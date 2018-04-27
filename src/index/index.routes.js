import config from '../config/config';
export default app => {
    app.get('/api', (req, res) => {
        res.json({
            message: 'Welcome to the sandbox API!',
            version: config.version
        });
    });

    app.get('/*', (req, res) => {
        res.render('index', { title: 'Sandbox API' });
    });
};
