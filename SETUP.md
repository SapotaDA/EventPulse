# EventPulse Setup Guide

## Issues Fixed ✅
1. **Missing triggerScrape function** - Added to eventController.js
2. **Missing frontend .env.example** - Created proper environment template
3. **Backend startup error** - Fixed missing function reference

## Setup Instructions

### 1. Environment Configuration

**Backend (.env):**
```bash
# Copy the example file
cp backend/.env.example backend/.env

# Edit backend/.env with your values:
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/eventpulse
ADMIN_EMAIL=your-admin@gmail.com
JWT_SECRET=your_super_secret_key_here
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env):**
```bash
# Copy the example file
cp frontend/.env.example frontend/.env

# Edit frontend/.env with your values:
VITE_API_BASE=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### 2. Install Dependencies
```bash
# Install all dependencies (root, backend, frontend)
npm run install-all
```

### 3. Start the Application
```bash
# Start both backend and frontend
npm start
```

Or start individually:
```bash
# Backend
cd backend && npm start

# Frontend (in another terminal)
cd frontend && npm run dev
```

## Required Services

### 1. MongoDB Atlas
- Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster
- Add your IP to Network Access whitelist
- Get your connection string
- Update `MONGO_URI` in backend/.env

### 2. Google OAuth (Optional)
- Create a project at [Google Cloud Console](https://console.cloud.google.com/)
- Enable Google+ API
- Create OAuth 2.0 credentials
- Add authorized origins: `http://localhost:5173`
- Update `GOOGLE_CLIENT_ID` in both .env files

## Application Features
- ✅ Event discovery across India
- ✅ Real-time web scraping (Townscript, AllEvents)
- ✅ Movie catalog with ratings
- ✅ Location-based event filtering
- ✅ Google OAuth authentication
- ✅ Admin dashboard
- ✅ Responsive UI with glassmorphism design

## Troubleshooting

### Backend Issues
- **MongoDB Connection Error**: Check your MONGO_URI and IP whitelist
- **Port Already in Use**: Change PORT in backend/.env
- **Missing Dependencies**: Run `npm install` in backend folder

### Frontend Issues
- **API Connection Error**: Ensure backend is running on correct port
- **Build Errors**: Check VITE_API_BASE in frontend/.env
- **OAuth Issues**: Verify Google Client ID configuration

### Common Issues
- **CORS Errors**: Check FRONTEND_URL matches your frontend URL
- **Environment Variables**: Ensure .env files are in correct locations
- **Dependencies**: Clear node_modules and reinstall if needed

## Development Notes
- Backend runs on port 5000 by default
- Frontend runs on port 5173 by default
- Database seeding happens automatically on first run
- Mock movie data is included for testing
- Web scraping may be rate-limited by external sites
