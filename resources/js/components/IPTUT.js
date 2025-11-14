import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { initTheme, toggleTheme } from '../utils/theme';

export default function ReportsPage() {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState({ name: '' });
    const [currentView, setCurrentView] = useState('student');
    const [studentData, setStudentData] = useState([]);
    const [facultyData, setFacultyData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        course: '',
        year_level: '',
        status: '',
        academic_year: '',
        search: ''
    });
    const [facultyFilters, setFacultyFilters] = useState({
        department: '',
        status: '',
        search: ''
    });

    // Load data from localStorage
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    
    const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

    function logout() {
        localStorage.removeItem('sfms_auth');
        navigate('/login');
    }

    // Menus (profile only)
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = React.useRef(null);
    const [theme, setTheme] = useState('light');
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

    // Load settings data from API
    useEffect(() => {
        (async () => {
            await loadSettingsData();
            fetchProfile();
            try { const t = initTheme(); setTheme(t); } catch (e) {}
        })();
    }, []);

    const loadSettingsData = async () => {
        try {
            // Fetch courses from API
            try {
                const res = await fetch('/api/courses', { method: 'GET', headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });
                if (res.ok) {
                    const data = await res.json();
                    const list = Array.isArray(data) ? data : (data.courses || []);
                    const activeCourses = (list.filter ? list.filter(c => c.status === 'ACTIVE') : []);
                    setCourses(activeCourses.map(course => (course.name || '').replace(/\s*Program$/i, '')));
                } else {
                    setCourses([
                        'Computer Science',
                        'Business Administration',
                        'Arts & Humanities',
                        'Engineering',
                        'Teacher Education',
                        'Accountancy',
                        'Nursing',
                        'Criminal Justice',
                        'Tourism Management'
                    ]);
                }
            } catch (err) {
                console.warn('Failed to fetch courses, using defaults', err);
                setCourses([
                    'Computer Science',
                    'Business Administration',
                    'Arts & Humanities',
                    'Engineering',
                    'Teacher Education',
                    'Accountancy',
                    'Nursing',
                    'Criminal Justice',
                    'Tourism Management'
                ]);
            }

            // Fetch departments from API
            try {
                const resd = await fetch('/api/departments', { method: 'GET', headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });
                if (resd.ok) {
                    const ddata = await resd.json();
                    const dlist = Array.isArray(ddata) ? ddata : (ddata.departments || []);
                    const activeDepartments = (dlist.filter ? dlist.filter(d => d.status === 'ACTIVE') : []);
                    setDepartments(activeDepartments.map(dept => (dept.name || '').replace(/\s*Program$/i, '')));
                } else {
                    setDepartments([
                        'Computer Science',
                        'Business Administration',
                        'Arts & Humanities',
                        'Engineering',
                        'Teacher Education',
                        'Accountancy',
                        'Nursing',
                        'Criminal Justice',
                        'Tourism Management'
                    ]);
                }
            } catch (err) {
                console.warn('Failed to fetch departments, using defaults', err);
                setDepartments([
                    'Computer Science',
                    'Business Administration',
                    'Arts & Humanities',
                    'Engineering',
                    'Teacher Education',
                    'Accountancy',
                    'Nursing',
                    'Criminal Justice',
                    'Tourism Management'
                ]);
            }

            // Academic years: default list
            setAcademicYears(['2023-2024', '2024-2025', '2025-2026']);
        } catch (error) {
            console.error('Error loading settings data:', error);
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
        if (currentView === 'student') {
            fetchStudentData();
        } else {
            fetchFacultyData();
        }
    }, [currentView, filters, facultyFilters]);

    // Reload settings data when switching views to get latest changes
    useEffect(() => {
        loadSettingsData();
    }, [currentView]);

    // Fetch combined student data (active + archived)
    const fetchStudentData = async () => {
        try {
            setLoading(true);
            
            // Fetch active students
            const activeResponse = await fetch('/api/students', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });

            // Fetch archived students
            const archivedResponse = await fetch('/api/archived-students', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });

            if (activeResponse.ok && archivedResponse.ok) {
                const activeData = await activeResponse.json();
                const archivedData = await archivedResponse.json();
                
                // Combine and process data
                const activeStudents = Array.isArray(activeData) ? activeData : (activeData.students || []);
                const archivedStudents = Array.isArray(archivedData) ? archivedData : (archivedData.archived_students || []);
                
                // Mark archived students as INACTIVE
                const processedArchived = archivedStudents.map(student => ({
                    ...student,
                    status: 'INACTIVE',
                    isArchived: true
                }));

                const allStudents = [...activeStudents, ...processedArchived];
                setStudentData(allStudents);
            } else {
                console.error('Failed to fetch student data');
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch combined faculty data (active + archived)
    const fetchFacultyData = async () => {
        try {
            setLoading(true);
            
            // Fetch active faculty
            const activeResponse = await fetch('/api/faculties', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });

            // Fetch archived faculty
            const archivedResponse = await fetch('/api/archived-faculties', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });

            if (activeResponse.ok && archivedResponse.ok) {
                const activeData = await activeResponse.json();
                const archivedData = await archivedResponse.json();
                
                // Combine and process data
                const activeFaculty = Array.isArray(activeData) ? activeData : (activeData.faculties || []);
                const archivedFaculty = Array.isArray(archivedData) ? archivedData : (archivedData.archived_faculties || []);
                
                // Mark archived faculty as INACTIVE
                const processedArchived = archivedFaculty.map(faculty => ({
                    ...faculty,
                    status: 'INACTIVE',
                    isArchived: true
                }));

                const allFaculty = [...activeFaculty, ...processedArchived];
                setFacultyData(allFaculty);
            } else {
                console.error('Failed to fetch faculty data');
            }
        } catch (error) {
            console.error('Error fetching faculty data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFacultyFilterChange = (e) => {
        const { name, value } = e.target;
        setFacultyFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Filter student data based on selected filters
    const getFilteredStudentData = () => {
        return studentData.filter(student => {
            const courseMatch = !filters.course || student.course === filters.course;
            const yearMatch = !filters.year_level || student.year_level === filters.year_level;
            const statusMatch = !filters.status || student.status === filters.status;
            const academicYearMatch = !filters.academic_year || student.academic_year === filters.academic_year;
            const searchMatch = !filters.search || 
                student.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                student.student_number.toLowerCase().includes(filters.search.toLowerCase());
            
            return courseMatch && yearMatch && statusMatch && academicYearMatch && searchMatch;
        });
    };

    // Filter faculty data based on selected filters
    const getFilteredFacultyData = () => {
        return facultyData.filter(faculty => {
            const departmentMatch = !facultyFilters.department || faculty.department === facultyFilters.department;
            const statusMatch = !facultyFilters.status || faculty.status === facultyFilters.status;
            const searchMatch = !facultyFilters.search || 
                faculty.name.toLowerCase().includes(facultyFilters.search.toLowerCase()) ||
                faculty.faculty_number.toLowerCase().includes(facultyFilters.search.toLowerCase());
            
            return departmentMatch && statusMatch && searchMatch;
        });
    };

    // Calculate student summary statistics
    const calculateStudentSummary = (students) => {
        const summary = {};
        
        courses.forEach(course => {
            summary[course] = {
                year1: students.filter(s => s.course === course && s.year_level === '1st Year').length,
                year2: students.filter(s => s.course === course && s.year_level === '2nd Year').length,
                year3: students.filter(s => s.course === course && s.year_level === '3rd Year').length,
                year4: students.filter(s => s.course === course && s.year_level === '4th Year').length,
                total: students.filter(s => s.course === course).length
            };
        });
        
        return summary;
    };

    // Build an Excel-compatible HTML table and trigger download as .xls
    // Excel will open .xls files containing HTML tables correctly.
    const buildExcelHtml = (title, headers, rows) => {
        const styles = `
            <style>
                table { border-collapse:collapse; width:100%; }
                th, td { border:1px solid #ddd; padding:8px; }
                th { background:#f4f6fb; font-weight:700; }
                .title { font-size:16px; font-weight:700; padding:8px 0; }
            </style>
        `;

        const headerHtml = headers.map(h => `<th>${h}</th>`).join('');
        const rowsHtml = rows.map(r => `<tr>${r.map(c => `<td>${(c !== null && c !== undefined) ? String(c) : ''}</td>`).join('')}</tr>`).join('');

        return `<!DOCTYPE html><html><head><meta charset="utf-8"/>${styles}</head><body>` +
            `<div class="title">${title}</div>` +
            `<table><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;
    };

    const downloadExcel = (html, filename) => {
        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Export student data to an Excel (.xls) file with organized table
    const exportStudentData = () => {
        const filteredStudents = getFilteredStudentData();
        const headers = ['Student Number', 'Name', 'Course', 'Year Level', 'Academic Year', 'Email', 'Contact', 'Status'];
        const rows = filteredStudents.map(student => [
            student.student_number,
            student.name,
            student.course,
            student.year_level,
            student.academic_year,
            student.email || 'N/A',
            student.contact || 'N/A',
            student.status
        ]);

        const html = buildExcelHtml('Student Report', headers, rows);
        downloadExcel(html, 'student_report.xls');
    };

    // Export faculty data to an Excel (.xls) file with organized table
    const exportFacultyData = () => {
        const filteredFaculty = getFilteredFacultyData();
        const headers = ['Faculty Number', 'Name', 'Department', 'Position', 'Email', 'Contact', 'Status'];
        const rows = filteredFaculty.map(faculty => [
            faculty.faculty_number,
            faculty.name,
            faculty.department || 'N/A',
            faculty.position || 'N/A',
            faculty.email || 'N/A',
            faculty.contact || 'N/A',
            faculty.status
        ]);

        const html = buildExcelHtml('Faculty Report', headers, rows);
        downloadExcel(html, 'faculty_report.xls');
    };

    const filteredStudents = getFilteredStudentData();
    const filteredFaculty = getFilteredFacultyData();
    const studentSummary = calculateStudentSummary(filteredStudents);

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
    const sunIcon = (isWhite = false) => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...withStroke(isWhite)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2v2"></path>
            <path d="M12 20v2"></path>
            <path d="M4.93 4.93l1.41 1.41"></path>
            <path d="M17.66 17.66l1.41 1.41"></path>
            <path d="M2 12h2"></path>
            <path d="M20 12h2"></path>
            <path d="M4.93 19.07l1.41-1.41"></path>
            <path d="M17.66 6.34l1.41-1.41"></path>
        </svg>
    );
    const moonIcon = (isWhite = false) => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...withStroke(isWhite)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
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
                        <li className="active"><a href="#"><span className="nav-icon">{reportsIcon()}</span>Reports</a></li>
                        <li><Link to="/dashboard/settings"><span className="nav-icon">{settingsIcon()}</span>Settings</Link></li>
                        <li><Link to="/dashboard/profile"><span className="nav-icon">{profileIcon()}</span>Profile</Link></li>
                    </ul>
                </nav>
            </aside>

            <main className="sfms-main">
                <header className="topbar">
                    <div className="topbar-left">
                        <h4>Reports & Analytics</h4>
                    </div>

                    <div className="topbar-right">
                        <div className="top-icons">
                            
                            <NotificationBell />
                            <button 
                                className="icon-circle" 
                                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                                onClick={() => { const t = toggleTheme(); setTheme(t); }}
                            >
                                {theme === 'dark' ? sunIcon() : moonIcon()}
                            </button>
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

                <div className="reports-page">
                    <div className="reports-header bg-white p-4 mb-4">
                        <h1>Reports & Analytics</h1>
                        <p className="text-muted">Generate comprehensive reports for students and faculty</p>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="reports-nav bg-white p-4 mb-4">
                        <div className="nav-buttons">
                            <button 
                                className={`nav-btn ${currentView === 'student' ? 'active' : ''}`}
                                onClick={() => setCurrentView('student')}
                            >
                                Student Report
                            </button>
                            <button 
                                className={`nav-btn ${currentView === 'faculty' ? 'active' : ''}`}
                                onClick={() => setCurrentView('faculty')}
                            >
                                Faculty Reports
                            </button>
                        </div>
                    </div>

                    {/* Student Report Section */}
                    {currentView === 'student' && (
                        <div className="student-report">
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
                                    <div className="col-md-2">
                                        <label className="form-label">Academic Year</label>
                                        <select 
                                            className="form-select"
                                            name="academic_year"
                                            value={filters.academic_year}
                                            onChange={handleFilterChange}
                                        >
                                            <option value="">All Years</option>
                                            {academicYears.map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-3">
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
                                    <div className="col-md-2">
                                        <button 
                                            className="btn btn-primary w-100"
                                            onClick={exportStudentData}
                                        >
                                            Export CSV
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Summary Statistics */}
                            <div className="summary-section bg-white p-4 mb-4">
                                <h5 className="mb-4">Student Report Details</h5>
                                <div className="summary-table">
                                    <table className="table table-bordered">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Course</th>
                                                <th>Year 1</th>
                                                <th>Year 2</th>
                                                <th>Year 3</th>
                                                <th>Year 4</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {courses.map(course => (
                                                <tr key={course}>
                                                    <td className="fw-semibold">{course}</td>
                                                    <td>{studentSummary[course]?.year1 || 0}</td>
                                                    <td>{studentSummary[course]?.year2 || 0}</td>
                                                    <td>{studentSummary[course]?.year3 || 0}</td>
                                                    <td>{studentSummary[course]?.year4 || 0}</td>
                                                    <td className="fw-bold">{studentSummary[course]?.total || 0}</td>
                                                </tr>
                                            ))}
                                            <tr className="table-light">
                                                <td className="fw-bold">Grand Total</td>
                                                <td className="fw-bold">{filteredStudents.filter(s => s.year_level === '1st Year').length}</td>
                                                <td className="fw-bold">{filteredStudents.filter(s => s.year_level === '2nd Year').length}</td>
                                                <td className="fw-bold">{filteredStudents.filter(s => s.year_level === '3rd Year').length}</td>
                                                <td className="fw-bold">{filteredStudents.filter(s => s.year_level === '4th Year').length}</td>
                                                <td className="fw-bold">{filteredStudents.length}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Detailed Student Data */}
                            <div className="student-data-section bg-white p-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5>Student Records</h5>
                                    <span className="text-muted">
                                        Showing {filteredStudents.length} records
                                    </span>
                                </div>
                                
                                {loading ? (
                                    <div className="text-center p-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : filteredStudents.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-striped">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Student Number</th>
                                                    <th>Name</th>
                                                    <th>Course</th>
                                                    <th>Year Level</th>
                                                    <th>Academic Year</th>
                                                    <th>Email</th>
                                                    <th>Contact</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredStudents.map((student) => (
                                                    <tr key={student.id}>
                                                        <td className="fw-semibold">{student.student_number}</td>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <div className="avatar-sm bg-light rounded-circle d-flex align-items-center justify-content-center me-3">
                                                                    <span className="text-muted">
                                                                        {student.name.split(' ').map(n => n[0]).join('')}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <div className="fw-semibold">{student.name}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>{student.course}</td>
                                                        <td>{student.year_level}</td>
                                                        <td>{student.academic_year}</td>
                                                        <td>{student.email || 'N/A'}</td>
                                                        <td>{student.contact || 'N/A'}</td>
                                                        <td>
                                                            {student.status === 'ACTIVE' ? (
                                                                <span className="badge-active">Active</span>
                                                            ) : (
                                                                <span className="badge-inactive">Inactive</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center p-5">
                                        <p className="text-muted">No student records found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Faculty Report Section */}
                    {currentView === 'faculty' && (
                        <div className="faculty-report">
                            {/* Filters Section */}
                            <div className="faculty-filters bg-white p-4 mb-4">
                                <div className="row g-3 align-items-end">
                                    <div className="col-md-3">
                                        <label className="form-label">Department</label>
                                        <select 
                                            className="form-select"
                                            name="department"
                                            value={facultyFilters.department}
                                            onChange={handleFacultyFilterChange}
                                        >
                                            <option value="">All Departments</option>
                                            {departments.map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label">Status</label>
                                        <select 
                                            className="form-select"
                                            name="status"
                                            value={facultyFilters.status}
                                            onChange={handleFacultyFilterChange}
                                        >
                                            <option value="">All Status</option>
                                            <option value="ACTIVE">Active</option>
                                            <option value="INACTIVE">Inactive</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Search</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="Search by name or faculty number..."
                                            name="search"
                                            value={facultyFilters.search}
                                            onChange={handleFacultyFilterChange}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <button 
                                            className="btn btn-primary w-100"
                                            onClick={exportFacultyData}
                                        >
                                            Export CSV
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Faculty Summary */}
                            <div className="faculty-summary bg-white p-4 mb-4">
                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="summary-card text-center p-3 border rounded">
                                            <h3 className="text-primary">{facultyData.length}</h3>
                                            <p className="text-muted mb-0">Total Faculty</p>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="summary-card text-center p-3 border rounded">
                                            <h3 className="text-success">{facultyData.filter(f => f.status === 'ACTIVE').length}</h3>
                                            <p className="text-muted mb-0">Active Faculty</p>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="summary-card text-center p-3 border rounded">
                                            <h3 className="text-warning">{facultyData.filter(f => f.status === 'INACTIVE').length}</h3>
                                            <p className="text-muted mb-0">Inactive Faculty</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Faculty Data */}
                            <div className="faculty-data-section bg-white p-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5>Faculty Records</h5>
                                    <span className="text-muted">
                                        Showing {filteredFaculty.length} records
                                    </span>
                                </div>
                                
                                {loading ? (
                                    <div className="text-center p-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : filteredFaculty.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-striped">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Faculty Number</th>
                                                    <th>Name</th>
                                                    <th>Department</th>
                                                    <th>Position</th>
                                                    <th>Email</th>
                                                    <th>Contact</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredFaculty.map((faculty) => (
                                                    <tr key={faculty.id}>
                                                        <td className="fw-semibold">{faculty.faculty_number}</td>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <div className="avatar-sm bg-light rounded-circle d-flex align-items-center justify-content-center me-3">
                                                                    <span className="text-muted">
                                                                        {faculty.name.split(' ').map(n => n[0]).join('')}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <div className="fw-semibold">{faculty.name}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>{faculty.department || 'N/A'}</td>
                                                        <td>{faculty.position || 'N/A'}</td>
                                                        <td>{faculty.email || 'N/A'}</td>
                                                        <td>{faculty.contact || 'N/A'}</td>
                                                        <td>
                                                            {faculty.status === 'ACTIVE' ? (
                                                                <span className="badge-active">Active</span>
                                                            ) : (
                                                                <span className="badge-inactive">Inactive</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center p-5">
                                        <p className="text-muted">No faculty records found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}