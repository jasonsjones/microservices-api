import dotenv from 'dotenv';
dotenv.config();

const { MLAB_DB_URI } = process.env;

export default {
    logging: false,
    apiUrl: 'https://j2sandbox-api.herokuapp.com',
    clientUrl: 'https://j2sandbox.herokupap.com',
    dbUrl: MLAB_DB_URI
};
