const display_user_name = document.getElementById('display-user-name');
const display_user_email = document.getElementById('display-user-email');
const display_user_role = document.getElementById('display-user-role');
const display_user_id = document.getElementById('display-user-id');
const user_role_badge = document.getElementById('user-role-badge');

const update_profile_form = document.getElementById('update-profile-form');
const update_name_input = document.getElementById('update-name');
const update_email_input = document.getElementById('update-email');

const change_password_form = document.getElementById('change-password-form');
const old_password_input = document.getElementById('old-password');
const new_password_input = document.getElementById('new-password');
const confirm_password_input = document.getElementById('confirm-password');

const delete_account_btn = document.getElementById('delete-account-btn');

function get_token() {
    return typeof get_auth_token === 'function' ? get_auth_token() : localStorage.getItem('token');
}

// 1. Fetch and display user profile details
async function fetch_profile() {

    const token = get_token();

    if (!token) {
        window.location.replace('login.html');
        return;
    }

    try {
        const response = await fetch('/api/user/my-profile', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        const data = await response.json();

        if (response.ok) {

            const user = data.data && data.data.user;

            if (!user) {
                return;
            }

            if (display_user_name) display_user_name.textContent = user.name;
            if (display_user_email) display_user_email.textContent = user.email;

            if (user_role_badge) {
                user_role_badge.textContent = user.role;
                user_role_badge.className = user.role === 'admin' ? 'badge badge-admin' : 'badge badge-user';
            }

            if (display_user_role) {
                display_user_role.textContent = user.role === 'admin' ? 'Administrator' : 'Developer';
            }

            if (display_user_id) {
                display_user_id.textContent = user.id || user._id || '—';
            }

            if (update_name_input) update_name_input.value = user.name;
            if (update_email_input) update_email_input.value = user.email;

        }
        else {

            if (response.status === 401 || response.status === 403) {
                show_toast('Session expired or unauthorized. Please log in again.', 'error');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setTimeout(function () {
                    window.location.replace('login.html');
                }, 500);
            }
            else {
                let err_msg = data.message;
                if (data.errors && data.errors.length > 0) {
                    err_msg = data.errors[0].message;
                }
                show_toast(err_msg || 'Failed to fetch profile', 'error');
            }

        }
    }
    catch (err) {
        show_toast('Network error while loading profile', 'error');
    }
}

// 2. Update user profile
if (update_profile_form) {
    update_profile_form.addEventListener('submit', async function (event) {

        event.preventDefault();

        const token = get_token();
        const new_name = update_name_input ? update_name_input.value.trim() : '';
        const new_email = update_email_input ? update_email_input.value.trim() : '';
        const submit_btn = update_profile_form.querySelector('button[type="submit"]');

        const updates = {};
        if (new_name) updates.name = new_name;
        if (new_email) updates.email = new_email;

        if (Object.keys(updates).length === 0) {
            show_toast('Please enter a name or email to update', 'error');
            return;
        }

        if (submit_btn) {
            submit_btn.disabled = true;
            submit_btn.textContent = 'Saving...';
        }

        try {
            const response = await fetch('/api/user/update-profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(updates)
            });

            const data = await response.json();

            if (response.ok) {

                show_toast('Profile updated successfully!', 'success');

                if (data.data && data.data.user) {
                    localStorage.setItem('user', JSON.stringify(data.data.user));
                }
                else {
                    const current_user = JSON.parse(localStorage.getItem('user') || '{}');
                    if (new_name) current_user.name = new_name;
                    if (new_email) current_user.email = new_email;
                    localStorage.setItem('user', JSON.stringify(current_user));
                }

                fetch_profile();
                if (typeof update_navbar === 'function') {
                    update_navbar();
                }

            }
            else {

                let error_message = data.message;

                if (data.errors && data.errors.length > 0) {
                    error_message = data.errors[0].message;
                }

                show_toast(error_message || 'Update failed', 'error');
            }
        }
        catch (err) {
            show_toast('Network error while updating profile', 'error');
        }
        finally {
            if (submit_btn) {
                submit_btn.disabled = false;
                submit_btn.textContent = 'Save Profile Changes';
            }
        }
    });
}

// 3. Change password
if (change_password_form) {
    change_password_form.addEventListener('submit', async function (event) {

        event.preventDefault();

        const token = get_token();
        const old_password = old_password_input ? old_password_input.value : '';
        const new_password = new_password_input ? new_password_input.value : '';
        const confirm_password = confirm_password_input ? confirm_password_input.value : '';
        const submit_btn = change_password_form.querySelector('button[type="submit"]');

        if (!old_password || !new_password) {
            show_toast('Please fill in current and new password', 'error');
            return;
        }

        if (old_password === new_password) {
            show_toast('New password cannot be the same as old password', 'error');
            return;
        }

        if (new_password !== confirm_password) {
            show_toast('New passwords do not match', 'error');
            return;
        }

        if (new_password.length > 72) {
            show_toast('New password cannot be longer than 72 characters', 'error');
            return;
        }

        const password_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/;
        if (!password_regex.test(new_password)) {
            show_toast('New password must be at least 8 characters long and contain uppercase, lowercase, number, and symbol', 'error');
            return;
        }

        if (submit_btn) {
            submit_btn.disabled = true;
            submit_btn.textContent = 'Changing Password...';
        }

        try {
            const response = await fetch('/api/user/change-password', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    old_password: old_password,
                    new_password: new_password
                })
            });

            const data = await response.json();

            if (response.ok) {
                change_password_form.reset();
                show_toast('Password changed successfully', 'success');
            }
            else {
                let error_message = data.message;

                if (data.errors && data.errors.length > 0) {
                    error_message = data.errors[0].message;
                }

                show_toast(error_message || 'Password change failed', 'error');
            }
        }
        catch (err) {
            show_toast('Network error while changing password', 'error');
        }
        finally {
            if (submit_btn) {
                submit_btn.disabled = false;
                submit_btn.textContent = 'Change Password';
            }
        }
    });
}

// 4. Delete account
if (delete_account_btn) {
    delete_account_btn.addEventListener('click', async function () {

        const user_confirmed = confirm('Are you sure you want to permanently delete your account and all your posts? This cannot be undone.');

        if (user_confirmed === false) {
            return;
        }

        const token = get_token();

        delete_account_btn.disabled = true;
        delete_account_btn.textContent = 'Deleting Account...';

        try {
            const response = await fetch('/api/user/delete-account', {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            const data = await response.json();

            if (response.ok) {

                show_toast('Account deleted successfully', 'info');

                localStorage.removeItem('token');
                localStorage.removeItem('user');

                setTimeout(function () {
                    window.location.replace('register.html');
                }, 600);

            }
            else {
                let error_message = data.message;
                if (data.errors && data.errors.length > 0) {
                    error_message = data.errors[0].message;
                }
                show_toast(error_message || 'Delete account failed', 'error');
                delete_account_btn.disabled = false;
                delete_account_btn.textContent = 'Delete My Account';
            }
        }
        catch (err) {
            show_toast('Network error while deleting account', 'error');
            delete_account_btn.disabled = false;
            delete_account_btn.textContent = 'Delete My Account';
        }
    });
}

// Initial load
fetch_profile();
