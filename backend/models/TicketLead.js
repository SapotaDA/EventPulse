const mongoose = require('mongoose');

const TicketLeadSchema = new mongoose.Schema({
    email: { type: String, required: true },
    consent: { type: Boolean, default: false },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TicketLead', TicketLeadSchema);
