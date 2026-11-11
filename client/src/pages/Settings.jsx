import { useEffect, useState } from 'react'; import api, { err, uploadFile } from '../api'; import { toast } from '../toast'; import { Media } from '../Crud';
export default function Settings() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get('/settings').then(r => setS(r.data)); }, []);
  const save = async e => { e.preventDefault(); try { await api.put('/settings', s); toast('Settings saved'); } catch (x) { toast(err(x), 'err'); } };
  const up = key => async e => {
    const file = e.target.files[0]; if (!file) return;
    try { toast('Uploading...'); const url = await uploadFile(file); setS(v => ({ ...v, [key]: url })); toast('Uploaded. Press Save below.'); } catch (x) { toast(err(x), 'err'); }
  };
  if (!s) return null; const set = k => e => setS({ ...s, [k]: e.target.value });
  return (<div><div className="pagehead"><h2>System Settings</h2></div>
    <form onSubmit={save}>
      <div className="card form"><h3 style={{ width: '100%', margin: 0 }}>🏨 Hotel Rules</h3>
        <label>Tax %<input type="number" value={s.taxPercent} onChange={set('taxPercent')} /></label><label>Check-in time<input value={s.checkInTime} onChange={set('checkInTime')} /></label>
        <label>Check-out time<input value={s.checkOutTime} onChange={set('checkOutTime')} /></label><label>Policy<textarea value={s.policy} onChange={set('policy')} /></label></div>
      <div className="card form"><h3 style={{ width: '100%', margin: 0 }}>🎬 Landing Page Media</h3>
        <label>Background Video<input type="file" accept="video/*" onChange={up('heroVideo')} /></label>
        <label>Background Image<input type="file" accept="image/*" onChange={up('heroImage')} /></label>
        <div style={{ width: '100%', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {s.heroVideo && <div><Media src={s.heroVideo} /><br /><button type="button" className="sm danger" onClick={() => setS({ ...s, heroVideo: '' })}>Remove video</button></div>}
          {s.heroImage && <div><Media src={s.heroImage} /><br /><button type="button" className="sm danger" onClick={() => setS({ ...s, heroImage: '' })}>Remove image</button></div>}</div></div>
      <button>💾 Save Settings</button></form></div>);
}
