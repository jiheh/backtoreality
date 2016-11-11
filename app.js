const Express = require('express');

const app = new Express();

app.set('port', (process.env.PORT || 3000));

app.use('/', Express.static('browser'));

app.listen(app.get('port'), function() {
	console.log('Listening to port 3000');
});