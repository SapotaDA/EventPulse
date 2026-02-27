import React from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin } from 'lucide-react';

const Hero = ({ search, setSearch, location, setLocation, detectLocation, onSearch }) => {
    return (
        <section className="hero">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hero-content"
                >
                    <div className="badge">
                        <span className="pulse-dot"></span>
                        Live in {location.city}
                    </div>
                    <h1>Discover Amazing <span className="text-gradient">Experiences</span></h1>
                    <p>Find and book the best virtual and local events happening in India. From concerts to workshops, we've got you covered.</p>

                    <div className="search-bar-container">
                        <div className="search-bar glass shadow-2xl">
                            <div className="search-input">
                                <Search className="text-muted" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search concerts, festivals..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
                                />
                            </div>
                            <div className="location-input">
                                <MapPin
                                    className="text-primary cursor-pointer"
                                    size={20}
                                    onClick={detectLocation}
                                    title="Detect my location"
                                />
                                <input
                                    type="text"
                                    placeholder="City (e.g. Mumbai)"
                                    value={location.city}
                                    onChange={(e) => setLocation({ ...location, city: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
                                />
                            </div>
                            <button className="btn-primary" onClick={onSearch}>Search</button>
                        </div>
                    </div>

                    <div className="hero-stats">
                        <div className="stat">
                            <strong>500+</strong>
                            <span>Events Weekly</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat">
                            <strong>50k+</strong>
                            <span>Tickets Sold</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat">
                            <strong>99%</strong>
                            <span>Happy Users</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
