import dotenv from 'dotenv';
dotenv.config();

const dockerDbUriTest = 'mongodb://mongo:27017/sandboxapi-test';

// TODO: Need to start up another cluster to use the atlas Mongo SAAS solution.
// const atlasUri = "mongodb://dbadmin:" + process.env.DB_PASSWD + "@sandboxcluster-shard-00-00-ks6uh.mongodb.net:27017,"+
//                "sandboxcluster-shard-00-01-ks6uh.mongodb.net:27017," +
//                "sandboxcluster-shard-00-02-ks6uh.mongodb.net:27017/test" + // <-- update db name when new cluster is created.
//                "?ssl=true&replicaSet=SandboxCluster-shard-0&authSource=admin"

export default {
    logging: false,
    dbUrl: process.env.RUNNING_IN_DOCKER ? dockerDbUriTest : process.env.MLAB_DB_TEST_URI
};
