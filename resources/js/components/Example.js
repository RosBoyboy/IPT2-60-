import React, { useState, useEffect } from 'react';
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

    return (
        <div className="sfms-dashboard">
            <aside className="sfms-sidebar">
                <div className="sidebar-brand">
                    <div className="logo">
                        {}
                        <img src="/img/sfms-logo2.png" alt="SFMS Logo" />
                    </div>
                    <div className="brand-text">Profile System</div>
                </div>

                <nav className="sidebar-nav">
                    <ul>
                        <li className="active"><Link to="/dashboard">Dashboard</Link></li>
                        <li><Link to="/dashboard/faculty">Faculty</Link></li>
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
                        <h4>Dashboard</h4>
                    </div>

                    <div className="topbar-right">
                        <div className="welcome">Welcome back, {profileData.name || 'Admin'}</div>
                        <div className="top-actions">
                            <button 
                                className="btn small" 
                                onClick={() => navigate('/dashboard/students')}
                            >
                                Add Student
                            </button>
                            <button 
                                className="btn small outline" 
                                onClick={() => navigate('/dashboard/faculty')}
                            >
                                Add Faculty
                            </button>
                            <button className="icon-btn">⠇</button>
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
                            <div className="stat-icon blue">👩‍🎓</div>
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
                            <div className="stat-icon green">👨‍🏫</div>
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
                            <div className="stat-icon yellow">📚</div>
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
                            <div className="stat-icon cyan">🏫</div>
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
                                        Showing top {topCourses.length} courses by student enrollment
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

                    <div className="activity-section">
                        <div className="activity-card">
                            <div className="card-header">
                                <h3>Recent Faculty Activity</h3>
                                <button 
                                    className="view-all-btn"
                                    onClick={() => navigate('/dashboard/faculty')}
                                >
                                    View all
                                </button>
                            </div>
                            <ul className="activity-list">
                                <li>
                                    <div className="activity-content">
                                        <strong>Dr. John Smith</strong>
                                        <span>Updated profile information</span>
                                    </div>
                                    <div className="activity-time">2 hours ago</div>
                                </li>
                                <li>
                                    <div className="activity-content">
                                        <strong>Prof. Sarah Johnson</strong>
                                        <span>Added new course materials</span>
                                    </div>
                                    <div className="activity-time">4 hours ago</div>
                                </li>
                                <li>
                                    <div className="activity-content">
                                        <strong>Dr. Michael Brown</strong>
                                        <span>Completed student evaluation</span>
                                    </div>
                                    <div className="activity-time">6 hours ago</div>
                                </li>
                            </ul>
                        </div>

                        <div className="notifications-card">
                            <div className="card-header">
                                <h3>System Notifications</h3>
                            </div>
                            <ul className="notifications-list">
                                <li className="notification-item info">
                                    <div className="notification-content">
                                        <div className="notification-title">Student Data Updated</div>
                                        <div className="notification-desc">
                                            Current student count: {dashboardData.loading ? '...' : dashboardData.totalStudents} active students
                                        </div>
                                    </div>
                                </li>
                                <li className="notification-item info">
                                    <div className="notification-content">
                                        <div className="notification-title">Faculty Data Updated</div>
                                        <div className="notification-desc">
                                            Current faculty count: {dashboardData.loading ? '...' : dashboardData.totalFaculty} active members
                                        </div>
                                    </div>
                                </li>
                                <li className="notification-item success">
                                    <div className="notification-content">
                                        <div className="notification-title">System Update</div>
                                        <div className="notification-desc">Database backup completed successfully</div>
                                    </div>
                                </li>
                                <li className="notification-item warning">
                                    <div className="notification-content">
                                        <div className="notification-title">Maintenance</div>
                                        <div className="notification-desc">Scheduled maintenance on Dec 20, 2023</div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}