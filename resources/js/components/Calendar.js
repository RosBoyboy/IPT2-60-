import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

export default function CalendarPage() {
  const navigate = useNavigate();
  const [profileName, setProfileName] = useState('');
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setProfileName((data.user && data.user.name) || 'Admin');
        }
      } catch (e) {}
    })();
  }, []);

  const [baseDate, setBaseDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const today = new Date();

  const { monthLabel, weeks } = useMemo(() => {
    const monthFormatter = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' });
    const label = monthFormatter.format(baseDate);

    // Compute days matrix (weeks x 7)
    const firstDayIdx = (baseDate.getDay() + 6) % 7; // make Monday=0
    const daysInMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayIdx; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(baseDate.getFullYear(), baseDate.getMonth(), d));
    }
    while (days.length % 7 !== 0) {
      days.push(null);
    }

    const grid = [];
    for (let i = 0; i < days.length; i += 7) {
      grid.push(days.slice(i, i + 7));
    }
    return { monthLabel: label, weeks: grid };
  }, [baseDate]);

  const initials = (profileName || 'Admin')
    .split(' ')
    .map(n => n && n[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase();

  function logout() {
    localStorage.removeItem('sfms_auth');
    navigate('/login');
  }

  const isSameDate = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  return (
    <div className="sfms-dashboard">
      <aside className="sfms-sidebar">
        <div className="sidebar-brand">
          <div className="logo">
            <img src="/img/sfms-logo2.png" alt="SFMS Logo" />
          </div>
          <div className="brand-text">SFMS</div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li><Link to="/dashboard"><span className="nav-icon">{iconDashboard()}</span>Dashboard</Link></li>
            <li><Link to="/dashboard/faculty"><span className="nav-icon">{iconFaculty()}</span>Faculty</Link></li>
            <li><Link to="/dashboard/students"><span className="nav-icon">{iconStudents()}</span>Students</Link></li>
            <li className="active"><Link to="/dashboard/calendar"><span className="nav-icon">{iconCalendar()}</span>Calendar</Link></li>
            <li><Link to="/dashboard/reports"><span className="nav-icon">{iconReports()}</span>Reports</Link></li>
            <li><Link to="/dashboard/settings"><span className="nav-icon">{iconSettings()}</span>Settings</Link></li>
            <li><Link to="/dashboard/profile"><span className="nav-icon">{iconProfile()}</span>Profile</Link></li>
            
          </ul>
        </nav>
      </aside>

      <main className="sfms-main">
        <header className="topbar">
          <div className="topbar-left">
            <h4>Calendar</h4>
          </div>

          <div className="topbar-right">
            <div className="top-icons">
              <NotificationBell />
              <button className="icon-circle" title="Settings" onClick={() => navigate('/dashboard/settings')}>
                {iconSettings()}
              </button>
              <button className="profile-chip" title="Profile" onClick={() => navigate('/dashboard/profile')}>
                <span className="avatar-sm">{initials}</span>
                <span className="profile-name">{profileName || 'Admin'}</span>
              </button>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="calendar-card">
            <div className="calendar-header">
              <button className="icon-circle" aria-label="Previous month" onClick={() => setBaseDate(new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, 1))}>{iconChevronLeft()}</button>
              <div className="calendar-title">{monthLabel}</div>
              <button className="icon-circle" aria-label="Next month" onClick={() => setBaseDate(new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1))}>{iconChevronRight()}</button>
            </div>

            <div className="calendar-grid">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                <div key={d} className="calendar-dow">{d}</div>
              ))}
              {weeks.map((week, wi) => (
                <React.Fragment key={wi}>
                  {week.map((d, di) => {
                    const isToday = d && isSameDate(d, today);
                    const label = d ? d.getDate() : '';
                    return (
                      <div key={di} className={`calendar-cell ${d ? '' : 'empty'} ${isToday ? 'today' : ''}`}>
                        <span className="calendar-day-number">{label}</span>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Icon components (stroke currentColor) ---
function iconCalendar() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="4" ry="4"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );
}
function iconSettings() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c0 .69.28 1.32.73 1.77.45.45 1.08.73 1.77.73h.09a2 2 0 010 4h-.09a1.65 1.65 0 00-1.77.73z"></path>
    </svg>
  );
}
function iconBell() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8"></path>
      <path d="M13.73 21a2 2 0 01-3.46 0"></path>
    </svg>
  );
}
function iconChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  );
}
function iconChevronRight() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  );
}

// Sidebar icons
function iconDashboard() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="2"></rect>
      <rect x="14" y="3" width="7" height="7" rx="2"></rect>
      <rect x="14" y="14" width="7" height="7" rx="2"></rect>
      <rect x="3" y="14" width="7" height="7" rx="2"></rect>
    </svg>
  );
}
function iconStudents() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 14c-4.418 0-8 1.79-8 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}
function iconFaculty() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20v-1c0-2.21 3.582-4 8-4s8 1.79 8 4v1"></path>
      <circle cx="10" cy="7" r="4"></circle>
      <circle cx="18" cy="8" r="3"></circle>
    </svg>
  );
}
function iconReports() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h18"></path>
      <path d="M3 6h18"></path>
      <path d="M3 18h18"></path>
    </svg>
  );
}
function iconProfile() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}
function iconLogout() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  );
}


