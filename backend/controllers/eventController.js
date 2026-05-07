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
                    title: 'Comedy Night with Stand-Up Stars',
                    dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                    venue: { name: 'The Comedy Club', address: 'Indiranagar, Bengaluru' },
                    city: 'Bengaluru',
                    description: 'An evening of non-stop laughter with top comedians from across the country. Get ready for punchlines that will leave you in splits!',
                    category: ['Comedy'],
                    imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801',
                    rating: 4.7,
                    reviewsCount: 2847,
                    source: 'Mock Data',
                    originalUrl: 'https://example.com/comedy-night',
                    status: 'new',
                    price: { min: 499, max: 999, currency: '₹' }
                },
                {
                    _id: 'mock2',
                    title: 'Bengaluru Comedy Festival 2024',
                    dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    venue: { name: 'Phoenix Marketcity', address: 'Whitefield, Bengaluru' },
                    city: 'Bengaluru',
                    description: 'The biggest comedy festival in Bengaluru featuring international comedians, local talent, and open mic sessions. Three days of pure entertainment!',
                    category: ['Comedy', 'Festival'],
                    imageUrl: 'https://images.unsplash.com/photo-1543286386-713bdd548da4',
                    rating: 4.9,
                    reviewsCount: 5632,
                    source: 'Mock Data',
                    originalUrl: 'https://example.com/comedy-fest',
                    status: 'new',
                    price: { min: 299, max: 1499, currency: '₹' }
                },
                {
                    _id: 'mock3',
                    title: 'Stand-Up Saturday Special',
                    dateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
                    venue: { name: 'Hard Rock Cafe', address: 'St. Marks Road, Bengaluru' },
                    city: 'Bengaluru',
                    description: 'Weekly stand-up comedy showcase featuring emerging talent and established comedians. Great food, great drinks, great laughs!',
                    category: ['Comedy'],
                    imageUrl: 'https://images.unsplash.com/photo-1471473885449-5d867bf5cc1c',
                    rating: 4.6,
                    reviewsCount: 1923,
                    source: 'Mock Data',
                    originalUrl: 'https://example.com/standup-saturday',
                    status: 'new',
                    price: { min: 399, max: 799, currency: '₹' }
                },
                {
                    _id: 'mock4',
                    title: 'Improv Comedy Workshop',
                    dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                    venue: { name: 'Atta Galatta', address: 'Koramangala, Bengaluru' },
                    city: 'Bengaluru',
                    description: 'Learn the art of improvisational comedy from professional comedians. No experience required - just bring your sense of humor!',
                    category: ['Comedy', 'Workshop'],
                    imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0',
                    rating: 4.8,
                    reviewsCount: 1247,
                    source: 'Mock Data',
                    originalUrl: 'https://example.com/improv-workshop',
                    status: 'new',
                    price: { min: 1500, max: 1500, currency: '₹' }
                },
                {
                    _id: 'mock5',
                    title: 'Open Mic Comedy Night',
                    dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                    venue: { name: 'The Bunker', address: 'Brigade Road, Bengaluru' },
                    city: 'Bengaluru',
                    description: 'Your chance to be on stage! Sign up for open mic and try your hand at comedy. Or just enjoy watching new talent discover their voice.',
                    category: ['Comedy'],
                    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
                    rating: 4.4,
                    reviewsCount: 892,
                    source: 'Mock Data',
                    originalUrl: 'https://example.com/open-mic',
                    status: 'new',
                    price: { min: 199, max: 199, currency: '₹' }
                },
                {
                    _id: 'mock6',
                    title: 'Roast Battle Championship',
                    dateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                    venue: { name: 'Social Koramangala', address: 'Koramangala, Bengaluru' },
                    city: 'Bengaluru',
                    description: 'Watch comedians go head-to-head in the ultimate roast battle. No holds barred, no topics off limits. Not for the faint-hearted!',
                    category: ['Comedy'],
                    imageUrl: 'https://images.unsplash.com/photo-1517048675924-a9aba795cb71',
                    rating: 4.9,
                    reviewsCount: 3215,
                    source: 'Mock Data',
                    originalUrl: 'https://example.com/roast-battle',
                    status: 'new',
                    price: { min: 599, max: 999, currency: '₹' }
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
