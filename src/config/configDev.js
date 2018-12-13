import dotenv from 'dotenv';
dotenv.config();

const dockerDbUri = 'mongodb://mongo:27017/sandboxapi';
const { RUNNING_IN_DOCKER, MLAB_DB_URI, DOCKER_DB_URI = dockerDbUri } = process.env;

export default {
    logging: true,
    dbUrl: RUNNING_IN_DOCKER ? DOCKER_DB_URI : MLAB_DB_URI
};
