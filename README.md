# EventPulse 🇮🇳

A college project built with the MERN stack (MongoDB, Express.js, React, Node.js) for discovering events across India using real-time scraping.

> [!NOTE]  
> This is a **college project** for testing purposes. It is currently intended for local development and is not deployed to a live server.

## ✨ Features

- **Event Scraper**: Real-time data fetching from Townscript and AllEvents.
- **Admin Dashboard**: A secure portal using Google OAuth 2.0 to sync and manage event data.
- **Modern UI**: A responsive interface built with modern CSS techniques like glassmorphism.
- **Automated Placeholder Images**: Intelligent matching for events without posters.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), CSS
- **Backend**: Node.js, Express.js, Puppeteer
- **Database**: MongoDB Atlas

## 🚀 How to Run Locally

### 1. Requirements
- Node.js installed on your machine.
- A MongoDB Atlas account and a Google Cloud project (for OAuth).

### 2. Setup Environment Variables
Create a `.env` file in the `backend/` and `frontend/` folders based on the following examples:

**Backend (`/backend/.env`):**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com
ADMIN_EMAIL=your_email@gmail.com
FRONTEND_URL=http://localhost:5173
```

**Frontend (`/frontend/.env`):**
```env
VITE_API_BASE=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com
```

### 3. Installation & Start

1.  **Backend**:
    ```bash
    cd backend
    npm install
    npm start
    ```
2.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

---
Built as a project by [SapotaDA](https://github.com/SapotaDA)
