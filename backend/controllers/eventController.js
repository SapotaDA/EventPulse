const Event = require('../models/Event');
const TicketLead = require('../models/TicketLead');
const { scrapeIndiaEvents, scrapeAll, seedMockEvents } = require('../utils/scraper');

const mongoose = require('mongoose');

exports.getEvents = async (req, res) => {
    try {
        // Return mock data if MongoDB is not connected
        if (mongoose.connection.readyState !== 1) {
            console.log('🔄 MongoDB not connected, returning mock data');
            const mockEvents = [
                {
                    _id: 'mock1',
                    title: 'Sample Event - Tech Conference',
                    dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    venue: { name: 'Convention Center', address: 'Bangalore' },
                    city: 'Bangalore',
                    description: 'A tech conference featuring the latest innovations',
                    category: ['Tech', 'Conference'],
                    imageUrl: 'https://images.unsplash.com/photo-1540575467066-5a5a94e5d5b1',
                    rating: 4.5,
                    reviewsCount: 1200,
                    source: 'Mock Data',
                    originalUrl: 'https://example.com/event1',
                    status: 'new'
                },
                {
                    _id: 'mock2',
                    title: 'Music Festival 2024',
                    dateTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                    venue: { name: 'Arena Stadium', address: 'Mumbai' },
                    city: 'Mumbai',
                    description: 'Annual music festival with top artists',
                    category: ['Concerts', 'Festival'],
                    imageUrl: 'https://images.unsplash.com/photo-1459749411177-042180ce5372',
                    rating: 4.8,
                    reviewsCount: 3500,
                    source: 'Mock Data',
                    originalUrl: 'https://example.com/event2',
                    status: 'new'
                },
                {
                    _id: 'mock3',
                    title: 'Food & Wine Expo',
                    dateTime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
                    venue: { name: 'Exhibition Hall', address: 'Delhi' },
                    city: 'Delhi',
                    description: 'Taste the best cuisines and wines from around the world',
                    category: ['Food & Drink', 'Festival'],
                    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
                    rating: 4.6,
                    reviewsCount: 890,
                    source: 'Mock Data',
                    originalUrl: 'https://example.com/event3',
                    status: 'new'
                }
            ];
            return res.json(mockEvents);
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
        
        // Return mock success when MongoDB is not connected
        if (mongoose.connection.readyState !== 1) {
            console.log('🔄 MongoDB not connected, returning mock success for ticket interest');
            return res.status(201).json({ 
                message: 'Interest registered successfully',
                mockData: true,
                email: email,
                eventId: eventId
            });
        }
        
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
            importedBy,
            importNotes: notes
        }, { new: true });
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.triggerScrape = async (req, res) => {
    try {
        const { city } = req.body;
        await scrapeAll(city);
        res.json({ message: 'Scraping completed successfully' });
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
