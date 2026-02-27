require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

console.log('Testing connection to Atlas...');

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('✅ SUCCESS: Connected to MongoDB');
        process.exit(0);
    } catch (err) {
        console.error('❌ FAILURE:', err.message);
        process.exit(1);
    }
})();
