import dotenv from 'dotenv';
import devConfig from './devConfig';
dotenv.config();

const port = process.env.PORT || 3000;
const token_secret = process.env.JWT_SECRET;
const session_secret = process.env.SESSION_SECRET;

const dockerDbUriTest = 'mongodb://mongo/sandboxapi-test';
// const mLabDbUri = `mongodb://${process.env.MLAB_USER}:${process.env.DB_PASSWD}@ds119436.mlab.com:19436/sandboxapi`
// const mLabDbUriTest = `mongodb://${process.env.MLAB_USER}:${process.env.DB_PASSWD}@ds135966.mlab.com:35966/sandboxapi-test`;

// TODO: Need to start up another cluster to use the atlas Mongo SAAS solution.
// const atlasUri = "mongodb://dbadmin:" + process.env.DB_PASSWD + "@sandboxcluster-shard-00-00-ks6uh.mongodb.net:27017,"+
//                "sandboxcluster-shard-00-01-ks6uh.mongodb.net:27017," +
//                "sandboxcluster-shard-00-02-ks6uh.mongodb.net:27017/test" + // <-- update db name when new cluster is created.
//                "?ssl=true&replicaSet=SandboxCluster-shard-0&authSource=admin"

const env = process.env.NODE_ENV || 'development';

let baseConfig = {
    version: '0.2.4',
    env,
    port,
    token_secret,
    session_secret,
    baseUrl: 'http://localhost'
};

let testConfig = {
    dbUrl: dockerDbUriTest
};

let config;
if (baseConfig.env === 'development') {
    config = Object.assign(baseConfig, devConfig);
} else if (baseConfig.env === 'testing') {
    config = Object.assign(baseConfig, testConfig);
}

export default config;
