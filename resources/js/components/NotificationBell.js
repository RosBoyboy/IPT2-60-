import React, { useEffect, useRef, useState } from 'react';

export default function NotificationBell({ wrapperZIndex = 2000, dropdownZIndex = 4000 }) {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    const save = (list) => {
        try { localStorage.setItem('sfms_notifications', JSON.stringify(list)); } catch (e) {}
    };

    const seed = () => [];

    const loadFromStorage = () => {
        try {
            const raw = localStorage.getItem('sfms_notifications');
            if (raw) {
                const arr = JSON.parse(raw);
                if (Array.isArray(arr)) {
                    setNotifications(arr.map(n => ({ ...n, time: typeof n?.time === 'number' && isFinite(n.time) ? n.time : Date.now() })));
                    return;
                }
            }
        } catch (e) {}
        setNotifications(seed());
    };

    useEffect(() => { loadFromStorage(); }, []);

    useEffect(() => { save(notifications); }, [notifications]);

    useEffect(() => {
        const onDown = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        const onStorage = (e) => {
            if (e && e.key && e.key !== 'sfms_notifications') return;
            loadFromStorage();
        };
        const onCustom = () => loadFromStorage();
        window.addEventListener('storage', onStorage);
        window.addEventListener('sfms-notifications-updated', onCustom);
        return () => {
            document.removeEventListener('mousedown', onDown);
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('sfms-notifications-updated', onCustom);
        };
    }, []);

    const withStroke = (isWhite) => ({ stroke: isWhite ? 'white' : 'currentColor' });
    const bellIcon = () => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...withStroke(false)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8"></path>
            <path d="M13.73 21a2 2 0 01-3.46 0"></path>
        </svg>
    );

    const formatTimeAgo = (timestamp) => {
        const value = Number(timestamp);
        if (!isFinite(value)) return '';
        const diffMs = Date.now() - value;
        const minutes = Math.floor(diffMs / 60000);
        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="notification-wrapper" ref={wrapperRef} style={{ position: 'relative', zIndex: wrapperZIndex }}>
            <button 
                className={`icon-circle ${unreadCount > 0 ? 'has-badge' : ''}`}
                title="Notifications"
                onClick={() => setOpen(prev => !prev)}
                aria-expanded={open}
            >
                {bellIcon()}
                {unreadCount > 0 && (
                    <span className="icon-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>
            {open && (
                <div 
                    className="notifications-dropdown" 
                    style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: 320, background: 'white', borderRadius: 12, boxShadow: '0 16px 40px rgba(0,0,0,0.18)', overflow: 'hidden', zIndex: dropdownZIndex }}
                >
                    <div className="dropdown-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid #eee' }}>
                        <strong>Notifications</strong>
                        <div className="dropdown-actions" style={{ display: 'flex', gap: 8 }}>
                            <button 
                                className="link-button small" 
                                style={{ color: unreadCount ? '#0f79e0' : '#9aa4b2' }}
                                onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                                disabled={unreadCount === 0}
                            >
                                Mark all as read
                            </button>
                            <button 
                                className="link-button small" 
                                style={{ color: notifications.length ? '#ef4444' : '#9aa4b2' }}
                                onClick={() => setNotifications([])}
                                disabled={notifications.length === 0}
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                    <ul className="dropdown-list" style={{ maxHeight: 360, overflowY: 'auto', margin: 0, padding: 0 }}>
                        {notifications.length === 0 ? (
                            <li className="empty" style={{ padding: '16px 14px', color: '#666' }}>No notifications</li>
                        ) : (
                            notifications.map(n => (
                                <li 
                                    key={n.id} 
                                    className={`dropdown-item ${n.read ? 'read' : 'unread'}`}
                                    onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                                    style={{ display: 'flex', gap: 12, padding: '12px 14px', cursor: 'pointer', background: n.read ? 'white' : '#f7fbff' }}
                                >
                                    <span 
                                        className="dot" 
                                        style={{ width: 8, height: 8, borderRadius: 9999, marginTop: 8, backgroundColor: n.type === 'success' ? '#16a34a' : (n.type === 'warning' ? '#f59e0b' : '#0ea5e9') }}
                                    ></span>
                                    <div className="content" style={{ flex: 1 }}>
                                        <div className="title" style={{ fontWeight: 600, fontSize: 13 }}>{n.title}</div>
                                        <div className="desc" style={{ fontSize: 12, color: '#444', marginTop: 2 }}>{n.desc}</div>
                                        <div className="time" style={{ fontSize: 11, color: '#888', marginTop: 6 }}>{formatTimeAgo(n.time)}</div>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}





