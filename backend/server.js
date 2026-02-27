require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const eventRoutes = require('./routes/eventRoutes');
const { seedMockEvents, scrapeAll } = require('./utils/scraper');
const Event = require('./models/Event');

const app = express();

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: false, // Required for loading external images
}));

// Logging
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/', limiter);

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL // Will be added for deployment
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());

// Routes
app.use('/api', eventRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.json({
        name: 'EventPulse India API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

const PORT = process.env.PORT || 5000;

// database Connection and Server Start
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            // Initial seed only if in dev or if DB empty
            seedMockEvents().catch(err => console.error('Seed failed:', err.message));
        });
    } catch (err) {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    }
};

startServer();

// Global Error Handler (Production Ready)
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    console.error(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${status}: ${message}`);

    res.status(status).json({
        success: false,
        status,
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});
