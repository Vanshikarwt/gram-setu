# 🌾 GramSetu — Bridging Rural Agriculture

<div align="center">

![GramSetu](https://img.shields.io/badge/GramSetu-Rural%20AgriTech-22c55e?style=for-the-badge&logo=leaf&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Prisma-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--time-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

**A full-stack marketplace platform connecting rural farmers with agricultural services, machinery, labour, and buyers — built for Smart India Hackathon (SIH).**

[Live Demo](#) · [Report a Bug](#) · [Request Feature](#)

</div>

---

## 📖 About The Project

<div align="center">

> **GramSetu** *(meaning "Bridge to the Village")* is a mobile-first marketplace that empowers Indian farmers by connecting them with a local ecosystem of agricultural services, machinery, labour, and buyers — built for **Smart India Hackathon (SIH)**.

</div>

<br/>

### 🌱 What can you list or discover on GramSetu?

<table>
  <tr>
    <td align="center" width="20%">
      <br/>
      <b>🚜 Farm Machinery</b>
      <br/><sub>Tractors, tillers & harvesters<br/>available for hourly / daily hire</sub>
      <br/><br/>
    </td>
    <td align="center" width="20%">
      <br/>
      <b>👷 Skilled Labour</b>
      <br/><sub>Agricultural workers available<br/>for seasonal or daily hire</sub>
      <br/><br/>
    </td>
    <td align="center" width="20%">
      <br/>
      <b>🌾 Crop Residue</b>
      <br/><sub>Buy & sell stubble, straw<br/>and biomass</sub>
      <br/><br/>
    </td>
    <td align="center" width="20%">
      <br/>
      <b>🏪 Storage Facilities</b>
      <br/><sub>Cold storage & warehouse<br/>solutions</sub>
      <br/><br/>
    </td>
    <td align="center" width="20%">
      <br/>
      <b>🛒 Agri Products</b>
      <br/><sub>Seeds, fertilizers, tools<br/>& fresh produce</sub>
      <br/><br/>
    </td>
  </tr>
</table>

<br/>

<div align="center">

| 🌐 Multilingual | ⚡ Real-time Chat | 📱 Mobile-First | 🇮🇳 Made for India |
|:---:|:---:|:---:|:---:|
| English · हिंदी · Hinglish | Socket.IO powered | Responsive on all devices | Built for SIH 2024–25 |

</div>

---

## ✨ Features

<div align="center">

### Core Platform Features

</div>

<table>
  <tr>
    <td width="50%">
      <h3>🔐 Authentication</h3>
      <p>Phone-number based signup & login secured with <b>bcrypt</b> password hashing and <b>JWT</b> tokens. Protected routes ensure only verified users can access the platform.</p>
    </td>
    <td width="50%">
      <h3>🗂️ Listings Marketplace</h3>
      <p>Providers create rich listings with images, pricing (hourly / daily / per-unit), availability dates, and category tags. Consumers browse, filter, and view full listing detail pages.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📅 Booking Management</h3>
      <p>Full booking lifecycle from request to completion:<br/>
      <code>pending</code> → <code>accepted</code> → <code>paid</code> → <code>active</code> → <code>completed</code><br/>
      Supports both <b>hourly</b> and <b>daily</b> booking types with flexible pricing.</p>
    </td>
    <td width="50%">
      <h3>💬 Real-time Chat</h3>
      <p>1-on-1 conversations powered by <b>Socket.IO</b> with JWT-authenticated socket connections. Buyers and sellers negotiate directly before committing to a booking.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>💳 Payment Gateway</h3>
      <p>Simulated multi-method payment flow supporting <b>UPI</b>, <b>Card</b>, and <b>Cash</b>. Every transaction is recorded and linked to its booking for full traceability.</p>
    </td>
    <td width="50%">
      <h3>⭐ Reviews & Ratings</h3>
      <p>Post-booking review system with 1–5 star ratings and comments. Ratings are tied to individual listings, building trust across the rural marketplace.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📊 Provider Analytics</h3>
      <p>A dedicated provider dashboard with insights on total revenue, booking counts, average ratings, and listing performance — helping farmers make data-driven decisions.</p>
    </td>
    <td width="50%">
      <h3>🔔 Notifications</h3>
      <p>In-app notification panel keeps users informed of booking status changes, new requests, and system messages in real time — no refresh needed.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🏪 Gram Bazaar</h3>
      <p>A community bulletin board where anyone can post <b>needs</b> or <b>offers</b> — a local classifieds board for the village economy, bridging informal rural trade.</p>
    </td>
    <td width="50%">
      <h3>🔍 Smart Search</h3>
      <p>Filter listings by <b>type</b>, <b>price range</b>, <b>location</b>, and <b>availability</b>. The search UI is designed with icon-first interactions for low-literacy users.</p>
    </td>
  </tr>
</table>

<br/>

<div align="center">

| 🗺️ Mock Order Tracking | 🌐 3-Language UI | 🔒 JWT Auth | ⚡ Socket.IO |
|:---:|:---:|:---:|:---:|
| Simulated live tracking for hired services | English · हिंदी · Hinglish | Secure token-based sessions | Real-time bidirectional chat |

</div>

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| [React 19](https://react.dev/) | UI framework |
| [TypeScript 6](https://www.typescriptlang.org/) | Type-safe development |
| [Vite 8](https://vite.dev/) | Build tool & dev server |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first styling |
| [React Router 7](https://reactrouter.com/) | Client-side routing |
| [Zustand](https://zustand-demo.pmnd.rs/) | Global state management |
| [Lucide React](https://lucide.dev/) | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| [Node.js + Express](https://expressjs.com/) | REST API server |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe server code |
| [Socket.IO](https://socket.io/) | Real-time bidirectional chat |
| [Prisma ORM](https://www.prisma.io/) | Database schema and queries |
| [MongoDB](https://www.mongodb.com/) | Primary database (Atlas) |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Password hashing |
| [JSON Web Token](https://jwt.io/) | Auth token management |

### Infrastructure
| Service | Purpose |
|---|---|
| [Vercel](https://vercel.com/) | Frontend deployment |
| [Railway](https://railway.app/) / [Render](https://render.com/) | Backend deployment |
| [MongoDB Atlas](https://www.mongodb.com/atlas) | Cloud database |

---

## 🗂️ Project Structure

```
sihgramsetu/
├── src/                        # Frontend source
│   ├── components/             # Reusable UI components
│   │   ├── Layout.tsx          # App shell with bottom nav
│   │   ├── ListingCard.tsx     # Service listing card
│   │   ├── ListingForm.tsx     # Create/edit listing form
│   │   ├── BookingModal.tsx    # Booking flow modal
│   │   ├── PaymentGateway.tsx  # Payment simulation UI
│   │   ├── ChatScreen.tsx      # Real-time chat interface
│   │   ├── ProviderAnalytics.tsx # Provider dashboard
│   │   ├── IncomingRequests.tsx  # Booking request management
│   │   ├── SearchBar.tsx       # Smart search & filters
│   │   └── ...                 # (20 components total)
│   ├── pages/                  # Route-level pages
│   │   ├── Home.tsx            # Landing / dashboard
│   │   ├── Search.tsx          # Browse & discover listings
│   │   ├── Bazaar.tsx          # Community buy/sell board
│   │   ├── Chat.tsx            # Messaging hub
│   │   ├── Profile.tsx         # User profile & settings
│   │   ├── Login.tsx           # Authentication
│   │   ├── Signup.tsx          # Registration
│   │   └── LanguageSelect.tsx  # Language onboarding
│   ├── locales/                # i18n translations
│   │   ├── en.ts               # English strings
│   │   ├── hi.ts               # Hindi (हिंदी) strings
│   │   └── hinglish.ts         # Hinglish strings
│   ├── store/
│   │   └── useStore.ts         # Zustand global state
│   └── utils/
│       └── api.ts              # Axios API client
│
└── server/                     # Backend source
    ├── src/
    │   ├── index.ts            # Express + Socket.IO server entry
    │   ├── socket.ts           # Socket.IO event handlers
    │   ├── prisma.ts           # Prisma client singleton
    │   ├── routes/             # Express route definitions
    │   │   ├── authRoutes.ts
    │   │   ├── listingRoutes.ts
    │   │   ├── bookingRoutes.ts
    │   │   ├── chatRoutes.ts
    │   │   ├── paymentRoutes.ts
    │   │   ├── reviewRoutes.ts
    │   │   ├── notificationRoutes.ts
    │   │   ├── analyticsRoutes.ts
    │   │   └── insightsRoutes.ts
    │   ├── controllers/        # Request handlers
    │   └── middlewares/        # Auth & validation middleware
    └── prisma/
        └── schema.prisma       # MongoDB data models
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) v9+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier works)

---

### 1. Clone the Repository

```bash
git clone https://github.com/Vanshikarwt/gram-setu.git
cd gram-setu/sihgramsetu
```

---

### 2. Setup the Backend

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:

```env
PORT=5000
DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/gramsetu?retryWrites=true&w=majority"
JWT_SECRET="your_super_secret_jwt_key"
CLIENT_URL="http://localhost:5173"
```

> 💡 Copy from `server/.env.example` as a starting point.

Generate the Prisma client and start the dev server:

```bash
npm run dev
```

The backend API will be running at **http://localhost:5000**

---

### 3. Setup the Frontend

Open a new terminal in the project root (`sihgramsetu/`):

```bash
npm install
```

Create a `.env` file in the root:

```env
VITE_API_URL=http://localhost:5000
```

> 💡 Copy from `.env.example` as a starting point.

Start the dev server:

```bash
npm run dev
```

The frontend will be running at **http://localhost:5173**

---

## 🌐 API Endpoints

All API routes are prefixed with `/api`.

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `POST` | `/api/auth/login` | Login & receive JWT | ❌ |
| `GET` | `/api/auth/me` | Get current user profile | ✅ |
| `GET` | `/api/listings` | Browse all listings | ✅ |
| `POST` | `/api/listings` | Create a new listing | ✅ |
| `PUT` | `/api/listings/:id` | Update a listing | ✅ |
| `DELETE` | `/api/listings/:id` | Delete a listing | ✅ |
| `POST` | `/api/bookings` | Create a booking | ✅ |
| `GET` | `/api/bookings/incoming` | Provider's incoming requests | ✅ |
| `GET` | `/api/bookings/my` | Consumer's bookings | ✅ |
| `PUT` | `/api/bookings/:id/status` | Accept / reject booking | ✅ |
| `POST` | `/api/payments` | Process a payment | ✅ |
| `POST` | `/api/reviews` | Submit a review | ✅ |
| `GET` | `/api/chat/conversations` | List all conversations | ✅ |
| `GET` | `/api/chat/:conversationId/messages` | Get messages | ✅ |
| `GET` | `/api/bazaar` | Get bazaar posts | ✅ |
| `POST` | `/api/bazaar` | Create a bazaar post | ✅ |
| `GET` | `/api/analytics` | Provider analytics data | ✅ |
| `GET` | `/api/notifications` | Get notifications | ✅ |
| `GET` | `/api/health` | Server health check | ❌ |

---

## 🗄️ Data Models

```
User ──< Listing ──< Booking >── Transaction
  |                     |
  |──< BazaarPost       └──< Review
  |
  |──< Conversation >── Message
  |
  └──< Notification
```

Key models: **User**, **Listing**, **Booking**, **Transaction**, **Review**, **Conversation**, **Message**, **BazaarPost**, **Notification**

---

## 🌍 Multilingual Support

GramSetu ships with full UI translations in three languages, selectable at onboarding:

| Code | Language | Script |
|---|---|---|
| `en` | English | Latin |
| `hi` | Hindi | देवनागरी |
| `hinglish` | Hinglish | Latin (mixed) |

All UI strings live in `src/locales/` and are consumed via the `useTranslation` hook. Adding a new language requires only a new locale file and a one-line registration in `src/locales/index.ts`.

---

## ☁️ Deployment

### Frontend → Vercel

1. Import repo into [Vercel](https://vercel.com/)
2. Set **Root Directory** to `sihgramsetu`
3. Add environment variable: `VITE_API_URL=<your-backend-url>`
4. Deploy — `vercel.json` handles SPA routing rewrites automatically

### Backend → Railway or Render

1. Create a new service pointing to the `sihgramsetu/server` directory
2. Set environment variables: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, `PORT`
3. Build command: `npm run build && npx prisma generate`
4. Start command: `node dist/index.js`

---

## 📜 Available Scripts

### Frontend (`sihgramsetu/`)

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check & build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run Oxlint code linter |

### Backend (`sihgramsetu/server/`)

| Script | Description |
|---|---|
| `npm run dev` | Start server with hot-reload (ts-node-dev) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production server |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |
| `npm run db:generate` | Regenerate Prisma client |

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🏆 Built For

This project was built as part of **Smart India Hackathon (SIH)** to address the challenge of connecting rural farmers with accessible agricultural services and resources across India.

---

<div align="center">
Made with ❤️ for Indian Farmers 🇮🇳
</div>
