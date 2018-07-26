import debug from 'debug';
import config from '../config/config';
import app from '../config/app';
import db from '../config/db';
import { seedData } from './dbSeedUtils';

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
