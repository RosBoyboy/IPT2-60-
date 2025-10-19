import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function FacultyPage() {
    const navigate = useNavigate();
    const [facultyData, setFacultyData] = useState([]);
    const [archivedData, setArchivedData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [archiveLoading, setArchiveLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [showArchivePage, setShowArchivePage] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState(null);
    const [deletingFaculty, setDeletingFaculty] = useState(null);
    const [formData, setFormData] = useState({
        faculty_number: '',
        name: '',
        department: '',
        position: '',
        email: '',
        contact: '',
        status: 'ACTIVE'
    });
    const [errors, setErrors] = useState([]);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [filters, setFilters] = useState({
        department: '',
        status: '',
        search: ''
    });
    const [archiveFilters, setArchiveFilters] = useState({
        department: '',
        search: ''
    });

    // Load departments from localStorage
    const [departments, setDepartments] = useState([]);

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

    // Load departments from localStorage
    useEffect(() => {
        loadSettingsData();
    }, []);

    // must match settings.js version
    const DEPARTMENTS_VERSION = '2';

    const loadSettingsData = () => {
        // Load departments from localStorage with version check
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

        if (useSavedDepartments) {
            try {
                const deptData = JSON.parse(savedDepartmentsRaw);
                const activeDepartments = deptData.filter(dept => dept.status === 'ACTIVE');
                setDepartments(activeDepartments.map(dept => dept.name));
                return;
            } catch (err) {
                // fallthrough to initialize defaults
                console.warn('Invalid saved departments, falling back to defaults');
            }
        }

        // Fallback to default departments if not found or version mismatch
        setDepartments([
            'Computer Science Program',
            'Business Administration Program',
            'Arts & Sciences Program',
            'Engineering Program',
            'Teachers Eductation Program',
            'Accountancy Program',
            'Nursing Program',
            'Criminal Justice Program',
            'Tourism Management Program'
        ]);
    };

    useEffect(() => {
        fetchFacultyData();
    }, [filters]);

    const fetchFacultyData = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            
            if (filters.department) queryParams.append('department', filters.department);
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.search) queryParams.append('search', filters.search);

            const url = `/api/faculties${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            
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
                setFacultyData(data.faculties || data);
            } else {
                console.error('Failed to fetch faculty data');
                setErrors(['Failed to load faculty data']);
            }
        } catch (error) {
            console.error('Error fetching faculty data:', error);
            setErrors(['Network error occurred while loading data']);
        } finally {
            setLoading(false);
        }
    };

    const fetchArchivedData = async () => {
        try {
            setArchiveLoading(true);
            const queryParams = new URLSearchParams();
            
            if (archiveFilters.department) queryParams.append('department', archiveFilters.department);
            if (archiveFilters.search) queryParams.append('search', archiveFilters.search);

            const url = `/api/archived-faculties${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            
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
                setArchivedData(data.archived_faculties || data);
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

            const url = editingFaculty ? `/api/faculties/${editingFaculty.id}` : '/api/faculties';
            const method = editingFaculty ? 'PUT' : 'POST';

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
                if (editingFaculty) {
                    setFacultyData(prev => 
                        prev.map(faculty => 
                            faculty.id === editingFaculty.id ? data.faculty : faculty
                        )
                    );
                    setToastMessage(data.success || 'Faculty updated successfully!');
                } else {
                    setFacultyData(prev => [data.faculty, ...prev]);
                    setToastMessage(data.success || 'Faculty added successfully!');
                }
                
                setShowModal(false);
                setEditingFaculty(null);
                setShowToast(true);
                
                setFormData({
                    faculty_number: '',
                    name: '',
                    department: '',
                    position: '',
                    email: '',
                    contact: '',
                    status: 'ACTIVE'
                });

                setTimeout(() => setShowToast(false), 3000);
            } else {
                if (data.errors) {
                    const errorMessages = Object.values(data.errors).flat();
                    setErrors(errorMessages);
                } else if (data.message) {
                    setErrors([data.message]);
                } else {
                    setErrors(['Failed to save faculty member. Please try again.']);
                }
            }
        } catch (error) {
            console.error('Error saving faculty:', error);
            setErrors(['Network error occurred. Please check your connection and try again.']);
        }
    };

    const handleEdit = (faculty) => {
        setEditingFaculty(faculty);
        setFormData({
            faculty_number: faculty.faculty_number,
            name: faculty.name,
            department: faculty.department,
            position: faculty.position,
            email: faculty.email,
            contact: faculty.contact,
            status: faculty.status
        });
        setShowModal(true);
    };

    const handleDelete = (faculty) => {
        setDeletingFaculty(faculty);
        setShowArchiveModal(true);
    };

    const confirmDelete = async () => {
        if (!deletingFaculty) return;

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

            const response = await fetch(`/api/faculties/${deletingFaculty.id}`, {
                method: 'DELETE',
                headers: headers
            });

            if (response.ok) {
                // Remove from current list (since it's now inactive)
                setFacultyData(prev => prev.filter(faculty => faculty.id !== deletingFaculty.id));
                setToastMessage('Faculty moved to inactive status and archived!');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            } else {
                const data = await response.json();
                setErrors([data.message || 'Failed to archive faculty member.']);
            }
        } catch (error) {
            console.error('Error deleting faculty:', error);
            setErrors(['Network error occurred. Please try again.']);
        } finally {
            setShowArchiveModal(false);
            setDeletingFaculty(null);
        }
    };

    const handleRestore = async (archivedFaculty) => {
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

            const response = await fetch(`/api/archived-faculties/${archivedFaculty.id}/restore`, {
                method: 'POST',
                headers: headers
            });

            if (response.ok) {
                // Remove from archived list
                setArchivedData(prev => prev.filter(faculty => faculty.id !== archivedFaculty.id));
                setToastMessage('Faculty restored successfully!');
                setShowToast(true);
                
                // Refresh active faculty list
                fetchFacultyData();
                
                setTimeout(() => setShowToast(false), 3000);
            } else {
                const data = await response.json();
                setErrors([data.message || 'Failed to restore faculty member.']);
            }
        } catch (error) {
            console.error('Error restoring faculty:', error);
            setErrors(['Network error occurred. Please try again.']);
        }
    };

    const handlePermanentDelete = async (archivedFaculty) => {
        if (!window.confirm(`Are you sure you want to permanently delete ${archivedFaculty.name}? This action cannot be undone.`)) {
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

            const response = await fetch(`/api/archived-faculties/${archivedFaculty.id}/force`, {
                method: 'DELETE',
                headers: headers
            });

            if (response.ok) {
                // Remove from archived list
                setArchivedData(prev => prev.filter(faculty => faculty.id !== archivedFaculty.id));
                setToastMessage('Archived faculty permanently deleted!');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            } else {
                const data = await response.json();
                setErrors([data.message || 'Failed to delete faculty member.']);
            }
        } catch (error) {
            console.error('Error deleting faculty:', error);
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
        setEditingFaculty(null);
        setErrors([]);
        setFormData({
            faculty_number: '',
            name: '',
            department: '',
            position: '',
            email: '',
            contact: '',
            status: 'ACTIVE'
        });
    };

    const handleCloseArchiveModal = () => {
        setShowArchiveModal(false);
        setDeletingFaculty(null);
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

    return (
        <div className="sfms-dashboard">
            <aside className="sfms-sidebar">
                <div className="sidebar-brand">
                    <div className="logo">
                        <img src="Screenshot 2025-10-13 010627.png" alt="SFMS Logo" />
                    </div>
                    <div className="brand-text">Profile System</div>
                </div>

                <nav className="sidebar-nav">
                    <ul>
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        <li className="active"><Link to="/dashboard/faculty">Faculty</Link></li>
                        <li><Link to="/dashboard/students">Students</Link></li>
                        <li><Link to="/dashboard/reports">Reports</Link></li>
                        <li><Link to="/dashboard/settings">Settings</Link></li>
                        <li><Link to="/dashboard/profile">Profile</Link></li>
                        <li><button className="link-button" onClick={logout}>Logout</button></li>
                    </ul>
                </nav>
            </aside>

            <main className="sfms-main">
                <header className="topbar">
                    <div className="topbar-left">
                        <h4>Faculty Management</h4>
                    </div>

                    <div className="topbar-right">
                        <div className="welcome">Welcome back, John Doe</div>
                        <div className="top-actions">
                            <button 
                                className="btn small outline"
                                onClick={() => setShowModal(true)}
                            >
                                Add Faculty
                            </button>
                            <button className="icon-btn">⠇</button>
                        </div>
                    </div>
                </header>

                <div className="faculty-page">
                    <div className="faculty-filters bg-white p-4 mb-4">
                        <div className="row g-3 align-items-end">
                            <div className="col-md-3">
                                <label className="form-label">Department</label>
                                <select 
                                    className="form-select"
                                    name="department"
                                    value={filters.department}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Departments</option>
                                    {departments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3">
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
                                    placeholder="Search by name, faculty number, position, or email..."
                                    name="search"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                />
                            </div>
                            <div className="col-md-2">
                                <button 
                                    className="btn btn-search w-100"
                                    onClick={fetchFacultyData}
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="faculty-table bg-white">
                        {loading ? (
                            <div className="text-center p-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : facultyData.length > 0 ? (
                            <table className="table">
                                <thead className="table-light">
                                    <tr>
                                        <th>Faculty Number</th>
                                        <th>Name</th>
                                        <th>Department</th>
                                        <th>Position</th>
                                        <th>Email</th>
                                        <th>Contact</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {facultyData.map((faculty) => (
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
                                            <td>{faculty.department}</td>
                                            <td>{faculty.position}</td>
                                            <td>{faculty.email}</td>
                                            <td>{faculty.contact}</td>
                                            <td>
                                                {faculty.status === 'ACTIVE' ? (
                                                    <span className="badge-active">Active</span>
                                                ) : (
                                                    <span className="badge-inactive">Inactive</span>
                                                )}
                                            </td>
                                            <td>
                                                <button 
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                    onClick={() => handleEdit(faculty)}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(faculty)}
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
                                <p className="text-muted">No active faculty members found.</p>
                            </div>
                        )}
                    </div>

                    {/* Archive Button */}
                    <div className="faculty-archive-btn">
                        <button 
                            className="btn btn-archive"
                            onClick={openArchivePage}
                        >
                            📁 View Archive
                        </button>
                    </div>

                    {/* Add/Edit Faculty Modal */}
                    {showModal && (
                        <div className="sfms-modal">
                            <div 
                                className="sfms-modal-backdrop"
                                onClick={handleCloseModal}
                            ></div>
                            <div className="sfms-modal-window bg-white">
                                <div className="modal-form">
                                    <div className="modal-top d-flex justify-content-between align-items-center mb-4">
                                        <h5>{editingFaculty ? 'Edit Faculty Member' : 'Add New Faculty Member'}</h5>
                                        <button 
                                            className="btn-close"
                                            onClick={handleCloseModal}
                                        >
                                            ×
                                        </button>
                                    </div>

                                    {errors.length > 0 && (
                                        <div className="faculty-errors">
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
                                                    <label htmlFor="faculty_number">Faculty Number *</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="faculty_number"
                                                        name="faculty_number"
                                                        value={formData.faculty_number}
                                                        onChange={handleInputChange}
                                                        required
                                                        placeholder="e.g., FAC-001"
                                                        disabled={editingFaculty}
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
                                                        placeholder="e.g., Dr. John Smith"
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label htmlFor="department">Department</label>
                                                    <select
                                                        className="form-select"
                                                        id="department"
                                                        name="department"
                                                        value={formData.department}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="">Select Department</option>
                                                        {departments.map(dept => (
                                                            <option key={dept} value={dept}>{dept}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-md-6">
                                                    <label htmlFor="position">Position</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="position"
                                                        name="position"
                                                        value={formData.position}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g., Professor, Associate Professor"
                                                    />
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
                                                        placeholder="e.g., faculty@university.edu"
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
                                                {editingFaculty ? 'Update Faculty' : 'Add Faculty'}
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
                                        <h5>Move Faculty to Inactive</h5>
                                        <button 
                                            className="btn-close"
                                            onClick={handleCloseArchiveModal}
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <div className="modal-body">
                                        <p>Are you sure you want to move <strong>{deletingFaculty?.name}</strong> to inactive status?</p>
                                        <p className="text-muted">This will set the faculty status to INACTIVE and archive the record. You can restore it later from the archive.</p>
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
                                            Move to Inactive
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
                                        <h5>Faculty Archive</h5>
                                        <button 
                                            className="btn-close"
                                            onClick={closeArchivePage}
                                        >
                                            ×
                                        </button>
                                    </div>

                                    {/* Archive Filters */}
                                    <div className="faculty-filters bg-light p-4 mb-4">
                                        <div className="row g-3 align-items-end">
                                            <div className="col-md-4">
                                                <label className="form-label">Department</label>
                                                <select 
                                                    className="form-select"
                                                    name="department"
                                                    value={archiveFilters.department}
                                                    onChange={handleArchiveFilterChange}
                                                >
                                                    <option value="">All Departments</option>
                                                    {departments.map(dept => (
                                                        <option key={dept} value={dept}>{dept}</option>
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

                                    {/* Archived Faculty Table */}
                                    <div className="faculty-table bg-white">
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
                                                        <th>Faculty Number</th>
                                                        <th>Name</th>
                                                        <th>Department</th>
                                                        <th>Position</th>
                                                        <th>Archived Date</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {archivedData.map((faculty) => (
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
                                                                        <div className="text-muted small">{faculty.email}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>{faculty.department}</td>
                                                            <td>{faculty.position}</td>
                                                            <td>
                                                                <div className="text-muted small">
                                                                    {new Date(faculty.archived_at).toLocaleDateString()}
                                                                </div>
                                                                <div className="text-muted extra-small">
                                                                    {new Date(faculty.archived_at).toLocaleTimeString()}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <button 
                                                                    className="btn btn-sm btn-success me-2"
                                                                    onClick={() => handleRestore(faculty)}
                                                                >
                                                                    Restore
                                                                </button>
                                                                <button 
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() => handlePermanentDelete(faculty)}
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
                                                <p className="text-muted">No archived faculty records found.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success Toast */}
                    {showToast && (
                        <div className="faculty-toast">
                            {toastMessage}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}