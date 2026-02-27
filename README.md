# EventPulse India 🇮🇳

A professional-grade event discovery platform built with the MERN stack (MongoDB, Express, React, Node). Featuring multi-source real-time scraping, admin dashboards, and custom theme.

## 🚀 Enterprise Features
- **Smart Scraper**: Combined data from Townscript and AllEvents with intelligent category detection.
- **Admin Hub**: Secure auth via Google OAuth 2.0 with management controls (Import, Sync, Reset).
- **Premium UI**: Glassmorphism design, skeleton loaders, and responsive layout.
- **Production Secure**: Rate limiting, security headers (Helmet), and robust error handling.
- **Variety Placeholders**: Dynamically matched high-res images for events missing posters.

## 🛠️ Deployment Ready
The project is structured for easy deployment on platforms like Vercel (Frontend) and Render/Heroku (Backend).

### 1. Environment Variables (.env)
**Backend:**
```env
PORT=5000
MONGO_URI=your_mongodb_uri
GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com
ADMIN_EMAIL=admin@gmail.com
FRONTEND_URL=https://your-frontend.vercel.app
```

**Frontend:**
```env
VITE_API_BASE=https://your-backend.render.com/api
VITE_GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com
```

### 2. Deployment Steps
1. **Database**: Create a MongoDB Atlas cluster and whitelist `0.0.0.0/0` for production.
2. **Backend**:
   - Push to GitHub.
   - Connect to Render/Heroku.
   - Set build command: `npm install`
   - Set start command: `node server.js`
3. **Frontend**:
   - Push to GitHub.
   - Connect to Vercel/Netlify.
   - Set framework: `Vite`
   - set output directory: `dist`

## 🧪 Testing
The system includes several testing/health points:
- **API Health**: `GET /health` returns uptime and system status.
- **Admin Reset**: Use the 'Reset All Data' button in the dashboard to verify DB connectivity and seeding.
- **Scraper Test**: Click 'Refresh' on any city to verify real-time scraping connectivity.

---
Built with ❤️ for EventPulse India
