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
import CalendarPage from './Calendar';
import AuthenticationError from './authentication';

// Simple auth helper (client-side only)
const isAuthenticated = () => {
    return localStorage.getItem('sfms_auth') === 'true';
};

// Guard that renders an error page when unauthenticated
function PrivateRoute({ children }) {
    return isAuthenticated() ? children : <AuthenticationError loginPath="/login" />;
}

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<AdminLogs />} />

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
                    path="/dashboard/calendar"
                    element={
                        <PrivateRoute>
                            <CalendarPage />
                        </PrivateRoute>
                    }
                />

                {/* Existing */}
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

                {/* root -> go to login */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* fallback -> go to login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
// ...existing code...