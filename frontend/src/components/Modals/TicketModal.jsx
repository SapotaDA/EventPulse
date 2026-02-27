import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Mail, ExternalLink, ShieldCheck } from 'lucide-react';

const TicketModal = ({ show, onClose, event, email, setEmail, consent, setConsent, onSubmit, success }) => {
    if (!show) return null;

    return (
        <AnimatePresence>
            <div className="modal-overlay">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="modal-content glass"
                >
                    <button className="close-btn" onClick={onClose}>×</button>

                    {success ? (
                        <div className="success-view">
                            <CheckCircle size={64} color="#10b981" />
                            <h2>Redirecting...</h2>
                            <p>Taking you to the official ticket site.</p>
                        </div>
                    ) : (
                        <div className="ticket-form">
                            <div className="modal-header">
                                <div className="modal-logo">🎫</div>
                                <h2>Get Tickets</h2>
                                <p>Join the pulse of the city. Secure your spot for this premium event.</p>
                            </div>
                            <form onSubmit={onSubmit}>
                                <div className="input-group">
                                    <label>EMAIL ADDRESS</label>
                                    <div className="input-with-icon">
                                        <Mail size={18} />
                                        <input
                                            type="email"
                                            placeholder="your@email.com"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="consent-group">
                                    <input
                                        type="checkbox"
                                        id="consent"
                                        required
                                        checked={consent}
                                        onChange={(e) => setConsent(e.target.checked)}
                                    />
                                    <label htmlFor="consent">I'd like to receive updates on similar events</label>
                                </div>
                                <button type="submit" className="btn-primary w-full">
                                    Continue to Tickets <ExternalLink size={16} />
                                </button>
                            </form>
                            <p className="modal-footer">
                                <ShieldCheck size={14} /> Secure checkout powered by EventPulse
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default TicketModal;
