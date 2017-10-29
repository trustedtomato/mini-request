const request = require('./');

request('https://www.reddit.com/r/Showerthoughts/hot.json')
	.then(JSON.parse)
	.then(reddit => reddit.data.children[0].data.title)
	.then(console.log);

request('https://google.com')
	.then(text => text.match(/<title>(.*?)<\/title>/i)[1].trim())
	.then(title => {
		if(title !== 'Google'){
			throw new Error('The title should be Google, not ' + title);
		}else{
			console.log('The title is Google!');
		}
	});