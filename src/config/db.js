import mongoose from 'mongoose';
import debug from 'debug';

const log = debug('db:connection');

export default (config) => {
    log('setting up mongodb...');
    mongoose.Promise = global.Promise;
    mongoose.connect(config.dbUrl, { useMongoClient: true });
    let db = mongoose.connection;

    db.once('open', function () {
        log(`Connected to ${config.dbUrl} in mongo container`);
    });

    db.on('error', console.error.bind(console, 'connection error'));
    db.on('disconnected', () => {
        log(`Mongoose disconnected`);
    });

    process.on('SIGINT', () => {
        db.close(() => {
            log('Mongoose default connection closed via app termination');
            process.exit(0);
        });
    });

    process.once('SIGUSR2', () => {
        db.close(() => {
            log('Mongoose default connection closed via nodemon restart');
            process.kill(process.pid, 'SIGUSR2');
        });
    });
    return db;
}
