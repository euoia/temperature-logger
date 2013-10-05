var temp = require('node-rasp2c-temp/temp'),
	express = require('express'),
	routes = require('./routes'),
	db = require('./db.js');

// Log interval in milliseconds.
var logIntervalMilliseconds = 30 * 1000;

var app = express();
app.configure(function () {
	"use strict";

	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.static('static'));
});

// Repeatedly call the logging function.
setInterval(function () {
	"use strict";

	var celsius = temp.getLastGoodTemp();
	var record = {
		unix_time: Date.now(),
		celsius: celsius
	};

	console.log('Inserting last good temperature reading into database.');

	db.insertTemp(record, function (error) {
		if (error) {
			console.error('Error inserting into database.');
			console.error(error);
		}
	});

}, logIntervalMilliseconds);

console.log('Server is logging to database at ' + logIntervalMilliseconds + 'ms intervals');

app.get('/json/temperature_query', routes.temperature_query);
app.get('/json/temperature_now', routes.temperature_now(temp));

app.get('/', routes.index);

app.get('/temperature_log', routes.temperature_log);
app.get('/temperature_plot', routes.temperature_plot);

app.listen(app.get('port'), function () {
	console.log("Express server started on port %d.", app.get('port'));
});