const Event = require('../models/Event');
const TicketLead = require('../models/TicketLead');
const { scrapeIndiaEvents, scrapeAll } = require('../utils/scraper');

const mongoose = require('mongoose');

exports.getEvents = async (req, res) => {
    console.log(`GET /api/events?city=${req.query.city}`);
    try {
        // If connecting, wait up to 5 seconds
        let attempts = 0;
        while (mongoose.connection.readyState === 2 && attempts < 10) {
            console.log('⏳ DB is connecting... waiting 500ms');
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }

        if (mongoose.connection.readyState !== 1) {
            console.log('503 hit! DB state:', mongoose.connection.readyState);
            return res.status(503).json({
                error: 'Database connection is not ready. Please check your Atlas IP whitelist.',
                database: 'disconnected',
                readyState: mongoose.connection.readyState
            });
        }

        const city = req.query.city?.toString().trim();
        const search = req.query.search?.toString().trim();
        const status = req.query.status?.toString().trim();
        let query = {};

        if (city === 'India') {
            query.city = {
                $in: [
                    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Ahmedabad', 'Kolkata',
                    'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
                    'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik',
                    'Faridabad', 'Meerut', 'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad',
                    'Amritsar', 'Navi Mumbai', 'Allahabad', 'Howrah', 'Jabalpur', 'Gwalior', 'Vijayawada',
                    'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Solapur', 'Mysore',
                    'Gurgaon', 'Aligarh', 'Jalandhar', 'Bhubaneswar', 'Salem', 'Warangal', 'Guntur',
                    'Gorakhpur', 'Bikaner', 'Amravati', 'Noida', 'Jamshedpur', 'Kochi', 'Dehradun'
                ]
            };
        } else if (city) {
            query.city = city;

            // Auto-scrape if city has no data and no search is active
            if (!search) {
                const count = await Event.countDocuments({ city });
                if (count === 0) {
                    console.log(`🔍 No events found for ${city}. Triggering auto-scrape...`);
                    await scrapeIndiaEvents(city);
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
        const events = await Event.find(query).sort({ rating: -1, dateTime: 1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.triggerScrape = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Cannot scrape without a database connection.');
        }
        const { city } = req.body;
        console.log(`Manual scrape requested for ${city || 'All'}...`);
        if (city) {
            await scrapeIndiaEvents(city);
        } else {
            await scrapeAll();
        }
        res.json({ message: 'Scrape completed successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.registerInterest = async (req, res) => {
    try {
        const { email, consent, eventId } = req.body;
        const lead = new TicketLead({ email, consent, eventId });
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
            importedBy: importedBy || 'Admin',
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
