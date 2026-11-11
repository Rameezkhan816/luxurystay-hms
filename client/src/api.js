import axios from 'axios';
const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use(c => { const t = localStorage.getItem('token'); if (t) c.headers.Authorization = 'Bearer ' + t; return c; });
export const err = e => e.response?.data?.message || e.message;
export default api;
// Image/video upload: file bhejo, server URL wapas deta hai (jaise /uploads/123.jpg)
export const uploadFile = async (file) => {
  const fd = new FormData();
  fd.append('file', file);
  return (await api.post('/upload', fd)).data.url;
};
