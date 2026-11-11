import { useEffect, useState } from 'react'; import api, { err } from '../api'; import { toast } from '../toast'; import { useAuth } from '../auth';
export default function Bookings() {
  const { user } = useAuth(); const staff = ['admin', 'manager', 'receptionist'].includes(user.role);
  const [list, setList] = useState([]); const [rooms, setRooms] = useState([]); const [guests, setGuests] = useState([]);
  const [f, setF] = useState({ checkIn: '', checkOut: '' }); const [msg, setMsg] = useState(''); const [confirm, setConfirm] = useState(null);
  const load = () => api.get('/reservations').then(r => setList(r.data));
  useEffect(() => { load(); if (staff) api.get('/users').then(r => setGuests(r.data.filter(u => u.role === 'guest' && u.isActive))); }, []);
  const search = async () => { setMsg(''); setConfirm(null); try { setRooms((await api.get('/reservations/available', { params: f })).data); } catch (e) { setMsg(err(e)); } };
  const book = async room => {
    try { const r = await api.post('/reservations', { ...f, room }); setConfirm(r.data); setMsg(''); toast('Booking confirmed: ' + r.data.bookingNo); setRooms([]); load(); } catch (e) { setMsg(err(e)); }
  };
  const act = async (id, a) => { try { await api.put(`/reservations/${id}/${a}`); load(); if (a === 'checkout') setMsg('Checked out. The bill is on the Billing page and a cleaning task was created.'); } catch (e) { setMsg(err(e)); } };
  const d = x => x?.slice(0, 10);
  return (<div><div className="pagehead"><h2>Reservations</h2><span className="count">{list.length} bookings</span></div>{msg && <p className="err">{msg}</p>}
    {confirm && <div className="card welcome"><h2>✅ Booking Confirmed</h2><p>Booking No: <b>{confirm.bookingNo}</b></p>
      <p>Room {confirm.room?.roomNumber} ({confirm.room?.type}) | {d(confirm.checkIn)} se {d(confirm.checkOut)}</p><p>Total: <b>${confirm.totalAmount}</b> (tax is added at check-out)</p></div>}
    <div className="card form"><label>Check-in<input type="date" onChange={e => setF({ ...f, checkIn: e.target.value })} /></label>
      <label>Check-out<input type="date" onChange={e => setF({ ...f, checkOut: e.target.value })} /></label>
      {staff && <label>Guest<select onChange={e => setF({ ...f, guest: e.target.value })}><option value="">-- guest --</option>{guests.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}</select></label>}
      <button onClick={search}>Check Availability</button></div>
    {rooms.length > 0 && <div className="card scroll"><h3>Available Rooms</h3><table><tbody>{rooms.map(r => <tr key={r._id}><td>Room {r.roomNumber}</td><td>{r.type}</td><td>${r.price}/night</td><td><button className="sm" onClick={() => book(r._id)}>Book</button></td></tr>)}</tbody></table></div>}
    <div className="card scroll"><table><thead><tr><th>Booking #</th><th>Guest</th><th>Room</th><th>In</th><th>Out</th><th>Total</th><th>Key Card</th><th>Status</th><th></th></tr></thead>
      <tbody>{list.map(r => <tr key={r._id}><td>{r.bookingNo}</td><td>{r.guest?.name}</td><td>{r.room?.roomNumber}</td><td>{d(r.checkIn)}</td><td>{d(r.checkOut)}</td><td>${r.totalAmount}</td><td>{r.keyCard || '-'}</td>
        <td><span className={'badge ' + r.status}>{r.status}</span></td>
        <td className="act">{staff && r.status === 'confirmed' && <button className="sm" onClick={() => act(r._id, 'checkin')}>Check-in</button>}
          {staff && r.status === 'checked-in' && <button className="sm" onClick={() => act(r._id, 'checkout')}>Check-out</button>}
          {r.status === 'confirmed' && <button className="sm danger" onClick={() => act(r._id, 'cancel')}>Cancel</button>}</td></tr>)}
        {!list.length && <tr><td colSpan="9">No reservations</td></tr>}</tbody></table></div></div>);
}
