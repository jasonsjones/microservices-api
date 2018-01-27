export default (app) => {

    app.get('/api', (req, res) => {
        res.json({
            message: 'Welcome to the sandbox API!',
            version: '1.0'
        });
    })

    app.get('/*', (req, res) => {
        res.render('index', {title: 'React-Node Sandbox'});
    });
}
