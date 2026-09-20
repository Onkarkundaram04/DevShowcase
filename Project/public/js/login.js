const login_form = document.getElementById('login-form');

async function handle_login(event) {

    event.preventDefault();

    const email_input = document.getElementById('login-email');
    const password_input = document.getElementById('login-password');
    const submit_btn = login_form ? login_form.querySelector('button[type="submit"]') : null;

    if (!email_input || !password_input) {
        return;
    }

    const email_value = email_input.value.trim().toLowerCase();
    const password_value = password_input.value;

    if (!email_value || !password_value) {
        show_toast('Please enter both email and password', 'error');
        return;
    }

    if (submit_btn) {
        submit_btn.disabled = true;
        submit_btn.textContent = 'Signing in...';
    }

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                email: email_value,
                password: password_value
            })
        });

        const data = await response.json();

        if (response.ok) {

            const token = data.data && data.data.token;
            const user = data.data && data.data.user;

            if (token && user) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                show_toast('Signed in successfully! Redirecting...', 'success');

                setTimeout(function () {
                    window.location.replace('explore.html');
                }, 500);
            }
            else {
                show_toast('Login succeeded but auth token was missing', 'error');
                if (submit_btn) {
                    submit_btn.disabled = false;
                    submit_btn.textContent = 'Sign In';
                }
            }

        }
        else {

            let error_message = data.message;

            if (data.errors && data.errors.length > 0) {
                error_message = data.errors[0].message;
            }

            show_toast(error_message || 'Login failed', 'error');

            if (submit_btn) {
                submit_btn.disabled = false;
                submit_btn.textContent = 'Sign In';
            }
        }
    }
    catch (err) {
        show_toast('Network error. Unable to connect to server.', 'error');
        if (submit_btn) {
            submit_btn.disabled = false;
            submit_btn.textContent = 'Sign In';
        }
    }
}

if (login_form) {
    login_form.addEventListener('submit', handle_login);
}

