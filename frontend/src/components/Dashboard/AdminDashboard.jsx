import { RotateCw, ArrowRight, MapPin, ExternalLink, Trash2 } from 'lucide-react';

const AdminDashboard = ({ events, loading, onRefresh, onBack, onImport, onClear, selectedEvent, setSelectedEvent }) => {
    return (
        <div className="dashboard-container">
            <header className="dashboard-header glass">
                <div className="container">
                    <div className="flex-between">
                        <div className="flex-gap">
                            <h2>Admin Dashboard</h2>
                            <button className={`btn-refresh ${loading ? 'spinning' : ''}`} onClick={onRefresh} title="Refresh real-time data">
                                <RotateCw size={18} />
                            </button>
                        </div>
                        <button className="btn-primary" onClick={onBack}>
                            Back to Site <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="container py-10">
                <div className="dashboard-stats flex-gap mb-40">
                    <div className="stat-card glass">
                        <span>Total Events</span>
                        <h3>{events.length}</h3>
                    </div>
                    <div className="stat-card glass">
                        <span>Imported</span>
                        <h3>{events.filter(e => e.status === 'imported').length}</h3>
                    </div>
                    <div className="stat-card glass border-error">
                        <span>System Action</span>
                        <button className="btn-error-outline" onClick={onClear} disabled={loading}>
                            <Trash2 size={16} /> Reset All Data
                        </button>
                    </div>
                </div>

                <div className="table-container glass">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Event Details</th>
                                <th>Status</th>
                                <th>City</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map(event => (
                                <tr key={event._id}>
                                    <td>
                                        <div className="table-event">
                                            <strong>{event.title}</strong>
                                            <span>{new Date(event.dateTime).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-tag ${event.status}`}>{event.status}</span>
                                    </td>
                                    <td>{event.city}</td>
                                    <td>
                                        {event.status !== 'imported' ? (
                                            <button className="btn-primary-small" onClick={() => onImport(event._id)}>
                                                Import Now
                                            </button>
                                        ) : (
                                            <span className="text-muted-small">Imported</span>
                                        )}
                                        <button className="btn-outline-small" onClick={() => setSelectedEvent(event)}>
                                            Preview
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {events.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="4" className="text-center py-40">
                                        <div className="empty-state">
                                            <RotateCw size={32} className="text-muted mb-10" />
                                            <p>No events found. Click sync to fetch data.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {selectedEvent && (
                <div className="preview-panel glass">
                    <button className="close-btn" onClick={() => setSelectedEvent(null)}>×</button>
                    <img src={selectedEvent.imageUrl} alt="" className="preview-img" />
                    <h3>{selectedEvent.title}</h3>
                    <p className="preview-desc">{selectedEvent.description}</p>
                    <div className="preview-meta">
                        <MapPin size={16} /> {selectedEvent.venue?.name || selectedEvent.venue}
                    </div>
                    <div className="preview-meta">
                        <ExternalLink size={16} /> <a href={selectedEvent.originalUrl} target="_blank">View Source</a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
