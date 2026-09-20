const admin_delete_post_form = document.getElementById('admin-delete-post-form');
const admin_post_id_input = document.getElementById('admin-post-id');

const admin_delete_user_form = document.getElementById('admin-delete-user-form');
const admin_user_id_input = document.getElementById('admin-user-id');

const admin_update_post_form = document.getElementById('admin-update-post-form');
const admin_update_post_id_input = document.getElementById('admin-update-post-id');
const admin_update_post_title_input = document.getElementById('admin-update-post-title');
const admin_update_post_content_input = document.getElementById('admin-update-post-content');

const admin_users_container = document.getElementById('admin-users-container');
const refresh_users_btn = document.getElementById('refresh-users-btn');

const delete_all_users_btn = document.getElementById('delete-all-users-btn');
const delete_all_posts_btn = document.getElementById('delete-all-posts-btn');

function get_token() {
    return typeof get_auth_token === 'function' ? get_auth_token() : localStorage.getItem('token');
}

function get_error_message(data, default_message) {

    if (data.errors && data.errors.length > 0) {
        return data.errors[0].message;
    }

    return data.message || default_message;
}

// 1. Fetch all users for the admin dashboard
async function fetch_all_users() {

    const token = get_token();

    if (!token) {
        window.location.replace('login.html');
        return;
    }

    try {
        const response = await fetch('/api/admin/get-all-users', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
            show_toast('Admin session expired or unauthorized. Please log in as admin.', 'error');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setTimeout(function () {
                window.location.replace('login.html');
            }, 600);
            return;
        }

        if (!response.ok) {
            throw new Error(get_error_message(data, 'Failed to load users'));
        }

        const users = data.data && data.data.users ? data.data.users : [];
        if (admin_users_container) {
            admin_users_container.textContent = '';

            if (users.length === 0) {
                admin_users_container.textContent = 'No users found.';
                return;
            }

            for (const user of users) {
                const user_card = document.createElement('div');
                user_card.className = 'user-card';

                const name = document.createElement('p');
                name.textContent = 'Name: ' + user.name;

                const email = document.createElement('p');
                email.textContent = 'Email: ' + user.email;

                const role = document.createElement('p');
                role.textContent = 'Role: ' + user.role;

                const id = document.createElement('p');
                id.className = 'user-id';
                id.textContent = 'ID: ' + user._id;

                const actions = document.createElement('div');
                actions.style.marginTop = '10px';
                actions.style.display = 'flex';
                actions.style.gap = '8px';

                const fill_btn = document.createElement('button');
                fill_btn.type = 'button';
                fill_btn.className = 'btn btn-secondary';
                fill_btn.style.fontSize = '0.76rem';
                fill_btn.style.padding = '4px 8px';
                fill_btn.textContent = 'Select ID';
                fill_btn.addEventListener('click', function () {
                    if (admin_user_id_input) {
                        admin_user_id_input.value = user._id;
                        admin_user_id_input.scrollIntoView({ behavior: 'smooth' });
                        admin_user_id_input.focus();
                        show_toast('User ID selected: ' + user._id, 'info');
                    }
                });
                actions.appendChild(fill_btn);

                if (user.role !== 'admin') {
                    const quick_del_btn = document.createElement('button');
                    quick_del_btn.type = 'button';
                    quick_del_btn.className = 'btn btn-danger';
                    quick_del_btn.style.fontSize = '0.76rem';
                    quick_del_btn.style.padding = '4px 8px';
                    quick_del_btn.textContent = 'Delete User';
                    quick_del_btn.addEventListener('click', function () {
                        if (admin_user_id_input) {
                            admin_user_id_input.value = user._id;
                        }
                        if (admin_delete_user_form) {
                            admin_delete_user_form.dispatchEvent(new Event('submit'));
                        }
                    });
                    actions.appendChild(quick_del_btn);
                }

                user_card.appendChild(name);
                user_card.appendChild(email);
                user_card.appendChild(role);
                user_card.appendChild(id);
                user_card.appendChild(actions);
                admin_users_container.appendChild(user_card);
            }
        }
    }
    catch (error) {
        if (admin_users_container) {
            admin_users_container.textContent = 'Unable to load users.';
        }
    }
}

if (refresh_users_btn) {
    refresh_users_btn.addEventListener('click', fetch_all_users);
}

// 2. Moderate/Delete single post by ID
if (admin_delete_post_form) {
    admin_delete_post_form.addEventListener('submit', async function (event) {

        event.preventDefault();

        const token = get_token();
        const post_id = admin_post_id_input ? admin_post_id_input.value.trim() : '';
        const submit_btn = admin_delete_post_form.querySelector('button[type="submit"]');

        if (!post_id) {
            show_toast('Please enter post ID', 'error');
            return;
        }

        const confirmed = confirm('Are you sure you want to delete post ' + post_id + '?');

        if (confirmed === false) {
            return;
        }

        if (submit_btn) {
            submit_btn.disabled = true;
            submit_btn.textContent = 'Deleting...';
        }

        try {
            const response = await fetch('/api/admin/delete-post/' + encodeURIComponent(post_id), {
                method: 'DELETE',

                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            const data = await response.json();

            if (response.ok) {
                show_toast('Post deleted successfully', 'success');
                if (admin_post_id_input) admin_post_id_input.value = '';
            }
            else {
                show_toast(get_error_message(data, 'Failed to delete post'), 'error');
            }
        }
        catch (err) {
            show_toast('Network error while deleting post', 'error');
        }
        finally {
            if (submit_btn) {
                submit_btn.disabled = false;
                submit_btn.textContent = 'Delete Project';
            }
        }
    });
}

// 3. Update any post by ID
if (admin_update_post_form) {
    admin_update_post_form.addEventListener('submit', async function (event) {

        event.preventDefault();

        const token = get_token();
        const post_id = admin_update_post_id_input ? admin_update_post_id_input.value.trim() : '';
        const title = admin_update_post_title_input ? admin_update_post_title_input.value.trim() : '';
        const content = admin_update_post_content_input ? admin_update_post_content_input.value.trim() : '';
        const submit_btn = admin_update_post_form.querySelector('button[type="submit"]');

        if (!post_id || !title || !content) {
            show_toast('Post ID, title, and content are required', 'error');
            return;
        }

        if (submit_btn) {
            submit_btn.disabled = true;
            submit_btn.textContent = 'Saving Changes...';
        }

        try {
            const response = await fetch('/api/admin/update-post/' + encodeURIComponent(post_id), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    title: title,
                    content: content
                })
            });

            const data = await response.json();

            if (response.ok) {
                show_toast('Post updated successfully', 'success');
                admin_update_post_form.reset();
            }
            else {
                show_toast(get_error_message(data, 'Failed to update post'), 'error');
            }
        }
        catch (err) {
            show_toast('Network error while updating post', 'error');
        }
        finally {
            if (submit_btn) {
                submit_btn.disabled = false;
                submit_btn.textContent = 'Save Changes';
            }
        }
    });
}

// 4. Delete user and their posts by User ID
if (admin_delete_user_form) {
    admin_delete_user_form.addEventListener('submit', async function (event) {

        event.preventDefault();

        const user_id = admin_user_id_input ? admin_user_id_input.value.trim() : '';
        const submit_btn = admin_delete_user_form.querySelector('button[type="submit"]');

        if (!user_id) {
            show_toast('Please enter user ID', 'error');
            return;
        }

        const confirmed = confirm('Are you sure you want to delete user ' + user_id + ' and all their posts?');

        if (confirmed === false) {
            return;
        }

        const token = get_token();

        if (submit_btn) {
            submit_btn.disabled = true;
            submit_btn.textContent = 'Deleting User...';
        }

        try {
            const response = await fetch('/api/admin/delete-user/' + encodeURIComponent(user_id), {
                method: 'DELETE',

                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            const data = await response.json();

            if (response.ok) {
                show_toast('User and associated posts deleted successfully', 'success');
                if (admin_user_id_input) admin_user_id_input.value = '';
            }
            else {
                show_toast(get_error_message(data, 'Failed to delete user'), 'error');
                return;
            }

            fetch_all_users();
        }
        catch (err) {
            show_toast('Network error while deleting user', 'error');
        }
        finally {
            if (submit_btn) {
                submit_btn.disabled = false;
                submit_btn.textContent = 'Delete User & All Showcases';
            }
        }
    });
}

// 5. Delete all non-admin users
if (delete_all_users_btn) {
    delete_all_users_btn.addEventListener('click', async function () {

        const confirmed = confirm('DANGER: Are you sure you want to delete ALL normal users and their posts?');

        if (confirmed === false) {
            return;
        }

        const token = get_token();

        delete_all_users_btn.disabled = true;
        delete_all_users_btn.textContent = 'Deleting Users...';

        try {
            const response = await fetch('/api/admin/delete-all-users', {
                method: 'DELETE',

                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            const data = await response.json();

            if (response.ok) {
                show_toast(data.message || 'All normal users deleted successfully', 'success');
                fetch_all_users();
            }
            else {
                show_toast(get_error_message(data, 'Failed to delete users'), 'error');
            }
        }
        catch (err) {
            show_toast('Network error while deleting users', 'error');
        }
        finally {
            delete_all_users_btn.disabled = false;
            delete_all_users_btn.textContent = 'Delete All Normal Users';
        }
    });
}

// 6. Delete all posts
if (delete_all_posts_btn) {
    delete_all_posts_btn.addEventListener('click', async function () {

        const confirmed = confirm('DANGER: Are you sure you want to delete ALL project showcases from the database?');

        if (confirmed === false) {
            return;
        }

        const token = get_token();

        delete_all_posts_btn.disabled = true;
        delete_all_posts_btn.textContent = 'Deleting All Posts...';

        try {
            const response = await fetch('/api/admin/delete-all-posts', {
                method: 'DELETE',

                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            const data = await response.json();

            if (response.ok) {
                show_toast(data.message || 'All posts deleted successfully', 'success');
            }
            else {
                show_toast(get_error_message(data, 'Failed to delete posts'), 'error');
            }
        }
        catch (err) {
            show_toast('Network error while deleting posts', 'error');
        }
        finally {
            delete_all_posts_btn.disabled = false;
            delete_all_posts_btn.textContent = 'Delete All Project Showcases';
        }
    });
}

fetch_all_users();

