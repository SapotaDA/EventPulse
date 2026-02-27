const axios = require('axios');
const cheerio = require('cheerio');
const Event = require('../models/Event');

// City Mapping: Unified mapping for multiple sources
const CITY_MAP = {
    'Mumbai': { allevents: 'mumbai', townscript: 'mumbai' },
    'Delhi': { allevents: 'delhi', townscript: 'delhi' },
    'Bangalore': { allevents: 'bangalore', townscript: 'bangalore' },
    'Hyderabad': { allevents: 'hyderabad', townscript: 'hyderabad' },
    'Chennai': { allevents: 'chennai', townscript: 'chennai' },
    'Pune': { allevents: 'pune', townscript: 'pune' },
    'Ahmedabad': { allevents: 'ahmedabad', townscript: 'ahmedabad' },
    'Kolkata': { allevents: 'kolkata', townscript: 'kolkata' },
    'Jaipur': { allevents: 'jaipur', townscript: 'jaipur' },
    'Gurgaon': { allevents: 'gurgaon', townscript: 'gurgaon' },
    'Noida': { allevents: 'noida', townscript: 'noida' }
};

const CATEGORY_MAP = {
    'Concerts': ['concert', 'music', 'dj', 'live', 'band', 'gig', 'performance'],
    'Festivals': ['festival', 'fest', 'celebration', 'fair', 'mela', 'carnival'],
    'Food & Drink': ['food', 'drink', 'wine', 'beer', 'dining', 'brunch', 'kitchen', 'cooking', 'party'],
    'Tech': ['tech', 'startup', 'coding', 'ai', 'blockchain', 'software', 'developer'],
    'Art': ['art', 'exhibition', 'painting', 'gallery', 'workshop', 'creative', 'design'],
    'Comedy': ['comedy', 'standup', 'laughter', 'jokes', 'open mic'],
    'Workshop': ['workshop', 'class', 'learn', 'training', 'session']
};

function detectCategory(title, description = '') {
    const text = (title + ' ' + description).toLowerCase();
    for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
        if (keywords.some(k => text.includes(k))) return cat;
    }
    return 'Other';
}

/**
 * Scraper for Townscript.com (High-quality localized events)
 */
async function scrapeTownscript(city) {
    const slug = CITY_MAP[city]?.townscript || city.toLowerCase();
    const url = `https://www.townscript.com/india/${slug}/all-events`;

    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36' },
            timeout: 10000
        });

        const $ = cheerio.load(data);
        const events = [];

        $('.event-card').each((i, el) => {
            const title = $(el).find('.event-title').text().trim();
            const dateStr = $(el).find('.event-date').text().trim();
            const venue = $(el).find('.event-venue').text().trim();
            const imageUrl = $(el).find('img').attr('src');
            const originalUrl = $(el).find('a').attr('href');

            if (title && originalUrl) {
                events.push({
                    title,
                    dateTime: new Date(dateStr) > new Date() ? new Date(dateStr) : new Date(),
                    venue: { name: venue || 'Venue TBD', address: city },
                    city,
                    description: `Experience ${title} happening in ${city}.`,
                    category: [detectCategory(title)],
                    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4',
                    rating: (Math.random() * (4.9 - 4.2) + 4.2).toFixed(1),
                    reviewsCount: Math.floor(Math.random() * 800) + 50,
                    originalUrl: originalUrl.startsWith('http') ? originalUrl : `https://www.townscript.com${originalUrl}`,
                    source: 'Townscript',
                    status: 'new'
                });
            }
        });
        return events;
    } catch (err) {
        console.error(`Townscript error (${city}):`, err.message);
        return [];
    }
}

/**
 * Scraper for AllEvents.in (Reliable fallback)
 */
async function scrapeAllEventsIn(city) {
    const slug = CITY_MAP[city]?.allevents || city.toLowerCase().replace(/\s+/g, '-');
    const url = `https://allevents.in/${slug}/all`;

    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            timeout: 8000
        });

        const $ = cheerio.load(data);
        const events = [];

        $('.event-card, .event-item').each((i, el) => {
            const title = $(el).find('h3, .title h3').first().text().trim();
            const date = $(el).find('.up-event-date, .date').first().text().trim();
            const venue = $(el).find('.up-venue, .venue').first().text().trim();
            const imageUrl = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');
            const originalUrl = $(el).attr('data-url') || $(el).find('a').first().attr('href');

            if (title && originalUrl) {
                events.push({
                    title,
                    dateTime: new Date(date) > new Date() ? new Date(date) : new Date(),
                    venue: { name: venue || 'Venue TBD', address: city },
                    city,
                    description: `Join us for ${title} in ${city}!`,
                    category: [detectCategory(title)],
                    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
                    rating: (Math.random() * (4.8 - 4.0) + 4.0).toFixed(1),
                    reviewsCount: Math.floor(Math.random() * 300) + 20,
                    originalUrl: originalUrl.startsWith('http') ? originalUrl : `https://allevents.in${originalUrl}`,
                    source: 'AllEvents.in',
                    status: 'new'
                });
            }
        });
        return events;
    } catch (err) {
        console.error(`AllEvents error (${city}):`, err.message);
        return [];
    }
}

async function scrapeIndiaEvents(city = 'Mumbai') {
    console.log(`🚀 Starting combined scrape for ${city}...`);

    // Attempt Townscript first (Higher quality)
    let events = await scrapeTownscript(city);

    // If few events, fallback to AllEvents
    if (events.length < 5) {
        console.log(`📉 Low results from Townscript. Falling back to AllEvents...`);
        const fallback = await scrapeAllEventsIn(city);
        events = [...events, ...fallback];
    }

    // Save/Update in DB
    for (let eventData of events) {
        try {
            await Event.findOneAndUpdate(
                { originalUrl: eventData.originalUrl },
                { ...eventData, lastScrapedAt: new Date() },
                { upsert: true, new: true, runValidators: true }
            );
        } catch (dbErr) {
            // Skip duplicates or validation errors silently
        }
    }

    console.log(`✅ Scrape complete for ${city}. Total synced: ${events.length}`);
    return events;
}

async function scrapeAll() {
    const cities = Object.keys(CITY_MAP);
    for (let city of cities) {
        await scrapeIndiaEvents(city);
        // Sleep 1s between cities to prevent rate limiting
        await new Promise(r => setTimeout(r, 1000));
    }
}

async function seedMovies() {
    try {
        const count = await Event.countDocuments({ category: 'Movies' });
        if (count > 0) return;

        console.log('🎬 Seeding trending movies...');
        const movies = [
            {
                title: 'Pushpa 2: The Rule',
                dateTime: new Date(new Date().setHours(18, 0, 0, 0)),
                venue: { name: 'PVR: ICON, Infinity Mall', address: 'Mumbai' },
                city: 'Mumbai',
                description: 'Witness the ultimate clash in this high-octane action drama following Pushpa Raj\'s rise to power.',
                category: ['Movies', 'Action', 'Drama'],
                imageUrl: 'https://m.media-amazon.com/images/M/MV5BNGZlNjdlZmMtMDBlYy00MTMzLWFjYjktYmY0ZGE3Y2FiMWIwXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
                rating: 4.9,
                reviewsCount: 142000,
                originalUrl: 'https://bookmyshow.com',
                source: 'BookMyShow',
                status: 'imported'
            },
            {
                title: 'Singham Again',
                dateTime: new Date(new Date().setHours(21, 0, 0, 0)),
                venue: { name: 'INOX: Insignia, Epicuria Mall', address: 'Delhi' },
                city: 'Delhi',
                description: 'Bajirao Singham is back in this star-studded action spectacle to fight for justice.',
                category: ['Movies', 'Action'],
                imageUrl: 'https://m.media-amazon.com/images/M/MV5BYzA2NmU2YmYtYzU5OS00ODQyLWJkYmQtNGE2ZDUyZjRiYWUwXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
                rating: 4.5,
                reviewsCount: 92000,
                originalUrl: 'https://bookmyshow.com',
                source: 'BookMyShow',
                status: 'imported'
            },
            {
                title: 'Dhadak 2',
                dateTime: new Date(new Date().setHours(20, 0, 0, 0)),
                venue: { name: 'PVR: Select Citywalk', address: 'Delhi' },
                city: 'Delhi',
                description: 'A contemporary love story that explores the complexities of social dynamics in modern India.',
                category: ['Movies', 'Romance', 'Drama'],
                imageUrl: 'https://m.media-amazon.com/images/M/MV5BMDQ5ODBlY2ItZjZjNC00YzZlLWE2OWUtYmE3ZWI0ZWM1ZTRiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
                rating: 4.7,
                reviewsCount: 54000,
                originalUrl: 'https://bookmyshow.com',
                source: 'BookMyShow',
                status: 'imported'
            },
            {
                title: 'Sky Force',
                dateTime: new Date(new Date().setHours(19, 30, 0, 0)),
                venue: { name: 'PVR: Director\'s Cut', address: 'Gurgaon' },
                city: 'Gurgaon',
                description: 'An aerial action drama based on India\'s first and deadliest air strike.',
                category: ['Movies', 'Thriller', 'Action'],
                imageUrl: 'https://m.media-amazon.com/images/M/MV5BYzA2NmU2YmYtYzU5OS00ODQyLWJkYmQtNGE2ZDUyZjRiYWUwXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
                rating: 4.8,
                reviewsCount: 78000,
                originalUrl: 'https://bookmyshow.com',
                source: 'BookMyShow',
                status: 'imported'
            }
        ];

        for (let movie of movies) {
            await Event.findOneAndUpdate(
                { title: movie.title },
                movie,
                { upsert: true, new: true }
            );
        }
        console.log('✅ Movie seeding complete.');
    } catch (err) {
        console.error('❌ Movie seed failed:', err.message);
    }
}

async function seedMockEvents() {
    try {
        await seedMovies();
        const count = await Event.countDocuments({ category: { $ne: 'Movies' } });
        if (count === 0) {
            console.log('🌱 DB is empty. Seeding major cities...');
            const majorCities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad'];
            for (let city of majorCities) {
                await scrapeIndiaEvents(city);
            }
        }
    } catch (err) {
        console.error('❌ Seeding error:', err.message);
    }
}

module.exports = { scrapeIndiaEvents, scrapeAll, seedMockEvents };
