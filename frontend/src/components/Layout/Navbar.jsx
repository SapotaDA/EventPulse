import React from 'react';
import { ShieldCheck, User, LogOut, Layout, MapPin } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Navbar = ({ user, view, setView, onLoginSuccess, onLogout, location, onLocationClick, isAdmin }) => {
    return (
        <nav className="navbar glass fixed-top">
            <div className="container flex-between">
                <div className="flex-gap">
                    <div className="logo cursor-pointer" onClick={() => setView('landing')}>
                        EventPulse<span>India</span>
                    </div>
                    {isAdmin && (
                        <span className="admin-badge">Admin</span>
                    )}
                    <div className="location-trigger" onClick={onLocationClick}>
                        <MapPin size={18} />
                        <span>{location.city}</span>
                        <span className="chevron">▼</span>
                    </div>
                </div>

                <div className="nav-actions">
                    {user ? (
                        <div className="user-profile">
                            <div className="profile-info">
                                <img src={user.picture} alt="" className="avatar" />
                                <div className="profile-text">
                                    <span className="user-name">{user.name}</span>
                                    <span className="user-role">{isAdmin ? 'Admin' : 'User'} Access</span>
                                </div>
                            </div>
                            <div className="profile-dropdown">
                                {isAdmin && (
                                    view === 'landing' ? (
                                        <button onClick={() => setView('dashboard')} className="dropdown-item">
                                            <Layout size={18} /> Dashboard
                                        </button>
                                    ) : (
                                        <button onClick={() => setView('landing')} className="dropdown-item">
                                            <Layout size={18} /> View Site
                                        </button>
                                    )
                                )}
                                <button onClick={onLogout} className="dropdown-item text-error">
                                    <LogOut size={18} /> Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="login-button-container">
                            <GoogleLogin
                                onSuccess={onLoginSuccess}
                                onError={() => console.log('Login Failed')}
                                useOneTap
                                theme="filled_black"
                                shape="pill"
                            />
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
