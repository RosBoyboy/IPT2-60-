import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function ProfilePage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        role: 'Administrator',
        department: '',
        lastLogin: '',
        joinDate: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [activityLogs, setActivityLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    function logout() {
        // Log logout activity before clearing auth
        logActivity('Logged out');
        localStorage.removeItem('sfms_auth');
        localStorage.removeItem('sfms_activity_logs');
        navigate('/login');
    }

    // Load profile and logs from API
    useEffect(() => {
        fetchProfile();
        fetchLogs();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/profile');
            if (res.ok) {
                const data = await res.json();
                const u = data.user || {};
                setProfileData({
                    name: u.name || '',
                    email: u.email || '',
                    role: u.role || 'Administrator',
                    department: u.department || '',
                    lastLogin: u.last_login_at || '',
                    joinDate: u.joined_at || ''
                });
            }
        } catch (e) {}
    };

    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/activity-logs');
            if (res.ok) {
                const data = await res.json();
                const logs = (data.logs || []).map(l => ({
                    id: l.id,
                    timestamp: l.created_at,
                    activity: l.action,
                    ipAddress: l.ip_address,
                    details: l.details
                }));
                setActivityLogs(logs);
            }
        } catch (e) {}
    };

    // Client will just refetch logs after server writes them via controllers

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors([]);

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: profileData.name,
                    email: profileData.email,
                    department: profileData.department,
                })
            });
            const data = await res.json();
            if (res.ok) {
                setToastMessage(data.success || 'Profile updated successfully!');
                setShowToast(true);
                fetchLogs();
            } else if (data.errors) {
                setErrors(Object.values(data.errors).flat());
            }
        } finally {
            setLoading(false);
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setErrors([]);

        // Validation
        const validationErrors = [];

        if (passwordData.currentPassword !== 'admin123') {
            validationErrors.push('Current password is incorrect');
        }

        if (passwordData.newPassword.length < 8) {
            validationErrors.push('Password must be at least 8 characters long');
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            validationErrors.push('New passwords do not match');
        }

        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/profile/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    current_password: passwordData.currentPassword,
                    new_password: passwordData.newPassword,
                    new_password_confirmation: passwordData.confirmPassword
                })
            });
            const data = await res.json();
            if (res.ok) {
                setToastMessage(data.success || 'Password changed successfully!');
                setShowToast(true);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                fetchLogs();
            } else if (data.errors) {
                setErrors(Object.values(data.errors).flat());
            } else if (data.message) {
                setErrors([data.message]);
            }
        } finally {
            setLoading(false);
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    const handleProfileInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

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
                        <li><Link to="/dashboard/settings">Settings</Link></li>
                        <li className="active"><a href="#">Profile</a></li>
                        <li><button className="link-button" onClick={logout}>Logout</button></li>
                    </ul>
                </nav>
            </aside>

            <main className="sfms-main">
                <header className="topbar">
                    <div className="topbar-left">
                        <h4>My Profile</h4>
                    </div>

                    <div className="topbar-right">
                        <div className="welcome">Welcome back, {profileData.name || 'Admin'}</div>
                        <div className="top-actions">
                            <button className="icon-btn">⠇</button>
                        </div>
                    </div>
                </header>

                <div className="profile-page">
                    <div className="profile-header bg-white p-4 mb-4">
                        <h1>My Profile</h1>
                        <p className="text-muted">Manage your account settings and view activity logs</p>
                    </div>

                    <div className="profile-content">
                        <div className="row">
                            {/* Left Sidebar - Navigation */}
                            <div className="col-md-3">
                                <div className="profile-nav bg-white p-4">
                                    <div className="user-info text-center mb-4">
                                        <div className="avatar-lg bg-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                                            <span className="text-white fs-4">
                                                {profileData.name.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        </div>
                                        <h5 className="mb-1">{profileData.name}</h5>
                                        <p className="text-muted mb-2">{profileData.role}</p>
                                        <small className="text-muted">
                                            Member since {profileData.joinDate ? new Date(profileData.joinDate).toLocaleDateString() : '—'}
                                        </small>
                                    </div>

                                    <nav className="profile-nav-links">
                                        <button 
                                            className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('profile')}
                                        >
                                            Profile Information
                                        </button>
                                        <button 
                                            className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('password')}
                                        >
                                            Change Password
                                        </button>
                                        <button 
                                            className={`nav-link ${activeTab === 'activity' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('activity')}
                                        >
                                            Activity Log
                                        </button>
                                    </nav>
                                </div>
                            </div>

                            {/* Right Content - Tab Panels */}
                            <div className="col-md-9">
                                {/* Profile Information Tab */}
                                {activeTab === 'profile' && (
                                    <div className="profile-tab bg-white p-4">
                                        <h5 className="mb-4">Profile Information</h5>
                                        <form onSubmit={handleProfileUpdate}>
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label htmlFor="name" className="form-label">Full Name *</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="name"
                                                        name="name"
                                                        value={profileData.name}
                                                        onChange={handleProfileInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label htmlFor="email" className="form-label">Email Address *</label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        id="email"
                                                        name="email"
                                                        value={profileData.email}
                                                        onChange={handleProfileInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label htmlFor="role" className="form-label">Role</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="role"
                                                        name="role"
                                                        value={profileData.role}
                                                        onChange={handleProfileInputChange}
                                                        disabled
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label htmlFor="department" className="form-label">Department</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="department"
                                                        name="department"
                                                        value={profileData.department}
                                                        onChange={handleProfileInputChange}
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Last Login</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={profileData.lastLogin ? formatDate(profileData.lastLogin) : '—'}
                                                        disabled
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Admin Since</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={new Date(profileData.joinDate).toLocaleDateString()}
                                                        disabled
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary"
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Updating...' : 'Update Profile'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Change Password Tab */}
                                {activeTab === 'password' && (
                                    <div className="password-tab bg-white p-4">
                                        <h5 className="mb-4">Change Password</h5>
                                        
                                        {errors.length > 0 && (
                                            <div className="alert alert-danger">
                                                <ul className="mb-0">
                                                    {errors.map((error, index) => (
                                                        <li key={index}>{error}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <form onSubmit={handlePasswordChange}>
                                            <div className="row g-3">
                                                <div className="col-md-12">
                                                    <label htmlFor="currentPassword" className="form-label">Current Password *</label>
                                                    <input
                                                        type="password"
                                                        className="form-control"
                                                        id="currentPassword"
                                                        name="currentPassword"
                                                        value={passwordData.currentPassword}
                                                        onChange={handlePasswordInputChange}
                                                        required
                                                        placeholder="Enter current password"
                                                    />
                                                </div>
                                                <div className="col-md-12">
                                                    <label htmlFor="newPassword" className="form-label">New Password *</label>
                                                    <input
                                                        type="password"
                                                        className="form-control"
                                                        id="newPassword"
                                                        name="newPassword"
                                                        value={passwordData.newPassword}
                                                        onChange={handlePasswordInputChange}
                                                        required
                                                        placeholder="Enter new password"
                                                    />
                                                    <div className="form-text">
                                                        Password must be at least 8 characters long
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <label htmlFor="confirmPassword" className="form-label">Confirm New Password *</label>
                                                    <input
                                                        type="password"
                                                        className="form-control"
                                                        id="confirmPassword"
                                                        name="confirmPassword"
                                                        value={passwordData.confirmPassword}
                                                        onChange={handlePasswordInputChange}
                                                        required
                                                        placeholder="Confirm new password"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary"
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Changing Password...' : 'Change Password'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Activity Log Tab */}
                                {activeTab === 'activity' && (
                                    <div className="activity-tab bg-white p-4">
                                        <h5 className="mb-4">Activity Log</h5>
                                        <p className="text-muted mb-4">
                                            Recent activities and system access logs
                                        </p>

                                        {activityLogs.length > 0 ? (
                                            <div className="table-responsive">
                                                <table className="table table-striped">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Date & Time</th>
                                                            <th>Activity</th>
                                                            <th>IP Address</th>
                                                            <th>Details</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {activityLogs.map((log) => (
                                                            <tr key={log.id}>
                                                                <td className="text-nowrap">
                                                                    {formatDate(log.timestamp)}
                                                                </td>
                                                                <td>
                                                                    <strong>{log.activity}</strong>
                                                                </td>
                                                                <td>{log.ipAddress}</td>
                                                                <td>
                                                                    <small className="text-muted">
                                                                        {log.details || '—'}
                                                                    </small>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-center p-5">
                                                <p className="text-muted">No activity logs found.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Success Toast */}
                    {showToast && (
                        <div className="profile-toast">
                            {toastMessage}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}