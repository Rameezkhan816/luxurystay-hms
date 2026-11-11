import { useEffect, useState } from 'react'; import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../api'; import { useAuth } from '../auth';
const COLORS = ['#2ea043', '#ef4444', '#f5a524', '#3b82f6'];
// Har role ke liye quick shortcuts
const QUICK = {
  admin: [['/users', '👥 Manage Users'], ['/rooms', '🛏️ Rooms'], ['/settings', '⚙️ Settings']],
  manager: [['/rooms', '🛏️ Rooms'], ['/bookings', '📅 Bookings'], ['/feedback', '⭐ Feedback']],
  receptionist: [['/bookings', '📅 New Booking'], ['/billing', '🧾 Billing'], ['/services', '🛎️ Services']],
  housekeeping: [['/housekeeping', '🧹 My Tasks'], ['/rooms', '🛏️ Rooms'], ['/maintenance', '🔧 Maintenance']],
  guest: [['/bookings', '📅 Book a Room'], ['/services', '🛎️ Request Service'], ['/feedback', '⭐ Give Feedback']],
};
// Number ko 0 se ginti karte hue dikhata hai (animation)
function Num({ v }) {
  const m = String(v).match(/^([^\d]*)([\d.]+)(.*)$/); const [n, setN] = useState(0);
  useEffect(() => { if (!m) return; const to = parseFloat(m[2]); let t = 0; const id = setInterval(() => { t++; setN(to * Math.min(t / 25, 1)); if (t >= 25) clearInterval(id); }, 30); return () => clearInterval(id); }, [v]);
  if (!m) return v;
  return <>{m[1]}{n.toFixed(m[2].includes('.') ? m[2].split('.')[1].length : 0)}{m[3]}</>;
}
export default function Dashboard() {
  const { user } = useAuth(); const [d, setD] = useState(null);
  const isBoss = ['admin', 'manager'].includes(user.role);
  useEffect(() => { if (isBoss) api.get('/reports').then(r => setD(r.data)); }, []);
  const banner = (<div className="card welcome"><h2>Welcome back, {user.name} 👋</h2>
    <p>{isBoss ? 'Here is the full overview of your hotel today.' : 'Get started with the shortcuts below.'}</p>
    <div className="quick">{QUICK[user.role].map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}</div></div>);
  if (!isBoss) return banner;
  if (!d) return <div><div className="skeleton" style={{ height: 150, marginBottom: 16 }} /><div className="skeleton" style={{ height: 280 }} /></div>;
  const stats = [['🛏️', 'Total Rooms', d.totalRooms], ['🔑', 'Occupied', d.occupied], ['📈', 'Occupancy', d.occupancyRate + '%'], ['💰', 'Revenue', '$' + d.totalRevenue.toFixed(2)], ['📅', 'Reservations', d.reservations], ['⭐', 'Avg Rating', d.avgRating + ' / 5']];
  return (<div>{banner}
    <div className="stats">{stats.map(([i, k, v]) => <div className="card stat" key={k}><span className="ico">{i}</span><div><small>{k}</small><b><Num v={v} /></b></div></div>)}</div>
    <div className="grid2">
      <div className="card"><h3>💰 Revenue by Month</h3><ResponsiveContainer height={260}><BarChart data={d.revenueByMonth}><CartesianGrid strokeDasharray="3 3" opacity={.25} /><XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="revenue" fill="#c9a24d" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div>
      <div className="card"><h3>🛏️ Room Status</h3><ResponsiveContainer height={260}><PieChart><Pie data={d.roomStatus} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} label>{d.roomStatus.map((_, i) => <Cell key={i} fill={COLORS[i % 4]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div></div>
    <div className="card"><h3>📈 Forecast & Pricing Tip</h3>
      <div className="tip"><div><small>Expected bookings next month</small><b>{d.forecast}</b></div><p>💡 {d.pricingTip}</p></div>
      <ResponsiveContainer height={200}><BarChart data={d.bookingsByMonth}><CartesianGrid strokeDasharray="3 3" opacity={.25} /><XAxis dataKey="month" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="bookings" fill="#2ea043" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div></div>);
}
