
const path = require('path');

const config = {
	viewDir: path.join(__dirname,'..', 'views'),
	staticDir: path.join(__dirname,'..','public'),
	port: 3000
};

module.exports = config;