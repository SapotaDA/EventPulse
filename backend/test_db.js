const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function check() {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected!');
        const count = await mongoose.connection.db.collection('events').countDocuments();
        console.log('Event count:', count);
        const cities = await mongoose.connection.db.collection('events').distinct('city');
        console.log('Cities found:', cities);
        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err.message);
        process.exit(1);
    }
}
check();
