// Saari photos yahan hain. Apni photos use karni hon to client/public/images/ mein rakh kar yahan '/images/naam.jpg' likh dein.
const u = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`;
export const ROOM_IMG = {
  Single: u('photo-1590490360182-c33d57733427'),
  Double: u('photo-1631049307264-da0ec9d70304'),
  Deluxe: u('photo-1618773928121-c32242e63f39'),
  Suite: u('photo-1582719478250-c89cae4dc85b'),
};
export const GALLERY = [
  ['Grand Lobby', u('photo-1551882547-ff40c63fe5fa')],
  ['Swimming Pool', u('photo-1520250497591-112f2f40a3f4')],
  ['Hotel View', u('photo-1542314831-068cd1dbfeeb')],
  ['Luxury Rooms', u('photo-1631049307264-da0ec9d70304')],
];
export const hideBroken = e => { e.target.style.display = 'none'; };
