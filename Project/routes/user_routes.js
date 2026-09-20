const express = require('express');

const router = express.Router();

const {
    delete_my_account,
    get_my_profile,
    update_my_profile,
    change_password,
    logout
} = require('../controllers/user_controller');

const { auth_middleware } = require('../middlewares/auth_middleware');

router.delete('/delete-account', auth_middleware, delete_my_account);
router.get('/my-profile', auth_middleware, get_my_profile);
router.patch('/update-profile', auth_middleware, update_my_profile);
router.patch('/change-password', auth_middleware, change_password);
router.post('/logout', auth_middleware, logout);

module.exports = router;