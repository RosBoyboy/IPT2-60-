import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="lp-root">
                {/* Header (kept simple) and hero will match the example: hero full-bleed background with left-aligned overlay text */}
                <style>{`
                    :root{ --blue: #2563eb; }
                    /* Header: blue, larger, navbar-like */
                    .lp-header{ background: var(--blue); position:sticky; top:0; z-index:40; box-shadow: 0 4px 20px rgba(2,6,23,0.08); }
                    .lp-container{ max-width:1200px; margin:0 auto; padding:0 1rem 0 1.5rem; }
                    .lp-nav{ display:flex; align-items:center; justify-content:space-between; padding:1rem 0; }
                    .lp-brand{ display:flex; align-items:center; gap:14px; margin-left:8px; }
                    /* Slightly larger logo to match reference and nudge into position */
                    .lp-brand img{ height:64px; width:auto; display:block; }
                    .lp-brand-name{ color:#fff; font-weight:800; font-size:20px; line-height:1; display:flex; flex-direction:column; }
                    .lp-brand-sub{ color: rgba(255,255,255,0.9); font-size:12px; font-weight:600; margin-top:2px; }
                    .lp-links{ display:flex; gap:22px; align-items:center; margin-right:12px; }
                    .lp-links a{ color:#fff; text-decoration:none; font-weight:700; padding:8px 10px; border-radius:6px; }
                    .lp-links a:hover{ background: rgba(255,255,255,0.06); }
                    /* Inverse button style for header: white bg with blue text */
                    .lp-btn-primary{ background:#fff; color:var(--blue); border:none; padding:0.45rem 0.95rem; border-radius:8px; font-weight:800; }

                    /* Full-bleed hero */
                    .lp-hero{ background-image: url('/img/Welcome_to_SFMS.jpg'); background-position:center; background-size:cover; background-repeat:no-repeat; height:560px; position:relative; display:flex; align-items:center; }
                    /* Removed dark overlay to highlight the background image (school) */
                    .lp-hero-inner{ position:relative; z-index:2; max-width:1100px; margin:0 auto; padding:2.25rem; display:flex; gap:36px; align-items:center; }
                    /* Left content occupies natural space; no blocking right image slot so background shows through */
                    .lp-hero-inner > div:first-child{ flex:1 1 100%; }
                    .lp-hero h1{ color:#fff; font-size:48px; line-height:1.02; margin:0 0 12px 0; text-shadow:0 6px 20px rgba(2,6,23,0.45); }
                    .lp-hero p{ color: rgba(255,255,255,0.95); margin:0 0 18px 0; font-size:18px; }
                    .lp-hero .lp-cta{ background:#fff; color:var(--blue); padding:0.7rem 1.1rem; border-radius:999px; font-weight:700; border:none; }

                    /* Features/cards: make a clean 3-column section like the reference */
                    /* Make the cards horizontally scrollable so content can overflow at 100% width and show a scrollbar */
                    .lp-grid{ display:flex; gap:32px; margin-top:60px; padding:40px; background: #f3f6f9; border-radius:10px; overflow-x:auto; overflow-y:hidden; -webkit-overflow-scrolling:touch; }
                    .lp-grid::-webkit-scrollbar{ height:10px; }
                    .lp-grid::-webkit-scrollbar-thumb{ background: rgba(37,99,235,0.9); border-radius:6px; }
                    .lp-card{ background:#fff; text-align:center; padding:22px; min-width:360px; border-radius:12px; box-shadow:0 6px 18px rgba(2,6,23,0.04); display:flex; flex-direction:column; align-items:center; gap:12px; }
                    .lp-card img{ width:320px; height:200px; object-fit:cover; border-radius:10px; box-shadow:0 8px 24px rgba(2,6,23,0.06); display:block; }
                    .lp-card h3{ margin-top:8px; font-size:18px; font-weight:700; color:#0f172a; }
                    .lp-card p{ color:#6b7280; font-size:15px; margin:6px 0 12px; max-width:320px; }
                    .lp-card .lp-cta-small{ background:var(--blue); color:#fff; border:none; padding:10px 18px; border-radius:6px; font-weight:700; }
                `}</style>
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
                                {/* removed FSUU Website link as requested */}
                                <button className="lp-btn-primary" onClick={() => setIsModalOpen(true)}>Log in</button>
                            </div>
                        </nav>
                    </div>
                </header>

            <main>
                <section className="lp-hero">
                    <div className="lp-container lp-hero-inner">
                        <div>
                            <h1>Welcome to the Father Saturnino Urios University</h1>
                            <p>Empowering learners through excellence, values, and service.</p>
                            <button className="lp-btn lp-btn-primary" onClick={() => setIsModalOpen(true)}>Get Started</button>
                        </div>
                        {/* removed right-side image slot so the school's background image is fully visible */}
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

            {isModalOpen && (
                <div className="lp-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
                    <div className="lp-modal">
                        <div className="lp-modal-header">
                            <div className="lp-modal-title">Log in</div>
                            <button className="lp-close" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <div className="lp-modal-body">
                            <div className="lp-login-options">
                                <button className="lp-btn lp-btn-outline" onClick={() => navigate('/student-login')}>Student login</button>
                                <div className="lp-muted">Use your student account (simulation)</div>
                                <button className="lp-btn lp-btn-primary" onClick={() => navigate('/login')}>Admin log in</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


