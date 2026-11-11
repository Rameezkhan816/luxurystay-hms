# LuxuryStay – Hotel Management System (MERN)

A full-stack hotel management system built with the MERN stack. It covers room bookings, check-in/check-out, billing and invoices, housekeeping, maintenance, guest services, feedback and reports, with role-based access for five user types.

**Live Demo:** _add your Vercel link here_
**Tech Stack:** MongoDB · Express.js · React (Vite) · Node.js

## Features

- **Role-based access control** with JWT authentication: Admin, Manager, Receptionist, Housekeeping and Guest
- **Rooms and reservations:** room management with photo upload, online booking, check-in and check-out
- **Billing:** bill generation, tax settings and optional email invoices via Nodemailer
- **Operations:** housekeeping tasks, maintenance requests with photo/video attachments, guest service requests
- **Guest experience:** guest self-registration, feedback submission, notifications per role
- **Dashboard and reports:** charts and statistics built with Recharts
- **Admin settings:** tax, policies, and landing page media
- **Security:** bcrypt password hashing, Helmet, CORS, and login rate limiting

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Axios, Recharts |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Auth and security | JWT, bcryptjs, Helmet, CORS, express-rate-limit |
| Other | Multer (file uploads), Nodemailer (email invoices) |

## Run Locally

**Prerequisites:** Node.js 18+ and a MongoDB database (local or MongoDB Atlas).

```bash
# 1. Backend
cd server
cp .env.example .env      # then fill in MONGO_URI and JWT_SECRET
npm install
npm run seed              # creates the first admin account from .env
npm start                 # runs on http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev               # runs on http://localhost:5173
```

## Environment Variables (`server/.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string used to sign tokens |
| `CLIENT_URL` | Frontend URL allowed by CORS |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First admin created by `npm run seed` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Optional, for emailing invoices |

## Project Structure

```
luxurystay-hms/
├── client/            React frontend (pages, auth, roles, theme)
├── server/
│   ├── models/        Mongoose models
│   ├── middleware/    JWT protect + role check
│   ├── routes/        auth, users, rooms, reservations, billing,
│   │                  services, housekeeping, maintenance, feedback,
│   │                  notifications, reports, settings, upload
│   └── server.js      App entry point
└── docs/              Full project documentation
```

Full documentation: [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md)

## Author

**Rameez Khan** – MERN Stack Developer
[GitHub](https://github.com/Rameezkhan816) · [LinkedIn](https://www.linkedin.com/in/rameezkhan-developer/)
