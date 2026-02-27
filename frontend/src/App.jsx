import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { RotateCw } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

// Components
import Navbar from './components/Layout/Navbar';
import Hero from './components/Layout/Hero';
import EventCard from './components/Events/EventCard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import TicketModal from './components/Modals/TicketModal';
import LocationModal from './components/Modals/LocationModal';
import { Toaster, toast } from 'react-hot-toast';
import EventSkeleton from './components/UI/EventSkeleton';

// Services
import { fetchEvents as apiFetchEvents, triggerScrape, registerInterest, importEvent, clearDatabase } from './services/api';

const App = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [success, setSuccess] = useState(false);
  const [location, setLocation] = useState({ city: 'India', detected: false });
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [category, setCategory] = useState('All');
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing'); // 'landing' or 'dashboard'

  useEffect(() => {
    loadEvents();
    detectLocation();
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const loadEvents = async (city = location.city) => {
    setLoading(true);
    try {
      const data = await apiFetchEvents(city);
      if (data && data.error) {
        if (data.database === 'disconnected') {
          toast.error("Database connection issue. Check IP whitelist.");
        }
      }
      if (Array.isArray(data)) setEvents(data);
    } catch (err) {
      console.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const resp = await triggerScrape(location.city);
      if (resp.status === 401 || resp.status === 403) {
        toast.error("Unauthorized: Admin access required");
        await loadEvents();
        return;
      }
      toast.success('Real-time sync complete');
      await loadEvents();
    } catch (err) {
      console.error('Refresh failed', err);
      loadEvents();
    } finally {
      setLoading(false);
    }
  };

  const detectLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await res.json();
          const userCity = data.city || data.locality || 'Mumbai';
          setLocation({ city: userCity, detected: true });
          loadEvents(userCity);
        } catch (err) {
          console.error("Location detection failed", err);
        }
      });
    }
  };

  const onTicketSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerInterest(email, consent, selectedEvent._id);
      setSuccess(true);
      setTimeout(() => {
        window.open(selectedEvent.originalUrl, '_blank');
        setShowTicketModal(false);
        setSuccess(false);
        setEmail('');
        setConsent(false);
      }, 1500);
    } catch (err) {
      toast.error('Registration failed. Please try again.');
    }
  };

  const handleImport = async (id) => {
    try {
      await importEvent(id, user);
      loadEvents(location.city);
    } catch (err) {
      toast.error('Event import failed');
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Are you sure? This will delete all scraped events and reset the database.')) return;
    setLoading(true);
    try {
      const res = await clearDatabase();
      if (res.ok) {
        toast.success('Database has been reset');
        await loadEvents();
      } else {
        toast.error('Unauthorized action');
      }
    } catch (err) {
      toast.error('Clear failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.venue?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || (e.category && e.category.includes(category));
    return matchesSearch && matchesCategory;
  });

  const handleSearch = () => {
    loadEvents(location.city);
    document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (view === 'dashboard' && user) {
    return (
      <AdminDashboard
        events={events}
        loading={loading}
        onRefresh={handleRefresh}
        onBack={() => setView('landing')}
        onImport={handleImport}
        onClear={handleClear}
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar
        user={user}
        view={view}
        setView={setView}
        location={location}
        onLocationClick={() => setShowLocationModal(true)}
        onLoginSuccess={(res) => {
          const decoded = jwtDecode(res.credential);
          const userData = { ...decoded, token: res.credential };
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          if (['aaravuniyal1@gmail.com', 'aaravuniyal3@gmail.com'].includes(decoded.email?.toLowerCase())) {
            setView('dashboard');
          }
        }}
        onLogout={() => {
          setUser(null);
          localStorage.removeItem('user');
          setView('landing');
        }}
        isAdmin={['aaravuniyal1@gmail.com', 'aaravuniyal3@gmail.com'].includes(user?.email?.toLowerCase())}
      />

      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        currentCity={location.city}
        onSelectCity={(city) => {
          setLocation({ ...location, city });
          loadEvents(city);
        }}
      />

      <Hero
        search={search}
        setSearch={setSearch}
        location={location}
        setLocation={setLocation}
        detectLocation={detectLocation}
        onSearch={handleSearch}
      />

      <main id="discover" className="container py-20">
        <div className="section-header">
          <h3>Upcoming Highlights</h3>
          <div className="filter-chips">
            {['All', 'Movies', 'Concerts', 'Festivals', 'Food & Drink', 'Art', 'Comedy'].map(cat => (
              <button
                key={cat}
                className={`chip ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat === 'All' ? 'All Events' : cat}
              </button>
            ))}
            <button className={`refresh-chip ${loading ? 'spinning' : ''}`} onClick={handleRefresh}>
              <RotateCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="event-grid">
            {[...Array(6)].map((_, i) => <EventSkeleton key={i} />)}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="event-grid">
            {filteredEvents.map(event => (
              <EventCard
                key={event._id}
                event={event}
                onClick={(ev) => {
                  window.open(ev.originalUrl, '_blank');
                  // Still open modal if you want to capture leads in parallel or just direct
                }}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state glass">
            <RotateCw size={48} className="text-muted mb-20" />
            <h4>No events found</h4>
            <p>Try refreshing to fetch real-time data or change your search.</p>
            <button className="btn-primary mt-20" onClick={handleRefresh}>
              Refresh Now
            </button>
          </div>
        )}
      </main>

      <TicketModal
        show={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        event={selectedEvent}
        email={email}
        setEmail={setEmail}
        consent={consent}
        setConsent={setConsent}
        onSubmit={onTicketSubmit}
        success={success}
      />

      <footer className="main-footer">
        <div className="container">
          <div className="footer-content">
            <div className="logo-small">EventPulse<span>India</span></div>
            <div className="footer-links">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Contact</a>
            </div>
            <p>© 2026 EventPulse India. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default App;
