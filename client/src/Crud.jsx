// Reusable page: search + filter + table/cards view + add/edit/delete.
import { useEffect, useState } from 'react'; import api, { err, uploadFile } from './api'; import { toast } from './toast';
const isVideo = s => /\.(mp4|webm|mov|ogg)$/i.test(s);
// Uploaded image ya video dikhane ke liye
export function Media({ src, small }) {
  if (!src) return null;
  return isVideo(src) ? <video src={src} controls className={small ? 'mthumb' : 'mfull'} />
    : <a href={src} target="_blank" rel="noreferrer"><img src={src} className={small ? 'mthumb' : 'mfull'} alt="" /></a>;
}
const show = v => v && typeof v === 'object' ? (v.bookingNo || v.roomNumber || v.name || v._id)
  : typeof v === 'boolean' ? (v ? 'Yes' : 'No') : (typeof v === 'string' && /^\d{4}-\d\d-\d\dT/.test(v)) ? v.slice(0, 10) : v;
export default function Crud({ title, endpoint, fields, canWrite, canDelete, canAdd = canWrite, deleteLabel = 'Delete', defaultView = 'table', cardImage }) {
  const [rows, setRows] = useState([]); const [form, setForm] = useState({}); const [editing, setEditing] = useState(null);
  const [refs, setRefs] = useState({}); const [msg, setMsg] = useState(''); const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(''); const [sf, setSf] = useState(''); const [view, setView] = useState(defaultView);
  const load = () => api.get('/' + endpoint).then(r => setRows(r.data)).catch(e => setMsg(err(e))).finally(() => setLoading(false));
  useEffect(() => { load(); fields.filter(f => f.type === 'ref').forEach(f => api.get('/' + f.ref).then(r => setRefs(p => ({ ...p, [f.name]: r.data.filter(f.refFilter || (() => true)) }))).catch(() => {})); }, [endpoint]);
  const save = async e => {
    e.preventDefault(); setMsg('');
    try { editing ? await api.put(`/${endpoint}/${editing}`, form) : await api.post('/' + endpoint, form); toast(editing ? 'Updated successfully' : 'Added successfully'); setForm({}); setEditing(null); load(); }
    catch (x) { setMsg(err(x)); toast(err(x), 'err'); }
  };
  const edit = r => { setEditing(r._id); const f = {}; fields.forEach(x => { const v = r[x.name]; f[x.name] = v && typeof v === 'object' ? v._id : x.type === 'date' && v ? v.slice(0, 10) : v; }); setForm(f); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const del = async id => { if (confirm('Are you sure?')) { try { await api.delete(`/${endpoint}/${id}`); toast('Done'); } catch (x) { toast(err(x), 'err'); } load(); } };
  const input = f => {
    const p = { value: form[f.name] ?? '', onChange: e => setForm({ ...form, [f.name]: e.target.value }), required: f.required };
    if (f.type === 'select') return <select {...p}><option value="">-- {f.label} --</option>{f.options.map(o => <option key={o}>{o}</option>)}</select>;
    if (f.type === 'ref') return <select {...p}><option value="">-- {f.label} --</option>{(refs[f.name] || []).map(o => <option key={o._id} value={o._id}>{f.refText ? f.refText(o) : (o.roomNumber || o.name)}</option>)}</select>;
    if (f.type === 'file') return <div className="filebox"><input type="file" accept={f.accept} onChange={async e => { const file = e.target.files[0]; if (!file) return; try { toast('Uploading...'); const url = await uploadFile(file); setForm(x => ({ ...x, [f.name]: url })); toast('File uploaded'); } catch (x) { toast(err(x), 'err'); } }} />{form[f.name] && <Media src={form[f.name]} small />}</div>;
    if (f.type === 'textarea') return <textarea placeholder={f.label} {...p} />;
    return <input type={f.type || 'text'} placeholder={f.label} {...p} />;
  };
  const statuses = [...new Set(rows.map(r => r.status).filter(Boolean))];
  const shown = rows.filter(r => JSON.stringify(r).toLowerCase().includes(q.toLowerCase()) && (!sf || r.status === sf));
  const actions = r => <>{canWrite && <button className="sm" onClick={() => edit(r)}>Edit</button>}{canDelete && <button className="sm danger" onClick={() => del(r._id)}>{deleteLabel}</button>}</>;
  const cell = (f, r) => ['status', 'priority'].includes(f.name) ? <span className={'badge ' + r[f.name]}>{r[f.name]}</span>
    : (typeof r[f.name] === 'string' && r[f.name].startsWith('/uploads/')) ? <Media src={r[f.name]} small /> : show(r[f.name]);
  return (<div>
    <div className="pagehead"><h2>{title}</h2><span className="count">{rows.length} records</span></div>{msg && <p className="err">{msg}</p>}
    {(canAdd || (canWrite && editing)) && <form className="card form" onSubmit={save}>
      <h3 style={{ width: '100%', margin: 0 }}>{editing ? '✏️ Edit record' : '➕ Add new'}</h3>
      {fields.filter(f => !f.readOnly).map(f => <label key={f.name}>{f.label}{input(f)}</label>)}
      <button>{editing ? 'Update' : 'Add'}</button>{editing && <button type="button" className="sec" onClick={() => { setEditing(null); setForm({}); }}>Cancel</button>}
    </form>}
    <div className="toolbar">
      <input className="search" placeholder="🔍 Search..." value={q} onChange={e => setQ(e.target.value)} />
      {statuses.length > 1 && <select value={sf} onChange={e => setSf(e.target.value)}><option value="">All status</option>{statuses.map(s => <option key={s}>{s}</option>)}</select>}
      <div className="seg"><button type="button" className={view === 'table' ? 'on' : ''} onClick={() => setView('table')}>☰ Table</button><button type="button" className={view === 'cards' ? 'on' : ''} onClick={() => setView('cards')}>▦ Cards</button></div>
    </div>
    {loading ? <div className="skeleton" style={{ height: 220 }} /> : !shown.length ? <div className="card empty">📭<br />No records found</div>
      : view === 'cards' ? <div className="cards">{shown.map(r => <div className="rcard" key={r._id}>
        {cardImage && cardImage(r) && <img className="rimg" src={cardImage(r)} alt="" loading="lazy" onError={e => { e.target.style.display = 'none'; }} />}
        <div className="rhead"><b>{show(r[fields[0].name])}</b>{r.status && <span className={'badge ' + r.status}>{r.status}</span>}</div>
        {fields.slice(1).filter(f => f.name !== 'status' && r[f.name] !== undefined && r[f.name] !== '' && r[f.name] !== null).map(f => <div className="rrow" key={f.name}><span>{f.label}</span><b>{cell(f, r)}</b></div>)}
        <div className="act">{actions(r)}</div></div>)}</div>
      : <div className="card scroll"><table><thead><tr>{fields.map(f => <th key={f.name}>{f.label}</th>)}<th></th></tr></thead>
        <tbody>{shown.map(r => <tr key={r._id}>{fields.map(f => <td key={f.name}>{cell(f, r)}</td>)}<td className="act">{actions(r)}</td></tr>)}</tbody></table></div>}
  </div>);
}
