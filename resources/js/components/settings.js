import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function SettingsPage() {
    const navigate = useNavigate();
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
        'Computer Science Program',
        'Business Administration Program',
        'Arts & Sciences Program',
        'Engineering Program',
        'Teachers Eductation Program',
        'Accountancy Program',
        'Nursing Program',
        'Criminal Justice Program',
        'Tourism Management Program'
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

    useEffect(() => {
        loadFromLocalStorage();
    }, []);

    // Save data to localStorage (also store meta for departments version)
    const saveToLocalStorage = (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            if (key === 'sfms_departments') {
                localStorage.setItem('sfms_departments_meta', JSON.stringify({ version: DEPARTMENTS_VERSION, updatedAt: Date.now() }));
            }
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    };

    // Load data from localStorage or initialize with defaults
    const loadFromLocalStorage = () => {
        setLoading(true);
        try {
            // Departments with version check
            const savedDepartmentsRaw = localStorage.getItem('sfms_departments');
            const savedDepartmentsMetaRaw = localStorage.getItem('sfms_departments_meta');
            let useSavedDepartments = false;

            if (savedDepartmentsRaw && savedDepartmentsMetaRaw) {
                try {
                    const meta = JSON.parse(savedDepartmentsMetaRaw);
                    if (meta && meta.version === DEPARTMENTS_VERSION) {
                        useSavedDepartments = true;
                    }
                } catch (e) {
                    useSavedDepartments = false;
                }
            }

            if (useSavedDepartments && savedDepartmentsRaw) {
                setDepartments(JSON.parse(savedDepartmentsRaw));
            } else {
                // Initialize with default departments
                const initialDepartments = defaultDepartments.map((name, index) => ({
                    id: index + 1,
                    name: name,
                    status: 'ACTIVE',
                    isDefault: true
                }));
                setDepartments(initialDepartments);
                saveToLocalStorage('sfms_departments', initialDepartments);
            }

            // Courses (keep behaviour as before — reuse defaultDepartments)
            const savedCourses = localStorage.getItem('sfms_courses');
            if (savedCourses) {
                setCourses(JSON.parse(savedCourses));
            } else {
                const initialCourses = defaultDepartments.map((name, index) => ({
                    id: index + 1,
                    name: name,
                    status: 'ACTIVE',
                    isDefault: true
                }));
                setCourses(initialCourses);
                localStorage.setItem('sfms_courses', JSON.stringify(initialCourses));
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
                if (editingItem) {
                    updatedData = departments.map(dept => 
                        dept.id === editingItem.id ? { ...dept, ...formData } : dept
                    );
                    setDepartments(updatedData);
                    saveToLocalStorage('sfms_departments', updatedData);
                    setToastMessage('Department updated successfully!');
                } else {
                    newItem = {
                        id: Date.now(),
                        name: formData.name,
                        status: formData.status,
                        isDefault: false
                    };
                    updatedData = [newItem, ...departments];
                    setDepartments(updatedData);
                    saveToLocalStorage('sfms_departments', updatedData);
                    setToastMessage('Department added successfully!');
                }
            } else if (currentView === 'courses') {
                if (editingItem) {
                    updatedData = courses.map(course => 
                        course.id === editingItem.id ? { ...course, ...courseFormData } : course
                    );
                    setCourses(updatedData);
                    saveToLocalStorage('sfms_courses', updatedData);
                    setToastMessage('Course updated successfully!');
                } else {
                    newItem = {
                        id: Date.now(),
                        name: courseFormData.name,
                        status: courseFormData.status,
                        isDefault: false
                    };
                    updatedData = [newItem, ...courses];
                    setCourses(updatedData);
                    saveToLocalStorage('sfms_courses', updatedData);
                    setToastMessage('Course added successfully!');
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

    const handleDelete = (item) => {
        if (item.isDefault) {
            alert('Default items cannot be deleted.');
            return;
        }

        if (!window.confirm(`Are you sure you want to delete "${item.name || item.year}"?`)) {
            return;
        }

        try {
            let updatedData;
            if (currentView === 'departments') {
                updatedData = departments.filter(dept => dept.id !== item.id);
                setDepartments(updatedData);
                saveToLocalStorage('sfms_departments', updatedData);
            } else if (currentView === 'courses') {
                updatedData = courses.filter(course => course.id !== item.id);
                setCourses(updatedData);
                saveToLocalStorage('sfms_courses', updatedData);
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

    const toggleStatus = (item) => {
        if (item.isDefault) {
            alert('Default items status cannot be changed.');
            return;
        }

        try {
            let updatedData;
            const newStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

            if (currentView === 'departments') {
                updatedData = departments.map(dept => 
                    dept.id === item.id ? { ...dept, status: newStatus } : dept
                );
                setDepartments(updatedData);
                saveToLocalStorage('sfms_departments', updatedData);
            } else if (currentView === 'courses') {
                updatedData = courses.map(course => 
                    course.id === item.id ? { ...course, status: newStatus } : course
                );
                setCourses(updatedData);
                saveToLocalStorage('sfms_courses', updatedData);
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

    return (
        <div className="sfms-dashboard">
            <aside className="sfms-sidebar">
                <div className="sidebar-brand">
                    <div className="logo">
                        <img src="/img/sfms-logo2.png" alt="SFMS Logo" />
                    </div>
                    <div className="brand-text">Profile System</div>
                </div>

                <nav className="sidebar-nav">
                    <ul>
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        <li><Link to="/dashboard/faculty">Faculty</Link></li>
                        <li><Link to="/dashboard/students">Students</Link></li>
                        <li><Link to="/dashboard/reports">Reports</Link></li>
                        <li className="active"><a href="#">Settings</a></li>
                        <li><Link to="/dashboard/profile">Profile</Link></li>
                        <li><button className="link-button" onClick={logout}>Logout</button></li>
                    </ul>
                </nav>
            </aside>

            <main className="sfms-main">
                <header className="topbar">
                    <div className="topbar-left">
                        <h4>System Settings</h4>
                    </div>

                    <div className="topbar-right">
                        <div className="welcome">Welcome back, John Doe</div>
                        <div className="top-actions">
                            <button className="icon-btn">⠇</button>
                        </div>
                    </div>
                </header>

                <div className="settings-page">
                    <div className="settings-header bg-white p-4 mb-4">
                        <h1>System Settings</h1>
                        <p className="text-muted">Manage courses, departments, and academic years</p>
                        <p className="text-info small mt-2">
                            Changes made here will update the dropdown options in "Add Student" and "Add Faculty" forms.
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
                                                            {department.isDefault ? (
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
                                                                disabled={department.isDefault}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-outline-secondary me-2"
                                                                onClick={() => toggleStatus(department)}
                                                                disabled={department.isDefault}
                                                            >
                                                                {department.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleDelete(department)}
                                                                disabled={department.isDefault}
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
                                                            placeholder="e.g., Computer Science Program"
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
                                                            placeholder="e.g., Computer Science Program"
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