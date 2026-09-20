// My Showcased Projects Controller
const my_posts_container = document.getElementById('my-posts-container');

function get_token() {
    return typeof get_auth_token === 'function' ? get_auth_token() : localStorage.getItem('token');
}

// 1. Fetch and display logged-in user's own repository posts
async function fetch_my_posts() {

    if (!my_posts_container) {
        return;
    }

    const token = get_token();

    if (!token) {
        window.location.replace('login.html');
        return;
    }

    try {
        const response = await fetch('/api/posts/get-my-posts', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        const data = await response.json();

        my_posts_container.textContent = '';

        if (!response.ok) {
            my_posts_container.innerHTML = '<p class="text-secondary">Unable to load your project showcases.</p>';
            return;
        }

        const posts = (data.data && data.data.posts) ? data.data.posts : [];

        if (posts.length === 0) {
            my_posts_container.innerHTML = `
                <div class="card" style="text-align: center; padding: 36px 20px; color: var(--text-muted);">
                    <p style="margin-bottom: 12px; font-size: 0.95rem;">You have not shared any projects yet.</p>
                    <a href="post.html" class="btn btn-primary" style="font-size: 0.85rem; padding: 6px 16px;">+ Share Your First Build</a>
                </div>
            `;
            return;
        }

        for (let post of posts) {
            const card = document.createElement('div');
            card.className = 'card post-card';

            const header = document.createElement('div');
            header.className = 'post-header';

            const title = document.createElement('a');
            title.className = 'post-title';
            title.href = 'post.html?id=' + encodeURIComponent(post._id);
            title.textContent = post.title;

            const meta = document.createElement('div');
            meta.className = 'post-meta';

            let date_str = '';
            if (post.createdAt) {
                const d = new Date(post.createdAt);
                date_str = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
            }
            meta.textContent = date_str ? ('Created on ' + date_str) : '';

            header.appendChild(title);
            header.appendChild(meta);

            const content = document.createElement('div');
            content.className = 'post-body';
            if (typeof render_content_with_links === 'function') {
                render_content_with_links(content, post.content);
            }
            else {
                content.textContent = post.content;
            }

            const actions = document.createElement('div');
            actions.className = 'card-actions post-actions';

            const edit_btn = document.createElement('a');
            edit_btn.className = 'btn btn-secondary';
            edit_btn.style.fontSize = '0.85rem';
            edit_btn.style.padding = '6px 14px';
            edit_btn.href = 'post.html?id=' + encodeURIComponent(post._id) + '&edit=true';
            edit_btn.textContent = 'Edit Showcase';

            const delete_btn = document.createElement('button');
            delete_btn.type = 'button';
            delete_btn.className = 'btn btn-danger delete-btn';
            delete_btn.style.fontSize = '0.85rem';
            delete_btn.style.padding = '6px 14px';
            delete_btn.textContent = 'Delete';
            delete_btn.dataset.id = post._id;

            actions.appendChild(edit_btn);
            actions.appendChild(delete_btn);

            card.appendChild(header);
            card.appendChild(content);
            card.appendChild(actions);

            my_posts_container.appendChild(card);
        }
    }
    catch (error) {
        my_posts_container.innerHTML = '<p class="text-secondary">Error loading your posts.</p>';
    }
}

// 2. Listen for Delete on My Posts
if (my_posts_container) {
    my_posts_container.addEventListener('click', function (event) {
        const id = event.target.dataset.id;
        if (!id) return;

        if (event.target.classList.contains('delete-btn')) {
            delete_my_post(id);
        }
    });
}

// 3. Delete user's own post
async function delete_my_post(id) {

    const user_confirmed = confirm('Are you sure you want to delete this project showcase?');

    if (user_confirmed === false) {
        return;
    }

    const token = get_token();

    try {
        const response = await fetch('/api/posts/delete-post/' + encodeURIComponent(id), {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        const data = await response.json();

        if (response.ok) {
            show_toast('Project deleted successfully', 'success');
            fetch_my_posts();
        }
        else {
            let error_message = data.message;
            if (data.errors && data.errors.length > 0) {
                error_message = data.errors[0].message;
            }
            show_toast(error_message || 'Failed to delete post', 'error');
        }
    }
    catch (err) {
        show_toast('Network error while deleting post', 'error');
    }
}

// Initial load
fetch_my_posts();
