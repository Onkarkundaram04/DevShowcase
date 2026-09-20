const user_model = require('../models/user_model');
const post_model = require('../models/post_model');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const {
    send_validation_error,
    send_forbidden,
    send_not_found,
    send_conflict,
    send_success
} = require('../utils/api_response');

async function delete_my_account(req, res, next) {

    try {

        const user_id = req.user.user_id;

        if (!mongoose.isValidObjectId(user_id)) {

            return send_validation_error(
                res,
                {
                    errors: [
                        {
                            field: 'user_id',
                            message: 'Invalid user ID'
                        }
                    ]
                }
            );
        }

        if (req.user.role === 'admin') {

            return send_forbidden(
                res,
                {
                    errors: [
                        {
                            field: 'role',
                            message: 'You cannot delete admin account from here'
                        }
                    ]
                }
            );
        }

        const existing_user = await user_model.findById(user_id);

        if (!existing_user) {
            return send_not_found(
                res,
                {
                    errors: [
                        {
                            field: 'user_id',
                            message: 'User not found'
                        }
                    ]
                }
            );
        }

        const deleted_posts = await post_model.deleteMany(
            {
                author: user_id
            }
        );


        const total_posts_deleted = deleted_posts.deletedCount;


        const deleted_user = await user_model.findOneAndDelete(
            {
                _id: user_id,
                role: 'user'
            }
        );

        if (!deleted_user) {

            return send_not_found(
                res,
                {
                    errors: [
                        {
                            field: 'user_id',
                            message: 'User not found'
                        }
                    ]
                }
            );
        }

        return send_success(
            res,
            {
                message: 'User deleted successfully',
                data: {
                    count: total_posts_deleted
                }
            }
        );

    }
    catch (error) {

        error.operation = 'Delete my account';

        return next(error);
    }
}

async function get_my_profile(req, res, next) {
    try {

        const user_id = req.user.user_id;

        if (!mongoose.isValidObjectId(user_id)) {

            return send_validation_error(
                res,
                {
                    errors: [
                        {
                            field: 'user_id',
                            message: 'Invalid user ID'
                        }
                    ]
                }
            );
        }

        const user_data = await user_model.findById(user_id);

        if (!user_data) {

            return send_not_found(
                res,
                {
                    errors: [
                        {
                            field: 'user_id',
                            message: 'User not found'
                        }
                    ]
                }
            );
        }

        return send_success(
            res,
            {
                message: 'User profile fetched successfully',
                data: {
                    user: {
                        id: user_data._id,
                        name: user_data.name,
                        email: user_data.email,
                        role: user_data.role
                    }
                }
            }
        );

    }
    catch (error) {
        error.operation = 'Get my profile';
        return next(error);
    }
}

async function update_my_profile(req, res, next) {

    try {

        const user_id = req.user.user_id;

        if (!mongoose.isValidObjectId(user_id)) {

            return send_validation_error(
                res,
                {
                    errors: [
                        {
                            field: 'user_id',
                            message: 'Invalid user ID'
                        }
                    ]
                }
            );
        }

        const { name, email } = req.body;

        if (name === undefined && email === undefined) {

            return send_validation_error(
                res,
                {
                    errors: [
                        {
                            field: 'body',
                            message: 'At least one field (name or email) must be provided'
                        }
                    ]
                }
            );
        }

        const updates = {};

        if (name !== undefined) {

            if (typeof name !== 'string' || name.trim() === '') {
                return send_validation_error(
                    res,
                    {
                        errors: [
                            {
                                field: 'name',
                                message: 'Name must be a non-empty string'
                            }
                        ]
                    }
                );
            }

            updates.name = name.trim();
        }

        if (email !== undefined) {

            if (typeof email !== 'string' || email.trim() === '') {
                return send_validation_error(
                    res,
                    {
                        errors: [
                            {
                                field: 'email',
                                message: 'Email must be a non-empty string'
                            }
                        ]
                    }
                );
            }

            const normalized_email = email.trim().toLowerCase();

            const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!email_pattern.test(normalized_email)) {
                return send_validation_error(
                    res,
                    {
                        errors: [
                            {
                                field: 'email',
                                message: 'Email is invalid'
                            }
                        ]
                    }
                );
            }

            const existing_user = await user_model.findOne(
                {
                    email: normalized_email,
                    _id: { $ne: user_id }
                }
            );

            if (existing_user) {
                return send_conflict(
                    res,
                    {
                        errors: [
                            {
                                field: 'email',
                                message: 'Email is already registered with another account'
                            }
                        ]
                    }
                );
            }

            updates.email = normalized_email;
        }

        const updated_user = await user_model.findByIdAndUpdate(
            user_id,
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updated_user) {

            return send_not_found(
                res,
                {
                    errors: [
                        {
                            field: 'user_id',
                            message: 'User not found'
                        }
                    ]
                }
            );
        }

        return send_success(
            res,
            {
                message: 'Profile updated successfully',
                data: {
                    user: {
                        id: updated_user._id,
                        name: updated_user.name,
                        email: updated_user.email,
                        role: updated_user.role
                    }
                }
            }
        );

    }
    catch (error) {

        error.operation = 'Update my profile';

        return next(error);
    }
}

async function change_password(req, res, next) {
    try {

        const user_id = req.user.user_id;

        if (!mongoose.isValidObjectId(user_id)) {

            return send_validation_error(
                res,
                {
                    errors: [
                        {
                            field: 'user_id',
                            message: 'Invalid user ID'
                        }
                    ]
                }
            );
        }

        const { old_password, new_password } = req.body || {};

        if (typeof old_password !== 'string' || old_password.trim() === '') {
            return send_validation_error(
                res,
                {
                    errors: [
                        {
                            field: 'old_password',
                            message: 'Old password must be a non-empty string'
                        }
                    ]
                }
            );
        }

        if (typeof new_password !== 'string' || new_password.trim() === '') {
            return send_validation_error(
                res,
                {
                    errors: [
                        {
                            field: 'new_password',
                            message: 'New password must be a non-empty string'
                        }
                    ]
                }
            );
        }

        if (new_password.length > 72) {

            return send_validation_error(
                res,
                {
                    errors: [
                        {
                            field: 'new_password',
                            message: 'New password cannot be longer than 72 characters'
                        }
                    ]
                }
            );
        }

        if (old_password === new_password) {
            return send_validation_error(
                res,
                {
                    errors: [
                        {
                            field: 'new_password',
                            message: 'New password cannot be the same as old password'
                        }
                    ]
                }
            );
        }

        const password_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/;


        if (!password_regex.test(new_password)) {
            return send_validation_error(
                res,
                {
                    errors: [
                        {
                            field: 'new_password',
                            message: 'New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
                        }
                    ]
                }
            );
        }

        const user = await user_model.findById(user_id).select('+password');

        if (!user) {

            return send_not_found(
                res,
                {
                    errors: [
                        {
                            field: 'user_id',
                            message: 'User not found'
                        }
                    ]
                }
            );
        }

        const password_match = await bcrypt.compare(old_password, user.password);

        if (!password_match) {

            return send_validation_error(
                res,
                {
                    errors: [
                        {
                            field: 'old_password',
                            message: 'Invalid password'
                        }
                    ]
                }
            );
        }

        const hashed_password = await bcrypt.hash(new_password, 10);

        user.password = hashed_password;

        await user.save();

        return send_success(
            res,
            {
                message: 'Password changed successfully'
            }
        );

    }
    catch (error) {

        error.operation = 'Change password';

        return next(error);
    }
}

async function logout(req, res, next) {

    try {

        return send_success(
            res,
            {
                message: 'Logged out successfully'
            }
        );

    }
    catch (error) {

        error.operation = 'Logout user';

        return next(error);
    }
}

module.exports = {
    delete_my_account,
    get_my_profile,
    update_my_profile,
    change_password,
    logout
};