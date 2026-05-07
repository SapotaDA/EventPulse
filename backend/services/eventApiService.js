const axios = require('axios');

class EventApiService {
    constructor() {
        this.baseUrls = {
            ticketmaster: 'https://app.ticketmaster.com/discovery/v2',
            eventbrite: 'https://www.eventbriteapi.com/v3',
            // You can add more APIs here
        };
        
        // API Keys (you'll need to get these from respective services)
        this.apiKeys = {
            ticketmaster: process.env.TICKETMASTER_API_KEY || 'your_ticketmaster_key',
            eventbrite: process.env.EVENTBRITE_API_KEY || 'your_eventbrite_key',
        };
    }

    // Fetch events from Ticketmaster API
    async fetchTicketmasterEvents(city, category = null) {
        try {
            const params = {
                apikey: this.apiKeys.ticketmaster,
                city: city,
                size: 50,
                sort: 'date,asc',
            };

            if (category) {
                params.classificationName = category;
            }

            const response = await axios.get(`${this.baseUrls.ticketmaster}/events.json`, { params });
            
            return response.data._embedded?.events?.map(event => ({
                id: event.id,
                title: event.name,
                description: event.description || 'Join us for an amazing event!',
                dateTime: new Date(event.dates.start.dateTime),
                venue: {
                    name: event._embedded.venues[0].name,
                    address: `${event._embedded.venues[0].address?.line1 || ''}, ${event._embedded.venues[0].city?.name || ''}`,
                    city: event._embedded.venues[0].city?.name || city,
                },
                city: event._embedded.venues[0].city?.name || city,
                category: event.classifications?.map(c => c.segment?.name) || ['Entertainment'],
                imageUrl: event.images?.[0]?.url || 'https://images.unsplash.com/photo-1516426122078-c23e76319801',
                rating: 4.5 + Math.random() * 0.5,
                reviewsCount: Math.floor(Math.random() * 5000) + 100,
                price: {
                    min: event.priceRanges?.[0]?.min || 299,
                    max: event.priceRanges?.[0]?.max || 2999,
                    currency: event.priceRanges?.[0]?.currency || '₹'
                },
                source: 'Ticketmaster',
                originalUrl: event.url,
                status: 'new'
            })) || [];
        } catch (error) {
            console.error('Ticketmaster API error:', error.message);
            return [];
        }
    }

    // Fetch events from Eventbrite API
    async fetchEventbriteEvents(city, category = null) {
        try {
            const params = {
                'location.address': city,
                'expand': 'venue',
                size: 50,
            };

            if (category) {
                params.categories = this.getEventbriteCategoryId(category);
            }

            const response = await axios.get(`${this.baseUrls.eventbrite}/events/`, { 
                params,
                headers: {
                    'Authorization': `Bearer ${this.apiKeys.eventbrite}`
                }
            });
            
            return response.data.events?.map(event => ({
                id: event.id,
                title: event.name.text,
                description: event.description.text || 'Join us for an amazing event!',
                dateTime: new Date(event.start.utc),
                venue: {
                    name: event.venue?.name || 'Venue',
                    address: event.venue?.address?.address_1 || '',
                    city: event.venue?.address?.city || city,
                },
                city: event.venue?.address?.city || city,
                category: [event.subcategory?.name || 'Entertainment'],
                imageUrl: event.logo?.url || 'https://images.unsplash.com/photo-1516426122078-c23e76319801',
                rating: 4.0 + Math.random() * 1.0,
                reviewsCount: Math.floor(Math.random() * 3000) + 50,
                price: {
                    min: event.ticket_price_minimum || 199,
                    max: event.ticket_price_maximum || 1999,
                    currency: '₹'
                },
                source: 'Eventbrite',
                originalUrl: event.url,
                status: 'new'
            })) || [];
        } catch (error) {
            console.error('Eventbrite API error:', error.message);
            return [];
        }
    }

    // Enhanced mock data with realistic events
    async fetchMockEvents(city, category = null) {
        const events = [
            {
                id: 'mock1',
                title: 'Comedy Night with Stand-Up Stars',
                description: 'An evening of non-stop laughter with top comedians from across the country. Get ready for punchlines that will leave you in splits!',
                dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                venue: { name: 'The Comedy Club', address: 'Indiranagar, Bengaluru', city: 'Bengaluru' },
                city: 'Bengaluru',
                category: ['Comedy'],
                imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801',
                rating: 4.7,
                reviewsCount: 2847,
                price: { min: 499, max: 999, currency: '₹' },
                source: 'Mock Data',
                originalUrl: 'https://example.com/comedy-night',
                status: 'new'
            },
            {
                id: 'mock2',
                title: 'Bengaluru Comedy Festival 2024',
                description: 'The biggest comedy festival in Bengaluru featuring international comedians, local talent, and open mic sessions. Three days of pure entertainment!',
                dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                venue: { name: 'Phoenix Marketcity', address: 'Whitefield, Bengaluru', city: 'Bengaluru' },
                city: 'Bengaluru',
                category: ['Comedy', 'Festival'],
                imageUrl: 'https://images.unsplash.com/photo-1543286386-713bdd548da4',
                rating: 4.9,
                reviewsCount: 5632,
                price: { min: 299, max: 1499, currency: '₹' },
                source: 'Mock Data',
                originalUrl: 'https://example.com/comedy-fest',
                status: 'new'
            },
            {
                id: 'mock3',
                title: 'Stand-Up Saturday Special',
                description: 'Weekly stand-up comedy showcase featuring emerging talent and established comedians. Great food, great drinks, great laughs!',
                dateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
                venue: { name: 'Hard Rock Cafe', address: 'St. Marks Road, Bengaluru', city: 'Bengaluru' },
                city: 'Bengaluru',
                category: ['Comedy'],
                imageUrl: 'https://images.unsplash.com/photo-1471473885449-5d867bf5cc1c',
                rating: 4.6,
                reviewsCount: 1923,
                price: { min: 399, max: 799, currency: '₹' },
                source: 'Mock Data',
                originalUrl: 'https://example.com/standup-saturday',
                status: 'new'
            },
            {
                id: 'mock4',
                title: 'Bollywood Music Night',
                description: 'Experience the magic of Bollywood with live performances by renowned artists. Sing along to your favorite hits!',
                dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                venue: { name: 'Palace Grounds', address: 'Basaveshwaranagar, Bengaluru', city: 'Bengaluru' },
                city: 'Bengaluru',
                category: ['Concerts', 'Music'],
                imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
                rating: 4.8,
                reviewsCount: 8234,
                price: { min: 899, max: 2999, currency: '₹' },
                source: 'Mock Data',
                originalUrl: 'https://example.com/bollywood-night',
                status: 'new'
            },
            {
                id: 'mock5',
                title: 'Food & Wine Festival',
                description: 'Taste the best cuisines and wines from around the world. Live cooking demonstrations, wine tasting sessions, and gourmet food stalls!',
                dateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                venue: { name: 'White Orchid', address: 'MG Road, Bengaluru', city: 'Bengaluru' },
                city: 'Bengaluru',
                category: ['Food & Drink', 'Festival'],
                imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
                rating: 4.5,
                reviewsCount: 3421,
                price: { min: 299, max: 1299, currency: '₹' },
                source: 'Mock Data',
                originalUrl: 'https://example.com/food-fest',
                status: 'new'
            },
            {
                id: 'mock6',
                title: 'Tech Conference 2024',
                description: 'Join industry leaders for insights into the latest technology trends. Network with professionals and learn about cutting-edge innovations.',
                dateTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                venue: { name: 'Koramangala Convention Center', address: 'Koramangala, Bengaluru', city: 'Bengaluru' },
                city: 'Bengaluru',
                category: ['Tech', 'Conference'],
                imageUrl: 'https://images.unsplash.com/photo-1540575467066-5a5a94e5d5b1',
                rating: 4.7,
                reviewsCount: 1876,
                price: { min: 1999, max: 4999, currency: '₹' },
                source: 'Mock Data',
                originalUrl: 'https://example.com/tech-conf',
                status: 'new'
            }
        ];

        // Filter by category if specified
        if (category) {
            return events.filter(event => 
                event.category.some(cat => 
                    cat.toLowerCase().includes(category.toLowerCase())
                )
            );
        }

        return events;
    }

    // Main method to fetch events from all sources
    async fetchEvents(city, category = null) {
        const allEvents = [];

        try {
            // Try real APIs first
            const ticketmasterEvents = await this.fetchTicketmasterEvents(city, category);
            allEvents.push(...ticketmasterEvents);

            const eventbriteEvents = await this.fetchEventbriteEvents(city, category);
            allEvents.push(...eventbriteEvents);

            // If no real events found, use mock data
            if (allEvents.length === 0) {
                const mockEvents = await this.fetchMockEvents(city, category);
                allEvents.push(...mockEvents);
            }
        } catch (error) {
            console.error('Error fetching events:', error.message);
            // Fallback to mock data
            const mockEvents = await this.fetchMockEvents(city, category);
            allEvents.push(...mockEvents);
        }

        // Sort by date and return
        return allEvents.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
    }

    // Helper method to get Eventbrite category ID
    getEventbriteCategoryId(category) {
        const categoryMap = {
            'comedy': '103',
            'music': '103',
            'concerts': '103',
            'food': '110',
            'tech': '102',
            'sports': '108',
            'arts': '105'
        };
        return categoryMap[category.toLowerCase()] || null;
    }
}

module.exports = new EventApiService();
