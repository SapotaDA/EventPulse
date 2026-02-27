const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return {
        'Content-Type': 'application/json',
        'Authorization': user ? `Bearer ${user.token}` : ''
    };
};

export const fetchEvents = async (city) => {
    const res = await fetch(`${API_BASE}/events?city=${city}`);
    return await res.json();
};

export const triggerScrape = async (city) => {
    return await fetch(`${API_BASE}/admin/scrape`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ city: city === 'India' ? null : city })
    });
};

export const registerInterest = async (email, consent, eventId) => {
    return await fetch(`${API_BASE}/tickets/interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent, eventId })
    });
};

export const importEvent = async (id, user) => {
    return await fetch(`${API_BASE}/events/${id}/import`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ importedBy: user.name, notes: 'Imported via dashboard' })
    });
}; export const clearDatabase = async () => {
    return await fetch(`${API_BASE}/admin/clear`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
};
