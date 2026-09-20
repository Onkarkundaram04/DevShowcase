const post_id = new URLSearchParams(window.location.search).get('id');

const create_post_section = document.getElementById('create-post-section');
const create_post_form = document.getElementById('create-post-form');
const post_detail_section = document.getElementById('post-detail-section');
const post_detail_title = document.getElementById('post-detail-title');
const post_detail_date = document.getElementById('post-detail-date');
const post_detail_id = document.getElementById('post-detail-id');
const post_detail_body = document.getElementById('post-detail-body');
const post_actions = document.getElementById('post-actions');
const edit_post_btn = document.getElementById('edit-post-btn');
const delete_post_btn = document.getElementById('delete-post-btn');
const edit_post_section = document.getElementById('edit-post-section');
const edit_post_form = document.getElementById('edit-post-form');
const edit_post_title = document.getElementById('edit-post-title');
const edit_post_content = document.getElementById('edit-post-content');
const cancel_edit_btn = document.getElementById('cancel-edit-btn');

let current_post = null;

function get_post_from_response(response_data) {

    if (response_data.data && response_data.data.post) {
        return response_data.data.post;
    }

    return response_data.post_data || null;
}

function get_error_message(response_data, default_message) {

    if (response_data.errors && response_data.errors.length > 0) {
        return response_data.errors[0].message;
    }

    return response_data.message || default_message;
}

function get_post_author_id(post) {

    if (!post.author) {
        return null;
    }

    return post.author._id || post.author.id || post.author;
}

function can_manage_post(post) {

    const user = get_auth_user();

    if (!user) {
        return false;
    }

    if (user.role === 'admin') {
        return true;
    }

    const current_user_id = user.id || user._id;
    const author_id = get_post_author_id(post);

    return current_user_id && author_id && String(current_user_id) === String(author_id);
}

function get_post_action_url(action) {

    const user = get_auth_user();
    const is_admin = user && user.role === 'admin';

    if (is_admin) {
        return '/api/admin/' + action + '-post/' + encodeURIComponent(post_id);
    }

    return '/api/posts/' + action + '-post/' + encodeURIComponent(post_id);
}

function show_create_section() {

    if (create_post_section) {
        create_post_section.style.display = 'block';
    }
}

function render_post(post) {

    current_post = post;

    post_detail_title.textContent = post.title;
    document.title = post.title + ' — DevShowcase';

    if (typeof render_content_with_links === 'function') {
        render_content_with_links(post_detail_body, post.content);
    }
    else {
        post_detail_body.textContent = post.content;
    }
    post_detail_id.textContent = 'Post ID: ' + post._id;

    let date_str = '';
    if (post.createdAt) {
        const d = new Date(post.createdAt);
        date_str = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }
    const author_name = (post.author && post.author.name) ? post.author.name : null;
    post_detail_date.textContent = author_name 
        ? ('Shared by ' + author_name + (date_str ? ' • ' + date_str : '')) 
        : (date_str ? 'Shared on ' + date_str : '');

    if (can_manage_post(post)) {
        post_actions.style.display = 'flex';
        if (edit_post_btn) edit_post_btn.style.display = 'inline-flex';
        if (delete_post_btn) delete_post_btn.style.display = 'inline-flex';
    }
    else {
        post_actions.style.display = 'none';
    }
}

async function load_post() {

    try {
        const response = await fetch('/api/posts/get-single-post/' + encodeURIComponent(post_id));
        const response_data = await response.json();

        if (!response.ok) {
            throw new Error(get_error_message(response_data, 'Post not found'));
        }

        const post = get_post_from_response(response_data);

        if (!post) {
            throw new Error('Post not found');
        }

        render_post(post);

        // Check if navigated with edit intent
        const url_params = new URLSearchParams(window.location.search);
        if (url_params.get('edit') === 'true' || window.location.hash === '#edit') {
            if (can_manage_post(post)) {
                open_edit_form();
            }
        }
    }
    catch (error) {
        post_detail_title.textContent = 'Post not found';
        post_detail_body.textContent = error.message;
        post_detail_id.textContent = '';
        post_detail_date.textContent = '';
        post_actions.style.display = 'none';
    }
}

async function create_post(event) {

    event.preventDefault();

    const token = get_auth_token();
    const title_input = document.getElementById('create-post-title');
    const content_input = document.getElementById('create-post-content');
    const submit_btn = create_post_form ? create_post_form.querySelector('button[type="submit"]') : null;

    const title = title_input ? title_input.value.trim() : '';
    const content = content_input ? content_input.value.trim() : '';

    if (!token) {
        show_toast('Please log in before creating a post', 'error');
        return;
    }

    if (!title || !content) {
        show_toast('Title and content are required', 'error');
        return;
    }

    if (submit_btn) {
        submit_btn.disabled = true;
        submit_btn.textContent = 'Publishing Showcase...';
    }

    try {
        const response = await fetch('/api/posts/create-post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                title: title,
                content: content
            })
        });

        const response_data = await response.json();

        if (!response.ok) {
            show_toast(get_error_message(response_data, 'Failed to create post'), 'error');
            if (submit_btn) {
                submit_btn.disabled = false;
                submit_btn.textContent = 'Publish Showcase';
            }
            return;
        }

        const created_post = get_post_from_response(response_data);

        show_toast('Post created successfully', 'success');

        if (created_post && created_post._id) {
            window.location.replace('post.html?id=' + encodeURIComponent(created_post._id));
        }
        else {
            window.location.replace('explore.html');
        }
    }
    catch (error) {
        show_toast('Could not create post. Please try again.', 'error');
        if (submit_btn) {
            submit_btn.disabled = false;
            submit_btn.textContent = 'Publish Showcase';
        }
    }
}

function open_edit_form() {

    if (!current_post) {
        return;
    }

    if (edit_post_title) edit_post_title.value = current_post.title;
    if (edit_post_content) edit_post_content.value = current_post.content;
    if (edit_post_section) {
        edit_post_section.style.display = 'block';
        edit_post_section.scrollIntoView({ behavior: 'smooth' });
    }
}

function close_edit_form() {
    if (edit_post_section) {
        edit_post_section.style.display = 'none';
    }
}

async function update_post(event) {

    event.preventDefault();

    const token = get_auth_token();
    const title = edit_post_title ? edit_post_title.value.trim() : '';
    const content = edit_post_content ? edit_post_content.value.trim() : '';
    const submit_btn = edit_post_form ? edit_post_form.querySelector('button[type="submit"]') : null;

    if (!token) {
        show_toast('Please log in before editing a post', 'error');
        return;
    }

    if (!title || !content) {
        show_toast('Title and content are required', 'error');
        return;
    }

    if (submit_btn) {
        submit_btn.disabled = true;
        submit_btn.textContent = 'Saving Changes...';
    }

    try {
        const response = await fetch(get_post_action_url('update'), {
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

        const response_data = await response.json();

        if (!response.ok) {
            show_toast(get_error_message(response_data, 'Failed to update post'), 'error');
            if (submit_btn) {
                submit_btn.disabled = false;
                submit_btn.textContent = 'Save Changes';
            }
            return;
        }

        const updated_post = get_post_from_response(response_data);

        if (updated_post) {
            if (current_post && current_post.author && (!updated_post.author || typeof updated_post.author === 'string')) {
                updated_post.author = current_post.author;
            }
            render_post(updated_post);
        }

        close_edit_form();
        show_toast('Post updated successfully', 'success');

        if (submit_btn) {
            submit_btn.disabled = false;
            submit_btn.textContent = 'Save Changes';
        }
    }
    catch (error) {
        show_toast('Could not update post. Please try again.', 'error');
        if (submit_btn) {
            submit_btn.disabled = false;
            submit_btn.textContent = 'Save Changes';
        }
    }
}

async function delete_post() {

    if (!confirm('Are you sure you want to delete this project showcase?')) {
        return;
    }

    const token = get_auth_token();

    if (!token) {
        show_toast('Please log in before deleting a post', 'error');
        return;
    }

    if (delete_post_btn) {
        delete_post_btn.disabled = true;
        delete_post_btn.textContent = 'Deleting...';
    }

    try {
        const response = await fetch(get_post_action_url('delete'), {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        const response_data = await response.json();

        if (!response.ok) {
            show_toast(get_error_message(response_data, 'Failed to delete post'), 'error');
            if (delete_post_btn) {
                delete_post_btn.disabled = false;
                delete_post_btn.textContent = 'Delete Showcase';
            }
            return;
        }

        show_toast('Post deleted successfully', 'success');

        setTimeout(function () {
            window.location.replace('explore.html');
        }, 500);
    }
    catch (error) {
        show_toast('Could not delete post. Please try again.', 'error');
        if (delete_post_btn) {
            delete_post_btn.disabled = false;
            delete_post_btn.textContent = 'Delete Showcase';
        }
    }
}

if (post_id) {
    if (post_detail_section) post_detail_section.style.display = 'block';
    load_post();
}
else {
    show_create_section();
}

if (create_post_form) {
    create_post_form.addEventListener('submit', create_post);
}

if (edit_post_btn) {
    edit_post_btn.addEventListener('click', open_edit_form);
}

if (delete_post_btn) {
    delete_post_btn.addEventListener('click', delete_post);
}

if (cancel_edit_btn) {
    cancel_edit_btn.addEventListener('click', close_edit_form);
}

if (edit_post_form) {
    edit_post_form.addEventListener('submit', update_post);
}

