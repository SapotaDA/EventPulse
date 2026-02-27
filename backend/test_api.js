const axios = require('axios');

async function test() {
    try {
        const res = await axios.get('http://localhost:5000/api/events?city=India');
        console.log('Success:', res.data.length, 'events found');
    } catch (err) {
        console.error('Error Status:', err.response?.status);
        console.error('Error Data:', err.response?.data);
    }
}

test();
