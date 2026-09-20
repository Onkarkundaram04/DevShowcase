const express = require('express');

const router = express.Router();

const {
    auth_middleware,
    require_admin
} = require('../middlewares/auth_middleware');

const {
    get_all_users,
    admin_update_post,
    admin_delete_post,
    delete_user,
    delete_all_users,
    delete_all_posts
} = require('../controllers/admin_controller');

router.get('/get-all-users', auth_middleware, require_admin, get_all_users);

router.patch('/update-post/:id', auth_middleware, require_admin, admin_update_post);

router.delete('/delete-post/:id', auth_middleware, require_admin, admin_delete_post);

router.delete('/delete-user/:id', auth_middleware, require_admin, delete_user);

router.delete('/delete-all-users', auth_middleware, require_admin, delete_all_users);

router.delete('/delete-all-posts', auth_middleware, require_admin, delete_all_posts);

module.exports = router;