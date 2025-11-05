// ...existing code...
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogs from './adminlogs';
import Dashboard from './Example';
import Faculty from './Faculty';
import Student from './Student';
import Reports from './reports';
import Settings from './settings';
import Profile from './profile';
import AuthenticationError from './authentication';
import LandingPage from './LandingPage';
import StudentLogin from './StudentLogin';

// Simple auth helper (client-side only)
const isAuthenticated = () => localStorage.getItem('sfms_auth') === 'true';

// Guard that shows an error page when unauthenticated (no redirect)
function PrivateRoute({ children }) {
    return isAuthenticated() ? children : <AuthenticationError loginPath="/login" />;
}

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<AdminLogs />} />
                <Route path="/student-login" element={<StudentLogin />} />

                {/* Dashboard root - protected */}
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />

                {/* Faculty under dashboard - protected */}
                <Route
                    path="/dashboard/faculty"
                    element={
                        <PrivateRoute>
                            <Faculty />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/dashboard/students"
                    element={
                        <PrivateRoute>
                            <Student />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/dashboard/reports"
                    element={
                        <PrivateRoute>
                            <Reports />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/dashboard/settings"
                    element={
                        <PrivateRoute>
                            <Settings />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/dashboard/profile"
                    element={
                        <PrivateRoute>
                            <Profile />
                        </PrivateRoute>
                    }
                />

                {/* fallback -> go to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
// ...existing code...