import debug from 'debug';
const log = debug('test');
process.env.NODE_ENV = 'testing';

log(`*** Running in ${process.env.NODE_ENV} mode`);
