const Koa = require('koa');
const router = require('koa-simple-router');
const serve = require('koa-static');
const render = require('koa-swig');
const co = require('co');
const bodyParser = require('koa-bodyparser');
const log4js = require('log4js');
const config = require('./config');
const errorHandler = require('./middlewares/errorHandler');
const controllerInit = require('./controllers/controllerInit');

//创建服务实例
const app = new Koa();

//配置log
log4js.configure({
    appenders: { cheese: { type: 'file', filename: './logs/error.log' } },
    categories: { default: { appenders: ['cheese'], level: 'error' } }
});
const logger = log4js.getLogger('cheese');

//错误处理
errorHandler.error(app, logger);

//初始化所有的路由
controllerInit.init(app, router);

//配置swig(前端模板)
app.context.render = co.wrap(render({
  	root: config.viewDir,
  	autoescape: true,
  	cache: 'memory',
  	ext: 'html',
  	writeBody: false
}));

//配置静态文件目录
app.use(serve(config.staticDir));

//使用请求参数解析
app.use(bodyParser());

//启动服务
app.listen(config.port, () => {
  console.log(`server is running on port ${config.port}`);
});

module.exports = app;