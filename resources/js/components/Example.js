import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState({
        name: ''
    });
    const [dashboardData, setDashboardData] = useState({
        totalFaculty: 0,
        totalStudents: 0,
        activeCourses: 0,
        departments: 0,
        facultyByDepartment: {},
        studentsByCourse: {},
        loading: true
    });

    // Notifications state
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationsWrapperRef = useRef(null);
    const profileMenuRef = useRef(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const saveNotificationsToStorage = (list) => {
        try {
            localStorage.setItem('sfms_notifications', JSON.stringify(list));
        } catch (e) {}
    };

    const seedDefaultNotifications = () => [];

    // Initialize notifications from storage or seed
    useEffect(() => {
        try {
            const saved = localStorage.getItem('sfms_notifications');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    const normalized = parsed.map(n => ({
                        ...n,
                        time: typeof n?.time === 'number' && isFinite(n.time) ? n.time : Date.now()
                    }));
                    setNotifications(normalized);
                    return;
                }
            }
        } catch (e) {}
        setNotifications(seedDefaultNotifications());
    }, []);

    // Persist notifications
    useEffect(() => {
        saveNotificationsToStorage(notifications);
    }, [notifications]);

    // Close dropdowns on outside click + live reload on notification updates
    useEffect(() => {
        const onDocMouseDown = (e) => {
            if (notificationsWrapperRef.current && !notificationsWrapperRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
                setShowProfileMenu(false);
            }
        };
        const loadFromStorage = () => {
            try {
                const saved = localStorage.getItem('sfms_notifications');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed)) {
                        const normalized = parsed.map(n => ({
                            ...n,
                            time: typeof n?.time === 'number' && isFinite(n.time) ? n.time : Date.now()
                        }));
                        setNotifications(normalized);
                    }
                }
            } catch (e) {}
        };
        const onStorage = (e) => {
            if (e && e.key && e.key !== 'sfms_notifications') return;
            loadFromStorage();
        };
        const onCustom = () => loadFromStorage();
        document.addEventListener('mousedown', onDocMouseDown);
        window.addEventListener('storage', onStorage);
        window.addEventListener('sfms-notifications-updated', onCustom);
        return () => {
            document.removeEventListener('mousedown', onDocMouseDown);
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('sfms-notifications-updated', onCustom);
        };
    }, []);

    // Update seeded counts once data loads
    useEffect(() => {
        if (!dashboardData.loading) {
            setNotifications(prev => prev.map(n => {
                if (n.id === 'seed-students') {
                    return { ...n, desc: `Current student count: ${dashboardData.totalStudents} active students` };
                }
                if (n.id === 'seed-faculty') {
                    return { ...n, desc: `Current faculty count: ${dashboardData.totalFaculty} active members` };
                }
                return n;
            }));
        }
    }, [dashboardData.loading, dashboardData.totalStudents, dashboardData.totalFaculty]);

    function logout() {
        localStorage.removeItem('sfms_auth');
        navigate('/login');
    }

    // Fetch all dashboard data
    useEffect(() => {
        fetchDashboardData();
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/profile');
            if (res.ok) {
                const data = await res.json();
                const u = data.user || {};
                setProfileData({ name: u.name || '' });
            }
        } catch (e) {}
    };

    const fetchDashboardData = async () => {
        try {
            setDashboardData(prev => ({ ...prev, loading: true }));
            
            // Fetch faculty data
            const facultyResponse = await fetch('/api/faculties', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });

            // Fetch student data
            const studentResponse = await fetch('/api/students', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });

            if (facultyResponse.ok && studentResponse.ok) {
                const facultyData = await facultyResponse.json();
                const studentData = await studentResponse.json();
                
                const activeFaculty = facultyData.faculties ? facultyData.faculties.filter(f => f.status === 'ACTIVE') : [];
                const activeStudents = studentData.students ? studentData.students.filter(s => s.status === 'ACTIVE') : [];
                
                // Calculate faculty by department
                const departmentCount = {};
                activeFaculty.forEach(faculty => {
                    const dept = faculty.department || 'Unknown';
                    departmentCount[dept] = (departmentCount[dept] || 0) + 1;
                });

                // Calculate students by course
                const courseCount = {};
                activeStudents.forEach(student => {
                    const course = student.course || 'Unknown';
                    courseCount[course] = (courseCount[course] || 0) + 1;
                });

                // Load courses and departments from localStorage for counts
                const savedCourses = localStorage.getItem('sfms_courses');
                const savedDepartments = localStorage.getItem('sfms_departments');
                
                let activeCoursesCount = 0;
                let activeDepartmentsCount = 0;

                if (savedCourses) {
                    try {
                        const coursesData = JSON.parse(savedCourses);
                        activeCoursesCount = coursesData.filter(course => course.status === 'ACTIVE').length;
                    } catch (error) {
                        console.error('Error parsing courses data:', error);
                    }
                }

                if (savedDepartments) {
                    try {
                        const departmentsData = JSON.parse(savedDepartments);
                        activeDepartmentsCount = departmentsData.filter(dept => dept.status === 'ACTIVE').length;
                    } catch (error) {
                        console.error('Error parsing departments data:', error);
                    }
                }

                setDashboardData(prev => ({
                    ...prev,
                    totalFaculty: activeFaculty.length,
                    totalStudents: activeStudents.length,
                    activeCourses: activeCoursesCount,
                    departments: activeDepartmentsCount,
                    facultyByDepartment: departmentCount,
                    studentsByCourse: courseCount,
                    loading: false
                }));
            } else {
                console.error('Failed to fetch dashboard data');
                setDashboardData(prev => ({ ...prev, loading: false }));
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setDashboardData(prev => ({ ...prev, loading: false }));
        }
    };

    // Format number with commas
    const formatNumber = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // Human-readable time difference
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

    // Calculate percentage changes
    const calculateChanges = () => {
        // Mock previous data - in a real app, you'd get this from historical data
        const previousStudents = 1200;
        const previousFaculty = 82;
        const previousCourses = 10;
        const previousDepartments = 7;

        const studentChange = dashboardData.totalStudents - previousStudents;
        const facultyChange = dashboardData.totalFaculty - previousFaculty;
        const courseChange = dashboardData.activeCourses - previousCourses;
        const departmentChange = dashboardData.departments - previousDepartments;

        return {
            students: {
                change: studentChange,
                percentage: previousStudents > 0 ? Math.abs((studentChange / previousStudents) * 100).toFixed(1) : '0',
                isPositive: studentChange >= 0
            },
            faculty: {
                change: facultyChange,
                percentage: previousFaculty > 0 ? Math.abs((facultyChange / previousFaculty) * 100).toFixed(1) : '0',
                isPositive: facultyChange >= 0
            },
            courses: {
                change: courseChange,
                percentage: previousCourses > 0 ? Math.abs((courseChange / previousCourses) * 100).toFixed(1) : '0',
                isPositive: courseChange >= 0
            },
            departments: {
                change: departmentChange,
                percentage: previousDepartments > 0 ? Math.abs((departmentChange / previousDepartments) * 100).toFixed(1) : '0',
                isPositive: departmentChange >= 0
            }
        };
    };

    const changes = calculateChanges();

    // Get top courses for bar chart
    const getTopCourses = () => {
        const courses = Object.entries(dashboardData.studentsByCourse)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5); // Top 5 courses
        
        if (courses.length === 0) {
            // Return default courses if no data
            return [
                ['Computer Science Program', 70],
                ['Business Administration Program', 85],
                ['Engineering Program', 60],
                ['Nursing Program', 45],
                ['Accountancy Program', 30]
            ];
        }

        // Calculate max for percentage scaling
        const maxStudents = Math.max(...courses.map(([,count]) => count));
        
        return courses.map(([course, count]) => [
            course.split(' ')[0] + '...', // Abbreviate for display
            Math.round((count / maxStudents) * 100)
        ]);
    };

    // Get faculty distribution for pie chart
    const getFacultyDistribution = () => {
        const departments = Object.entries(dashboardData.facultyByDepartment);
        
        if (departments.length === 0) {
            // Return default data if no faculty data
            return [
                { department: 'Computer Science', count: 12, color: '#0f79e0' },
                { department: 'Business Admin', count: 8, color: '#1dbb7a' },
                { department: 'Engineering', count: 6, color: '#ffd166' },
                { department: 'Arts & Sciences', count: 4, color: '#43c6d8' }
            ];
        }

        const colors = [
            '#0f79e0', '#1dbb7a', '#ffd166', '#43c6d8', '#8b5cf6',
            '#ef476f', '#06d6a0', '#118ab2', '#ff9e00', '#9d4edd',
            '#f15bb5', '#00bbf9', '#00f5d4', '#fee440', '#f72585'
        ];

        return departments.map(([dept, count], index) => ({
            department: dept.split(' ')[0] + (dept.split(' ')[1] ? '...' : ''),
            count: count,
            color: colors[index % colors.length]
        }));
    };

    const topCourses = getTopCourses();
    const facultyDistribution = getFacultyDistribution();

    // Calculate donut chart segments
    const getDonutSegments = () => {
        const total = facultyDistribution.reduce((sum, dept) => sum + dept.count, 0);
        let currentAngle = 0;
        
        return facultyDistribution.map((item, index) => {
            const percentage = total > 0 ? (item.count / total) : 0;
            const angle = percentage * 360;
            const dashArray = `${percentage * 314.16} ${314.16}`;
            
            const segment = (
                <circle 
                    key={index}
                    cx="60" 
                    cy="60" 
                    r="50" 
                    fill="none"
                    stroke={item.color}
                    strokeWidth="20"
                    strokeDasharray={dashArray}
                    strokeDashoffset={-currentAngle * 314.16 / 360}
                    transform="rotate(-90 60 60)"
                />
            );
            
            currentAngle += angle;
            return segment;
        });
    };

    // Icon helpers (stroke color adjustable)
    const withStroke = (isWhite) => ({ stroke: isWhite ? 'white' : 'currentColor' });
    const calendarIcon = (isWhite = false) => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...withStroke(isWhite)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="4" ry="4"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
    );
    const settingsIcon = (isWhite = false) => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...withStroke(isWhite)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c0 .69.28 1.32.73 1.77.45.45 1.08.73 1.77.73h.09a2 2 0 010 4h-.09a1.65 1.65 0 00-1.77.73z"></path>
        </svg>
    );
    const bellIcon = (isWhite = false) => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...withStroke(isWhite)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8"></path>
            <path d="M13.73 21a2 2 0 01-3.46 0"></path>
        </svg>
    );
    const dashboardIcon = (isWhite = false) => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...withStroke(isWhite)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="2"></rect>
            <rect x="14" y="3" width="7" height="7" rx="2"></rect>
            <rect x="14" y="14" width="7" height="7" rx="2"></rect>
            <rect x="3" y="14" width="7" height="7" rx="2"></rect>
        </svg>
    );
    const studentsIcon = (isWhite = false) => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...withStroke(isWhite)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 14c-4.418 0-8 1.79-8 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
        </svg>
    );
    const facultyIcon = (isWhite = false) => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...withStroke(isWhite)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 20v-1c0-2.21 3.582-4 8-4s8 1.79 8 4v1"></path>
            <circle cx="10" cy="7" r="4"></circle>
            <circle cx="18" cy="8" r="3"></circle>
        </svg>
    );
    const coursesIcon = (isWhite = false) => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...withStroke(isWhite)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5V6a2 2 0 012-2h10l4 4v11.5a1.5 1.5 0 01-1.5 1.5H5.5A1.5 1.5 0 014 19.5z"></path>
            <path d="M14 4v4h4"></path>
        </svg>
    );
    const departmentsIcon = (isWhite = false) => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...withStroke(isWhite)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="8" width="18" height="12" rx="2"></rect>
            <path d="M7 8V4h10v4"></path>
            <path d="M7 12h2"></path>
            <path d="M11 12h2"></path>
            <path d="M15 12h2"></path>
        </svg>
    );
    const reportsIcon = (isWhite = false) => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...withStroke(isWhite)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12h18"></path>
            <path d="M3 6h18"></path>
            <path d="M3 18h18"></path>
        </svg>
    );
    const profileIcon = (isWhite = false) => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...withStroke(isWhite)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
        </svg>
    );
    const logoutIcon = (isWhite = false) => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...withStroke(isWhite)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
    );

    const userInitials = (profileData.name || 'Admin').split(' ').map(n => n && n[0]).filter(Boolean).join('').slice(0,2).toUpperCase();

    return (
        <div className="sfms-dashboard">
            <aside className="sfms-sidebar">
                <div className="sidebar-brand">
                    <div className="logo">
                        {}
                        <img src="/img/sfms-logo2.png" alt="SFMS Logo" />
                    </div>
                    <div className="brand-text">SFMS</div>
                </div>

                <nav className="sidebar-nav">
                    <ul>
                        <li className="active"><Link to="/dashboard"><span className="nav-icon">{dashboardIcon()}</span>Dashboard</Link></li>
                        <li><Link to="/dashboard/faculty"><span className="nav-icon">{facultyIcon()}</span>Faculty</Link></li>
                        <li><Link to="/dashboard/students"><span className="nav-icon">{studentsIcon()}</span>Students</Link></li>
                        <li><Link to="/dashboard/calendar"><span className="nav-icon">{calendarIcon()}</span>Calendar</Link></li>
                        <li><Link to="/dashboard/reports"><span className="nav-icon">{reportsIcon()}</span>Reports</Link></li>
                        <li><Link to="/dashboard/settings"><span className="nav-icon">{settingsIcon()}</span>Settings</Link></li>
                        <li><Link to="/dashboard/profile"><span className="nav-icon">{profileIcon()}</span>Profile</Link></li>
                    </ul>
                </nav>
            </aside>

            <main className="sfms-main">
                <header className="topbar" style={{ position: 'relative', zIndex: 100000 }}>
                    <div className="topbar-left">
                        <h4>Dashboard</h4>
                    </div>

                    <div className="topbar-right">
                        <div className="top-icons">
                            
                            <div className="notification-wrapper" ref={notificationsWrapperRef} style={{ position: 'relative', zIndex: 2000 }}>
                                <button 
                                    className={`icon-circle ${notifications.filter(n => !n.read).length > 0 ? 'has-badge' : ''}`}
                                    title="Notifications"
                                    onClick={() => setShowNotifications(prev => !prev)}
                                    aria-expanded={showNotifications}
                                >
                                    {bellIcon()}
                                    {notifications.filter(n => !n.read).length > 0 && (
                                        <span className="icon-badge">
                                            {notifications.filter(n => !n.read).length > 9 ? '9+' : notifications.filter(n => !n.read).length}
                                        </span>
                                    )}
                                </button>
                                {showNotifications && (
                                    <div 
                                        className="notifications-dropdown" 
                                        style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: 320, background: 'white', borderRadius: 12, boxShadow: '0 16px 40px rgba(0,0,0,0.18)', overflow: 'hidden', zIndex: 4000 }}
                                    >
                                        <div className="dropdown-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid #eee' }}>
                                            <strong>Notifications</strong>
                                            <div className="dropdown-actions" style={{ display: 'flex', gap: 8 }}>
                                                <button 
                                                    className="link-button small" 
                                                    style={{ color: notifications.filter(n => !n.read).length === 0 ? '#9aa4b2' : '#0f79e0' }}
                                                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))} 
                                                    disabled={notifications.filter(n => !n.read).length === 0}
                                                >
                                                    Mark all as read
                                                </button>
                                                <button 
                                                    className="link-button small" 
                                                    style={{ color: notifications.length === 0 ? '#9aa4b2' : '#ef4444' }}
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
                            <button 
                                className="icon-circle" 
                                title="Settings"
                                onClick={() => navigate('/dashboard/settings')}
                            >
                                {settingsIcon()}
                            </button>
                            <div className="profile-menu-wrapper" ref={profileMenuRef} style={{ position: 'relative' }}>
                                <button 
                                    className="profile-chip" 
                                    title="Profile"
                                    onClick={() => setShowProfileMenu(prev => !prev)}
                                    aria-expanded={showProfileMenu}
                                >
                                    <span className="avatar-sm">{userInitials}</span>
                                    <span className="profile-name">{profileData.name || 'Admin'}</span>
                                </button>
                                {showProfileMenu && (
                                    <div className="notifications-dropdown" style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: 200, background: 'white', borderRadius: 12, boxShadow: '0 16px 40px rgba(0,0,0,0.18)', overflow: 'hidden', zIndex: 4000 }}>
                                        <ul className="dropdown-list" style={{ margin: 0, padding: 0 }}>
                                            <li className="dropdown-item" style={{ padding: '12px 14px', cursor: 'pointer' }} onClick={() => { setShowProfileMenu(false); navigate('/dashboard/profile'); }}>View Profile</li>
                                            <li className="dropdown-item" style={{ padding: '12px 14px', cursor: 'pointer' }} onClick={() => { setShowProfileMenu(false); navigate('/dashboard/settings'); }}>Settings</li>
                                            <li className="dropdown-item" style={{ padding: '12px 14px', cursor: 'pointer', color: '#ef4444' }} onClick={() => { setShowProfileMenu(false); logout(); }}>Logout</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="dashboard-content">
                    <div className="welcome-section">
                        <div className="welcome-card">
                            <h3>Welcome back, {profileData.name || 'Admin'}</h3>
                            <p>Here's what's happening in your campus today</p>
                        </div>
                    </div>

                    <div className="stats-section">
                        <div className="stat-card">
                            <div className="stat-icon blue">{studentsIcon(true)}</div>
                            <div className="stat-body">
                                <div className="stat-value">
                                    {dashboardData.loading ? '...' : formatNumber(dashboardData.totalStudents)}
                                </div>
                                <div className="stat-label">Total Students</div>
                                <div className={`stat-change ${changes.students.isPositive ? 'positive' : 'negative'}`}>
                                    {dashboardData.loading ? '...' : 
                                        `${changes.students.isPositive ? '+' : '-'}${changes.students.percentage}% vs last term`
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon green">{facultyIcon(true)}</div>
                            <div className="stat-body">
                                <div className="stat-value">
                                    {dashboardData.loading ? '...' : formatNumber(dashboardData.totalFaculty)}
                                </div>
                                <div className="stat-label">Total Faculty</div>
                                <div className={`stat-change ${changes.faculty.isPositive ? 'positive' : 'negative'}`}>
                                    {dashboardData.loading ? '...' : 
                                        `${changes.faculty.isPositive ? '+' : '-'}${changes.faculty.percentage}% vs last term`
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon yellow">{coursesIcon(true)}</div>
                            <div className="stat-body">
                                <div className="stat-value">
                                    {dashboardData.loading ? '...' : formatNumber(dashboardData.activeCourses)}
                                </div>
                                <div className="stat-label">Active Courses</div>
                                <div className={`stat-change ${changes.courses.isPositive ? 'positive' : 'negative'}`}>
                                    {dashboardData.loading ? '...' : 
                                        `${changes.courses.isPositive ? '+' : '-'}${changes.courses.percentage}% vs last term`
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon cyan">{departmentsIcon(true)}</div>
                            <div className="stat-body">
                                <div className="stat-value">
                                    {dashboardData.loading ? '...' : formatNumber(dashboardData.departments)}
                                </div>
                                <div className="stat-label">Departments</div>
                                <div className={`stat-change ${changes.departments.isPositive ? 'positive' : 'negative'}`}>
                                    {dashboardData.loading ? '...' : 
                                        `${changes.departments.isPositive ? '+' : '-'}${changes.departments.percentage}% vs last term`
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="charts-section">
                        <div className="chart-card">
                            <div className="chart-header">
                                <h3>Students by Course</h3>
                                <button 
                                    className="view-report-btn"
                                    onClick={() => navigate('/dashboard/reports')}
                                >
                                    View report
                                </button>
                            </div>
                            <div className="chart-container">
                                <div className="bar-chart">
                                    <div className="bar-chart-y-axis">
                                        <div>100%</div>
                                        <div>80%</div>
                                        <div>60%</div>
                                        <div>40%</div>
                                        <div>20%</div>
                                        <div>0%</div>
                                    </div>
                                    <div className="bar-chart-bars">
                                        {topCourses.map(([course, percentage], index) => (
                                            <div className="bar-container" key={index}>
                                                <div 
                                                    className="bar" 
                                                    style={{height: `${percentage}%`}}
                                                    title={`${course}: ${percentage}%`}
                                                ></div>
                                                <div className="bar-label">{course}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="chart-legend">
                                    <p className="text-muted small text-center mt-3">
                                        
                                    </p>
                                </div>
                            </div>  
                        </div>

                        <div className="chart-card">
                            <div className="chart-header">
                                <h3>Faculty by Department</h3>
                                <button 
                                    className="view-report-btn"
                                    onClick={() => navigate('/dashboard/reports')}
                                >
                                    View report
                                </button>
                            </div>
                            <div className="chart-container">
                                {dashboardData.loading ? (
                                    <div className="chart-placeholder">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : facultyDistribution.length > 0 ? (
                                    <div className="donut-chart">
                                        <div className="donut-chart-visual">
                                            <div className="donut-chart-circle">
                                                <div className="donut-chart-svg">
                                                    <svg width="120" height="120" viewBox="0 0 120 120">
                                                        <circle cx="60" cy="60" r="50" fill="none" stroke="#f0f0f0" strokeWidth="20" />
                                                        {getDonutSegments()}
                                                        <circle cx="60" cy="60" r="30" fill="white" />
                                                    </svg>
                                                    <div className="donut-chart-center">
                                                        <div className="donut-total">{facultyDistribution.reduce((sum, dept) => sum + dept.count, 0)}</div>
                                                        <div className="donut-label">Total Faculty</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="donut-chart-legend">
                                            {facultyDistribution.map((item, index) => (
                                                <div className="legend-item" key={index}>
                                                    <div 
                                                        className="legend-color" 
                                                        style={{ backgroundColor: item.color }}
                                                    ></div>
                                                    <div className="legend-label">
                                                        <span className="legend-department">{item.department}</span>
                                                        <span className="legend-count">({item.count})</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="chart-placeholder">
                                        <p className="text-muted">No faculty data available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                
                </div>
            </main>
        </div>
    );
}