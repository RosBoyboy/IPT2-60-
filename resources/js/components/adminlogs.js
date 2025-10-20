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

                    <div className="demo-credentials">
                        <strong>Demo Accounts:</strong><br />
                        Admin: admin / admin456
                    </div>
                </form>
            </div>
        </div>
    );
}