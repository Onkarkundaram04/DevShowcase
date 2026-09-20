const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const user_model = require('../models/user_model');
const {
    send_validation_error,
    send_conflict,
    send_unauthorized,
    send_success,
    send_created
} = require('../utils/api_response');

async function register_user(req, res, next) {

    try {

        const { name, email, password } = req.body;

        if (typeof name !== 'string' || name.trim() === '') {

            return send_validation_error(
                res,
                {
                    errors: [
                        {
                            field: 'name',
                            message: 'Name is required'
                        }
                    ]
                }
            );
        }

        if (typeof email !== 'string' || email.trim() === '') {

            return send_validation_error(
                res,
                {
                    errors: [
                        {
                            field: 'email',
                            message: 'Email is required'
                        }
                    ]
                }
            );

        }

        const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email_pattern.test(email.trim())) {

            return send_validation_error(
                res,
                {
                    errors: [
                        {
                            field: 'email',
                            message: 'Please provide a valid email'
                        }
                    ]
                }
            );
        }

        if (typeof password !== 'string') {
            return send_validation_error(
                res,
                {
                    errors: [
                        {
                            field: 'password',
                            message: 'Password is required and must be a string'
                        }
                    ]
                }
            );
        }

        if (password.length > 72) {
            return send_validation_error(
                res,
                {
                    errors: [
                        {
                            field: 'password',
                            message: 'Password cannot be longer than 72 characters'
                        }
                    ]
                }
            );
        }

        const password_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/;

        if (!password_regex.test(password)) {
            return send_validation_error(
                res,
                {
                    errors: [
                        {
                            field: 'password',
                            message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
                        }
                    ]
                }
            );
        }

        const normalized_email = email.trim().toLowerCase();

        const existing_user = await user_model.findOne(
            {
                email: normalized_email
            }
        );

        if (existing_user) {
            return send_conflict(
                res,
                {
                    errors: [
                        {
                            field: 'email',
                            message: 'Email is already registered'
                        }
                    ]
                }
            );
        }

        const hashed_password = await bcrypt.hash(password, 10);

        const new_user = await user_model.create(
            {
                name: name.trim(),
                email: normalized_email,
                password: hashed_password
            }
        );

        const token = jwt.sign(
            {
                user_id: new_user._id,
                role: new_user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );

        return send_created(
            res,
            {
                message: 'User registered successfully',
                data: {
                    token: token,
                    user: {
                        id: new_user._id,
                        name: new_user.name,
                        email: new_user.email,
                        role: new_user.role
                    }
                }
            }
        );
    }
    catch (error) {

        error.operation = 'Register user';

        return next(error);

    }
}

async function login_user(req, res, next) {
    try {

        const { email, password } = req.body;

        if (typeof email !== 'string' || email.trim() === '') {

            return send_validation_error(
                res,
                {
                    errors: [
                        {
                            field: 'email',
                            message: 'Email is required'
                        }
                    ]
                }
            );
        }


        if (typeof password !== 'string' || password === '') {

            return send_validation_error(
                res,
                {
                    errors: [
                        {
                            field: 'password',
                            message: 'Password is required'
                        }
                    ]
                }
            );
        }

        const normalized_email = email.trim().toLowerCase();

        const user = await user_model.findOne({
            email: normalized_email
        }).select('+password');

        if (!user) {

            return send_unauthorized(
                res,
                {
                    errors: [
                        {
                            field: 'credentials',
                            message: 'Invalid email or password'
                        }
                    ]
                }
            );
        }

        const is_password_valid = await bcrypt.compare(
            password,
            user.password
        );

        if (!is_password_valid) {

            return send_unauthorized(
                res,
                {
                    errors: [
                        {
                            field: 'credentials',
                            message: 'Invalid email or password'
                        }
                    ]
                }
            );
        }

        const token = jwt.sign(
            {
                user_id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );


        return send_success(
            res,
            {
                message: 'Login Successful',
                data: {
                    token: token,
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                }
            }
        );

    }
    catch (error) {

        error.operation = 'Login user';

        return next(error);
    }
}

module.exports = {
    register_user,
    login_user
};