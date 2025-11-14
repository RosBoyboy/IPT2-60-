import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { initTheme, toggleTheme } from '../utils/theme';

export default function FacultyPage() {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState({ name: '' });
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
    // Photo upload state
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    // Persisted uploaded photos (data URLs) fallback when server doesn't return photo_url
    const [uploadedPhotos, setUploadedPhotos] = useState({});

    // Load persisted uploaded photos from localStorage on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem('sfms_uploaded_faculty_photos');
            if (raw) setUploadedPhotos(JSON.parse(raw));
        } catch (e) {
            console.error('Failed to load uploaded faculty photos from localStorage', e);
        }
    }, []);

    const saveUploadedPhotos = (map) => {
        try {
            localStorage.setItem('sfms_uploaded_faculty_photos', JSON.stringify(map || {}));
        } catch (e) {
            console.error('Failed to save uploaded faculty photos to localStorage', e);
        }
    };

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

    // Load departments from API (replace localStorage reliance)
    useEffect(() => {
        (async () => {
            await loadSettingsData();
            fetchProfile();
            try { const t = initTheme(); setTheme(t); } catch (e) {}
        })();
    }, []);

    // must match settings.js version
    const DEPARTMENTS_VERSION = '2';

    const loadSettingsData = async () => {
        try {
            const res = await fetch('/api/departments', { method: 'GET', headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });
            if (res.ok) {
                const data = await res.json();
                const list = Array.isArray(data) ? data : (data.departments || []);
                const activeDepartments = (list.filter ? list.filter(d => d.status === 'ACTIVE') : []);
                setDepartments(activeDepartments.map(dept => (dept.name || '').replace(/\s*Program$/i, '')));
                return;
            }
        } catch (err) {
            console.warn('Failed to fetch departments from API, falling back to defaults', err);
        }

        // Fallback defaults
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
                const list = data.faculties || data;
                setFacultyData(list);
                // Clean up any local fallback images for items that now have server photo_url
                try {
                    const next = { ...(uploadedPhotos || {}) };
                    (Array.isArray(list) ? list : []).forEach(f => {
                        if (f && f.faculty_number && f.photo_url && next[f.faculty_number]) {
                            delete next[f.faculty_number];
                        }
                    });
                    // Only update if changed
                    if (JSON.stringify(next) !== JSON.stringify(uploadedPhotos)) {
                        setUploadedPhotos(next);
                        saveUploadedPhotos(next);
                    }
                } catch (e) {
                    console.error('Error cleaning uploadedPhotos after fetch', e);
                }
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
		// Auto-calculate age when DOB changes
		if (name === 'dob') {
			const dobVal = value;
			let computedAge = '';
			if (dobVal) {
				const dobDate = new Date(dobVal);
				const today = new Date();
				let a = today.getFullYear() - dobDate.getFullYear();
				const m = today.getMonth() - dobDate.getMonth();
				if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
					a--;
				}
				computedAge = a >= 0 ? a : '';
			}

			setFormData(prev => ({
				...prev,
				dob: dobVal,
				age: computedAge
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

    // File input handler for faculty photo
    const handlePhotoChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            setPhotoFile(file);
            try { setPhotoPreview(URL.createObjectURL(file)); } catch (err) { console.error(err); }
        } else {
            setPhotoFile(null);
            setPhotoPreview(null);
        }
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
            const isEdit = !!editingFaculty;
            const url = isEdit ? `/api/faculties/${editingFaculty.id}` : '/api/faculties';

            // Use FormData so we can attach photo files. Laravel accepts multipart even for new records.
            const payload = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== undefined && formData[key] !== null) payload.append(key, formData[key]);
            });
            if (photoFile) payload.append('photo', photoFile);
            if (isEdit) payload.append('_method', 'PUT');

            const csrfToken = getCsrfToken();
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {})
            };

            const response = await fetch(url, {
                method: 'POST', // POST with _method=PUT for editing
                headers: headers,
                body: payload
            });

            const contentType = response.headers.get('content-type');
            let data;
            const ct = contentType || '';
            if (ct.includes('application/json')) data = await response.json();
            else {
                const text = await response.text().catch(() => '');
                try { data = JSON.parse(text); } catch { data = { message: text }; }
            }

            if (response.ok) {
                // If we uploaded a photo file, also persist a local dataURL fallback so the avatar
                // displays immediately and survives refresh if the server doesn't return photo_url.
                const facultyNumber = (isEdit ? (editingFaculty && editingFaculty.faculty_number) : formData.faculty_number) || (data && data.faculty && data.faculty.faculty_number) || '';
                if (photoFile && facultyNumber) {
                    try {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const dataUrl = reader.result;
                            const next = { ...(uploadedPhotos || {}) };
                            next[facultyNumber] = dataUrl;
                            setUploadedPhotos(next);
                            saveUploadedPhotos(next);
                        };
                        reader.readAsDataURL(photoFile);
                    } catch (e) {
                        console.error('Failed to read uploaded photo for local persistence', e);
                    }
                }

                // Refresh list from server so we get the saved photo_url and normalized data
                await fetchFacultyData();

                setShowModal(false);
                setEditingFaculty(null);
                setShowToast(true);

                setPhotoFile(null);
                setPhotoPreview(null);

                setFormData({
                    faculty_number: '',
                    name: '',
                    department: '',
                    position: '',
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

                setToastMessage(data.success || (isEdit ? 'Faculty updated successfully!' : 'Faculty added successfully!'));
                setTimeout(() => setShowToast(false), 3000);
            } else {
                if (data && data.errors) {
                    const errorMessages = Object.values(data.errors).flat();
                    setErrors(errorMessages);
                } else if (data && data.message) {
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
		status: faculty.status,
		gender: faculty.gender || '',
		dob: faculty.dob || '',
		age: faculty.age || '',
		street_address: faculty.street_address || '',
		city_municipality: faculty.city_municipality || '',
		province_region: faculty.province_region || '',
		zip_code: faculty.zip_code || ''
        });
        // show existing photo if available
        setPhotoPreview(faculty.photo_url || faculty.profile_photo_url || null);
        setPhotoFile(null);
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
			status: 'ACTIVE',
			gender: '',
			dob: '',
			age: '',
			street_address: '',
			city_municipality: '',
			province_region: '',
			zip_code: ''
		});
                setPhotoFile(null);
                setPhotoPreview(null);
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
                        <li className="active"><Link to="/dashboard/faculty"><span className="nav-icon">{facultyIcon()}</span>Faculty</Link></li>
                        <li><Link to="/dashboard/students"><span className="nav-icon">{studentsIcon()}</span>Students</Link></li>
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
                        <h4>Faculty Management</h4>
                    </div>

                    <div className="topbar-right">
                        <div className="top-actions">
                            <button 
                                className="btn small outline"
                                onClick={() => setShowModal(true)}
                            >
                                Add Faculty
                            </button>
                        </div>
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
                                        <th>Photo</th>
                                        <th>Faculty Number</th>
                                        <th>Name</th>
                                        <th>Department</th>
                                        <th>Position</th>
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
                                            {facultyData.map((faculty) => (
                                        <tr key={faculty.id}>
                                            <td>
                                                {renderAvatar(faculty.name, faculty.photo_url || faculty.profile_photo_url || uploadedPhotos[faculty.faculty_number])}
                                            </td>
                                            <td className="fw-semibold">{faculty.faculty_number}</td>
                                            <td><div className="fw-semibold">{faculty.name}</div></td>
                                            <td>{faculty.department}</td>
                                            <td>{faculty.position}</td>
											<td>{faculty.gender || '-'}</td>
											<td>{faculty.dob ? new Date(faculty.dob).toLocaleDateString() : '-'}</td>
											<td>{faculty.age ?? '-'}</td>
											<td>
												<div className="small text-muted">
													{faculty.street_address ? (<div>{faculty.street_address}</div>) : null}
													{(faculty.city_municipality || faculty.province_region || faculty.zip_code) ? (
														<div>
															{faculty.city_municipality}{faculty.city_municipality && faculty.province_region ? ', ' : ''}{faculty.province_region}{(faculty.zip_code && (faculty.city_municipality || faculty.province_region)) ? ' - ' + faculty.zip_code : (faculty.zip_code || '')}
														</div>
													) : null}
												</div>
											</td>
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
                            style={{ backgroundColor: '#0f79e0', borderColor: '#0f79e0', color: '#ffffff' }}
                            onClick={openArchivePage}
                        >
                            {archiveIcon()} <span style={{ marginLeft: 8 }}>View Archive</span>
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
                                                    <label htmlFor="photo">Attach Photo</label>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="form-control"
                                                        id="photo"
                                                        name="photo"
                                                        onChange={handlePhotoChange}
                                                    />
                                                    {photoPreview && (
                                                        <div style={{ marginTop: 8 }}>
                                                            <img src={photoPreview} alt="preview" style={{ maxWidth: 120, borderRadius: 8 }} />
                                                        </div>
                                                    )}
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
                                                        <th>Photo</th>
                                                        <th>Faculty Number</th>
                                                        <th>Name</th>
                                                        <th>Department</th>
                                                        <th>Position</th>
                                                        <th>Archived Date</th>
											<th>Gender</th>
										<th>Date of Birth</th>
											<th>Age</th>
											<th>Address</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {archivedData.map((faculty) => (
                                                        <tr key={faculty.id}>
                                                            <td>
                                                                {renderAvatar(faculty.name, faculty.photo_url || faculty.profile_photo_url || uploadedPhotos[faculty.faculty_number])}
                                                            </td>
                                                            <td className="fw-semibold">{faculty.faculty_number}</td>
                                                            <td>
                                                                <div className="fw-semibold">{faculty.name}</div>
                                                                <div className="text-muted small">{faculty.email}</div>
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
												<td>{faculty.gender || '-'}</td>
												<td>{faculty.dob ? new Date(faculty.dob).toLocaleDateString() : '-'}</td>
												<td>{faculty.age ?? '-'}</td>
												<td>
													<div className="small text-muted">
														{faculty.street_address ? (<div>{faculty.street_address}</div>) : null}
														{(faculty.city_municipality || faculty.province_region || faculty.zip_code) ? (
															<div>
																{faculty.city_municipality}{faculty.city_municipality && faculty.province_region ? ', ' : ''}{faculty.province_region}{(faculty.zip_code && (faculty.city_municipality || faculty.province_region)) ? ' - ' + faculty.zip_code : (faculty.zip_code || '')}
															</div>
														) : null}
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