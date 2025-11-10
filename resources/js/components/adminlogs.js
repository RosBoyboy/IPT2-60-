// ...existing code...
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogs() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    function handleSubmit(e) {
        e.preventDefault();
        // Hardcoded admin credentials
        if (username === 'admin' && password === 'admin456') {
            localStorage.setItem('sfms_auth', 'true');
            navigate('/dashboard');
        } else {
            setError('Invalid username or password');
        }
    }

    return (
        <div className="sfms-login-page">
            <div className="login-card">
                <div className="brand">
                    <div className="login-logo">
                        <img src="/img/sfms-logo2.png" alt="SFMS Logo" />
                    </div>
                    <h2>SFMS Management System</h2>
                    <p>Student & Faculty Management</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <label>Username</label>
                    <div className="input">
                        <span className="input-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" width="18" height="18" focusable="false">
                                <circle cx="12" cy="8" r="4" fill="currentColor" />
                                <path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    <label>Password</label>
                    <div className="input">
                        <span className="input-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" width="18" height="18" focusable="false">
                                <rect x="4" y="10" width="16" height="10" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2" />
                                <path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </span>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    {error && <div className="form-error">{error}</div>}

                    <button type="submit" className="btn-login">Login</button>
                </form>
            </div>
        </div>
    );
}
// ...existing code...