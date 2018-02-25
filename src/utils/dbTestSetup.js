import debug from 'debug';
import { dbConnection } from './dbTestUtils';

const log = debug('test');

process.env.NODE_ENV = 'test';

before(() => log('running the before hook...'));
after(() => {
    log('running the after hook...');
    dbConnection.close();
});