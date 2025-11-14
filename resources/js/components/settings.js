import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

export default function SettingsPage() {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState({ name: '' });
    const [currentView, setCurrentView] = useState('departments');
    const [departments, setDepartments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        status: 'ACTIVE'
    });
    const [courseFormData, setCourseFormData] = useState({
        name: '',
        status: 'ACTIVE'
    });
    const [academicYearFormData, setAcademicYearFormData] = useState({
        year: '',
        status: 'ACTIVE'
    });
    const [errors, setErrors] = useState([]);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // bump this if you change the defaultDepartments list in the future
    const DEPARTMENTS_VERSION = '2';

    // Default options that should always be available
    const defaultDepartments = [
        'Computer Science',
        'Business Administration',
        'Arts & Humanities',
        'Engineering',
        'Teacher Education',
        'Accountancy',
        'Nursing',
        'Criminal Justice',
        'Tourism Management'
    ];

    const defaultAcademicYears = [
        '2023-2024',
        '2024-2025', 
        '2025-2026'
    ];

    function logout() {
        localStorage.removeItem('sfms_auth');
        navigate('/login');
    }
    // Menus (profile only)
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = React.useRef(null);
    useEffect(() => {
        const onDown = (e) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) setShowProfileMenu(false);
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, []);

    const getCsrfToken = () => {
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (metaTag) {
            return metaTag.getAttribute('content');
        }
        
        if (window.Laravel && window.Laravel.csrfToken) {
            return window.Laravel.csrfToken;
        }
        
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1];
            
        if (cookieValue) {
            return decodeURIComponent(cookieValue);
        }
        
        console.warn('CSRF token not found');
        return null;
    };

    const refetchCourses = async () => {
        try {
            const res = await fetch('/api/courses');
            if (res.ok) {
                const data = await res.json();
                const list = (data.courses || []).map(c => ({
                    id: c.id,
                    name: (c.name || '').replace(/\s*Program$/i, ''),
                    status: c.status,
                    is_default: !!c.is_default
                }));
                setCourses(list);
            }
        } catch (e) {}
    };

    const pushNotification = (notification) => {
        try {
            const raw = localStorage.getItem('sfms_notifications');
            const arr = raw ? JSON.parse(raw) : [];
            const list = Array.isArray(arr) ? arr : [];
            list.unshift(notification);
            localStorage.setItem('sfms_notifications', JSON.stringify(list));
            try { window.dispatchEvent(new CustomEvent('sfms-notifications-updated', { detail: { count: list.length } })); } catch (e) {}
        } catch (e) {}
    };

    useEffect(() => {
        loadFromLocalStorage();
        fetchProfile();
    }, []);

    // Save data to localStorage (also store meta for departments version)
    const saveToLocalStorage = (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    };

    // Load data from localStorage first, then refresh departments from API (persisted)
    const loadFromLocalStorage = async () => {
        setLoading(true);
        try {
            // Initialize defaults while API loads
            const initialDepartments = defaultDepartments.map((name, index) => ({
                id: index + 1,
                name: name,
                status: 'ACTIVE',
                is_default: true
            }));
            setDepartments(initialDepartments);

            // Try to load real departments from API
            try {
                const res = await fetch('/api/departments');
                if (res.ok) {
                    const data = await res.json();
                    const deptList = (data.departments || []).map(d => ({
                        id: d.id,
                        name: d.name,
                        status: d.status,
                        is_default: !!d.is_default
                    }));
                    if (deptList.length > 0) setDepartments(deptList);
                }
            } catch (e) {
                // ignore API errors; UI will keep using defaults
            }

            // Courses — try to load from API first, fallback to localStorage
            // Load courses from API
            try {
                const res = await fetch('/api/courses');
                if (res.ok) {
                    const data = await res.json();
                    const list = (data.courses || []).map(c => ({
                        id: c.id,
                        name: (c.name || '').replace(/\s*Program$/i, ''),
                        status: c.status,
                        is_default: !!c.is_default
                    }));
                    setCourses(list);
                } else {
                    setCourses([]);
                }
            } catch (e) {
                setCourses([]);
            }

            // Academic years (same as before)
            const savedAcademicYears = localStorage.getItem('sfms_academic_years');
            if (savedAcademicYears) {
                setAcademicYears(JSON.parse(savedAcademicYears));
            } else {
                const initialAcademicYears = defaultAcademicYears.map((year, index) => ({
                    id: index + 1,
                    year: year,
                    status: 'ACTIVE',
                    isDefault: true
                }));
                setAcademicYears(initialAcademicYears);
                localStorage.setItem('sfms_academic_years', JSON.stringify(initialAcademicYears));
            }
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
        } finally {
            setLoading(false);
        }
    };

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCourseInputChange = (e) => {
        const { name, value } = e.target;
        setCourseFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAcademicYearInputChange = (e) => {
        const { name, value } = e.target;
        setAcademicYearFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);

        try {
            let newItem;
            let updatedData;

            if (currentView === 'departments') {
                const csrfToken = getCsrfToken();
                const headers = {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                };
                if (csrfToken) headers['X-CSRF-TOKEN'] = csrfToken;

                if (editingItem) {
                    const res = await fetch(`/api/departments/${editingItem.id}`, {
                        method: 'PUT',
                        headers,
                        body: JSON.stringify({ name: formData.name, status: formData.status })
                    });
                    const data = await res.json();
                    if (!res.ok) {
                        setErrors([data.message || 'Failed to update department']);
                        return;
                    }
                    await refetchDepartments();
                    setToastMessage(data.success || 'Department updated successfully!');
                } else {
                    const res = await fetch('/api/departments', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ name: formData.name, status: formData.status })
                    });
                    const data = await res.json();
                    if (!res.ok) {
                        const err = data.errors ? Object.values(data.errors).flat() : [data.message || 'Failed to add department'];
                        setErrors(err);
                        return;
                    }
                    await refetchDepartments();
                    setToastMessage(data.success || 'Department added successfully!');

                    // Add notification for new department
                    pushNotification({
                        id: `department-create-${Date.now()}`,
                        type: 'success',
                        title: 'New department added',
                        desc: formData.name,
                        time: Date.now(),
                        read: false
                    });
                }
            } else if (currentView === 'courses') {
                const csrfToken = getCsrfToken();
                const headers = {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                };
                if (csrfToken) headers['X-CSRF-TOKEN'] = csrfToken;

                if (editingItem) {
                    const res = await fetch(`/api/courses/${editingItem.id}`, {
                        method: 'PUT',
                        headers,
                        body: JSON.stringify({ name: courseFormData.name, status: courseFormData.status })
                    });
                    const data = await res.json();
                    if (!res.ok) {
                        setErrors([data.message || 'Failed to update course']);
                        return;
                    }
                    await refetchCourses();
                    setToastMessage(data.success || 'Course updated successfully!');
                } else {
                    const res = await fetch('/api/courses', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ name: courseFormData.name, status: courseFormData.status })
                    });
                    const data = await res.json();
                    if (!res.ok) {
                        const err = data.errors ? Object.values(data.errors).flat() : [data.message || 'Failed to add course'];
                        setErrors(err);
                        return;
                    }
                    await refetchCourses();
                    setToastMessage(data.success || 'Course added successfully!');

                    // Add notification for new course
                    pushNotification({
                        id: `course-create-${Date.now()}`,
                        type: 'success',
                        title: 'New course added',
                        desc: courseFormData.name,
                        time: Date.now(),
                        read: false
                    });
                }
            } else if (currentView === 'academic-years') {
                if (editingItem) {
                    updatedData = academicYears.map(year => 
                        year.id === editingItem.id ? { ...year, ...academicYearFormData } : year
                    );
                    setAcademicYears(updatedData);
                    saveToLocalStorage('sfms_academic_years', updatedData);
                    setToastMessage('Academic year updated successfully!');
                } else {
                    newItem = {
                        id: Date.now(),
                        year: academicYearFormData.year,
                        status: academicYearFormData.status,
                        isDefault: false
                    };
                    updatedData = [newItem, ...academicYears];
                    setAcademicYears(updatedData);
                    saveToLocalStorage('sfms_academic_years', updatedData);
                    setToastMessage('Academic year added successfully!');

                    // Add notification for new academic year
                    pushNotification({
                        id: `ay-create-${Date.now()}`,
                        type: 'success',
                        title: 'New academic year added',
                        desc: academicYearFormData.year,
                        time: Date.now(),
                        read: false
                    });
                }
            }
            
            setShowModal(false);
            setEditingItem(null);
            setShowToast(true);
            resetForms();

            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error('Error saving:', error);
            setErrors(['Error occurred while saving. Please try again.']);
        }
    };

    const refetchDepartments = async () => {
        try {
            const res = await fetch('/api/departments');
            if (res.ok) {
                const data = await res.json();
                const list = (data.departments || []).map(d => ({
                    id: d.id,
                    name: d.name,
                    status: d.status,
                    is_default: !!d.is_default
                }));
                setDepartments(list);
            }
        } catch (e) {}
    };

    const resetForms = () => {
        setFormData({
            name: '',
            status: 'ACTIVE'
        });
        setCourseFormData({
            name: '',
            status: 'ACTIVE'
        });
        setAcademicYearFormData({
            year: '',
            status: 'ACTIVE'
        });
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        if (currentView === 'departments') {
            setFormData({
                name: item.name,
                status: item.status
            });
        } else if (currentView === 'courses') {
            setCourseFormData({
                name: item.name,
                status: item.status
            });
        } else if (currentView === 'academic-years') {
            setAcademicYearFormData({
                year: item.year,
                status: item.status
            });
        }
        setShowModal(true);
    };

    const handleDelete = async (item) => {
        if (item.is_default) {
            alert('Default items cannot be deleted.');
            return;
        }

        if (!window.confirm(`Are you sure you want to delete "${item.name || item.year}"?`)) {
            return;
        }

        try {
            let updatedData;
            if (currentView === 'departments') {
                const res = await fetch(`/api/departments/${item.id}`, { method: 'DELETE' });
                if (!res.ok) {
                    const data = await res.json();
                    setErrors([data.message || 'Failed to delete department.']);
                    return;
                }
                updatedData = departments.filter(dept => dept.id !== item.id);
                setDepartments(updatedData);
            } else if (currentView === 'courses') {
                // delete via API
                const res = await fetch(`/api/courses/${item.id}`, { method: 'DELETE' });
                if (!res.ok) {
                    const data = await res.json();
                    setErrors([data.message || 'Failed to delete course.']);
                    return;
                }
                await refetchCourses();
            } else if (currentView === 'academic-years') {
                updatedData = academicYears.filter(year => year.id !== item.id);
                setAcademicYears(updatedData);
                saveToLocalStorage('sfms_academic_years', updatedData);
            }
            setToastMessage('Item deleted successfully!');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error('Error deleting:', error);
            setErrors(['Error occurred while deleting. Please try again.']);
        }
    };

    const openAddModal = () => {
        setEditingItem(null);
        resetForms();
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setErrors([]);
        resetForms();
    };

    const toggleStatus = async (item) => {
        if (item.is_default) {
            alert('Default items status cannot be changed.');
            return;
        }

        try {
            let updatedData;
            const newStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

            if (currentView === 'departments') {
                const res = await fetch(`/api/departments/${item.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });
                if (!res.ok) {
                    const data = await res.json();
                    setErrors([data.message || 'Failed to update status.']);
                    return;
                }
                updatedData = departments.map(dept => 
                    dept.id === item.id ? { ...dept, status: newStatus } : dept
                );
                setDepartments(updatedData);
            } else if (currentView === 'courses') {
                // update status via API
                const res = await fetch(`/api/courses/${item.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });
                if (!res.ok) {
                    const data = await res.json();
                    setErrors([data.message || 'Failed to update status.']);
                    return;
                }
                await refetchCourses();
            } else if (currentView === 'academic-years') {
                updatedData = academicYears.map(year => 
                    year.id === item.id ? { ...year, status: newStatus } : year
                );
                setAcademicYears(updatedData);
                saveToLocalStorage('sfms_academic_years', updatedData);
            }
            setToastMessage('Status updated successfully!');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error('Error updating status:', error);
            setErrors(['Error occurred while updating status. Please try again.']);
        }
    };

    // Get active items for dropdowns
    const getActiveDepartments = () => departments.filter(dept => dept.status === 'ACTIVE');
    const getActiveCourses = () => courses.filter(course => course.status === 'ACTIVE');
    const getActiveAcademicYears = () => academicYears.filter(year => year.status === 'ACTIVE');

    useEffect(() => {
        if (showModal) {
            document.body.classList.add('sfms-modal-open');
        } else {
            document.body.classList.remove('sfms-modal-open');
        }
        
        return () => {
            document.body.classList.remove('sfms-modal-open');
        };
    }, [showModal]);

    // Icons (stroke currentColor)
    const withStroke = (isWhite) => ({ stroke: isWhite ? 'white' : 'currentColor' });
    const calendarIcon = () => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...withStroke(false)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="4" ry="4"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
    );
    const bellIcon = () => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...withStroke(false)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8"></path>
            <path d="M13.73 21a2 2 0 01-3.46 0"></path>
        </svg>
    );
    const settingsIcon = () => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...withStroke(false)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c0 .69.28 1.32.73 1.77.45.45 1.08.73 1.77.73h.09a2 2 0 010 4h-.09a1.65 1.65 0 00-1.77.73z"></path>
        </svg>
    );
    const dashboardIcon = () => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...withStroke(false)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="2"></rect>
            <rect x="14" y="3" width="7" height="7" rx="2"></rect>
            <rect x="14" y="14" width="7" height="7" rx="2"></rect>
            <rect x="3" y="14" width="7" height="7" rx="2"></rect>
        </svg>
    );
    const studentsIcon = () => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...withStroke(false)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 14c-4.418 0-8 1.79-8 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
        </svg>
    );
    const facultyIcon = () => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...withStroke(false)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 20v-1c0-2.21 3.582-4 8-4s8 1.79 8 4v1"></path>
            <circle cx="10" cy="7" r="4"></circle>
            <circle cx="18" cy="8" r="3"></circle>
        </svg>
    );
    const reportsIcon = () => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...withStroke(false)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12h18"></path>
            <path d="M3 6h18"></path>
            <path d="M3 18h18"></path>
        </svg>
    );
    const profileIcon = () => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...withStroke(false)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
        </svg>
    );
    const logoutIcon = () => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...withStroke(false)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                        <img src="/img/sfms-logo2.png" alt="SFMS Logo" />
                    </div>
                    <div className="brand-text">SFMS</div>
                </div>

                <nav className="sidebar-nav">
                    <ul>
                        <li><Link to="/dashboard"><span className="nav-icon">{dashboardIcon()}</span>Dashboard</Link></li>
                        <li><Link to="/dashboard/faculty"><span className="nav-icon">{facultyIcon()}</span>Faculty</Link></li>
                        <li><Link to="/dashboard/students"><span className="nav-icon">{studentsIcon()}</span>Students</Link></li>
                        <li><Link to="/dashboard/calendar"><span className="nav-icon">{calendarIcon()}</span>Calendar</Link></li>
                        <li><Link to="/dashboard/reports"><span className="nav-icon">{reportsIcon()}</span>Reports</Link></li>
                        <li className="active"><a href="#"><span className="nav-icon">{settingsIcon()}</span>Settings</a></li>
                        <li><Link to="/dashboard/profile"><span className="nav-icon">{profileIcon()}</span>Profile</Link></li>
                    </ul>
                </nav>
            </aside>

            <main className="sfms-main">
                <header className="topbar">
                    <div className="topbar-left">
                        <h4>System Settings</h4>
                    </div>

                    <div className="topbar-right">
                        <div className="top-icons">
                            
                            <NotificationBell />
                            <button className="icon-circle" title="Settings" onClick={() => navigate('/dashboard/settings')}>
                                {settingsIcon()}
                            </button>
                            <div className="profile-menu-wrapper" ref={profileMenuRef} style={{ position: 'relative' }}>
                                <button className="profile-chip" title="Profile" onClick={() => setShowProfileMenu(p => !p)} aria-expanded={showProfileMenu}>
                                    <span className="avatar-sm">{(profileData.name || 'Admin').split(' ').map(n => n && n[0]).filter(Boolean).join('').slice(0,2).toUpperCase()}</span>
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

                <div className="settings-page">
                    <div className="settings-header bg-white p-4 mb-4">
                        <h1>System Settings</h1>
                        <p className="text-muted">Manage courses, departments, and academic years</p>
                        <p className="text-info small mt-2">
                            
                        </p>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="settings-nav bg-white p-4 mb-4">
                        <div className="nav-buttons">
                            <button 
                                className={`nav-btn ${currentView === 'departments' ? 'active' : ''}`}
                                onClick={() => setCurrentView('departments')}
                            >
                                Departments
                            </button>
                            <button 
                                className={`nav-btn ${currentView === 'courses' ? 'active' : ''}`}
                                onClick={() => setCurrentView('courses')}
                            >
                                Courses
                            </button>
                            <button 
                                className={`nav-btn ${currentView === 'academic-years' ? 'active' : ''}`}
                                onClick={() => setCurrentView('academic-years')}
                            >
                                Academic Years
                            </button>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="settings-content">
                        {/* Departments Section */}
                        {currentView === 'departments' && (
                            <div className="departments-section">
                                <div className="section-header bg-white p-4 mb-4">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5>Department Management</h5>
                                            <p className="text-muted mb-0">
                                                These departments will appear in the "Department" dropdown when adding faculty members.
                                                Active: {getActiveDepartments().length} / Total: {departments.length}
                                            </p>
                                        </div>
                                        <button 
                                            className="btn btn-primary"
                                            onClick={openAddModal}
                                        >
                                            Add Department
                                        </button>
                                    </div>
                                </div>

                                <div className="departments-table bg-white">
                                    {loading ? (
                                        <div className="text-center p-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                    ) : departments.length > 0 ? (
                                        <table className="table">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Type</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {departments.map((department) => (
                                                    <tr key={department.id}>
                                                        <td className="fw-semibold">{department.name}</td>
                                                        <td>
                                                            {department.is_default ? (
                                                                <span className="badge badge-info">Default</span>
                                                            ) : (
                                                                <span className="badge badge-secondary">Custom</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${department.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                                                                {department.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button 
                                                                className="btn btn-sm btn-outline-primary me-2"
                                                                onClick={() => handleEdit(department)}
                                                                disabled={department.is_default}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-outline-secondary me-2"
                                                                onClick={() => toggleStatus(department)}
                                                                disabled={department.is_default}
                                                            >
                                                                {department.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleDelete(department)}
                                                                disabled={department.is_default}
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="text-center p-5">
                                            <p className="text-muted">No departments found.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Courses Section */}
                        {currentView === 'courses' && (
                            <div className="courses-section">
                                <div className="section-header bg-white p-4 mb-4">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5>Course Management</h5>
                                            <p className="text-muted mb-0">
                                                These courses will appear in the "Course" dropdown when adding students.
                                                Active: {getActiveCourses().length} / Total: {courses.length}
                                            </p>
                                        </div>
                                        <button 
                                            className="btn btn-primary"
                                            onClick={openAddModal}
                                        >
                                            Add Course
                                        </button>
                                    </div>
                                </div>

                                <div className="courses-table bg-white">
                                    {loading ? (
                                        <div className="text-center p-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                    ) : courses.length > 0 ? (
                                        <table className="table">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Type</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {courses.map((course) => (
                                                    <tr key={course.id}>
                                                        <td className="fw-semibold">{course.name}</td>
                                                        <td>
                                                            {course.isDefault ? (
                                                                <span className="badge badge-info">Default</span>
                                                            ) : (
                                                                <span className="badge badge-secondary">Custom</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${course.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                                                                {course.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button 
                                                                className="btn btn-sm btn-outline-primary me-2"
                                                                onClick={() => handleEdit(course)}
                                                                disabled={course.isDefault}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-outline-secondary me-2"
                                                                onClick={() => toggleStatus(course)}
                                                                disabled={course.isDefault}
                                                            >
                                                                {course.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleDelete(course)}
                                                                disabled={course.isDefault}
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="text-center p-5">
                                            <p className="text-muted">No courses found.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Academic Years Section */}
                        {currentView === 'academic-years' && (
                            <div className="academic-years-section">
                                <div className="section-header bg-white p-4 mb-4">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5>Academic Year Management</h5>
                                            <p className="text-muted mb-0">
                                                These academic years will appear in the "Academic Year" dropdown when adding students.
                                                Active: {getActiveAcademicYears().length} / Total: {academicYears.length}
                                            </p>
                                        </div>
                                        <button 
                                            className="btn btn-primary"
                                            onClick={openAddModal}
                                        >
                                            Add Academic Year
                                        </button>
                                    </div>
                                </div>

                                <div className="academic-years-table bg-white">
                                    {loading ? (
                                        <div className="text-center p-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                    ) : academicYears.length > 0 ? (
                                        <table className="table">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Academic Year</th>
                                                    <th>Type</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {academicYears.map((year) => (
                                                    <tr key={year.id}>
                                                        <td className="fw-semibold">{year.year}</td>
                                                        <td>
                                                            {year.isDefault ? (
                                                                <span className="badge badge-info">Default</span>
                                                            ) : (
                                                                <span className="badge badge-secondary">Custom</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${year.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                                                                {year.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button 
                                                                className="btn btn-sm btn-outline-primary me-2"
                                                                onClick={() => handleEdit(year)}
                                                                disabled={year.isDefault}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-outline-secondary me-2"
                                                                onClick={() => toggleStatus(year)}
                                                                disabled={year.isDefault}
                                                            >
                                                                {year.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleDelete(year)}
                                                                disabled={year.isDefault}
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="text-center p-5">
                                            <p className="text-muted">No academic years found.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Floating Add/Edit Modal */}
                    {showModal && (
                        <div className="sfms-modal">
                            <div 
                                className="sfms-modal-backdrop"
                                onClick={handleCloseModal}
                            ></div>
                            <div className="sfms-modal-window bg-white settings-modal-window">
                                <div className="modal-form">
                                    <div className="modal-top d-flex justify-content-between align-items-center mb-4">
                                        <h5>
                                            {editingItem ? 'Edit ' : 'Add New '}
                                            {currentView === 'departments' ? 'Department' : 
                                             currentView === 'courses' ? 'Course' : 'Academic Year'}
                                        </h5>
                                        <button 
                                            className="btn-close"
                                            onClick={handleCloseModal}
                                        >
                                            ×
                                        </button>
                                    </div>

                                    {errors.length > 0 && (
                                        <div className="settings-errors">
                                            <ul>
                                                {errors.map((error, index) => (
                                                    <li key={index}>{error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit}>
                                        <div className="modal-body">
                                            {currentView === 'departments' && (
                                                <div className="row g-3">
                                                    <div className="col-md-12">
                                                        <label htmlFor="name">Department Name *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="name"
                                                            name="name"
                                                            value={formData.name}
                                                            onChange={handleInputChange}
                                                            required
                                                            placeholder="e.g., Computer Science"
                                                        />
                                                        <div className="form-text">
                                                            This will appear in the "Department" dropdown when adding faculty members.
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <label htmlFor="status">Status *</label>
                                                        <select
                                                            className="form-select"
                                                            id="status"
                                                            name="status"
                                                            value={formData.status}
                                                            onChange={handleInputChange}
                                                            required
                                                        >
                                                            <option value="ACTIVE">Active (Visible in dropdowns)</option>
                                                            <option value="INACTIVE">Inactive (Hidden from dropdowns)</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            )}

                                            {currentView === 'courses' && (
                                                <div className="row g-3">
                                                    <div className="col-md-12">
                                                        <label htmlFor="course_name">Course Name *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="course_name"
                                                            name="name"
                                                            value={courseFormData.name}
                                                            onChange={handleCourseInputChange}
                                                            required
                                                            placeholder="e.g., Computer Science"
                                                        />
                                                        <div className="form-text">
                                                            This will appear in the "Course" dropdown when adding students.
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <label htmlFor="course_status">Status *</label>
                                                        <select
                                                            className="form-select"
                                                            id="course_status"
                                                            name="status"
                                                            value={courseFormData.status}
                                                            onChange={handleCourseInputChange}
                                                            required
                                                        >
                                                            <option value="ACTIVE">Active (Visible in dropdowns)</option>
                                                            <option value="INACTIVE">Inactive (Hidden from dropdowns)</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            )}

                                            {currentView === 'academic-years' && (
                                                <div className="row g-3">
                                                    <div className="col-md-12">
                                                        <label htmlFor="year">Academic Year *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="year"
                                                            name="year"
                                                            value={academicYearFormData.year}
                                                            onChange={handleAcademicYearInputChange}
                                                            required
                                                            placeholder="e.g., 2024-2025"
                                                        />
                                                        <div className="form-text">
                                                            This will appear in the "Academic Year" dropdown when adding students.
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <label htmlFor="academic_status">Status *</label>
                                                        <select
                                                            className="form-select"
                                                            id="academic_status"
                                                            name="status"
                                                            value={academicYearFormData.status}
                                                            onChange={handleAcademicYearInputChange}
                                                            required
                                                        >
                                                            <option value="ACTIVE">Active (Visible in dropdowns)</option>
                                                            <option value="INACTIVE">Inactive (Hidden from dropdowns)</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="modal-actions d-flex justify-content-end gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={handleCloseModal}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                            >
                                                {editingItem ? 'Update' : 'Add'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success Toast */}
                    {showToast && (
                        <div className="settings-toast">
                            {toastMessage}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}