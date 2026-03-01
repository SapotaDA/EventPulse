const Event = require('../models/Event');
const TicketLead = require('../models/TicketLead');
const { scrapeIndiaEvents, scrapeAll, seedMockEvents } = require('../utils/scraper');

const mongoose = require('mongoose');

exports.getEvents = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                error: 'Database connection is not ready. Please check your Atlas IP whitelist.',
                database: 'disconnected',
                readyState: mongoose.connection.readyState
            });
        }

        let city = req.query.city?.toString().trim();
        const search = req.query.search?.toString().trim();
        const status = req.query.status?.toString().trim();

        // Locality to Major City Mapping
        const LOCALITY_TO_CITY = {
            'Yelahanka': 'Bangalore',
            'Whitefield': 'Bangalore',
            'Andheri': 'Mumbai',
            'Bandra': 'Mumbai',
            'Dwarka': 'Delhi',
            'Gurugram': 'Gurgaon'
        };

        if (LOCALITY_TO_CITY[city]) {
            console.log(`🗺️ Mapping locality ${city} to ${LOCALITY_TO_CITY[city]}`);
            city = LOCALITY_TO_CITY[city];
        }

        let query = {};

        if (city === 'India') {
            query.city = {
                $in: [
                    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Ahmedabad', 'Kolkata',
                    'Jaipur', 'Gurgaon', 'Noida', 'Chandigarh', 'Lucknow', 'Indore', 'Bhopal'
                ]
            };
        } else if (city) {
            query.city = city;

            // Auto-scrape if city has no data and no search is active
            if (!search) {
                const count = await Event.countDocuments({ city });
                if (count === 0) {
                    console.log(`🔍 No local events for ${city}. Triggering auto-scrape...`);
                    await scrapeIndiaEvents(city).catch(e => console.error('Auto-scrape failed:', e.message));
                }
            }
        }

        if (status) query.status = status;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        let events = await Event.find(query).sort({ rating: -1, dateTime: 1 });

        // Final Fallback: If still nothing and was searching for a specific city, show India highlights
        if (events.length === 0 && city && city !== 'India' && !search) {
            console.log(`📉 Still no events for ${city}. Falling back to India highlights.`);
            events = await Event.find({
                city: { $in: ['Mumbai', 'Delhi', 'Bangalore'] }
            }).sort({ rating: -1 }).limit(10);
        }

        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.registerInterest = async (req, res) => {
    try {
        const { email, consent, eventId } = req.body;
        const lead = new TicketLead({ email, consent, event: eventId });
        await lead.save();
        res.status(201).json({ message: 'Interest registered' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.importEvent = async (req, res) => {
    try {
        const { importedBy, notes } = req.body;
        const event = await Event.findByIdAndUpdate(req.params.id, {
            status: 'imported',
            importedAt: new Date(),
            importedBy,
            importNotes: notes
        }, { new: true });
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.clearDatabase = async (req, res) => {
    try {
        await Event.deleteMany({});
        await seedMockEvents();
        res.json({ message: 'Database cleared and seeded with fresh movie data' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
