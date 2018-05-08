const index = require('./indexController');

//路由注册中心
const controllerInit = {
	init(app, router){
		app.use(router(_ => {
			_.get('/', index.index());
			_.get('/index', index.index());
		}));
	}
};

module.exports = controllerInit;