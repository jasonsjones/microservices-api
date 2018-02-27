import debug from 'debug';
import app from './config/app';
import Config from './config/config';
import db from './config/db';

const log = debug('app');
const env = process.env.NODE_ENV || "development";
const config = Config[env];
db(config);

app.listen(config.port, () => {
    log(`node server running on port ${config.port}`);
});
