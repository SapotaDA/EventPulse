const mongoose = require('mongoose');

const connectDB = async (retryCount = 0) => {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
        console.error('❌ MONGO_URI is not defined in .env');
        return;
    }

    try {
        console.log(`⏳ Attempting to connect to MongoDB Atlas (Attempt ${retryCount + 1})...`);

        // Disable buffering to prevent hanging requests when disconnected
        mongoose.set('bufferCommands', false);

        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✅ MongoDB Connected!');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);

        if (err.message.includes('whitelist')) {
            console.error('👉 TIP: Go to MongoDB Atlas -> Network Access -> Add Current IP Address.');
        }

        // Retry logic: up to 5 times with a delay
        if (retryCount < 5) {
            const delay = Math.pow(2, retryCount) * 1000;
            console.log(`🔄 Retrying connection in ${delay / 1000}s...`);
            setTimeout(() => connectDB(retryCount + 1), delay);
        }
    }
};

// Also handle disconnection events
mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB Disconnected. Checking connectivity...');
});

module.exports = connectDB;
