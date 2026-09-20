// Central Application State & UI Manager for DevShowcase

// 1. Toast Notification System
function show_toast(message, type) {

    let container = document.getElementById('toast-container');

    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');

    if (type === 'success') {
        toast.className = 'toast toast-success';
    }
    else if (type === 'error') {
        toast.className = 'toast toast-error';
    }
    else {
        toast.className = 'toast toast-info';
    }

    toast.textContent = message;

    // Remove toast when clicked
    toast.addEventListener('click', function () {
        toast.remove();
    });

    container.appendChild(toast);

    // Automatically remove after 3.5 seconds
    setTimeout(function () {
        toast.remove();
    }, 3500);
}

// 2. Auth State Helpers (with strict corruption sanitization)
function get_auth_token() {
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
        return null;
    }
    return token;
}

function get_auth_user() {
    const raw = localStorage.getItem('user');

    if (!raw || raw === 'undefined' || raw === 'null') {
        return null;
    }

    try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') {
            return null;
        }
        return parsed;
    }
    catch (error) {
        return null;
    }
}

async function logout_user() {

    const token = get_auth_token();

    if (token) {
        try {
            await fetch('/api/user/logout', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
        }
        catch (error) {
            // Removing the local token still logs the user out of this browser.
        }
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    show_toast('Logged out successfully', 'info');

    setTimeout(function () {
        window.location.replace('login.html');
    }, 400);
}

// Helper: Render text with clickable glowing URLs (XSS-safe and strips trailing punctuation)
function render_content_with_links(container, text) {

    container.textContent = '';

    if (!text) {
        return;
    }

    const url_split_regex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(url_split_regex);

    for (const part of parts) {
        if (/^https?:\/\/[^\s]+$/.test(part)) {
            // Separate trailing punctuation like . , ) ] from valid URL
            let clean_url = part;
            let trailing_punct = '';

            const match_punct = clean_url.match(/[.,;:!?)]+$/);
            if (match_punct) {
                trailing_punct = match_punct[0];
                clean_url = clean_url.slice(0, -trailing_punct.length);
            }

            const a = document.createElement('a');
            a.href = clean_url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.className = 'post-link';
            a.textContent = clean_url;
            container.appendChild(a);

            if (trailing_punct) {
                container.appendChild(document.createTextNode(trailing_punct));
            }
        }
        else if (part) {
            container.appendChild(document.createTextNode(part));
        }
    }
}

// Expose globally
window.get_auth_token = get_auth_token;
window.get_auth_user = get_auth_user;
window.logout_user = logout_user;
window.show_toast = show_toast;
window.render_content_with_links = render_content_with_links;

// 3. Dynamic Navbar Management
function update_navbar() {

    const nav_links = document.querySelector('.nav-links');

    if (!nav_links) {
        return;
    }

    const token = get_auth_token();
    const user = get_auth_user();
    const current_page = window.location.pathname.split('/').pop().toLowerCase() || 'index.html';

    nav_links.textContent = '';

    const nav_brand = document.querySelector('.nav-brand');
    if (nav_brand) {
        nav_brand.setAttribute('href', 'index.html');
        const admin_badge_html = (user && user.role === 'admin') 
            ? '<span class="badge badge-admin" style="margin-left: 6px;">Admin</span>' 
            : '';
        nav_brand.innerHTML = `
            <span class="brand-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
            </span>
            <span>Dev<span class="brand-gradient-text">Showcase</span></span>
            ${admin_badge_html}
        `;
    }

    // Home link
    const home_li = document.createElement('li');
    const home_a = document.createElement('a');
    home_a.href = 'index.html';
    home_a.className = 'nav-link' + (current_page === 'index.html' || current_page === '' ? ' active' : '');
    home_a.textContent = 'Home';
    home_li.appendChild(home_a);
    nav_links.appendChild(home_li);

    // Explore link
    const explore_li = document.createElement('li');
    const explore_a = document.createElement('a');
    explore_a.href = 'explore.html';
    explore_a.className = 'nav-link' + (current_page === 'explore.html' ? ' active' : '');
    explore_a.textContent = 'Explore';
    explore_li.appendChild(explore_a);
    nav_links.appendChild(explore_li);

    if (token && user) {

        // Share Project link
        const share_post_li = document.createElement('li');
        const share_post_a = document.createElement('a');
        share_post_a.href = 'post.html';
        share_post_a.className = 'nav-link' + (current_page === 'post.html' && !new URLSearchParams(window.location.search).get('id') ? ' active' : '');
        share_post_a.textContent = 'Share Project';
        share_post_li.appendChild(share_post_a);
        nav_links.appendChild(share_post_li);

        // My Projects nav link
        const my_projects_li = document.createElement('li');
        const my_projects_a = document.createElement('a');
        my_projects_a.href = 'my-projects.html';
        my_projects_a.className = 'nav-link' + (current_page === 'my-projects.html' || current_page === 'my-projects' ? ' active' : '');
        my_projects_a.textContent = 'My Projects';
        my_projects_li.appendChild(my_projects_a);
        nav_links.appendChild(my_projects_li);

        // Developer Profile nav link
        const profile_li = document.createElement('li');
        const profile_a = document.createElement('a');
        profile_a.href = 'profile.html';
        profile_a.className = 'nav-link' + (current_page === 'profile.html' || current_page === 'profile' ? ' active' : '');
        profile_a.textContent = 'Profile (' + (user.name || 'Me') + ')';
        profile_li.appendChild(profile_a);
        nav_links.appendChild(profile_li);

        // Admin link (ONLY if user.role is admin)
        if (user.role === 'admin') {
            const admin_li = document.createElement('li');
            const admin_a = document.createElement('a');
            admin_a.href = 'admin.html';
            admin_a.className = 'nav-link' + (current_page === 'admin.html' ? ' active' : '');
            admin_a.textContent = 'Admin Panel';
            admin_li.appendChild(admin_a);
            nav_links.appendChild(admin_li);
        }

        // Logout button
        const logout_li = document.createElement('li');
        const logout_btn = document.createElement('button');
        logout_btn.type = 'button';
        logout_btn.className = 'btn btn-secondary';
        logout_btn.textContent = 'Logout';
        logout_btn.addEventListener('click', logout_user);
        logout_li.appendChild(logout_btn);
        nav_links.appendChild(logout_li);

    }
    else {

        // Sign In button
        const login_li = document.createElement('li');
        const login_a = document.createElement('a');
        login_a.href = 'login.html';
        login_a.className = 'btn btn-secondary' + (current_page === 'login.html' ? ' active' : '');
        login_a.textContent = 'Sign In';
        login_li.appendChild(login_a);
        nav_links.appendChild(login_li);

        // Join / Register button
        const register_li = document.createElement('li');
        const register_a = document.createElement('a');
        register_a.href = 'register.html';
        register_a.className = 'btn btn-primary' + (current_page === 'register.html' ? ' active' : '');
        register_a.textContent = 'Join DevShowcase';
        register_li.appendChild(register_a);
        nav_links.appendChild(register_li);
    }
}

// 4. Client-side Route Protection
function check_route_guards() {

    const current_page = window.location.pathname.split('/').pop().toLowerCase() || 'index.html';
    const token = get_auth_token();
    const user = get_auth_user();

    // Clean up corrupted storage if any
    if (!token && localStorage.getItem('token')) {
        localStorage.removeItem('token');
    }
    if (!user && localStorage.getItem('user')) {
        localStorage.removeItem('user');
    }

    // Guard Admin page
    if (current_page === 'admin.html' || current_page === 'admin') {

        if (!token) {
            window.location.replace('login.html');
            return true;
        }

        if (!user || user.role !== 'admin') {
            window.location.replace('index.html');
            return true;
        }
    }

    // Guard Profile and Projects page
    if (current_page === 'profile.html' || current_page === 'profile' || current_page === 'my-projects.html' || current_page === 'my-projects') {

        if (!token) {
            window.location.replace('login.html');
            return true;
        }
    }

    // Guard Post creation (visiting post.html without an ID while logged out)
    if (current_page === 'post.html' || current_page === 'post') {
        const post_id = new URLSearchParams(window.location.search).get('id');
        if (!post_id && !token) {
            window.location.replace('login.html');
            return true;
        }
    }

    // Redirect already logged in users away from login/register pages
    if (current_page === 'login.html' || current_page === 'register.html') {

        if (token && user) {
            window.location.replace('index.html');
            return true;
        }
    }

    return false;
}

// Run route guards immediately on script evaluation to prevent unauthorized requests
check_route_guards();

// Setup navbar once DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        update_navbar();
    });
}
else {
    update_navbar();
}

// 5. Global Password Visibility Toggle
document.addEventListener('click', function (event) {

    const toggle_btn = event.target.closest('.toggle-password-btn');

    if (!toggle_btn) {
        return;
    }

    event.preventDefault();

    const target_id = toggle_btn.dataset.target;
    const input = document.getElementById(target_id);

    if (!input) {
        return;
    }

    const is_password = input.type === 'password';
    input.type = is_password ? 'text' : 'password';

    if (is_password) {
        toggle_btn.setAttribute('aria-label', 'Hide password');
        toggle_btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
    }
    else {
        toggle_btn.setAttribute('aria-label', 'Show password');
        toggle_btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
    }
});

