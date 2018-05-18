const dockerDbUri = 'mongodb://mongo/sandboxapi';
// const mLabDbUri = `mongodb://${process.env.MLAB_USER}:${process.env.DB_PASSWD}@ds119436.mlab.com:19436/sandboxapi`

export default {
    dbUrl: dockerDbUri
};
