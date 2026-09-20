const mongoose = require('mongoose');


const post_schema = new mongoose.Schema(
    {
        title: {

            type: String,
            required: true,
            trim: true

        },
        content: {

            type: String,
            required: true

        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true
        }
    },
    {
        timestamps: true
    }
);

/** @type {import('mongoose').Model<any>} */
const post_model = mongoose.model('posts', post_schema);

module.exports = post_model;