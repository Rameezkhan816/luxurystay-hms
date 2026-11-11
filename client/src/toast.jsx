// Chhote popup messages (alert ki jagah). Kahin se bhi: toast('Saved ✅') ya toast('Error', 'err')
import { useEffect, useState } from 'react';
export const toast = (msg, type = 'ok') => window.dispatchEvent(new CustomEvent('toast', { detail: { msg, type, id: Date.now() + Math.random() } }));
export function ToastHost() {
  const [list, setList] = useState([]);
  useEffect(() => {
    const on = e => { const t = e.detail; setList(l => [...l, t]); setTimeout(() => setList(l => l.filter(x => x.id !== t.id)), 3500); };
    window.addEventListener('toast', on); return () => window.removeEventListener('toast', on);
  }, []);
  return <div className="toasts">{list.map(t => <div key={t.id} className={'toast ' + t.type}>{t.type === 'err' ? '⚠️' : '✅'} {t.msg}</div>)}</div>;
}
