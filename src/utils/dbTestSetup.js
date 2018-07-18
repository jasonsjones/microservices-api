import { dbConnection } from './dbTestUtils';
import { setupEnv } from './testUtils';

before(() => {
    setupEnv();
});

after(() => {
    dbConnection.close();
});
