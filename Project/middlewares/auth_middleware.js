const jwt = require('jsonwebtoken');
const {
    send_unauthorized,
    send_forbidden
} = require('../utils/api_response');

function auth_middleware(req, res, next) {

    const authorization = req.headers.authorization;

    if (typeof authorization !== 'string' || authorization.trim() === '') {

        return send_unauthorized(
            res,
            {
                errors: [
                    {
                        field: 'authorization',
                        message: 'Authorization token not found, it is required'
                    }
                ]
            }
        );
    }

    const authorization_parts = authorization.trim().split(/\s+/);

    if (authorization_parts.length !== 2 || authorization_parts[0] !== 'Bearer' || authorization_parts[1] === '') {

        return send_unauthorized(
            res,
            {
                errors: [
                    {
                        field: 'authorization',
                        message: 'Authorization format must be Bearer token'
                    }
                ]
            }
        );
    }

    const token = authorization_parts[1];

    try {

        const decoded_token = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded_token;

        next();
    }

    catch (error) {

        return send_unauthorized(
            res,
            {
                errors: [
                    {
                        field: 'token',
                        message: 'Invalid or expired token'
                    }
                ]
            }
        );

    }
}


function require_admin(req, res, next) {

    if (!req.user || req.user.role !== 'admin') {

        return send_forbidden(
            res,
            {
                errors: [
                    {
                        field: 'role',
                        message: 'Admin access required'
                    }
                ]
            }
        );
    }

    next();
}


module.exports = {
    auth_middleware,
    require_admin
};