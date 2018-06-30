import { dbConnection } from './dbTestUtils';
import { setupEnv } from './testUtils';

setupEnv();

after(() => {
    dbConnection.close();
});
