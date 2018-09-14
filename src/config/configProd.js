import dotenv from 'dotenv';
dotenv.config();

const dockerDbUri = 'mongodb://mongo:27017/sandboxapi';

export default {
    logging: false,
    url: process.env.PROD_URL,
    dbUrl: process.env.MLAB_DB_URI
};
