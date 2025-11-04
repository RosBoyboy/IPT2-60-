import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function ImageWithPlaceholder({ src, alt, style, className }) {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setLoaded(false);
        if (!src) return;
        const img = new Image();
        img.src = src;
        img.onload = () => setLoaded(true);
        img.onerror = () => setLoaded(true);
    }, [src]);

    return (
        <div style={{ position: 'relative', overflow: 'hidden', ...style }} className={className}>
            {!loaded && (
                <div style={{
                    background: '#f3f4f6',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9ca3af'
                }}>Loading image…</div>
            )}
            {src && (
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    style={{ display: loaded ? 'block' : 'none', width: '100%', height: '100%', objectFit: 'cover' }}
                />
            )}
        </div>
    );
}

export default function LandingPage() {
    const navigate = useNavigate();
    const [heroLoaded, setHeroLoaded] = useState(false);

    // Use web-accessible images as placeholders; you can replace with local files later
    const heroUrl = '/img/hero.jpg'; // if not present, component will show fallback color until loaded
    const cards = [
        { title: 'The best teachers', text: 'Our staff comes from diverse teaching backgrounds and they are some of the best in the country.', img: 'https://images.unsplash.com/photo-1523580494860-8d91f5a9b6a7?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=1' },
        { title: 'Engaging activities', text: 'FSUU has exciting annual activities planned. Have a look right now.', img: 'https://images.unsplash.com/photo-1508873699372-7ae5d9f20b2c?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=2' },
        { title: 'Come to FSUU', text: 'Our enrollment is open. Drop us a message on our contact form and we will be in touch.', img: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=3' }
    ];

    useEffect(() => {
        if (!heroUrl) return;
        const img = new Image();
        img.src = heroUrl;
        img.onload = () => setHeroLoaded(true);
        img.onerror = () => setHeroLoaded(true);
    }, [heroUrl]);

    return (
        <div style={{ fontFamily: 'Inter, Roboto, Arial, sans-serif', color: '#111827' }}>
            <header style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 2rem',
                background: '#2563eb',
                position: 'sticky',
                top: 0,
                zIndex: 30,
                boxShadow: '0 2px 8px rgba(37,99,235,0.08)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src="/img/sfms-logo2.png" alt="SFMS" style={{ height: 40 }} />
                    <div style={{ fontWeight: 700, color: '#ffffff' }}>Student Faculty Management School (SFMS)</div>
                </div>

                <nav style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
                    <a href="#calendar" style={{ color: '#ffffff', textDecoration: 'none', opacity: 0.95 }}>Calendar</a>
                    <a href="#contact" style={{ color: '#ffffff', textDecoration: 'none', opacity: 0.95 }}>Contact</a>
                    <a href="#about" style={{ color: '#ffffff', textDecoration: 'none', opacity: 0.95 }}>About us</a>
                    <a href="https://www.urios.edu.ph" target="_blank" rel="noreferrer" style={{ color: '#ffffff', textDecoration: 'none', opacity: 0.95 }}>FSUU Website</a>
                    <Link to="/login"><button style={{ background: '#ffffff', color: '#2563eb', border: 'none', padding: '0.5rem 0.9rem', borderRadius: 999 }}>Log in</button></Link>
                </nav>
            </header>

            {/* Hero */}
            <section style={{ position: 'relative', height: 420, overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    background: heroLoaded ? `url(${heroUrl}) center/cover no-repeat` : 'linear-gradient(180deg,#eef2ff,#f8fafc)'
                }} />

                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(17,24,39,0.65) 0%, rgba(17,24,39,0.15) 60%)' }} />

                <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', alignItems: 'center' }}>
                    <div style={{ maxWidth: 980, margin: '0 auto', padding: '2rem', display: 'flex', gap: 24, alignItems: 'center' }}>
                        <div style={{ color: '#fff', maxWidth: 520 }}>
                            <h1 style={{ fontSize: 42, lineHeight: 1.05, margin: 0 }}>Welcome to SFMS</h1>
                            <p style={{ marginTop: 12, color: 'rgba(255,255,255,0.9)' }}>Student Faculty Management School — empowering learners through excellence, values and service.</p>
                            <div style={{ marginTop: 18 }}>
                                <a href="#about"><button style={{ background: '#fff', color: '#111827', border: 'none', padding: '0.6rem 1rem', borderRadius: 999 }}>About us</button></a>
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            {/* right side can show a preview image or be empty for the large hero */}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section style={{ background: '#f8fafc', padding: '3rem 1rem' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 36 }}>
                    {cards.map((c, idx) => (
                        <div key={idx} style={{ background: '#fff', borderRadius: 10, padding: 20, textAlign: 'center', boxShadow: '0 6px 18px rgba(15,23,42,0.06)' }}>
                            <div style={{ height: 180, borderRadius: 8, overflow: 'hidden' }}>
                                <ImageWithPlaceholder src={c.img} alt={c.title} />
                            </div>
                            <h3 style={{ marginTop: 18 }}>{c.title}</h3>
                            <p style={{ color: '#6b7280' }}>{c.text}</p>
                            <div style={{ marginTop: 12 }}>
                                <button style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.5rem 0.9rem', borderRadius: 6 }}>Learn more</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <footer style={{ padding: '2rem 1rem', background: '#fff' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', color: '#6b7280' }}>Built for classroom/demo use.</div>
            </footer>
        </div>
    );
}


