require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const { scrapeIndiaEvents } = require('./backend/utils/scraper');

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('Connected to DB');
        const list = await scrapeIndiaEvents('Mumbai');
        console.log('Results:', list.length);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

test();
