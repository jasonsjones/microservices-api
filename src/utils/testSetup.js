process.env.NODE_ENV = 'test';
import { setupEnv } from './testUtils';

before(() => {
    setupEnv();
});
