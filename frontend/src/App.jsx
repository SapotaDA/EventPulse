import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { RotateCw, Star } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

// Components
import Navbar from './components/Layout/Navbar';
import Hero from './components/Layout/Hero';
import EventCard from './components/Events/EventCard';
import TicketModal from './components/Modals/TicketModal';
import LocationModal from './components/Modals/LocationModal';
import { Toaster, toast } from 'react-hot-toast';
import EventSkeleton from './components/UI/EventSkeleton';
import { handleImageError } from './utils/imageHelpers';

// Services
import { fetchEvents as apiFetchEvents, triggerScrape, registerInterest } from './services/api';

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

  useEffect(() => {
    loadEvents();
    detectLocation();
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const loadEvents = async (city = location.city, searchQuery = search, cat = category) => {
    setLoading(true);
    try {
      const data = await apiFetchEvents(city, searchQuery);
      if (data && data.events) {
        setEvents(data.events);
      } else if (Array.isArray(data)) {
        setEvents(data);
      }
    } catch (err) {
      console.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await triggerScrape(location.city);
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

  const filteredEvents = events.filter(e => {
    const matchesCategory = category === 'All' || (e.category && e.category.includes(category));
    return matchesCategory;
  });

  const handleSearch = () => {
    loadEvents(location.city);
    document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      <Navbar
        user={user}
        location={location}
        onLocationClick={() => setShowLocationModal(true)}
        onLoginSuccess={(res) => {
          const decoded = jwtDecode(res.credential);
          const userData = { ...decoded, token: res.credential };
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }}
        onLogout={() => {
          if (window.confirm('Are you sure you want to logout?')) {
            setUser(null);
            localStorage.removeItem('user');
          }
        }}
        isAdmin={false}
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
        {/* Recommended Movies Section (BookMyShow Style) */}
        {!search && category === 'All' && events.filter(e => e.category?.includes('Movies')).length > 0 && (
          <div className="mb-40">
            <div className="flex-between mb-20">
              <h3 className="section-title">Recommended Movies</h3>
              <button className="text-primary font-600" onClick={() => setCategory('Movies')}>See All</button>
            </div>
            <div className="horizontal-scroll-container">
              {events.filter(e => e.category?.includes('Movies')).slice(0, 10).map(movie => (
                <div key={movie._id} className="movie-poster-card" onClick={() => { setSelectedEvent(movie); setShowTicketModal(true); }}>
                  <div className="poster-wrapper">
                    <img src={movie.imageUrl} alt={movie.title} onError={(e) => handleImageError(e, 'Movies', movie.title)} />
                    <div className="poster-rating">
                      <Star size={12} fill="currentColor" />
                      <span>{movie.rating}</span>
                    </div>
                  </div>
                  <h4 className="movie-title mt-10">{movie.title}</h4>
                  <p className="movie-meta">{movie.category?.filter(c => c !== 'Movies').join('/')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="section-header">
          <div className="flex-gap">
            <h3>{category === 'All' ? 'Upcoming Highlights' : `${category} in ${location.city}`}</h3>
          </div>
          <div className="filter-chips">
            {['All', 'Movies', 'Concerts', 'Festivals', 'Food & Drink', 'Art', 'Comedy'].map(cat => (
              <button
                key={cat}
                className={`chip ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
            <button className="refresh-chip" onClick={handleRefresh} disabled={loading}>
              <RotateCw size={16} className={loading ? 'spinning' : ''} /> Refresh
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
                  setSelectedEvent(ev);
                  setShowTicketModal(true);
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
