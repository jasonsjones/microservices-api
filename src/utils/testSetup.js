import debug from 'debug';
const log = debug('test');
process.env.NODE_ENV = 'test';

log(`*** Running in ${process.env.NODE_ENV} mode`);
