/**
 * First we will load all of this project's JavaScript dependencies which
 * includes React and other helpers. It's a great starting point while
 * building robust, powerful web applications using React + Laravel.
 */

//require('./bootstrap');

/**
 * Next, we will create a fresh React component instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

//require('./components/Routers');

// ...existing code...
import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import Routers from './components/Routers';

// import your SCSS so Mix compiles them into public/css/app.css
import '../sass/adminlogs.scss';
import '../sass/dashboard.scss';
import '../sass/faculty.scss';
import '../sass/student.scss';
import '../sass/reports.scss';
import '../sass/settings.scss';
import '../sass/profile.scss';

const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(<Routers />);
}