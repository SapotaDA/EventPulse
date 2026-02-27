import React from 'react';
import { motion } from 'framer-motion';

const EventSkeleton = () => {
    return (
        <div className="event-card glass animate-pulse-slow">
            <div className="card-image-container bg-surface-hover" style={{ height: '200px' }}></div>
            <div className="card-content">
                <div className="h-6 w-3/4 bg-surface-hover rounded mb-4"></div>
                <div className="space-y-2">
                    <div className="h-4 w-1/2 bg-surface-hover rounded"></div>
                    <div className="h-4 w-2/3 bg-surface-hover rounded"></div>
                </div>
                <div className="h-10 w-full bg-surface-hover rounded mt-6"></div>
            </div>
        </div>
    );
};

export default EventSkeleton;
