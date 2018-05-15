import { dbConnection } from './dbTestUtils';

process.env.NODE_ENV = 'testing';

after(() => {
    dbConnection.close();
});
