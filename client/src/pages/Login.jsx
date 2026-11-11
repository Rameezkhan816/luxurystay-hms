import { useState } from 'react'; import { ThemeToggle } from '../theme'; import api, { err } from '../api'; import { useAuth } from '../auth'; import { ROLES } from '../roles';
// Password kitna mazboot hai (0 se 4)
const strength = p => [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(p || '')).length;
const LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
export default function Login() {
  const { login } = useAuth();
  const [reg, setReg] = useState(new URLSearchParams(window.location.search).get('mode') === 'register');
  const [role, setRole] = useState('guest'); const [f, setF] = useState({}); const [msg, setMsg] = useState('');
  const [show, setShow] = useState(false); const [busy, setBusy] = useState(false);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const setMode = r => { setReg(r); setRole('guest'); setMsg(''); };
  const cur = ROLES.find(r => r.key === role); const s = strength(f.password);
  const submit = async e => {
    e.preventDefault(); setMsg(''); setBusy(true);
    try { login((await api.post(reg ? '/auth/register' : '/auth/login', reg ? f : { ...f, role })).data); } catch (x) { setMsg(err(x)); }
    setBusy(false);
  };
  return (<div className="login"><ThemeToggle className="float" />
    <div className="hero">
      <div className="bubbles">{[...Array(8)].map((_, i) => <i key={i} />)}</div>
      <a href="/" className="brand">🏨 <span>LuxuryStay</span></a>
      <h1>Experience <em>Luxury</em>,<br />Managed Smartly.</h1>
      <p>Bookings, rooms, billing, housekeeping and guest services, all in one beautiful dashboard.</p>
      <ul>
        <li><b>🛎️</b><div><strong>Smart Reservations</strong><small>Availability check, check-in &amp; check-out</small></div></li>
        <li><b>🧾</b><div><strong>Automatic Billing</strong><small>Invoices with tax, print &amp; email</small></div></li>
        <li><b>📊</b><div><strong>Live Analytics</strong><small>Occupancy, revenue &amp; forecast</small></div></li>
      </ul>
      <div className="herostats"><div><b>{ROLES.length}</b><small>User Roles</small></div><div><b>12</b><small>Modules</small></div><div><b>24/7</b><small>Operations</small></div></div>
    </div>
    <div className="formside"><form className="card" onSubmit={submit}>
      <div className="tabs"><button type="button" className={!reg ? 'on' : ''} onClick={() => setMode(false)}>Sign In</button><button type="button" className={reg ? 'on' : ''} onClick={() => setMode(true)}>Sign Up</button><i style={{ transform: reg ? 'translateX(100%)' : 'none' }} /></div>
      <h2>{reg ? 'Create your account' : 'Welcome back'}</h2>
      <p className="sub">{reg ? 'Register as a guest' : 'Choose your role and sign in'}</p>
      <div className="roles">{ROLES.map((r, i) => {
        const locked = reg && r.key !== 'guest';
        return <button type="button" key={r.key} style={{ '--i': i }} className={'role' + (role === r.key ? ' on' : '') + (locked ? ' lock' : '')}
          title={locked ? 'Staff accounts are created by the Admin only' : r.desc} onClick={() => !locked && setRole(r.key)}>
          <span>{locked ? '🔒' : r.icon}</span><b>{r.name}</b><small>{r.desc}</small></button>;
      })}</div>
      <div className="roleinfo" key={role} title={cur.can.join(' • ')}><b>{cur.icon} {cur.name}:</b> {cur.desc}</div>
      {reg && <p className="rolehint">🔒 Staff accounts are created by the Admin only.</p>}
      {reg && <div className="row2"><label>Full name<input placeholder="Your name" onChange={set('name')} required /></label><label>Phone<input placeholder="03xx xxxxxxx" onChange={set('phone')} /></label></div>}
      <label>Email<input type="email" placeholder="you@example.com" autoComplete="email" onChange={set('email')} required /></label>
      <label>Password<div className="pw"><input type={show ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password" onChange={set('password')} required /><span onClick={() => setShow(!show)}>{show ? '🙈' : '👁️'}</span></div></label>
      {reg && f.password && <div className="meter"><div><i className={'s' + s} style={{ width: s * 25 + '%' }} /></div><small>Password: {LABELS[s] || 'Too short'}</small></div>}
      {reg && <label className="consent"><input type="checkbox" onChange={e => setF({ ...f, consent: e.target.checked })} required />I agree to the use of my data (name, email, phone) for hotel services (GDPR consent).</label>}
      {msg && <div className="err">{msg}</div>}
      <button disabled={busy}>{busy ? 'Please wait...' : reg ? 'Create Account →' : `Sign In as ${cur.name} →`}</button>
      <a href="/">← Back to home</a>
    </form></div></div>);
}
