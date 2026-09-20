const express = require('express');

const router = express.Router();

const {
    get_all_posts,
    get_single_post,
    get_my_posts,
    create_post,
    update_post,
    delete_post
} = require('../controllers/post_controller');

const {
    auth_middleware
} = require('../middlewares/auth_middleware');

router.get('/get-all-posts', get_all_posts);
router.get('/get-single-post/:id', get_single_post);
router.get('/get-my-posts', auth_middleware, get_my_posts);
router.post('/create-post', auth_middleware, create_post);
router.patch('/update-post/:id', auth_middleware, update_post);
router.delete('/delete-post/:id', auth_middleware, delete_post);

module.exports = router;