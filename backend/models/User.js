const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: String,
    googleId: String,
    role: { type: String, default: 'admin' }
});

module.exports = mongoose.model('User', UserSchema);
