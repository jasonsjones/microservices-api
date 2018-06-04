const dockerDbUriTest = 'mongodb://mongo/sandboxapi-test';

// const mLabDbUriTest = `mongodb://${process.env.MLAB_USER}:${process.env.DB_PASSWD}@ds135966.mlab.com:35966/sandboxapi-test`;

// TODO: Need to start up another cluster to use the atlas Mongo SAAS solution.
// const atlasUri = "mongodb://dbadmin:" + process.env.DB_PASSWD + "@sandboxcluster-shard-00-00-ks6uh.mongodb.net:27017,"+
//                "sandboxcluster-shard-00-01-ks6uh.mongodb.net:27017," +
//                "sandboxcluster-shard-00-02-ks6uh.mongodb.net:27017/test" + // <-- update db name when new cluster is created.
//                "?ssl=true&replicaSet=SandboxCluster-shard-0&authSource=admin"

export default {
    logging: false,
    dbUrl: dockerDbUriTest
};
