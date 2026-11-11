import { useEffect, useState } from 'react'; import api from '../api'; import { toast } from '../toast';
export default function Notifications() {
  const [list, setList] = useState([]);
  const load = () => api.get('/notifications').then(r => setList(r.data));
  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, []);
  const read = async id => { await api.put('/notifications/' + id, { isRead: true }); load(); };
  const readAll = async () => { await Promise.all(list.filter(n => !n.isRead).map(n => api.put('/notifications/' + n._id, { isRead: true }))); load(); };
  const clear = async id => { await api.delete('/notifications/' + id).catch(() => toast('Only an admin or manager can delete this', 'err')); load(); };
  return (<div><h2>Notifications</h2><button className="sec" onClick={readAll}>Mark all as read</button>
    <div className="card" style={{ marginTop: 14 }}>{list.map(n => <div key={n._id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '10px 0', borderBottom: '1px solid #f0ebe2', opacity: n.isRead ? .55 : 1 }}>
      <span>{n.isRead ? '' : '🔵 '}{n.message} <small style={{ color: '#8a7f74' }}>({n.role} - {n.createdAt.slice(0, 16).replace('T', ' ')})</small></span>
      <span>{!n.isRead && <button className="sm" onClick={() => read(n._id)}>Mark read</button>}<button className="sm danger" onClick={() => clear(n._id)}>Clear</button></span></div>)}
      {!list.length && <p>No notifications</p>}</div></div>);
}
