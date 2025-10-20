import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function ReportsPage() {
    const navigate = useNavigate();
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

    // Load settings data from localStorage
    useEffect(() => {
        loadSettingsData();
    }, []);

    const loadSettingsData = () => {
        try {
            // Load courses from localStorage
            const savedCourses = localStorage.getItem('sfms_courses');
            if (savedCourses) {
                const coursesData = JSON.parse(savedCourses);
                const activeCourses = coursesData.filter(course => course.status === 'ACTIVE');
                setCourses(activeCourses.map(course => course.name));
            } else {
                // Use default courses if not found
                const defaultCourses = [
                    'Computer Science Program',
                    'Business Administration Program',
                    'Arts & Sciences Program',
                    'Engineering Program',
                    'Teachers Education Program',
                    'Accountancy Program',
                    'Nursing Program',
                    'Criminal Justice Program',
                    'Tourism Management Program'
                ];
                setCourses(defaultCourses);
            }

            // Load departments from localStorage
            const savedDepartments = localStorage.getItem('sfms_departments');
            if (savedDepartments) {
                const deptData = JSON.parse(savedDepartments);
                const activeDepartments = deptData.filter(dept => dept.status === 'ACTIVE');
                setDepartments(activeDepartments.map(dept => dept.name));
            } else {
                // Use default departments if not found
                const defaultDepartments = [
                    'Computer Science Program',
                    'Business Administration Program',
                    'Arts & Sciences Program',
                    'Engineering Program',
                    'Teachers Education Program',
                    'Accountancy Program',
                    'Nursing Program',
                    'Criminal Justice Program',
                    'Tourism Management Program'
                ];
                setDepartments(defaultDepartments);
            }

            // Load academic years from localStorage
            const savedAcademicYears = localStorage.getItem('sfms_academic_years');
            if (savedAcademicYears) {
                const yearsData = JSON.parse(savedAcademicYears);
                const activeYears = yearsData.filter(year => year.status === 'ACTIVE');
                setAcademicYears(activeYears.map(year => year.year));
            } else {
                // Use default academic years if not found
                setAcademicYears(['2023-2024', '2024-2025', '2025-2026']);
            }
        } catch (error) {
            console.error('Error loading settings data:', error);
        }
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

    // Export student data to CSV
    const exportStudentData = () => {
        const filteredStudents = getFilteredStudentData();
        const headers = ['Student Number', 'Name', 'Course', 'Year Level', 'Academic Year', 'Email', 'Contact', 'Status'];
        const csvData = filteredStudents.map(student => [
            student.student_number,
            student.name,
            student.course,
            student.year_level,
            student.academic_year,
            student.email || 'N/A',
            student.contact || 'N/A',
            student.status
        ]);

        downloadCSV([headers, ...csvData], 'student_report.csv');
    };

    // Export faculty data to CSV
    const exportFacultyData = () => {
        const filteredFaculty = getFilteredFacultyData();
        const headers = ['Faculty Number', 'Name', 'Department', 'Position', 'Email', 'Contact', 'Status'];
        const csvData = filteredFaculty.map(faculty => [
            faculty.faculty_number,
            faculty.name,
            faculty.department || 'N/A',
            faculty.position || 'N/A',
            faculty.email || 'N/A',
            faculty.contact || 'N/A',
            faculty.status
        ]);

        downloadCSV([headers, ...csvData], 'faculty_report.csv');
    };

    // Download CSV file
    const downloadCSV = (data, filename) => {
        const csvContent = data.map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const filteredStudents = getFilteredStudentData();
    const filteredFaculty = getFilteredFacultyData();
    const studentSummary = calculateStudentSummary(filteredStudents);

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
                        <li className="active"><a href="#">Reports</a></li>
                        <li><Link to="/dashboard/settings">Settings</Link></li>
                        <li><Link to="/dashboard/profile">Profile</Link></li>
                        <li><button className="link-button" onClick={logout}>Logout</button></li>
                    </ul>
                </nav>
            </aside>

            <main className="sfms-main">
                <header className="topbar">
                    <div className="topbar-left">
                        <h4>Reports & Analytics</h4>
                    </div>

                    <div className="topbar-right">
                        <div className="welcome">Welcome back, John Doe</div>
                        <div className="top-actions">
                            <button className="icon-btn">⠇</button>
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