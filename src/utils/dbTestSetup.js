import { dbConnection } from './dbTestUtils';

process.env.NODE_ENV = 'test';

after(() => {
    dbConnection.close();
});
