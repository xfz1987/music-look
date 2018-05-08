const IndexModel = require('../models/IndexModel');

const indexController = {
	index(){
		return async(ctx, next) => {
			const indexModel = new IndexModel();
			const result = await indexModel.getData();
			//将数据直出
			ctx.body = await ctx.render('index', {title: 'Passionate Music', music: result});
		};
	},
	test(){
		return (ctx, next) => {
			ctx.body = {
				data: "hello test"
			};
		};
	}
};

module.exports = indexController;