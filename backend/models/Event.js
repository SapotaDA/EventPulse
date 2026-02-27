const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    dateTime: { type: Date, required: true },
    venue: {
        name: String,
        address: String
    },
    city: { type: String, default: 'India' },
    description: String,
    category: [String],
    imageUrl: String,
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    source: String,
    originalUrl: { type: String, unique: true },
    status: {
        type: String,
        enum: ['new', 'updated', 'inactive', 'imported'],
        default: 'new'
    },
    lastScrapedAt: { type: Date, default: Date.now },
    importedAt: Date,
    importedBy: String,
    importNotes: String
});

module.exports = mongoose.model('Event', EventSchema);
