// Get all posts
const mongoose = require('mongoose');
const post_model = require("../models/post_model");
const {
    send_validation_error,
    send_not_found,
    send_success,
    send_created
} = require('../utils/api_response');

async function get_all_posts(req, res, next) {

    try {

        const all_posts_data = await post_model
            .find()
            .sort({ createdAt: -1 })
            .populate('author', 'name');

        return send_success(
            res,
            {
                message: "Successfully fetched all the Posts",
                data: {
                    posts: all_posts_data
                }
            }
        );
    }
    catch (error) {

        error.operation = 'Get all posts';

        return next(error);
    }
}

// Get Single Post Data
async function get_single_post(req, res, next) {

    try {

        const post_id = req.params.id;

        if (!mongoose.isValidObjectId(post_id)) {
            return send_validation_error(
                res,
                {
                    errors: [
                        {
                            field: 'post_id',
                            message: 'Please provide a valid Post ID'
                        }
                    ]
                }
            );
        }

        const post_data = await post_model
            .findById(post_id)
            .populate('author', 'name');

        if (!post_data) {

            return send_not_found(
                res,
                {
                    errors: [
                        {
                            field: 'post_id',
                            message: 'No post found with the provided ID'
                        }
                    ]
                }
            );
        }

        return send_success(
            res,
            {
                message: "Successfully fetched the single post data",
                data: {
                    post: post_data
                }
            }
        );
    }
    catch (error) {

        error.operation = 'Get single post';

        return next(error);
    }
}

// Get my posts - returns the user created posts

async function get_my_posts(req, res, next) {

    try {

        const user_id = req.user.user_id;

        const my_posts = await post_model
            .find({ author: user_id })
            .sort({ createdAt: -1 })
            .populate('author', 'name');

        return send_success(
            res,
            {
                message: "Successfully fetched your posts",
                data: {
                    posts: my_posts
                }
            }
        );
    }
    catch (error) {

        error.operation = 'Get my posts';

        return next(error);
    }
}
// Create Post

async function create_post(req, res, next) {

    try {

        const { title, content } = req.body;

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
        else if (typeof content !== 'string' || content.trim() === '') {

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

        const new_post = await post_model.create(
            {
                title: title.trim(),
                content: content.trim(),
                author: req.user.user_id
            }
        );

        return send_created(
            res,
            {
                message: "Successfully created the new post",
                data: {
                    post: new_post
                }
            }
        );
    }
    catch (error) {

        error.operation = 'Create post';

        return next(error);
    }
}

// Update post

async function update_post(req, res, next) {

    try {

        const post_id = req.params.id;

        if (!mongoose.isValidObjectId(post_id)) {
            return send_validation_error(
                res,
                {
                    errors: [
                        {
                            field: 'post_id',
                            message: 'Invalid Post ID'
                        }
                    ]
                }
            );
        }

        const { title, content } = req.body;

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

        const updated_post = await post_model.findOneAndUpdate(
            {
                _id: post_id,
                author: req.user.user_id
            },
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
                            message: 'No post found with this ID or you are not authorized to edit it'
                        }
                    ]
                }
            );
        }

        return send_success(
            res,
            {
                message: "Post successfully updated",
                data: {
                    post: updated_post
                }
            }
        );

    }
    catch (error) {

        error.operation = 'Update post';

        return next(error);
    }
}

// Delete post

async function delete_post(req, res, next) {

    try {

        const post_id = req.params.id;

        if (!mongoose.isValidObjectId(post_id)) {
            return send_validation_error(
                res,
                {
                    errors: [
                        {
                            field: 'post_id',
                            message: 'Invalid Post ID'
                        }
                    ]
                }
            );
        }

        const delete_post = await post_model.findOneAndDelete(
            {
                _id: post_id,
                author: req.user.user_id
            }
        );

        if (!delete_post) {
            return send_not_found(
                res,
                {
                    errors: [
                        {
                            field: 'post_id',
                            message: 'No post found with this ID or you are not authorized to delete it'
                        }
                    ]
                }
            );
        }

        return send_success(
            res,
            {
                message: "Post successfully deleted"
            }
        );
    }
    catch (error) {

        error.operation = 'Delete post';

        return next(error);
    }
}

module.exports = {
    get_all_posts,
    get_single_post,
    get_my_posts,
    create_post,
    update_post,
    delete_post
};