// All roles of the project in one place. The landing page, login form and stats all read from here.
// To add a new role, just add one more entry below.
export const ROLES = [
  { key: 'admin', icon: '👑', name: 'Admin', desc: 'Users, settings & full control',
    can: ['Manage staff and users (create / edit / deactivate)', 'Change tax, policy and system settings', 'View reports for the whole hotel'] },
  { key: 'manager', icon: '📊', name: 'Manager', desc: 'Reports, rooms & rates',
    can: ['View occupancy, revenue and forecast reports', 'Manage rooms and their rates', 'View bookings and guest feedback'] },
  { key: 'receptionist', icon: '🛎️', name: 'Receptionist', desc: 'Bookings, check-in/out, billing',
    can: ['Create and cancel guest bookings', 'Check guests in (key card) and out', 'Manage bills, invoices and payments'] },
  { key: 'housekeeping', icon: '🧹', name: 'Housekeeping', desc: 'Cleaning & room status',
    can: ['View and complete cleaning tasks', 'Update room status', 'Report maintenance issues'] },
  { key: 'guest', icon: '🧳', name: 'Guest', desc: 'Book rooms, services, feedback',
    can: ['Browse and book rooms online', 'Request room service, laundry and transport', 'View invoices and give feedback'] },
];
