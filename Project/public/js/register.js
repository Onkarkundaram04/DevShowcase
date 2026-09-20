const register_form = document.getElementById('register-form');

async function handle_register(event) {

    event.preventDefault();

    const name_input = document.getElementById('register-name');
    const email_input = document.getElementById('register-email');
    const password_input = document.getElementById('register-password');
    const submit_btn = register_form ? register_form.querySelector('button[type="submit"]') : null;

    if (!name_input || !email_input || !password_input) {
        return;
    }

    const name_value = name_input.value.trim();
    const email_value = email_input.value.trim().toLowerCase();
    const password_value = password_input.value;

    if (!name_value || !email_value || !password_value) {
        show_toast('Please fill in all required fields', 'error');
        return;
    }

    if (password_value.length > 72) {
        show_toast('Password cannot be longer than 72 characters', 'error');
        return;
    }

    const password_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/;
    if (!password_regex.test(password_value)) {
        show_toast('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character', 'error');
        return;
    }

    if (submit_btn) {
        submit_btn.disabled = true;
        submit_btn.textContent = 'Creating Developer Account...';
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                name: name_value,
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
                show_toast('Account created successfully! Welcome to DevShowcase.', 'success');
                setTimeout(function () {
                    window.location.replace('explore.html');
                }, 600);
            }
            else {
                show_toast('Account created successfully! Please sign in.', 'success');
                setTimeout(function () {
                    window.location.replace('login.html');
                }, 600);
            }

        }
        else {

            let error_message = data.message;

            if (data.errors && data.errors.length > 0) {
                error_message = data.errors[0].message;
            }

            show_toast(error_message || 'Registration failed', 'error');

            if (submit_btn) {
                submit_btn.disabled = false;
                submit_btn.textContent = 'Create Developer Account';
            }
        }
    }
    catch (err) {
        show_toast('Network error. Unable to connect to server.', 'error');
        if (submit_btn) {
            submit_btn.disabled = false;
            submit_btn.textContent = 'Create Developer Account';
        }
    }
}

if (register_form) {
    register_form.addEventListener('submit', handle_register);
}

