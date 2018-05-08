const fs = require('fs');
class IndexModel {
	constructor(app){}
	getData(){
		return new Promise((resolve, reject) => {
			fs.readdir('public/media', function(err, files){
				if(err){
					reject(new Error(err))
				}else{
					resolve(files);
				}
			});
		});
	}
}

module.exports = IndexModel;