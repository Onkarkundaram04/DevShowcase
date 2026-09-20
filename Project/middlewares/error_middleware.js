const {
    send_conflict,
    send_internal_server_error
} = require('../utils/api_response');

function error_middleware(error, req, res, next) {

    if (error.operation !== undefined) {
        console.error(`Error in : ${error.operation}`);
    }
    else {
        console.error(`Error in : Unknown Operation`);
    }

    console.error(error.message);
    console.error(error.stack);

    // MongoDB duplicate key error
    if (error.code === 11000) {

        let duplicate_field = 'field';

        if (error.keyValue !== undefined) {
            const keys = Object.keys(error.keyValue);
            duplicate_field = keys[0];
        }

        return send_conflict(
            res,
            {
                errors: [
                    {
                        field: duplicate_field,
                        message: `${duplicate_field} already exists`
                    }
                ]
            }
        );
    }

    return send_internal_server_error(
        res,
        {
            errors: [
                {
                    field: 'server',
                    message: 'Something went wrong'
                }
            ]
        }
    );
}

module.exports = error_middleware;