# 🚗 DriveFleet — Backend API Server

<div align="center">

**The RESTful API powering DriveFleet — handles authentication, car listings, and booking management with secure session-based auth.**

[![Server](https://img.shields.io/badge/API-drivefleet--server--7hs2.onrender.com-green?style=for-the-badge)](https://drivefleet-server-7hs2.onrender.com)
[![Express](https://img.shields.io/badge/Express.js-v5-black?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)
[![Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=for-the-badge&logo=render)](https://render.com/)

</div>

---

## ✨ Features

- 🔐 **Better Auth Integration** — Email/password and Google OAuth sessions stored in MongoDB; cookies set with `SameSite=None; Secure; HttpOnly` to support cross-domain requests between Vercel (client) and Render (server)
- 🚙 **Full Car CRUD API** — Create, read, update, and delete car listings with owner-only protection; partial updates use `$set` with `runValidators: false` so patch operations never fail on unrelated required fields
- 📅 **Booking Management** — Create bookings, auto-increment car popularity with MongoDB `$inc`, and cancel bookings by updating status rather than deleting records — preserving full booking history
- 🔍 **Search & Filter** — MongoDB `$regex` for case-insensitive car name search and `$in` for multi-type filtering, combined with flexible sort options (price, date, popularity)
- 🛡️ **JWT Middleware via Better Auth Session** — `verifyJWT` middleware reads the active session on every protected request using `auth.api.getSession()` — no manual token parsing required

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js v5 |
| Database | MongoDB Atlas |
| ODM | Mongoose v9 |
| Authentication | Better Auth |
| Session Adapter | MongoDB Adapter (better-auth) |
| Password Hashing | Built-in via Better Auth |
| CORS | cors middleware (credentials: true) |
| Environment | dotenv |
| Dev Server | nodemon |
| Deployment | Render |

---

## 📁 Project Structure

```
drivefleet-server/
│
├── index.js                  # Entry point — Express setup, CORS, MongoDB connect, seed data
│
├── lib/
│   └── auth.js               # Better Auth config — email/password + Google OAuth + MongoDB adapter
│
├── middleware/
│   └── verifyJWT.js          # Session-based auth guard using auth.api.getSession()
│
├── models/
│   ├── Car.js                # Mongoose schema for car listings (snake_case fields)
│   └── Booking.js            # Mongoose schema for bookings (camelCase fields)
│
└── routes/
    ├── cars.js               # GET / POST / PUT / DELETE for /api/cars
    └── bookings.js           # GET /my, POST /, PATCH /:id for /api/bookings
```

---

## 📡 API Reference

### 🔑 Auth Routes (Better Auth)
Handled automatically by Better Auth at `/api/auth/{*path}`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/sign-up/email` | Register with email/password |
| POST | `/api/auth/sign-in/email` | Login with email/password |
| POST | `/api/auth/sign-in/social` | Google OAuth login |
| GET | `/api/auth/get-session` | Get current session |
| POST | `/api/auth/sign-out` | Logout |

---

### 🚗 Car Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/cars` | Public | Get all cars — supports `?search=`, `?type=`, `?sort=` |
| GET | `/api/cars/my-cars` | ✅ Private | Get cars owned by the logged-in user |
| GET | `/api/cars/:id` | Public | Get single car by ID |
| POST | `/api/cars` | ✅ Private | Add a new car listing |
| PUT | `/api/cars/:id` | ✅ Private (owner only) | Update car fields |
| DELETE | `/api/cars/:id` | ✅ Private (owner only) | Delete a car listing |

**Query Parameters for `GET /api/cars`:**

| Param | Type | Example | Operator |
|---|---|---|---|
| `search` | string | `?search=toyota` | `$regex` (case-insensitive) |
| `type` | string | `?type=SUV` | `$in` |
| `sort` | string | `?sort=price_asc` | `price_asc / price_desc / newest / popular` |

---

### 📅 Booking Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/bookings/my` | ✅ Private | Get all bookings for the logged-in user |
| POST | `/api/bookings` | ✅ Private | Create a new booking + `$inc` booking_count on car |
| PATCH | `/api/bookings/:id` | ✅ Private (owner only) | Cancel a booking — sets `status: "cancelled"` |

---

## 🗄️ Database Schemas

### Car Model
```js
{
  car_name:          String  (required)
  daily_rent_price:  Number  (required, min: 0)
  car_type:          String  (enum: SUV | Sedan | Hatchback | Luxury | Sports Coupe | Electric SUV | Convertible | Pickup Truck)
  image_url:         String  (required)
  seat_capacity:     Number  (required, min: 1)
  pickup_location:   String  (required)
  description:       String  (required)
  availability:      Boolean (default: true)
  booking_count:     Number  (default: 0)
  owner_email:       String  (required, lowercase)
  owner_name:        String
  timestamps:        createdAt, updatedAt
}
```

### Booking Model
```js
{
  carId:           ObjectId → Car  (required)
  carName:         String          (required)
  carImage:        String
  carType:         String
  dailyRentPrice:  Number          (required)
  pickupLocation:  String
  userEmail:       String          (required, lowercase)
  userName:        String
  driverNeeded:    Boolean         (default: false)
  specialNote:     String
  bookingDate:     Date            (default: now)
  totalPrice:      Number
  status:          String          (enum: pending | confirmed | cancelled, default: confirmed)
  timestamps:      createdAt, updatedAt
}
```

---

## 🔒 Authentication & Security

- All private routes are protected by `verifyJWT` middleware
- `verifyJWT` calls `auth.api.getSession({ headers: req.headers })` — no manual JWT decoding
- Cookies are set with `httpOnly: true`, `secure: true`, `sameSite: "none"` for cross-origin support
- `BETTER_AUTH_SECRET` ensures session stability across Render restarts
- MongoDB credentials are stored in environment variables — never hardcoded
- Owner-only operations (PUT, DELETE car; PATCH booking) verify `req.user.email` against the stored owner/user email before proceeding

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster (free tier works fine)
- Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/)

### Installation

```bash
git clone https://github.com/nilanjanajui/drivefleet-server.git
cd drivefleet-server
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
BETTER_AUTH_SECRET=your_random_secret_string
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
CLIENT_URL=http://localhost:3000
```

### Run Locally

```bash
npm run dev
```

Server starts at [http://localhost:5000](http://localhost:5000).

> On first start, if the database has fewer than 10 cars, `seedDatabase()` runs automatically to populate sample listings so the frontend has data to display immediately.

---

## 🌐 Deployment

The server is deployed on **Render** (Web Service).

Base URL: **[https://drivefleet-server-7hs2.onrender.com](https://drivefleet-server-7hs2.onrender.com)**

> Add all `.env` variables in Render's Environment tab. Set `CLIENT_URL` to your deployed Vercel frontend URL.

---

## 🔗 Related Repository

- **Client (Next.js + Tailwind):** [github.com/nilanjanajui/drivefleet-client](https://github.com/nilanjanajui/drivefleet-client)
