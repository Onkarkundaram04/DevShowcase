require('dotenv').config();

const express = require('express');
const connect_db = require('./config/db');
const post_routes = require('./routes/post_routes');
const auth_routes = require('./routes/auth_routes');
const admin_routes = require('./routes/admin_routes');
const user_routes = require('./routes/user_routes');
const error_middleware = require('./middlewares/error_middleware');

const { send_not_found } = require('./utils/api_response');

const app = express();

const PORT = process.env.PORT || 8000;


app.use(express.json());
app.use(express.static('public'));


app.use('/api/posts', post_routes);

app.use('/api/auth', auth_routes);

app.use('/api/admin', admin_routes);

app.use('/api/user', user_routes);

app.use((req, res) => {

    return send_not_found(
        res,
        {
            errors: [
                {
                    field: 'route',
                    message: 'Route not found'
                }
            ]
        }
    );
});

app.use(error_middleware);

async function start_server() {

    try {

        await connect_db();

        app.listen(PORT, () => {

            console.log(`Server is running at http://localhost:${PORT}`);

        });

    }
    catch (error) {

        console.log(`Server could not start because Mongo DB connection failed`);

        process.exit(1);
    }

}

start_server();