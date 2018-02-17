import debug from 'debug';
const log = debug('db:collections');

export const dropCollections = (connection) => {
    let collections = Object.keys(connection.collections);
    collections.forEach((coll) => {
        connection.dropCollection(coll, (err) => {
            if (err) {
                throw err;
            }
            log(`***** dropped collection ${coll}`);
        });
    });
};
