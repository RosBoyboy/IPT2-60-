import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function StudentLogin() {
    const navigate = useNavigate();

    return (
        <div className="sl-wrap">
            <div className="sl-container">
                <div className="sl-panel">
                    <h2>Student login</h2>
                    <p className="sl-muted">This page is a placeholder for student authentication. Replace with your own logic later.</p>
                    <div className="sl-actions">
                        <button className="sl-btn sl-btn-primary" onClick={() => {
                            fetch('/sanctum/csrf-cookie', { credentials: 'same-origin' })
                                .finally(() => navigate('/dashboard'));
                        }}>Continue (simulate)</button>
                        <button className="sl-btn" onClick={() => navigate('/')}>Back to home</button>
                    </div>
                </div>
                <div className="sl-slot">Add your student login image/content here</div>
            </div>
        </div>
    );
}


