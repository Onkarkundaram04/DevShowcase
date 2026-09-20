const { ERROR_MESSAGES, SUCCESS_MESSAGES, HTTP_STATUS } = require('../config/constants');



// JavaScript doesnt have support to send named parameters from functions in any order.
// so we use object destructuring 

/*
    || returns the left value if it is truthy.
    Otherwise, it returns the right value.

    ?? returns the left value unless it is null or undefined.
    If it is null or undefined, it returns the right value.

    || treats these as falsy:
    false, 0, '', null, undefined, and NaN.

    Example:
    const name = user_name || 'Guest';

    ?? is useful for default values:
    const data = options.data ?? null;

    If options.data is 0:
    || returns null, but ?? keeps 0.
*/


function send_validation_error(
    res,
    res_options = {}
) {

    const res_msg = res_options.message ?? ERROR_MESSAGES.VALIDATION_ERROR;
    const res_data = res_options.data ?? null;
    const err_list = res_options.errors ?? [];

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: res_msg,
        data: res_data,
        errors: err_list
    });

}

function send_unauthorized(
    res,
    res_options = {}
) {
    const res_msg = res_options.message ?? ERROR_MESSAGES.UNAUTHORIZED;

    const res_data = res_options.data ?? null;

    const err_list = res_options.errors ?? [];

    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: res_msg,
        data: res_data,
        errors: err_list
    });
}

function send_forbidden(
    res,
    res_options = {}
) {
    const res_msg = res_options.message ?? ERROR_MESSAGES.FORBIDDEN;

    const res_data = res_options.data ?? null;

    const err_list = res_options.errors ?? [];

    return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: res_msg,
        data: res_data,
        errors: err_list
    });
}

function send_not_found(
    res,
    res_options = {}
) {
    const res_msg = res_options.message ?? ERROR_MESSAGES.NOT_FOUND;

    const res_data = res_options.data ?? null;

    const err_list = res_options.errors ?? [];

    return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: res_msg,
        data: res_data,
        errors: err_list
    });
}

function send_conflict(
    res,
    res_options = {}
) {
    const res_msg = res_options.message ?? ERROR_MESSAGES.CONFLICT;

    const res_data = res_options.data ?? null;

    const err_list = res_options.errors ?? [];

    return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: res_msg,
        data: res_data,
        errors: err_list
    });
}

function send_internal_server_error(
    res,
    res_options = {}
) {
    const res_msg = res_options.message ?? ERROR_MESSAGES.INTERNAL_SERVER_ERROR;

    const res_data = res_options.data ?? null;

    const err_list = res_options.errors ?? [];

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: res_msg,
        data: res_data,
        errors: err_list
    });
}

// --- Success Response Functions ---

function send_success(
    res,
    res_options = {}
) {
    const res_msg = res_options.message ?? SUCCESS_MESSAGES.SUCCESS;

    const res_data = res_options.data ?? null;

    const err_list = res_options.errors ?? [];

    return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: res_msg,
        data: res_data,
        errors: err_list
    });
}

function send_created(
    res,
    res_options = {}
) {
    const res_msg = res_options.message ?? SUCCESS_MESSAGES.CREATED;

    const res_data = res_options.data ?? null;

    const err_list = res_options.errors ?? [];

    return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: res_msg,
        data: res_data,
        errors: err_list
    });
}


module.exports = {
    send_validation_error,
    send_unauthorized,
    send_forbidden,
    send_not_found,
    send_conflict,
    send_internal_server_error,
    send_success,
    send_created
};
