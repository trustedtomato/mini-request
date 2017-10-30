const urlLib = require('url');
const querystring = require('querystring');

const request = (url, {method = 'GET', body, post, headers = {}, redirects = 5, stream = false} = {}) => new Promise((resolve, reject) => {
	if(redirects-- < 0){
		reject(new Error('Too much redirect!'));
	}
	const {host, path, protocol} = urlLib.parse(url);
	const lib = protocol === 'http:' ? require('http') : require('https');

	if(post){
		method = 'POST';
		body = post;
	}
	if(typeof body === 'object' && body !== null){
		body = JSON.stringify(body);
		if(!headers['Content-Type']){
			headers['Content-Type'] = 'application/json';
		}
	}
	if(body && !headers['Content-Length']){
		headers['Content-Length'] = Buffer.byteLength(body);
	}

	
	const req = lib.request({ host, path, headers, method }, resp => {		
		if(resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location){
			request(urlLib.resolve(url, resp.headers.location), {method, body, headers, redirects: redirects - 1, stream}).then(resolve).catch(reject);
			resp.destroy();
		}else if(resp.statusCode === 200){
			if(stream){
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

	if(body){
		req.write(body);
	}
	req.end();
});

module.exports = request;