# EventPulse 🇮🇳

A professional-grade event discovery platform built with the MERN stack (MongoDB, Express.js, React, Node.js). EventPulse provides a seamless experience for users to find events across India through real-time scraping and a premium user interface.

## ✨ Core Features

- **Real-time Event Scraper**: Dynamically fetches the latest events from major sources like Townscript and AllEvents.
- **Admin Dashboard**: Secure control center via Google OAuth 2.0. Admins can sync data, manage events, and reset the database.
- **Premium User Experience**: Sleek, responsive UI featuring glassmorphism, skeleton loaders, and modern animations.
- **Intelligent Data Matching**: Automated category detection and high-resolution image placeholders for a consistent visual experience.
- **Production Grade Security**: Implements rate limiting, security headers via Helmet, and robust server-side error handling.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, CSS (Vanilla with modern utilities), Axios.
- **Backend**: Node.js, Express.js, Puppeteer (for scraping), MongoDB Atlas.
- **Authentication**: Google OAuth 2.0.

## � Getting Started

### 1. Prerequisites

- Node.js (v16+)
- MongoDB Atlas Account
- Google Cloud Console Project (for OAuth)

### 2. Environment Setup

**Backend (`/backend/.env`):**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com
ADMIN_EMAIL=your_admin_email@gmail.com
FRONTEND_URL=http://localhost:5173
```

**Frontend (`/frontend/.env`):**
```env
VITE_API_BASE=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com
```

### 3. Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 4. Running Locally

```bash
# Start backend (from /backend folder)
npm start

# Start frontend (from /frontend folder)
npm run dev
```

## 🌐 Deployment

### Backend (Render/Railway/Heroku)
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Note**: Ensure the MongoDB IP whitelist includes your host's IP or `0.0.0.0/0`.

### Frontend (Vercel/Netlify)
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

---
Built with ❤️ by [SapotaDA](https://github.com/SapotaDA)
