import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

export default function StudentPage() {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState({ name: '' });
    const [studentData, setStudentData] = useState([]);
    const [archivedData, setArchivedData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [archiveLoading, setArchiveLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [showArchivePage, setShowArchivePage] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [deletingStudent, setDeletingStudent] = useState(null);
    const [formData, setFormData] = useState({
        student_number: '',
        name: '',
        course: '',
        year_level: '',
        academic_year: '',
        email: '',
        contact: '',
        status: 'ACTIVE',
        gender: '',
        dob: '',
        age: '',
        street_address: '',
        city_municipality: '',
        province_region: '',
        zip_code: ''
    });
    const [errors, setErrors] = useState([]);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [filters, setFilters] = useState({
        course: '',
        year_level: '',
        status: '',
        search: ''
    });
    const [archiveFilters, setArchiveFilters] = useState({
        course: '',
        search: ''
    });

    // Load courses and academic years from localStorage
    const [courses, setCourses] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);

    const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

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

    // Load courses and academic years from localStorage
    useEffect(() => {
        loadSettingsData();
        fetchProfile();
    }, []);

    const loadSettingsData = () => {
        // Load courses from localStorage
        const savedCourses = localStorage.getItem('sfms_courses');
        if (savedCourses) {
            const coursesData = JSON.parse(savedCourses);
            const activeCourses = coursesData.filter(course => course.status === 'ACTIVE');
            setCourses(activeCourses.map(course => course.name));
        } else {
            // Fallback to default courses if not found
            setCourses([
                'Computer Science',
                'Business Administration',
                'Arts & Humanities',
                'Engineering',
                'Mathematics',
                'Physics',
                'Chemistry',
                'Biology',
                'Psychology',
                'Economics',
                'Political Science',
                'Sociology'
            ]);
        }

        // Load academic years from localStorage
        const savedAcademicYears = localStorage.getItem('sfms_academic_years');
        if (savedAcademicYears) {
            const yearsData = JSON.parse(savedAcademicYears);
            const activeYears = yearsData.filter(year => year.status === 'ACTIVE');
            setAcademicYears(activeYears.map(year => year.year));
        } else {
            // Fallback to default academic years if not found
            setAcademicYears(['2023-2024', '2024-2025', '2025-2026']);
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

    useEffect(() => {
        fetchStudentData();
    }, [filters]);

    const fetchStudentData = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            
            if (filters.course) queryParams.append('course', filters.course);
            if (filters.year_level) queryParams.append('year_level', filters.year_level);
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.search) queryParams.append('search', filters.search);

            const url = `/api/students${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setStudentData(data.students || data);
            } else {
                console.error('Failed to fetch student data');
                setErrors(['Failed to load student data']);
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
            setErrors(['Network error occurred while loading data']);
        } finally {
            setLoading(false);
        }
    };

    const fetchArchivedData = async () => {
        try {
            setArchiveLoading(true);
            const queryParams = new URLSearchParams();
            
            if (archiveFilters.course) queryParams.append('course', archiveFilters.course);
            if (archiveFilters.search) queryParams.append('search', archiveFilters.search);

            const url = `/api/archived-students${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setArchivedData(data.archived_students || data);
            } else {
                console.error('Failed to fetch archived data');
                setErrors(['Failed to load archived data']);
            }
        } catch (error) {
            console.error('Error fetching archived data:', error);
            setErrors(['Network error occurred while loading archived data']);
        } finally {
            setArchiveLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // If dob changed, auto-calculate age
        if (name === 'dob') {
            const dobVal = value;
            let age = '';
            if (dobVal) {
                const dobDate = new Date(dobVal);
                const today = new Date();
                let a = today.getFullYear() - dobDate.getFullYear();
                const m = today.getMonth() - dobDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
                    a--;
                }
                age = a >= 0 ? a : '';
            }

            setFormData(prev => ({
                ...prev,
                dob: dobVal,
                age: age
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleArchiveFilterChange = (e) => {
        const { name, value } = e.target;
        setArchiveFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);

        try {
            const csrfToken = getCsrfToken();
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            };

            if (csrfToken) {
                headers['X-CSRF-TOKEN'] = csrfToken;
            }

            const url = editingStudent ? `/api/students/${editingStudent.id}` : '/api/students';
            const method = editingStudent ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: JSON.stringify(formData)
            });

            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                try {
                    data = JSON.parse(text);
                } catch {
                    data = { message: text };
                }
            }

            if (response.ok) {
                if (editingStudent) {
                    setStudentData(prev => 
                        prev.map(student => 
                            student.id === editingStudent.id ? data.student : student
                        )
                    );
                    setToastMessage(data.success || 'Student updated successfully!');
                } else {
                    setStudentData(prev => [data.student, ...prev]);
                    setToastMessage(data.success || 'Student added successfully!');

                    // Add notification for new student
                    pushNotification({
                        id: `student-create-${Date.now()}`,
                        type: 'success',
                        title: 'New student added',
                        desc: `${data.student.student_number} - ${data.student.name}`,
                        time: Date.now(),
                        read: false
                    });
                }
                
                setShowModal(false);
                setEditingStudent(null);
                setShowToast(true);
                
                setFormData({
                    student_number: '',
                    name: '',
                    course: '',
                    year_level: '',
                    academic_year: academicYears[0] || '',
                    email: '',
                    contact: '',
                    status: 'ACTIVE',
                    gender: '',
                    dob: '',
                    age: '',
                    street_address: '',
                    city_municipality: '',
                    province_region: '',
                    zip_code: ''
                });

                setTimeout(() => setShowToast(false), 3000);
            } else {
                if (data.errors) {
                    const errorMessages = Object.values(data.errors).flat();
                    setErrors(errorMessages);
                } else if (data.message) {
                    setErrors([data.message]);
                } else {
                    setErrors(['Failed to save student. Please try again.']);
                }
            }
        } catch (error) {
            console.error('Error saving student:', error);
            setErrors(['Network error occurred. Please check your connection and try again.']);
        }
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        setFormData({
            student_number: student.student_number,
            name: student.name,
            course: student.course,
            year_level: student.year_level,
            academic_year: student.academic_year,
            email: student.email,
            contact: student.contact,
            status: student.status,
            gender: student.gender || '',
            dob: student.dob || '',
            age: student.age || '',
            street_address: student.street_address || '',
            city_municipality: student.city_municipality || '',
            province_region: student.province_region || '',
            zip_code: student.zip_code || ''
        });
        setShowModal(true);
    };

    const handleDelete = (student) => {
        setDeletingStudent(student);
        setShowArchiveModal(true);
    };

    const confirmDelete = async () => {
        if (!deletingStudent) return;

        try {
            const csrfToken = getCsrfToken();
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            };

            if (csrfToken) {
                headers['X-CSRF-TOKEN'] = csrfToken;
            }

            const response = await fetch(`/api/students/${deletingStudent.id}`, {
                method: 'DELETE',
                headers: headers
            });

            if (response.ok) {
                setStudentData(prev => prev.filter(student => student.id !== deletingStudent.id));
                setToastMessage('Student moved to inactive status and archived!');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            } else {
                const data = await response.json();
                setErrors([data.message || 'Failed to archive student.']);
            }
        } catch (error) {
            console.error('Error deleting student:', error);
            setErrors(['Network error occurred. Please try again.']);
        } finally {
            setShowArchiveModal(false);
            setDeletingStudent(null);
        }
    };

    const handleRestore = async (archivedStudent) => {
        try {
            const csrfToken = getCsrfToken();
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            };

            if (csrfToken) {
                headers['X-CSRF-TOKEN'] = csrfToken;
            }

            const response = await fetch(`/api/archived-students/${archivedStudent.id}/restore`, {
                method: 'POST',
                headers: headers
            });

            if (response.ok) {
                setArchivedData(prev => prev.filter(student => student.id !== archivedStudent.id));
                setToastMessage('Student restored successfully!');
                setShowToast(true);
                fetchStudentData();
                setTimeout(() => setShowToast(false), 3000);
            } else {
                const data = await response.json();
                setErrors([data.message || 'Failed to restore student.']);
            }
        } catch (error) {
            console.error('Error restoring student:', error);
            setErrors(['Network error occurred. Please try again.']);
        }
    };

    const handlePermanentDelete = async (archivedStudent) => {
        if (!window.confirm(`Are you sure you want to permanently delete ${archivedStudent.name}? This action cannot be undone.`)) {
            return;
        }

        try {
            const csrfToken = getCsrfToken();
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            };

            if (csrfToken) {
                headers['X-CSRF-TOKEN'] = csrfToken;
            }

            const response = await fetch(`/api/archived-students/${archivedStudent.id}/force`, {
                method: 'DELETE',
                headers: headers
            });

            if (response.ok) {
                setArchivedData(prev => prev.filter(student => student.id !== archivedStudent.id));
                setToastMessage('Archived student permanently deleted!');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            } else {
                const data = await response.json();
                setErrors([data.message || 'Failed to delete student.']);
            }
        } catch (error) {
            console.error('Error deleting student:', error);
            setErrors(['Network error occurred. Please try again.']);
        }
    };

    const openArchivePage = async () => {
        setShowArchivePage(true);
        await fetchArchivedData();
    };

    const closeArchivePage = () => {
        setShowArchivePage(false);
        setArchivedData([]);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingStudent(null);
        setErrors([]);
        setFormData({
            student_number: '',
            name: '',
            course: '',
            year_level: '',
            academic_year: academicYears[0] || '',
            email: '',
            contact: '',
            status: 'ACTIVE',
            gender: '',
            dob: '',
            age: '',
            street_address: '',
            city_municipality: '',
            province_region: '',
            zip_code: ''
        });
    };

    const handleCloseArchiveModal = () => {
        setShowArchiveModal(false);
        setDeletingStudent(null);
    };

    // Reload settings data when modal opens to get latest changes
    useEffect(() => {
        if (showModal) {
            loadSettingsData();
        }
    }, [showModal]);

    useEffect(() => {
        if (showModal || showArchiveModal || showArchivePage) {
            document.body.classList.add('sfms-modal-open');
        } else {
            document.body.classList.remove('sfms-modal-open');
        }
        
        return () => {
            document.body.classList.remove('sfms-modal-open');
        };
    }, [showModal, showArchiveModal, showArchivePage]);

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
    const archiveIcon = () => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...withStroke(false)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5V6a2 2 0 012-2h10l4 4v11.5a1.5 1.5 0 01-1.5 1.5H5.5A1.5 1.5 0 014 19.5z"></path>
            <path d="M14 4v4h4"></path>
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

    const renderAvatar = (name, photoUrl) => {
        if (photoUrl) {
            return <img src={photoUrl} alt={name} className="avatar-img" />;
        }
        const initials = (name || '')
            .split(' ')
            .map(n => n && n[0])
            .filter(Boolean)
            .join('')
            .slice(0,2)
            .toUpperCase();
        return (
            <div className="avatar-sm bg-primary rounded-circle d-flex align-items-center justify-content-center text-white">
                <span className="fw-bold" style={{fontSize: '12px'}}>{initials}</span>
            </div>
        );
    };

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
                        <li className="active"><Link to="/dashboard/students"><span className="nav-icon">{studentsIcon()}</span>Students</Link></li>
                        <li><Link to="/dashboard/calendar"><span className="nav-icon">{calendarIcon()}</span>Calendar</Link></li>
                        <li><Link to="/dashboard/reports"><span className="nav-icon">{reportsIcon()}</span>Reports</Link></li>
                        <li><Link to="/dashboard/settings"><span className="nav-icon">{settingsIcon()}</span>Settings</Link></li>
                        <li><Link to="/dashboard/profile"><span className="nav-icon">{profileIcon()}</span>Profile</Link></li>
                        
                    </ul>
                </nav>
            </aside>

            <main className="sfms-main">
                <header className="topbar">
                    <div className="topbar-left">
                        <h4>Student Management</h4>
                    </div>

                    <div className="topbar-right">
                        <div className="top-actions">
                            <button 
                                className="btn small outline"
                                onClick={() => setShowModal(true)}
                            >
                                Add Student
                            </button>
                        </div>
                        <div className="top-icons">
                            
                            <NotificationBell />
                            <button className="icon-circle" title="Settings" onClick={() => navigate('/dashboard/settings')}>
                                {settingsIcon()}
                            </button>
                            <div className="profile-menu-wrapper" ref={profileMenuRef} style={{ position: 'relative' }}>
                                <button className="profile-chip" title="Profile" onClick={() => setShowProfileMenu(p => !p)} aria-expanded={showProfileMenu}>
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

                <div className="student-page">
                    {/* Filters Section */}
                    <div className="student-filters bg-white p-4 mb-4">
                        <div className="row g-3 align-items-end">
                            <div className="col-md-3">
                                <label className="form-label">Course</label>
                                <select 
                                    className="form-select"
                                    name="course"
                                    value={filters.course}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Courses</option>
                                    {courses.map(course => (
                                        <option key={course} value={course}>{course}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Year Level</label>
                                <select 
                                    className="form-select"
                                    name="year_level"
                                    value={filters.year_level}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Years</option>
                                    {yearLevels.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Status</label>
                                <select 
                                    className="form-select"
                                    name="status"
                                    value={filters.status}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Status</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Search</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Search by name or student number..."
                                    name="search"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                />
                            </div>
                            <div className="col-md-1">
                                <button 
                                    className="btn btn-search w-100"
                                    onClick={fetchStudentData}
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Student Table */}
                    <div className="student-table bg-white">
                        {loading ? (
                            <div className="text-center p-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : studentData.length > 0 ? (
                            <table className="table">
                                <thead className="table-light">
                                    <tr>
                                        <th>Photo</th>
                                        <th>Student Number</th>
                                        <th>Name</th>
                                        <th>Course</th>
                                        <th>Year Level</th>
                                        <th>Academic Year</th>
                                        <th>Gender</th>
                                        <th>Date of Birth</th>
                                        <th>Age</th>
                                        <th>Address</th>
                                        <th>Email</th>
                                        <th>Contact</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentData.map((student) => (
                                        <tr key={student.id}>
                                            <td>
                                                {renderAvatar(student.name, student.photo_url || student.profile_photo_url)}
                                            </td>
                                            <td className="fw-semibold">{student.student_number}</td>
                                            <td><div className="fw-semibold">{student.name}</div></td>
                                            <td>{student.course}</td>
                                            <td>{student.year_level}</td>
                                            <td>{student.academic_year}</td>
                                            <td>{student.gender || '-'}</td>
                                            <td>{student.dob ? new Date(student.dob).toLocaleDateString() : '-'}</td>
                                            <td>{student.age ?? '-'}</td>
                                            <td>
                                                <div className="small text-muted">
                                                    {student.street_address ? (<div>{student.street_address}</div>) : null}
                                                    {(student.city_municipality || student.province_region || student.zip_code) ? (
                                                        <div>
                                                            {student.city_municipality}{student.city_municipality && student.province_region ? ', ' : ''}{student.province_region}{(student.zip_code && (student.city_municipality || student.province_region)) ? ' - ' + student.zip_code : (student.zip_code || '')}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td>{student.email}</td>
                                            <td>{student.contact}</td>
                                            <td>
                                                {student.status === 'ACTIVE' ? (
                                                    <span className="badge-active">Active</span>
                                                ) : (
                                                    <span className="badge-inactive">Inactive</span>
                                                )}
                                            </td>
                                            <td>
                                                <button 
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                    onClick={() => handleEdit(student)}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(student)}
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
                                <p className="text-muted">No active students found.</p>
                            </div>
                        )}
                    </div>

                    {/* Archive Button */}
                    <div className="student-archive-btn">
                        <button 
                            className="btn btn-archive"
                            style={{ backgroundColor: '#0f79e0', borderColor: '#0f79e0', color: '#ffffff' }}
                            onClick={openArchivePage}
                        >
                            {archiveIcon()} <span style={{ marginLeft: 8 }}>View Archive</span>
                        </button>
                    </div>

                    {/* Add/Edit Student Modal */}
                    {showModal && (
                        <div className="sfms-modal">
                            <div 
                                className="sfms-modal-backdrop"
                                onClick={handleCloseModal}
                            ></div>
                            <div className="sfms-modal-window bg-white">
                                <div className="modal-form">
                                    <div className="modal-top d-flex justify-content-between align-items-center mb-4">
                                        <h5>{editingStudent ? 'Edit Student' : 'Add New Student'}</h5>
                                        <button 
                                            className="btn-close"
                                            onClick={handleCloseModal}
                                        >
                                            ×
                                        </button>
                                    </div>

                                    {errors.length > 0 && (
                                        <div className="student-errors">
                                            <ul>
                                                {errors.map((error, index) => (
                                                    <li key={index}>{error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit}>
                                        <div className="modal-body">
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label htmlFor="student_number">Student Number *</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="student_number"
                                                        name="student_number"
                                                        value={formData.student_number}
                                                        onChange={handleInputChange}
                                                        required
                                                        placeholder="e.g., 2023-001"
                                                        disabled={editingStudent}
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label htmlFor="name">Full Name *</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="name"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleInputChange}
                                                        required
                                                        placeholder="e.g., John Doe"
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label htmlFor="course">Course *</label>
                                                    <select
                                                        className="form-select"
                                                        id="course"
                                                        name="course"
                                                        value={formData.course}
                                                        onChange={handleInputChange}
                                                        required
                                                    >
                                                        <option value="">Select Course</option>
                                                        {courses.map(course => (
                                                            <option key={course} value={course}>{course}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-md-6">
                                                    <label htmlFor="year_level">Year Level *</label>
                                                    <select
                                                        className="form-select"
                                                        id="year_level"
                                                        name="year_level"
                                                        value={formData.year_level}
                                                        onChange={handleInputChange}
                                                        required
                                                    >
                                                        <option value="">Select Year Level</option>
                                                        {yearLevels.map(year => (
                                                            <option key={year} value={year}>{year}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-md-6">
                                                    <label htmlFor="academic_year">Academic Year *</label>
                                                    <select
                                                        className="form-select"
                                                        id="academic_year"
                                                        name="academic_year"
                                                        value={formData.academic_year}
                                                        onChange={handleInputChange}
                                                        required
                                                    >
                                                        <option value="">Select Academic Year</option>
                                                        {academicYears.map(year => (
                                                            <option key={year} value={year}>{year}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-md-6">
                                                    <label htmlFor="email">Email Address</label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        id="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g., student@university.edu"
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label htmlFor="contact">Contact Number</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="contact"
                                                        name="contact"
                                                        value={formData.contact}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g., +1234567890"
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    <label htmlFor="gender">Gender</label>
                                                    <select
                                                        className="form-select"
                                                        id="gender"
                                                        name="gender"
                                                        value={formData.gender}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="">Select Gender</option>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-4">
                                                    <label htmlFor="dob">Date of Birth</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        id="dob"
                                                        name="dob"
                                                        value={formData.dob}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    <label htmlFor="age">Age</label>
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        className="form-control"
                                                        id="age"
                                                        name="age"
                                                        value={formData.age}
                                                        placeholder="Auto-calculated from Date of Birth"
                                                    />
                                                </div>
                                                <div className="col-md-12">
                                                    <label htmlFor="street_address">Street Address</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="street_address"
                                                        name="street_address"
                                                        value={formData.street_address}
                                                        onChange={handleInputChange}
                                                        placeholder="House no., Street"
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    <label htmlFor="city_municipality">City / Municipality</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="city_municipality"
                                                        name="city_municipality"
                                                        value={formData.city_municipality}
                                                        onChange={handleInputChange}
                                                        placeholder="City or Municipality"
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    <label htmlFor="province_region">Province / Region</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="province_region"
                                                        name="province_region"
                                                        value={formData.province_region}
                                                        onChange={handleInputChange}
                                                        placeholder="Province or Region"
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    <label htmlFor="zip_code">ZIP Code</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="zip_code"
                                                        name="zip_code"
                                                        value={formData.zip_code}
                                                        onChange={handleInputChange}
                                                        placeholder="ZIP / Postal Code"
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label htmlFor="status">Status *</label>
                                                    <select
                                                        className="form-select"
                                                        id="status"
                                                        name="status"
                                                        value={formData.status}
                                                        onChange={handleInputChange}
                                                        required
                                                    >
                                                        <option value="ACTIVE">Active</option>
                                                        <option value="INACTIVE">Inactive</option>
                                                    </select>
                                                </div>
                                            </div>
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
                                                {editingStudent ? 'Update Student' : 'Add Student'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Archive Confirmation Modal */}
                    {showArchiveModal && (
                        <div className="sfms-modal">
                            <div 
                                className="sfms-modal-backdrop"
                                onClick={handleCloseArchiveModal}
                            ></div>
                            <div className="sfms-modal-window bg-white">
                                <div className="modal-form">
                                    <div className="modal-top d-flex justify-content-between align-items-center mb-4">
                                        <h5>Move Student to Inactive</h5>
                                        <button 
                                            className="btn-close"
                                            onClick={handleCloseArchiveModal}
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <div className="modal-body">
                                        <p>Are you sure you want to move <strong>{deletingStudent?.name}</strong> to inactive status?</p>
                                        <p className="text-muted">This will set the student status to INACTIVE and archive the record. You can restore it later from the archive.</p>
                                    </div>

                                    <div className="modal-actions d-flex justify-content-end gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={handleCloseArchiveModal}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-warning"
                                            onClick={confirmDelete}
                                        >
                                            Move to Archive
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Archive Page Floating Modal */}
                    {showArchivePage && (
                        <div className="sfms-modal">
                            <div 
                                className="sfms-modal-backdrop"
                                onClick={closeArchivePage}
                            ></div>
                            <div className="sfms-modal-window bg-white archive-page-modal">
                                <div className="modal-form">
                                    <div className="modal-top d-flex justify-content-between align-items-center mb-4">
                                        <h5>Student Archive</h5>
                                        <button 
                                            className="btn-close"
                                            onClick={closeArchivePage}
                                        >
                                            ×
                                        </button>
                                    </div>

                                    {/* Archive Filters */}
                                    <div className="student-filters bg-light p-4 mb-4">
                                        <div className="row g-3 align-items-end">
                                            <div className="col-md-4">
                                                <label className="form-label">Course</label>
                                                <select 
                                                    className="form-select"
                                                    name="course"
                                                    value={archiveFilters.course}
                                                    onChange={handleArchiveFilterChange}
                                                >
                                                    <option value="">All Courses</option>
                                                    {courses.map(course => (
                                                        <option key={course} value={course}>{course}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Search</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    placeholder="Search archived records..."
                                                    name="search"
                                                    value={archiveFilters.search}
                                                    onChange={handleArchiveFilterChange}
                                                />
                                            </div>
                                            <div className="col-md-2">
                                                <button 
                                                    className="btn btn-search w-100"
                                                    onClick={fetchArchivedData}
                                                >
                                                    Search
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Archived Student Table */}
                                    <div className="student-table bg-white">
                                        {archiveLoading ? (
                                            <div className="text-center p-5">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                        ) : archivedData.length > 0 ? (
                                            <table className="table">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Photo</th>
                                                        <th>Student Number</th>
                                                        <th>Name</th>
                                                        <th>Course</th>
                                                        <th>Year Level</th>
                                                        <th>Archived Date</th>
                                                        <th>Gender</th>
                                                        <th>Date of Birth</th>
                                                        <th>Age</th>
                                                        <th>Address</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {archivedData.map((student) => (
                                                        <tr key={student.id}>
                                                            <td>
                                                                {renderAvatar(student.name, student.photo_url || student.profile_photo_url)}
                                                            </td>
                                                            <td className="fw-semibold">{student.student_number}</td>
                                                            <td>
                                                                <div className="fw-semibold">{student.name}</div>
                                                                <div className="text-muted small">{student.email}</div>
                                                            </td>
                                                            <td>{student.course}</td>
                                                            <td>{student.year_level}</td>
                                                            <td>
                                                                <div className="text-muted small">
                                                                    {new Date(student.archived_at).toLocaleDateString()}
                                                                </div>
                                                                <div className="text-muted extra-small">
                                                                    {new Date(student.archived_at).toLocaleTimeString()}
                                                                </div>
                                                            </td>
                                                            <td>{student.gender || '-'}</td>
                                                            <td>{student.dob ? new Date(student.dob).toLocaleDateString() : '-'}</td>
                                                            <td>{student.age ?? '-'}</td>
                                                            <td>
                                                                <div className="small text-muted">
                                                                    {student.street_address ? (<div>{student.street_address}</div>) : null}
                                                                    {(student.city_municipality || student.province_region || student.zip_code) ? (
                                                                        <div>
                                                                            {student.city_municipality}{student.city_municipality && student.province_region ? ', ' : ''}{student.province_region}{(student.zip_code && (student.city_municipality || student.province_region)) ? ' - ' + student.zip_code : (student.zip_code || '')}
                                                                        </div>
                                                                    ) : null}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <button 
                                                                    className="btn btn-sm btn-success me-2"
                                                                    onClick={() => handleRestore(student)}
                                                                >
                                                                    Restore
                                                                </button>
                                                                <button 
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() => handlePermanentDelete(student)}
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
                                                <p className="text-muted">No archived student records found.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success Toast */}
                    {showToast && (
                        <div className="student-toast">
                            {toastMessage}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}