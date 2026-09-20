const post_model = require('../models/post_model');
const user_model = require('../models/user_model');
const { send_validation_error,
    send_unauthorized,
    send_forbidden,
    send_not_found,
    send_conflict,
    send_internal_server_error,
    send_success,
    send_created } = require('../utils/api_response');

const mongoose = require('mongoose');


async function get_all_users(req, res, next) {

    try {

        const users_data = await user_model
            .find()
            .select('-__v')
            .sort({ createdAt: -1 });

        return send_success(
            res,
            {
                message: 'Successfully fetched all users',

                data: {

                    users: users_data

                }
            }
        );
    }
    catch (error) {

        error.operation = 'Get all users';

        return next(error);
    }
}
async function admin_update_post(req, res, next) {

    try {

        const post_id = req.params.id;

        const title = req.body.title;

        const content = req.body.content;

        const is_valid_id = mongoose.isValidObjectId(post_id);

        if (is_valid_id === false) {

            return send_validation_error(
                res,
                {
                    errors: [
                        {
                            field: 'post_id',
                            message: 'Invalid post ID'
                        }
                    ]
                }
            );
        }

        if (title === undefined && content === undefined) {

            return send_validation_error(
                res,
                {
                    errors: [
                        {
                            field: 'body',
                            message: 'At least one field (title or content) must be provided'
                        }
                    ]
                }
            );
        }

        const updates = {};

        if (title !== undefined) {
            if (typeof title !== 'string' || title.trim() === '') {
                return send_validation_error(
                    res,
                    {
                        errors: [
                            {
                                field: 'title',
                                message: 'Title must be a non-empty string'
                            }
                        ]
                    }
                );
            }
            updates.title = title.trim();
        }

        if (content !== undefined) {
            if (typeof content !== 'string' || content.trim() === '') {

                return send_validation_error(
                    res,
                    {
                        errors: [
                            {
                                field: 'content',
                                message: 'Content must be a non-empty string'
                            }
                        ]
                    }
                );
            }
            updates.content = content.trim();
        }

        const updated_post = await post_model.findByIdAndUpdate(
            post_id,
            updates,
            {
                new: true,
                runValidators: true
            }
        );


        if (!updated_post) {

            return send_not_found(
                res,
                {
                    errors: [
                        {
                            field: 'post_id',
                            message: 'Post not found'
                        }
                    ]
                });
        }

        return send_success(
            res,
            {
                message: 'Post updated successfully',
                data: {
                    post: updated_post
                }
            }
        );
    }
    catch (error) {

        error.operation = 'Admin update post';

        return next(error);
    }
}

async function admin_delete_post(req, res, next) {

    try {

        const post_id = req.params.id;

        if (!mongoose.isValidObjectId(post_id)) {

            return send_validation_error(
                res,
                {
                    errors: [
                        {
                            field: 'post_id',
                            message: 'Invalid post ID'
                        }
                    ]
                }
            );
        }

        const deleted_post = await post_model.findByIdAndDelete(post_id);

        if (!deleted_post) {

            return send_not_found(
                res,
                {
                    errors: [
                        {
                            field: 'post_id',
                            message: 'Post not found'
                        }
                    ]
                }
            );
        }

        return send_success(
            res,
            {
                message: 'Post deleted successfully'
            }
        );

    }
    catch (error) {

        error.operation = 'Admin delete post';

        return next(error);
    }
}

async function delete_user(req, res, next) {

    try {

        const user_id = req.params.id;

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

        if (user_id === String(req.user.user_id)) {

            return send_forbidden(
                res,
                {
                    errors: [
                        {
                            field: 'user_id',
                            message: 'You cannot delete yourself'
                        }
                    ]
                }
            );
        }

        const target_user = await user_model.findById(user_id);

        if (!target_user) {
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

        if (target_user.role === 'admin') {
            return send_forbidden(
                res,
                {
                    errors: [
                        {
                            field: 'user_id',
                            message: 'You cannot delete an admin'
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

        const total_posts_deleted_count = deleted_posts.deletedCount;

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
                    count: total_posts_deleted_count
                }
            }
        );

    }
    catch (error) {

        error.operation = 'Admin delete user';

        return next(error);
    }
}

async function delete_all_users(req, res, next) {

    try {

        const normal_user_ids = await user_model.distinct(
            '_id',
            {
                role: 'user'
            }
        );

        const deleted_post = await post_model.deleteMany(
            {
                author: {
                    $in: normal_user_ids
                }
            }
        );

        const deleted_users = await user_model.deleteMany(
            {
                role: 'user'
            }
        );

        const total_posts_deleted_count = deleted_post.deletedCount;

        const total_normal_users_deleted_count = deleted_users.deletedCount;

        return send_success(
            res,
            {
                message: 'All normal users deleted successfully',
                data: {
                    deleted_users_count: total_normal_users_deleted_count,
                    deleted_posts_count: total_posts_deleted_count
                }
            }
        );
    }
    catch (error) {

        error.operation = 'Admin delete all users';

        return next(error);
    }
}


async function delete_all_posts(req, res, next) {

    try {

        const deleted_posts = await post_model.deleteMany({});

        const count = deleted_posts.deletedCount;

        return send_success(
            res,
            {
                message: 'All posts deleted successfully',
                data: {
                    deleted_posts_count: count
                }
            }
        );

    }
    catch (error) {

        error.operation = 'Admin delete all posts';

        return next(error);
    }
}

module.exports = {
    get_all_users,
    admin_update_post,
    admin_delete_post,
    delete_user,
    delete_all_users,
    delete_all_posts
};