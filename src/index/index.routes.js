export default app => {
    app.get('/api', (req, res) => {
        res.json({
            message: 'Welcome to the sandbox API!',
            version: '0.1'
        });
    });

    app.get('/*', (req, res) => {
        res.render('index', { title: 'Sandbox API' });
    });
};
