import debug from 'debug';
import app from './config/app';
import config from './config/config';
import db from './config/db';

const log = debug('app');
db(config);

app.listen(config.port, () => {
    log(`node server running on port ${config.port}`);
});
