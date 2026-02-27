import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ExternalLink, Star } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import { handleImageError, getPlaceholderImage } from '../../utils/imageHelpers';

const EventCard = ({ event, onClick }) => {
    const isFeatured = event.rating >= 4.5;

    return (
        <motion.div
            className="event-card glass hover-lift"
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -8 }}
        >
            <div className="card-image-container">
                <img
                    src={event.imageUrl || getPlaceholderImage(event.category?.[0], event.title)}
                    alt={event.title}
                    className="card-image"
                    loading="lazy"
                    onError={(e) => handleImageError(e, event.category?.[0], event.title)}
                />

                {isFeatured && (
                    <div className="card-badge featured-badge">
                        <Star size={10} fill="currentColor" />
                        <span>Featured</span>
                    </div>
                )}
                {!isFeatured && (
                    <div className="card-badge">
                        {event.category?.[0] || 'Recommended'}
                    </div>
                )}

                {event.rating > 0 && (
                    <div className="card-rating-pill">
                        <div className="rating-score">
                            <Star size={12} fill="currentColor" />
                            <span>{event.rating.toFixed(1)}/5</span>
                        </div>
                        <span className="rating-votes">{event.reviewsCount || 0} votes</span>
                    </div>
                )}
            </div>
            <div className="card-content">
                <h3 className="card-title">{event.title}</h3>
                <div className="card-info">
                    <div className="info-item">
                        <Calendar size={14} />
                        <span>{formatDate(event.dateTime)}</span>
                    </div>
                    <div className="info-item">
                        <MapPin size={14} />
                        <span className="text-truncate">{event.venue?.name || 'Venue TBD'}</span>
                    </div>
                </div>
                <button className="btn-book-tour w-full mt-10" onClick={() => onClick(event)}>
                    <span>Get Tickets</span>
                    <ExternalLink size={14} />
                </button>
            </div>
        </motion.div>
    );
};

export default EventCard;
