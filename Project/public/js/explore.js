const post_container = document.getElementById('post-container');

function get_posts(response_data) {

    if (response_data.data && Array.isArray(response_data.data.posts)) {
        return response_data.data.posts;
    }

    if (Array.isArray(response_data.post_data)) {
        return response_data.post_data;
    }

    return [];
}

function get_author_name(post) {

    if (post.author && post.author.name) {
        return post.author.name;
    }

    return 'Developer';
}

function build_post_card(post) {

    const card = document.createElement('article');
    card.className = 'card post-card';

    // Header section
    const header = document.createElement('div');
    header.className = 'post-header';

    // Title
    const title_link = document.createElement('a');
    title_link.className = 'post-title';
    title_link.href = 'post.html?id=' + encodeURIComponent(post._id);
    title_link.textContent = post.title;

    // Meta details (author, date)
    const meta = document.createElement('div');
    meta.className = 'post-meta';
    
    let date_str = '';
    if (post.createdAt) {
        const date = new Date(post.createdAt);
        date_str = ' • ' + date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }
    meta.textContent = 'Shared by ' + get_author_name(post) + date_str;

    // Body content with auto-link detection
    const content = document.createElement('div');
    content.className = 'post-body';
    if (typeof render_content_with_links === 'function') {
        render_content_with_links(content, post.content);
    }
    else {
        content.textContent = post.content;
    }

    header.appendChild(title_link);
    header.appendChild(meta);
    card.appendChild(header);
    card.appendChild(content);

    const actions = document.createElement('div');
    actions.className = 'card-actions';
    const view_link = document.createElement('a');
    view_link.className = 'btn btn-secondary';
    view_link.style.fontSize = '0.84rem';
    view_link.style.padding = '5px 12px';
    view_link.href = 'post.html?id=' + encodeURIComponent(post._id);
    view_link.textContent = 'View Showcase →';
    actions.appendChild(view_link);
    card.appendChild(actions);

    return card;
}

async function fetch_all_posts() {

    if (!post_container) {
        return;
    }

    try {
        const response = await fetch('/api/posts/get-all-posts');
        const response_data = await response.json();

        if (!response.ok) {
            let err_msg = response_data.message;
            if (response_data.errors && response_data.errors.length > 0) {
                err_msg = response_data.errors[0].message;
            }
            throw new Error(err_msg || 'Failed to load projects');
        }

        const posts = get_posts(response_data);
        post_container.textContent = '';

        if (posts.length === 0) {
            const empty_card = document.createElement('div');
            empty_card.className = 'card';
            empty_card.style.textAlign = 'center';
            empty_card.style.padding = '40px 20px';
            empty_card.innerHTML = `
                <h3 style="margin-bottom: 8px; color: var(--text-main);">No projects showcased yet</h3>
                <p style="color: var(--text-muted); margin-bottom: 20px;">Be the first developer to share your GitHub, Hugging Face, or live build with the community.</p>
                <a href="post.html" class="btn btn-primary">+ Share Your Project</a>
            `;
            post_container.appendChild(empty_card);
            return;
        }

        for (const post of posts) {
            post_container.appendChild(build_post_card(post));
        }
    }
    catch (error) {
        post_container.textContent = '';

        const error_message = document.createElement('p');
        error_message.className = 'card';
        error_message.style.color = 'var(--accent-rose)';
        error_message.textContent = error.message || 'Could not load projects. Please try refreshing.';
        post_container.appendChild(error_message);
    }
}

fetch_all_posts();

