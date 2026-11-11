import { Routes, Route, Navigate, NavLink } from "react-router-dom";
import { useAuth } from "./auth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import Billing from "./pages/Billing";
import { ROOM_IMG } from "./images";
import { useTheme } from "./theme";
import Landing from "./pages/Landing";
import Settings from "./pages/Settings";
import Crud from "./Crud";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import { useState, useEffect } from "react";
import api from "./api";
const RESV = {
  name: "reservation",
  label: "Booking",
  type: "ref",
  ref: "reservations",
  required: true,
  refFilter: (o) => ["confirmed", "checked-in"].includes(o.status),
  refText: (o) =>
    `${o.bookingNo || ""} | ${o.guest?.name || ""} | Room ${o.room?.roomNumber || ""}`,
};
const STAFF = ["admin", "manager", "receptionist", "housekeeping"],
  FRONT = ["admin", "manager", "receptionist"];
const NOHK = ["admin", "manager", "receptionist", "guest"]; // housekeeping ke bina
const RT = ["available", "occupied", "cleaning", "maintenance"];
const pages = [
  { path: "/", label: "Dashboard", roles: null, el: () => <Dashboard /> },
  {
    path: "/rooms",
    label: "Rooms",
    roles: null,
    el: (r) => (
      <Crud
        title="Room Inventory"
        endpoint="rooms"
        defaultView="cards"
        cardImage={(r) => r.image || ROOM_IMG[r.type]}
        canWrite={r !== "guest"}
        canAdd={FRONT.includes(r)}
        canDelete={["admin", "manager"].includes(r)}
        fields={[
          { name: "roomNumber", label: "Room No", required: true },
          {
            name: "type",
            label: "Type",
            type: "select",
            options: ["Single", "Double", "Suite", "Deluxe"],
          },
          { name: "floor", label: "Floor", type: "number" },
          {
            name: "price",
            label: "Price/Night",
            type: "number",
            required: true,
          },
          { name: "status", label: "Status", type: "select", options: RT },
          { name: "amenities", label: "Amenities" },
          {
            name: "image",
            label: "Room Photo",
            type: "file",
            accept: "image/*",
          },
        ]}
      />
    ),
  },
  { path: "/bookings", label: "Bookings", roles: NOHK, el: () => <Bookings /> },
  { path: "/billing", label: "Billing", roles: NOHK, el: () => <Billing /> },
  {
    path: "/services",
    label: "Services",
    roles: NOHK,
    el: (r) => (
      <Crud
        title="Guest Services"
        endpoint="services"
        canWrite={FRONT.includes(r)}
        canAdd
        canDelete={FRONT.includes(r)}
        fields={[
          {
            name: "type",
            label: "Service",
            type: "select",
            options: ["room service", "laundry", "wake-up call", "transport"],
            required: true,
          },
          { name: "details", label: "Details" },
          RESV,
          { name: "guest", label: "Guest", readOnly: true },
          ...(FRONT.includes(r)
            ? [
                { name: "price", label: "Price", type: "number" },
                {
                  name: "status",
                  label: "Status",
                  type: "select",
                  options: ["pending", "in-progress", "done"],
                },
              ]
            : [{ name: "status", label: "Status", readOnly: true }]),
        ]}
      />
    ),
  },
  {
    path: "/housekeeping",
    label: "Housekeeping",
    roles: STAFF,
    el: (r) => (
      <Crud
        title="Housekeeping Tasks"
        endpoint="housekeeping"
        canWrite
        canDelete={["admin", "manager"].includes(r)}
        fields={[
          { name: "room", label: "Room", type: "ref", ref: "rooms" },
          {
            name: "assignedTo",
            label: "Assigned To",
            type: "ref",
            ref: "users",
          },
          { name: "scheduledAt", label: "Date", type: "date" },
          { name: "notes", label: "Notes" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: ["pending", "in-progress", "completed"],
          },
        ]}
      />
    ),
  },
  {
    path: "/maintenance",
    label: "Maintenance",
    roles: null,
    el: (r) => (
      <Crud
        title="Maintenance Requests"
        endpoint="maintenance"
        canWrite={STAFF.includes(r)}
        canAdd
        canDelete={["admin", "manager"].includes(r)}
        fields={[
          { name: "room", label: "Room", type: "ref", ref: "rooms" },
          {
            name: "description",
            label: "Issue",
            type: "textarea",
            required: true,
          },
          {
            name: "priority",
            label: "Priority",
            type: "select",
            options: ["low", "medium", "high"],
          },
          {
            name: "media",
            label: "Photo / Video",
            type: "file",
            accept: "image/*,video/*",
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: ["open", "in-progress", "resolved"],
            readOnly: r === "guest",
          },
        ]}
      />
    ),
  },
  {
    path: "/feedback",
    label: "Feedback",
    roles: null,
    el: (r) => (
      <Crud
        title="Guest Feedback"
        endpoint="feedback"
        canWrite={false}
        canAdd={r === "guest"}
        canDelete={["admin", "manager"].includes(r)}
        fields={[
          { name: "guest", label: "Guest", readOnly: true },
          {
            name: "rating",
            label: "Rating (1-5)",
            type: "number",
            required: true,
          },
          { name: "comment", label: "Comment", type: "textarea" },
        ]}
      />
    ),
  },
  {
    path: "/notifications",
    label: "Notifications",
    roles: STAFF,
    el: () => <Notifications />,
  },
  { path: "/profile", label: "My Profile", roles: null, el: () => <Profile /> },
  {
    path: "/users",
    label: "Users",
    roles: ["admin", "manager", "receptionist"],
    el: (r) => (
      <Crud
        title="Staff & Guest Profiles"
        endpoint="users"
        canWrite={r === "admin"}
        canDelete={r === "admin"}
        deleteLabel="Deactivate"
        fields={[
          { name: "name", label: "Name", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          {
            name: "password",
            label: "Password (new)",
            type: "password",
            readOnly: false,
          },
          { name: "phone", label: "Phone" },
          {
            name: "role",
            label: "Role",
            type: "select",
            options: [
              "admin",
              "manager",
              "receptionist",
              "housekeeping",
              "guest",
            ],
          },
          { name: "preferences", label: "Preferences" },
          {
            name: "isActive",
            label: "Active",
            type: "select",
            options: ["true", "false"],
          },
        ]}
      />
    ),
  },
  {
    path: "/settings",
    label: "Settings",
    roles: ["admin"],
    el: () => <Settings />,
  },
];
const ICON = {
  "/": "📊",
  "/rooms": "🛏️",
  "/bookings": "📅",
  "/billing": "🧾",
  "/services": "🛎️",
  "/housekeeping": "🧹",
  "/maintenance": "🔧",
  "/feedback": "⭐",
  "/notifications": "🔔",
  "/users": "👥",
  "/settings": "⚙️",
  "/profile": "👤",
};
export default function App() {
  const { user, logout } = useAuth();
  const [unread, setUnread] = useState(0);
  // Staff ke liye har 15 second mein naye notifications check hote hain
  useEffect(() => {
    if (!user || user.role === "guest") return;
    const check = () =>
      api
        .get("/notifications")
        .then((r) => setUnread(r.data.filter((n) => !n.isRead).length))
        .catch(() => {});
    check();
    const t = setInterval(check, 15000);
    return () => clearInterval(t);
  }, [user]);
  // Dark / Light mode (browser mein yaad rehta hai)
  const [dark, toggleTheme] = useTheme();
  if (!user)
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  const vis = pages.filter((p) => !p.roles || p.roles.includes(user.role));
  return (
    <div className="layout">
      <aside>
        <h1>
          LuxuryStay<span>HOTEL SYSTEM</span>
        </h1>
        <div className="who">
          <div className="avatar">{user.name[0]}</div>
          <div>
            <b>{user.name}</b>
            <small>{user.role}</small>
          </div>
        </div>
        <nav>
          {vis.map((p) => (
            <NavLink key={p.path} to={p.path} end>
              {ICON[p.path]} {p.label}
              {p.path === "/notifications" && unread > 0 && (
                <span className="badge high" style={{ marginLeft: 6 }}>
                  {unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <button className="theme" onClick={toggleTheme}>
          {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
        <button className="logout" onClick={logout}>
          🚪 Logout
        </button>
      </aside>
      <main>
        <div className="topbar">
          <div>
            <small>{new Date().toDateString()}</small>
            <h3>Hello, {user.name} 👋</h3>
          </div>
          <span className="rolepill">{user.role}</span>
        </div>
        <Routes>
          {vis.map((p) => (
            <Route key={p.path} path={p.path} element={p.el(user.role)} />
          ))}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
