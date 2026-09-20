const ERROR_MESSAGES = {
    VALIDATION_ERROR: 'Validation error',
    UNAUTHORIZED: 'Authorization error',
    FORBIDDEN: 'Forbidden error',
    NOT_FOUND: 'Not found error',
    CONFLICT: 'Conflict error',
    INTERNAL_SERVER_ERROR: 'Internal server error'
};

const SUCCESS_MESSAGES = {
    SUCCESS: 'Success',
    CREATED: 'Created successfully'
};

const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
};

module.exports = {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    HTTP_STATUS
};
