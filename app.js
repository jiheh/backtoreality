const Express = require('express');

const app = new Express();

app.use('/', Express.static('views'));

app.listen(3000, function() {
	console.log('Listening to port 3000');
});