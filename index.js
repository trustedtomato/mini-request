const urlLib = require('url');

const request = (url, options = {}) => new Promise((resolve, reject) => {
	const urlParts = urlLib.parse(url);
	const lib = urlParts.protocol === 'http:' ? require('http') : require('https');

	lib.get({
		host: urlParts.host,
		path: urlParts.path,
		headers: Object.assign({}, options.headers)
	}, resp => {
		if(resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location){
			request(urlLib.resolve(url, resp.headers.location), options).then(resolve).catch(reject);
			resp.destroy();
		}else if(resp.statusCode === 200){
			if(options.stream){
				resolve(resp);
			}else{
				let body = '';
				resp.on('data', chunk => {
					body += chunk;
				});
				resp.on('end', () => {
					resolve(body);
				});
				resp.on('error', err => {
					reject(err);
				});
			}
		}else{
			reject(resp);
		}
	});
});

module.exports = request;