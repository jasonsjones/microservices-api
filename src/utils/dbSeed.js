import debug from 'debug';
import app from '../config/app';
import Config from '../config/config';
import db from '../config/db';
import { seedData } from './dbSeedUtils';

const env = process.env.NODE_ENV || 'development';
const config = Config[env];

const log = debug('db:seed');
const dbConn = db(config);

const server = app.listen(config.port, () => {
    log(`spinning up node server on port ${config.port} to seed the db`);
});

const closeConnections = (db, localServer) => {
    db.close(() => {
        log('mongodb connection closed');
    });
    localServer.close(() => {
        log('server closed');
    });
};

seedData().then(() => {
    closeConnections(dbConn, server);
});
