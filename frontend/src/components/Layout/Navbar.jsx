import React from 'react';
import { LogOut, MapPin } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Navbar = ({ user, onLoginSuccess, onLogout, location, onLocationClick, isAdmin }) => {
    return (
        <nav className="navbar glass fixed-top">
            <div className="container flex-between">
                <div className="flex-gap">
                    <div className="logo cursor-pointer">
                        EventPulse<span>India</span>
                    </div>
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
                                    <span className="user-role">Guest Access</span>
                                </div>
                            </div>
                            <div className="profile-dropdown">
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
