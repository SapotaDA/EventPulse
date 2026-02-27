const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Event = require('./models/Event');

async function debugData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const events = await Event.find({}).sort({ rating: -1 }).limit(10);
        console.log('Top 10 Events by Rating:');
        events.forEach(e => {
            console.log(`Rating: ${e.rating} | Title: ${e.title} | Image: ${e.imageUrl ? 'Yes' : 'No'}`);
        });

        // Update some events to have high ratings if all are 0
        const allZero = events.every(e => e.rating === 0);
        if (allZero && events.length > 0) {
            console.log('All events have 0 rating. Assigning some random high ratings for testing...');
            for (let i = 0; i < events.length; i++) {
                const rating = (Math.random() * 2 + 3).toFixed(1); // 3.0 to 5.0
                const reviews = Math.floor(Math.random() * 5000) + 100;
                await Event.findByIdAndUpdate(events[i]._id, { rating, reviewsCount: reviews });
            }
            console.log('Assigned random ratings to top 10 events.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugData();
