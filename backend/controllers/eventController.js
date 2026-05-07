const Event = require('../models/Event');
const TicketLead = require('../models/TicketLead');
const { scrapeIndiaEvents, scrapeAll, seedMockEvents } = require('../utils/scraper');
const eventApiService = require('../services/eventApiService');

const mongoose = require('mongoose');

exports.getEvents = async (req, res) => {
    try {
        let city = req.query.city?.toString().trim();
        const search = req.query.search?.toString().trim();
        const category = req.query.category?.toString().trim();
        const status = req.query.status?.toString().trim();

        // Use API service to fetch events (works with or without MongoDB)
        console.log(`🔍 Fetching events for ${city || 'India'}...`);
        let events = [];

        // If MongoDB is connected, try to get cached events first
        if (mongoose.connection.readyState === 1) {
            let query = { status: 'new' };
            
            if (city === 'India') {
                query.city = {
                    $in: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Ahmedabad', 'Kolkata', 'Jaipur', 'Gurgaon', 'Noida', 'Chandigarh', 'Lucknow', 'Indore', 'Bhopal']
                };
            } else if (city) {
                query.city = city;
            }

            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }

            events = await Event.find(query).sort({ rating: -1, dateTime: 1 });
        }

        // If no events found or MongoDB not connected, fetch from API service
        if (events.length === 0) {
            console.log('🔄 Fetching fresh events from API service...');
            const apiEvents = await eventApiService.fetchEvents(city || 'Bengaluru', category);
            events = apiEvents;
        }

        // Filter by category if specified
        if (category && category !== 'All') {
            events = events.filter(event => 
                event.category.some(cat => 
                    cat.toLowerCase().includes(category.toLowerCase())
                )
            );
        }

        // Limit results for performance
        if (events.length > 50) {
            events = events.slice(0, 50);
        }

        console.log(`✅ Returning ${events.length} events`);
        return res.json(events);
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
