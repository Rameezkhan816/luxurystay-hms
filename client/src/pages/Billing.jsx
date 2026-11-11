import { useEffect, useState } from 'react'; import api from '../api'; import { toast } from '../toast'; import { useAuth } from '../auth';
export default function Billing() {
  const { user } = useAuth(); const [bills, setBills] = useState([]); const [inv, setInv] = useState(null);
  const load = () => api.get('/billing').then(r => setBills(r.data)); useEffect(() => { load(); }, []);
  const pay = async id => { await api.put(`/billing/${id}/pay`); toast('Bill marked as paid'); load(); };
  const email = async id => { try { toast((await api.post(`/billing/${id}/email`)).data.message); } catch (e) { toast(e.response?.data?.message || e.message, 'err'); } };
  if (inv) return (<div><div className="card invoice"><h2>LuxuryStay Hospitality - Invoice</h2><p>Invoice #{inv._id.slice(-6).toUpperCase()} | {inv.createdAt.slice(0, 10)}</p>
    <p>Guest: {inv.guest?.name} ({inv.guest?.email})</p><p>Room: {inv.reservation?.room?.roomNumber} ({inv.reservation?.room?.type})</p>
    <table><tbody><tr><td>Room charges</td><td>${inv.roomCharges}</td></tr><tr><td>Additional services</td><td>${inv.services}</td></tr><tr><td>Tax</td><td>${inv.tax}</td></tr>
      <tr><th>Total</th><th>${inv.total}</th></tr></tbody></table><p>Status: <b>{inv.paymentStatus}</b></p></div>
    <button onClick={() => window.print()}>Print / Save PDF</button> <button className="sec" onClick={() => email(inv._id)}>Email Invoice</button> <button className="sec" onClick={() => setInv(null)}>Back</button></div>);
  return (<div><h2>Billing & Invoices</h2><p>Bills are generated automatically at check-out.</p><div className="card scroll"><table><thead><tr><th>Date</th><th>Guest</th><th>Room</th><th>Total</th><th>Status</th><th></th></tr></thead>
    <tbody>{bills.map(b => <tr key={b._id}><td>{b.createdAt.slice(0, 10)}</td><td>{b.guest?.name}</td><td>{b.reservation?.room?.roomNumber}</td><td>${b.total}</td><td><span className={'badge ' + b.paymentStatus}>{b.paymentStatus}</span></td>
      <td className="act"><button className="sm" onClick={() => setInv(b)}>Invoice</button>{user.role !== 'guest' && b.paymentStatus !== 'paid' && user.role !== 'housekeeping' && <button className="sm" onClick={() => pay(b._id)}>Mark Paid</button>}</td></tr>)}
      {!bills.length && <tr><td colSpan="6">No bills yet</td></tr>}</tbody></table></div></div>);
}
