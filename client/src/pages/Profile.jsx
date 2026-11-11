import { useEffect, useState } from 'react'; import api, { err } from '../api'; import { useAuth } from '../auth';
export default function Profile() {
  const { user, login } = useAuth(); const [f, setF] = useState(null); const [msg, setMsg] = useState('');
  useEffect(() => { api.get('/auth/me').then(r => setF(r.data)); }, []);
  const save = async e => {
    e.preventDefault();
    try { const r = await api.put('/auth/profile', f); login({ token: localStorage.getItem('token'), user: { ...user, name: r.data.name } }); setMsg('Profile saved'); }
    catch (x) { setMsg(err(x)); }
  };
  if (!f) return null; const set = k => e => setF({ ...f, [k]: e.target.value });
  return (<div><h2>My Profile</h2><form className="card form" onSubmit={save}>
    <label>Name<input value={f.name || ''} onChange={set('name')} required /></label>
    <label>Email<input value={f.email} disabled /></label>
    <label>Phone<input value={f.phone || ''} onChange={set('phone')} /></label>
    <label>Preferences (room, food, etc.)<input value={f.preferences || ''} onChange={set('preferences')} /></label>
    <button>Save</button>{msg && <span>{msg}</span>}</form></div>);
}
