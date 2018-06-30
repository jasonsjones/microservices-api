import dotenv from 'dotenv';
dotenv.config();

const dockerDbUri = 'mongodb://mongo/sandboxapi';

export default {
    logging: true,
    dbUrl: process.env.RUNNING_IN_DOCKER ? dockerDbUri : process.env.MLAB_DB_URI
};
