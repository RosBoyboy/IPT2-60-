// Theme utility: manages light/dark theme by toggling a CSS class and
// the Bootstrap `data-bs-theme` attribute on the document element.
// We set the attribute so Bootstrap variable overrides are applied while
// leaving accent colors (like the primary blue) intact.
const THEME_KEY = 'sfms_theme';
const DARK_CLASS = 'sfms-theme-dark';

function setDocumentThemeAttribute(theme) {
    try {
        const root = document.documentElement || document.body;
        if (theme === 'dark') {
            root.classList.add(DARK_CLASS);
            root.setAttribute('data-bs-theme', 'dark');
            // inject runtime overrides so components using .bg-white become dark
            try { injectDarkOverrides(); } catch (e) {}
        } else {
            root.classList.remove(DARK_CLASS);
            // explicit set to light so Bootstrap uses light variables
            root.setAttribute('data-bs-theme', 'light');
            try { removeDarkOverrides(); } catch (e) {}
        }
    } catch (e) {}
}

// Runtime CSS overrides injected for dark mode to ensure elements that use
// explicit `bg-white` classes (and similar) become dark without rebuilding
// CSS. We also add support for components like cards, modal windows, and
// dropdowns used in this app.
const DARK_OVERRIDES_ID = 'sfms-dark-overrides';
const DARK_OVERRIDES_CSS = `
[data-bs-theme="dark"] .bg-white,
.sfms-theme-dark .bg-white,
[data-bs-theme="dark"] .card,
.sfms-theme-dark .card,
[data-bs-theme="dark"] .sfms-modal-window,
.sfms-theme-dark .sfms-modal-window,
[data-bs-theme="dark"] .notifications-dropdown,
.sfms-theme-dark .notifications-dropdown {
    background-color: var(--bs-light-bg-subtle) !important;
    color: var(--bs-body-color) !important;
    border-color: var(--bs-border-color) !important;
}

/* Notifications dropdown: ensure all text inside the dropdown is readable
   and that selection/highlight colors are appropriate in dark mode. */
[data-bs-theme="dark"] .notifications-dropdown,
.sfms-theme-dark .notifications-dropdown {
    background-color: var(--bs-light-bg-subtle) !important;
    color: var(--bs-body-color) !important;
}
[data-bs-theme="dark"] .notifications-dropdown .dropdown-list,
.sfms-theme-dark .notifications-dropdown .dropdown-list,
[data-bs-theme="dark"] .notifications-dropdown .dropdown-item,
.sfms-theme-dark .notifications-dropdown .dropdown-item {
    color: var(--bs-body-color) !important;
}
[data-bs-theme="dark"] .notifications-dropdown a,
.sfms-theme-dark .notifications-dropdown a {
    color: var(--bs-primary) !important;
}
[data-bs-theme="dark"] .notifications-dropdown ::selection,
.sfms-theme-dark .notifications-dropdown ::selection {
    background: rgba(0,123,255,0.35) !important;
    color: #fff !important;
}

/* Profile page panels: header, left nav and right tab panels */
[data-bs-theme="dark"] .profile-header,
.sfms-theme-dark .profile-header,
[data-bs-theme="dark"] .profile-nav,
.sfms-theme-dark .profile-nav,
[data-bs-theme="dark"] .profile-tab,
.sfms-theme-dark .profile-tab,
[data-bs-theme="dark"] .profile-content,
.sfms-theme-dark .profile-content {
    background-color: var(--bs-light-bg-subtle) !important;
    color: var(--bs-body-color) !important;
    border-color: var(--bs-border-color) !important;
}

[data-bs-theme="dark"] .topbar,
.sfms-theme-dark .topbar {
    background-color: var(--bs-secondary-bg) !important;
    color: var(--bs-body-color) !important;
}

/* Ensure all common text elements inside dark panels and main content are readable.
   This forces headings, paragraphs, links, table cells, labels, and small text
   to use the theme body color. We still keep semantic classes like .text-primary
   and .btn-primary untouched elsewhere. */
[data-bs-theme="dark"] .sfms-modal *,
.sfms-theme-dark .sfms-modal *,
[data-bs-theme="dark"] .settings-modal-window *,
.sfms-theme-dark .settings-modal-window *,
[data-bs-theme="dark"] .sfms-main *,
.sfms-theme-dark .sfms-main *,
[data-bs-theme="dark"] .reports-page *,
.sfms-theme-dark .reports-page *,
[data-bs-theme="dark"] .faculty-page *,
.sfms-theme-dark .faculty-page *,
[data-bs-theme="dark"] .student-report *,
.sfms-theme-dark .student-report *,
[data-bs-theme="dark"] .faculty-report *,
.sfms-theme-dark .faculty-report * {
    color: var(--bs-body-color) !important;
}

/* Ensure links inside dark panels remain visible but keep primary accents */
[data-bs-theme="dark"] .sfms-modal a,
.sfms-theme-dark .sfms-modal a,
[data-bs-theme="dark"] .sfms-main a,
.sfms-theme-dark .sfms-main a {
    color: var(--bs-primary) !important;
}

/* Selection contrast inside dark panels */
[data-bs-theme="dark"] .sfms-modal ::selection,
.sfms-theme-dark .sfms-modal ::selection,
[data-bs-theme="dark"] .sfms-main ::selection,
.sfms-theme-dark .sfms-main ::selection {
    background: rgba(0,123,255,0.35) !important;
    color: #fff !important;
}
/* Tone down very bright accent surfaces (table header, pills, action buttons)
   so they appear static and not overly luminous in dark mode. Keep brand blue
   for active states but use slightly darker/muted fills and remove heavy glows. */
[data-bs-theme="dark"] .table thead th,
.sfms-theme-dark .table thead th {
    background: linear-gradient(180deg, rgba(10,90,180,0.98), rgba(8,76,153,0.98)) !important;
    color: #ffffff !important;
    border-bottom: 1px solid rgba(0,0,0,0.25) !important;
}

[data-bs-theme="dark"] .pill,
.sfms-theme-dark .pill,
[data-bs-theme="dark"] .nav-pills .nav-link,
.sfms-theme-dark .nav-pills .nav-link {
    background-color: rgba(255,255,255,0.03) !important;
    color: var(--bs-body-color) !important;
    border: 1px solid rgba(255,255,255,0.05) !important;
}

[data-bs-theme="dark"] .pill.active,
.sfms-theme-dark .pill.active,
[data-bs-theme="dark"] .nav-pills .nav-link.active,
.sfms-theme-dark .nav-pills .nav-link.active {
    background-color: var(--bs-primary) !important;
    color: #fff !important;
    box-shadow: none !important;
}

/* Action buttons (Edit/Delete) - keep blue but remove heavy shadow/highlight */
[data-bs-theme="dark"] .btn-primary,
.sfms-theme-dark .btn-primary {
    background-color: #0b74d9 !important;
    border-color: #0b74d9 !important;
    color: #fff !important;
    box-shadow: none !important;
}

[data-bs-theme="dark"] .btn-primary:hover,
.sfms-theme-dark .btn-primary:hover {
    filter: brightness(0.95) !important;
}

/* Status badges - slightly muted green */
[data-bs-theme="dark"] .badge-active,
.sfms-theme-dark .badge-active {
    background-color: rgba(144, 238, 144, 0.18) !important;
    color: #dfffe0 !important;
    border: 1px solid rgba(144,238,144,0.06) !important;
}

/* Topbar small controls (notification, settings, avatar) - muted backgrounds */
[data-bs-theme="dark"] .top-icons .icon-circle,
.sfms-theme-dark .top-icons .icon-circle,
[data-bs-theme="dark"] .profile-chip,
.sfms-theme-dark .profile-chip {
    background-color: rgba(255,255,255,0.03) !important;
    color: var(--bs-body-color) !important;
    border: 1px solid rgba(255,255,255,0.05) !important;
}

/* Ensure table rows text remains readable while reducing high-contrast whites */
[data-bs-theme="dark"] .table td,
.sfms-theme-dark .table td,
[data-bs-theme="dark"] .table th,
.sfms-theme-dark .table th {
    color: var(--bs-body-color) !important;
}
/* Ensure the page background and main content areas also switch to dark */
[data-bs-theme="dark"],
.sfms-theme-dark,
[data-bs-theme="dark"] body,
.sfms-theme-dark body,
[data-bs-theme="dark"] .sfms-main,
.sfms-theme-dark .sfms-main,
[data-bs-theme="dark"] .settings-page,
.sfms-theme-dark .settings-page,
[data-bs-theme="dark"] .settings-content,
.sfms-theme-dark .settings-content,
[data-bs-theme="dark"] .reports-page,
.sfms-theme-dark .reports-page,
[data-bs-theme="dark"] .faculty-page,
.sfms-theme-dark .faculty-page,
[data-bs-theme="dark"] .student-report,
.sfms-theme-dark .student-report,
[data-bs-theme="dark"] .faculty-report,
.sfms-theme-dark .faculty-report {
    background-color: var(--bs-body-bg) !important;
    color: var(--bs-body-color) !important;
}

/* Ensure modal backdrop content uses dark surface */
[data-bs-theme="dark"] .sfms-modal-window .modal-form,
.sfms-theme-dark .sfms-modal-window .modal-form {
    background-color: transparent !important;
}

/* Muted pill / nav buttons and outline adjustments so inactive pills aren't bright white */
[data-bs-theme="dark"] .nav-btn,
.sfms-theme-dark .nav-btn {
    background-color: rgba(255,255,255,0.02) !important;
    color: var(--bs-body-color) !important;
    border: 1px solid rgba(255,255,255,0.06) !important;
    box-shadow: none !important;
}

[data-bs-theme="dark"] .nav-btn.active,
.sfms-theme-dark .nav-btn.active {
    background-color: var(--bs-primary) !important;
    color: #fff !important;
    box-shadow: none !important;
}

/* FullCalendar: make calendar panels and day cells readable in dark mode */
[data-bs-theme="dark"] .fc,
.sfms-theme-dark .fc {
    background: transparent !important;
    color: var(--bs-body-color) !important;
}
[data-bs-theme="dark"] .fc .fc-toolbar,
.sfms-theme-dark .fc .fc-toolbar {
    background: rgba(255,255,255,0.02) !important;
    color: var(--bs-body-color) !important;
    border-bottom: 1px solid rgba(255,255,255,0.06) !important;
}
[data-bs-theme="dark"] .fc .fc-scrollgrid,
.sfms-theme-dark .fc .fc-scrollgrid {
    background: transparent !important;
}
[data-bs-theme="dark"] .fc .fc-daygrid-day-frame,
.sfms-theme-dark .fc .fc-daygrid-day-frame {
    background: rgba(255,255,255,0.02) !important;
    border: 1px solid rgba(255,255,255,0.03) !important;
    color: var(--bs-body-color) !important;
}
[data-bs-theme="dark"] .fc .fc-daygrid-day-number,
.sfms-theme-dark .fc .fc-daygrid-day-number {
    color: rgba(255,255,255,0.55) !important;
}

/* Aggressively target the calendar surface container (cards & wrappers) */
[data-bs-theme="dark"] .card .fc,
.sfms-theme-dark .card .fc,
[data-bs-theme="dark"] .calendar-card,
.sfms-theme-dark .calendar-card,
[data-bs-theme="dark"] .calendar-wrapper,
.sfms-theme-dark .calendar-wrapper {
    background-color: rgba(255,255,255,0.02) !important;
    color: var(--bs-body-color) !important;
}

/* Ensure the big white calendar panel that FullCalendar sometimes renders is covered */
[data-bs-theme="dark"] .fc .fc-daygrid,
.sfms-theme-dark .fc .fc-daygrid,
[data-bs-theme="dark"] .fc .fc-view-harness,
.sfms-theme-dark .fc .fc-view-harness,
[data-bs-theme="dark"] .fc .fc-scroller,
.sfms-theme-dark .fc .fc-scroller,
[data-bs-theme="dark"] .fc .fc-daygrid-body,
.sfms-theme-dark .fc .fc-daygrid-body {
    background: rgba(255,255,255,0.01) !important;
}

/* Table body rows: reduce bright whites and give subtle separation */
[data-bs-theme="dark"] .table tbody tr,
.sfms-theme-dark .table tbody tr {
    background-color: rgba(255,255,255,0.01) !important;
    border-top: 1px solid rgba(255,255,255,0.03) !important;
}
[data-bs-theme="dark"] .table tbody tr:hover,
.sfms-theme-dark .table tbody tr:hover {
    background-color: rgba(255,255,255,0.02) !important;
}

/* Muted table footer (Grand Total) */
[data-bs-theme="dark"] .table tfoot,
.sfms-theme-dark .table tfoot,
[data-bs-theme="dark"] .table tfoot tr,
.sfms-theme-dark .table tfoot tr,
[data-bs-theme="dark"] .table tfoot td,
.sfms-theme-dark .table tfoot td,
[data-bs-theme="dark"] .table tfoot th,
.sfms-theme-dark .table tfoot th {
    background-color: rgba(255,255,255,0.02) !important;
    color: rgba(15, 14, 14, 0.65) !important;
    border-top: 1px solid rgba(255,255,255,0.03) !important;
}

/* Reports footer (grand total) - slightly brighter but muted */
[data-bs-theme="dark"] .report-footer,
.sfms-theme-dark .report-footer {
    background-color: rgba(255,255,255,0.02) !important;
    color: rgba(14, 13, 13, 0.27) !important;
}

/* Settings lists and rows */
[data-bs-theme="dark"] .settings-table tbody tr,
.sfms-theme-dark .settings-table tbody tr,
[data-bs-theme="dark"] .list-group-item,
.sfms-theme-dark .list-group-item {
    background-color: rgba(255,255,255,0.02) !important;
    color: var(--bs-body-color) !important;
    border: 1px solid rgba(255,255,255,0.03) !important;
}

/* When a surface is light (mini white block) ensure the text inside is dark so
   it remains readable in dark mode. We only target small/light surfaces we
   intentionally converted to low-alpha white backgrounds above. This keeps
   overall page chrome readable while fixing text contrast on mini panels. */
[data-bs-theme="dark"] .bg-white,
.sfms-theme-dark .bg-white,
[data-bs-theme="dark"] .card .card-body,
.sfms-theme-dark .card .card-body,
[data-bs-theme="dark"] .fc .fc-daygrid-day-frame,
.sfms-theme-dark .fc .fc-daygrid-day-frame,
[data-bs-theme="dark"] .table tfoot td,
.sfms-theme-dark .table tfoot td,
[data-bs-theme="dark"] .table tfoot th,
.sfms-theme-dark .table tfoot th,
[data-bs-theme="dark"] .settings-table tbody tr,
.sfms-theme-dark .settings-table tbody tr,
[data-bs-theme="dark"] .list-group-item,
.sfms-theme-dark .list-group-item,
[data-bs-theme="dark"] .report-footer,
.sfms-theme-dark .report-footer {
    color: rgba(0,0,0,0.85) !important;
}

/* Dashboard stat card values use background-clip gradient in light mode which
   becomes hard to read when the card is muted. Force a solid, dark value color
   for readability inside small white cards. */
[data-bs-theme="dark"] .stat-card .stat-value,
.sfms-theme-dark .stat-card .stat-value {
    background: none !important;
    -webkit-background-clip: unset !important;
    background-clip: unset !important;
    -webkit-text-fill-color: rgba(0,0,0,0.9) !important;
    color: rgba(0,0,0,0.9) !important;
}

/* Chart titles, labels, and legend items inside chart cards should be dark
   when the card surface is light. */
[data-bs-theme="dark"] .chart-card .chart-header h3,
.sfms-theme-dark .chart-card .chart-header h3,
[data-bs-theme="dark"] .chart-card .chart-container,
.sfms-theme-dark .chart-card .chart-container,
[data-bs-theme="dark"] .chart-card .bar-label,
.sfms-theme-dark .chart-card .bar-label,
[data-bs-theme="dark"] .donut-chart-center .donut-total,
.sfms-theme-dark .donut-chart-center .donut-total,
[data-bs-theme="dark"] .donut-chart-center .donut-label,
.sfms-theme-dark .donut-chart-center .donut-label,
[data-bs-theme="dark"] .legend-label .legend-department,
.sfms-theme-dark .legend-label .legend-department,
[data-bs-theme="dark"] .legend-label .legend-count,
.sfms-theme-dark .legend-label .legend-count {
    color: rgba(0,0,0,0.85) !important;
}

/* Small caption/text inside stat cards */
[data-bs-theme="dark"] .stat-card .stat-label,
.sfms-theme-dark .stat-card .stat-label,
[data-bs-theme="dark"] .stat-card .stat-change,
.sfms-theme-dark .stat-card .stat-change {
    color: rgba(0,0,0,0.65) !important;
}

/* Muted toggle / pill labels inside table cells: the capsule background is light
   so the label text should be dark to be readable. This targets labels and
   any small text inside the pill controls. */
[data-bs-theme="dark"] .table .form-check-label,
.sfms-theme-dark .table .form-check-label,
[data-bs-theme="dark"] .table .pill,
.sfms-theme-dark .table .pill,
[data-bs-theme="dark"] .table .pill *,
.sfms-theme-dark .table .pill * {
    color: rgba(0,0,0,0.75) !important;
}

/* FullCalendar day numbers inside light day boxes should be darker */
[data-bs-theme="dark"] .fc .fc-daygrid-day-number,
.sfms-theme-dark .fc .fc-daygrid-day-number {
    color: rgba(0,0,0,0.55) !important;
    font-weight: 600 !important;
}

/* Muted toggle / pill inputs inside tables (type column) */
[data-bs-theme="dark"] .table .form-switch,
.sfms-theme-dark .table .form-switch,
[data-bs-theme="dark"] .table .form-check,
.sfms-theme-dark .table .form-check,
[data-bs-theme="dark"] .table .switch,
.sfms-theme-dark .table .switch,
[data-bs-theme="dark"] .table .onoffswitch,
.sfms-theme-dark .table .onoffswitch {
    background-color: rgba(255,255,255,0.02) !important;
    border-radius: 999px !important;
    padding: 4px !important;
}
[data-bs-theme="dark"] .table .form-check-input,
.sfms-theme-dark .table .form-check-input,
[data-bs-theme="dark"] .table .onoffswitch input,
.sfms-theme-dark .table .onoffswitch input {
    /* Muted knob / input so it's not a bright white spot */
    background-color: rgba(255,255,255,0.14) !important;
    border: 1px solid rgba(255,255,255,0.06) !important;
    box-shadow: none !important;
    color: var(--bs-body-color) !important;
}
    


/* Make outline/light buttons muted in dark mode (not pure white) */
[data-bs-theme="dark"] .btn-outline-light,
.sfms-theme-dark .btn-outline-light,
[data-bs-theme="dark"] .btn-outline-secondary,
.sfms-theme-dark .btn-outline-secondary {
    background-color: rgba(255,255,255,0.02) !important;
    color: var(--bs-body-color) !important;
    border-color: rgba(255,255,255,0.06) !important;
}
`;

function injectDarkOverrides() {
    try {
        if (document.getElementById(DARK_OVERRIDES_ID)) return;
        const el = document.createElement('style');
        el.id = DARK_OVERRIDES_ID;
        el.appendChild(document.createTextNode(DARK_OVERRIDES_CSS));
        document.head.appendChild(el);
    } catch (e) {}
}

function removeDarkOverrides() {
    try {
        const el = document.getElementById(DARK_OVERRIDES_ID);
        if (el && el.parentNode) el.parentNode.removeChild(el);
    } catch (e) {}
}

// Remove trailing " Program" from visible course/department names at runtime.
// This is a lightweight DOM fix so pages that still render names with
// the trailing " Program" will have it stripped without changing backend code.
function removeProgramSuffixFromElements() {
    try {
        const selectors = [
            '.course-name',
            '.course-title',
            '.list-course',
            '.course-col',
            '.department-name',
            '.name-col',
            // table cells in common pages (settings, reports, faculty, student)
            '.settings-page table td',
            '.reports-page table td',
            '.faculty-page table td',
            '.student-report table td',
            '.faculty-report table td',
            // specific settings table first column
            '.settings-table tbody tr td:first-child'
        ];
        selectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(node => {
                try {
                    // Only replace text nodes and simple innerText to avoid breaking markup
                    const txt = node.innerText || node.textContent || '';
                    const replaced = txt.replace(/\s*Program$/i, '');
                    if (replaced !== txt) {
                        // preserve simple markup: if node has children, try to update only text nodes
                        if (node.children && node.children.length) {
                            // fallback: set innerText (simpler, avoids breaking markup)
                            node.innerText = replaced;
                        } else {
                            node.textContent = replaced;
                        }
                    }
                } catch (e) {}
            });
        });
    } catch (e) {}
}

export function applyTheme(theme) {
    setDocumentThemeAttribute(theme);
}

export function saveTheme(theme) {
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
}

export function getStoredTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
}

export function initTheme() {
    const stored = getStoredTheme();
    const theme = stored || 'light';
    applyTheme(theme);
    // run DOM cleanup for course names immediately
    try { removeProgramSuffixFromElements(); } catch (e) {}
    return theme;
}

export function toggleTheme() {
    const current = getStoredTheme() || (typeof document !== 'undefined' && (document.documentElement || document.body).classList.contains(DARK_CLASS) ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    saveTheme(next);
    // ensure any course names are normalized after content changes
    try { removeProgramSuffixFromElements(); } catch (e) {}
    return next;
}

export default {
    initTheme,
    toggleTheme,
    applyTheme,
    getStoredTheme
};
