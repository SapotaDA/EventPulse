import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, X, Check } from 'lucide-react';

const POPULAR_CITIES = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad',
    'Chennai', 'Pune', 'Ahmedabad', 'Kolkata',
    'Gurgaon', 'Noida', 'Chandigarh', 'Jaipur'
];

const LocationModal = ({ isOpen, onClose, currentCity, onSelectCity }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCities = POPULAR_CITIES.filter(city =>
        city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="modal-overlay">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="location-modal glass"
                >
                    <div className="location-modal-header">
                        <div className="flex items-center gap-2">
                            <MapPin className="text-primary" size={20} />
                            <h3>Select City</h3>
                        </div>
                        <button className="close-btn" onClick={onClose}><X size={20} /></button>
                    </div>

                    <div className="location-search">
                        <Search size={18} className="text-muted" />
                        <input
                            type="text"
                            placeholder="Search for your city..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="popular-cities-section">
                        <h4>Popular Cities</h4>
                        <div className="cities-grid">
                            {POPULAR_CITIES.map(city => (
                                <button
                                    key={city}
                                    className={`city-pill ${currentCity === city ? 'active' : ''}`}
                                    onClick={() => {
                                        onSelectCity(city);
                                        onClose();
                                    }}
                                >
                                    {city}
                                    {currentCity === city && <Check size={12} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {searchTerm && filteredCities.length === 0 && (
                        <div className="empty-search">
                            <p>No cities found for "{searchTerm}"</p>
                            <button
                                className="btn-primary mt-10"
                                onClick={() => {
                                    onSelectCity(searchTerm);
                                    onClose();
                                }}
                            >
                                Use "{searchTerm}"
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LocationModal;
