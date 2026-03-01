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
    'Concerts': ['concert', 'music', 'dj', 'live', 'band', 'gig', 'performance', 'singer', 'unplugged', 'bolly', 'melody'],
    'Festivals': ['festival', 'fest', 'celebration', 'fair', 'mela', 'carnival', 'gala', 'utsav'],
    'Food & Drink': ['food', 'drink', 'wine', 'beer', 'dining', 'brunch', 'kitchen', 'cooking', 'party', 'brunch', 'culinary', 'buffet', 'taste'],
    'Tech': ['tech', 'startup', 'coding', 'ai', 'blockchain', 'software', 'developer', 'hacker', 'webinar', 'data'],
    'Art': ['art', 'exhibition', 'painting', 'gallery', 'workshop', 'creative', 'design', 'craft', 'poetry', 'literature', 'museum'],
    'Comedy': ['comedy', 'standup', 'laughter', 'jokes', 'open mic', 'comic'],
    'Workshop': ['workshop', 'class', 'learn', 'training', 'session', 'masterclass', 'bootcamp'],
    'Movies': ['movie', 'film', 'cinema', 'screening', 'theatre', 'show']
};

function detectCategory(title, description = '') {
    const text = (title + ' ' + description).toLowerCase();
    for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
        if (keywords.some(k => text.includes(k))) return cat;
    }
    return 'Other';
}

const puppeteer = require('puppeteer');

/**
 * Scraper for Townscript.com (High-quality localized events)
 * Upgraded to Puppeteer for robustness against anti-bot measures
 */
async function scrapeTownscript(city) {
    const slug = CITY_MAP[city]?.townscript || city.toLowerCase();
    const url = `https://www.townscript.com/india/${slug}/all-events`;

    let browser;
    try {
        console.log(`🤖 Puppeteer scraping Townscript for ${city}...`);
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Emulate a real browser
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 800 });

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Wait for event cards to appear
        await page.waitForSelector('.event-card', { timeout: 10000 }).catch(() => console.log('No event cards found on Townscript'));

        // Scroll a bit to trigger lazy loading
        await page.evaluate(() => window.scrollBy(0, 500));
        await new Promise(r => setTimeout(r, 1000));

        const events = await page.evaluate((city, url) => {
            const cards = document.querySelectorAll('.event-card');
            const results = [];

            cards.forEach(el => {
                const title = el.querySelector('.event-title')?.innerText?.trim();
                const dateStr = el.querySelector('.event-date')?.innerText?.trim();
                const venue = el.querySelector('.event-venue')?.innerText?.trim();
                // Prefer the banner image, usually inside a specific class
                const img = el.querySelector('.event-card-img img, .card-image img, img');
                const imageUrl = img?.src || img?.getAttribute('data-src') || img?.getAttribute('src');
                const originalUrl = el.querySelector('a')?.href;

                if (title && originalUrl) {
                    results.push({
                        title,
                        dateStr,
                        venue: venue || 'Venue TBD',
                        imageUrl,
                        originalUrl
                    });
                }
            });
            return results;
        }, city, url);

        await browser.close();

        return events.map(e => ({
            title: e.title,
            dateTime: new Date(e.dateStr) > new Date() ? new Date(e.dateStr) : new Date(),
            venue: { name: e.venue || 'Venue TBD', address: city },
            city,
            description: `Experience ${e.title} happening in ${city}.`,
            category: [detectCategory(e.title)],
            imageUrl: e.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4',
            rating: (Math.random() * (4.9 - 4.2) + 4.2).toFixed(1),
            reviewsCount: Math.floor(Math.random() * 800) + 50,
            originalUrl: e.originalUrl,
            source: 'Townscript',
            status: 'new'
        }));

    } catch (err) {
        console.error(`Townscript error (${city}):`, err.message);
        if (browser) await browser.close();
        return [];
    }
}

/**
 * Scraper for AllEvents.in (Reliable fallback)
 */
async function scrapeAllEventsIn(city) {
    const slug = CITY_MAP[city]?.allevents || city.toLowerCase().replace(/\s+/g, '-');
    const url = `https://allevents.in/${slug}/all`;

    let browser;
    try {
        console.log(`🤖 Puppeteer scraping AllEvents for ${city}...`);
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Wait for event cards
        await page.waitForSelector('.event-card, .event-item', { timeout: 10000 }).catch(() => console.log('No event cards found on AllEvents'));

        const events = await page.evaluate((city) => {
            const cards = document.querySelectorAll('.event-card, .event-item');
            const results = [];

            cards.forEach(el => {
                const title = el.querySelector('h3, .title h3')?.innerText?.trim();
                const date = el.querySelector('.up-event-date, .date')?.innerText?.trim();
                const venue = el.querySelector('.up-venue, .venue')?.innerText?.trim();
                const img = el.querySelector('img');
                const imageUrl = img?.getAttribute('data-src') || img?.getAttribute('data-original') || img?.src;
                const originalUrl = el.getAttribute('data-url') || el.querySelector('a')?.href;

                if (title && originalUrl) {
                    results.push({
                        title,
                        date,
                        venue: venue || 'Venue TBD',
                        imageUrl,
                        originalUrl
                    });
                }
            });
            return results;
        }, city);

        await browser.close();

        return events.map(e => ({
            title: e.title,
            dateTime: new Date(e.date) > new Date() ? new Date(e.date) : new Date(),
            venue: { name: e.venue || 'Venue TBD', address: city },
            city,
            description: `Join us for ${e.title} in ${city}!`,
            category: [detectCategory(e.title)],
            imageUrl: e.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
            rating: (Math.random() * (4.8 - 4.0) + 4.0).toFixed(1),
            reviewsCount: Math.floor(Math.random() * 300) + 20,
            originalUrl: e.originalUrl.startsWith('http') ? e.originalUrl : `https://allevents.in${e.originalUrl}`,
            source: 'AllEvents.in',
            status: 'new'
        }));
    } catch (err) {
        console.error(`AllEvents error (${city}):`, err.message);
        if (browser) await browser.close();
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
        console.log('🎬 Syncing trending movies catalog...');
        const movies = [
            {
                title: 'Pushpa 2: The Rule',
                dateTime: new Date(new Date().setHours(18, 0, 0, 0)),
                venue: { name: 'PVR: ICON, Infinity Mall', address: 'Mumbai' },
                city: 'Mumbai',
                description: 'Witness the ultimate clash in this high-octane action drama following Pushpa Raj\'s rise to power.',
                category: ['Movies', 'Action', 'Drama'],
                imageUrl: 'https://m.media-amazon.com/images/M/MV5BMzNjN2E0N2MtNDYxYS00OTM0LThjMzktMDdjNmY1YjYyNzgyXkEyXkFqcGc@._V1_.jpg',
                rating: 4.9,
                reviewsCount: 142000,
                originalUrl: 'https://bookmyshow.com/mumbai/movies/pushpa-2-the-rule/ET00356677',
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
                imageUrl: 'https://m.media-amazon.com/images/M/MV5BMmU1MGY2NDctMzlhMy00NThjLWExNTUtNDdmYmI2ODNhMDU3XkEyXkFqcGc@._V1_.jpg',
                rating: 4.5,
                reviewsCount: 92000,
                originalUrl: 'https://bookmyshow.com/delhi/movies/singham-again/ET00363951',
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
                imageUrl: 'https://m.media-amazon.com/images/M/MV5BMDQ5ODBlY2ItZjZjNC00YzZlLWE2OWUtYmE3ZWI0ZWM1ZTRiXkEyXkFqcGc@._V1_.jpg',
                rating: 4.7,
                reviewsCount: 54000,
                originalUrl: 'https://bookmyshow.com/delhi/movies/dhadak-2/ET00398322',
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
                imageUrl: 'https://m.media-amazon.com/images/M/MV5BYzA2NmU2YmYtYzU5OS00ODQyLWJkYmQtNGE2ZDUyZjRiYWUwXkEyXkFqcGc@._V1_.jpg',
                rating: 4.8,
                reviewsCount: 78000,
                originalUrl: 'https://bookmyshow.com/gurgaon/movies/sky-force/ET00371539',
                source: 'BookMyShow',
                status: 'imported'
            },
            {
                title: 'Game Changer',
                dateTime: new Date(new Date().setHours(17, 0, 0, 0)),
                venue: { name: 'Prasad’s IMAX', address: 'Hyderabad' },
                city: 'Hyderabad',
                description: 'A political action drama about an honest officer fighting corruption in the system.',
                category: ['Movies', 'Action', 'Drama'],
                imageUrl: 'https://m.media-amazon.com/images/M/MV5BNmU1MGY2NDctMzlhMy00NThjLWExNTUtNDdmYmI2ODNhMDU3XkEyXkFqcGc@._V1_.jpg',
                rating: 4.6,
                reviewsCount: 65000,
                originalUrl: 'https://bookmyshow.com/hyderabad/movies/game-changer/ET00311713',
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
            console.log(`📌 Updated: ${movie.title}`);
        }
        console.log('✅ Movie seeding complete.');
    } catch (err) {
        console.error('❌ Movie seed failed:', err.message);
    }
}

async function seedMockEvents() {
    try {
        console.log('🏃 Starting Seed Process...');
        await seedMovies();
        const count = await Event.countDocuments({ category: { $ne: 'Movies' } });
        console.log(`📊 Found ${count} non-movie events.`);
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

module.exports = { scrapeIndiaEvents, scrapeAll, seedMockEvents, seedMovies };
