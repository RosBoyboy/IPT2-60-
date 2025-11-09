import React from 'react';

export default function LandingPage() {

    return (
        <div className="lp-root">
            <header className="lp-header">
                <div className="lp-container">
                    <nav className="lp-nav">
                        <div className="lp-brand">
                            <img src="/img/sfms-logo2.png" alt="SFMS" />
                            <div className="lp-brand-name">
                                <span>SFMS</span>
                                <small className="lp-brand-sub">Student Faculty Management School</small>
                            </div>
                        </div>
                        <div className="lp-links">
                            <a href="#calendar">Calendar</a>
                            <a href="#contact">Contact</a>
                            <a href="#about">About us</a>
                            <a className="lp-btn lp-btn-primary" href="http://127.0.0.1:8000/login">Log in</a>
                        </div>
                    </nav>
                </div>
            </header>

            <main>
                <section className="lp-hero">
                    <div className="lp-container lp-hero-inner">
                        <div>
                            <h1>Student Faculty Management System</h1>
                            <p>Student &amp; Faculty Management</p>
                            <a className="lp-btn lp-btn-primary" href="http://127.0.0.1:8000/login">Get Started</a>
                        </div>
                    </div>
                </section>

                <div className="lp-container lp-grid">
                    <div className="lp-card">
                        <img src="/img/the_best_teacher.jpg" alt="Best Teacher" />
                        <h3>Experienced Faculty</h3>
                        <p>Learn from the best instructors who guide and inspire students every day.</p>
                        <button className="lp-cta-small">Learn more</button>
                    </div>
                    <div className="lp-card">
                        <img src="/img/Engaging_activities.jpg" alt="Activities" />
                        <h3>Engaging Activities</h3>
                        <p>Hands-on projects and events that build skills beyond the classroom.</p>
                        <button className="lp-cta-small">View events</button>
                    </div>
                    <div className="lp-card">
                        <img src="/img/Come to Sfms.webp" alt="Come to SFMS" />
                        <h3>Join Us</h3>
                        <p>Be part of our community—academic excellence and values combined.</p>
                        <button className="lp-cta-small">Apply now</button>
                    </div>
                </div>
            </main>

            {/* Modal removed: login buttons now redirect to backend at http://127.0.0.1:8000/login */}
        </div>
    );
}
