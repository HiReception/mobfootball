var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
Error.stackTraceLimit = Infinity;

mongoose.connect('mongodb://localhost/example');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
	var ballPosition = { lat: -37.814278, lng: 144.963257 }; /*(Elizabeth and Bourke, roughly centre of field)*/
	var goalOne = {lat: -37.817219, lng: 144.952797 }; /*(Top of Southern Cross Station Staircase, Western goal)*/
	var goalTwo = {lat: -37.811226, lng: 144.973603 }; /*(Top of Parliament House Staircase, Eastern goal)*/
	var fieldOfPlay = [
		{lat: -37.813226, lng: 144.951359}, /*(La Trobe and Spencer, Northwest corner)*/
		{lat: -37.807569, lng: 144.970618}, /*(La Trobe and Victoria, Northeast corner 1)*/
		{lat: -37.807861, lng: 144.971444}, /*(Spring and Victoria, Northeast corner 2)*/
		{lat: -37.815274, lng: 144.974877}, /*(Spring and Flinders, Southeast corner)*/
		{lat: -37.820973, lng: 144.955040}  /*(Spencer and Flinders, Southwest corner)*/
	];
	var idIncrement;
	var playerSchema = mongoose.schema({
		hasPossession: Boolean,
		latitude: Number,
		longitude: Number,
		name: String
	})
	
	var Player = mongoose.model('Player', playerSchema)
	
	app.get('/', function (req, res) {
		res.sendFile(__dirname + '/index.html');
	});

	io.on('connection', function(socket) {
		var thisPlayer = new Player({
			hasPossession: false,
			latitude: 0,
			longitude: 0,
		})
		socket.emit('player id created', thisPlayer.get('_id'));
		
		
		socket.on('player position update', function(lat, lng){
			Tank.update({ latitude: lat }, { longitude: lng }, callback);
		});
		
		socket.on('disconnect', function() {
			// TODO remove this player from database
		})
	});

	http.listen(3000, function() {
		console.log('listening on *:3000');
	});
	
	
	// send list of all users and their locations to every connected user, every second
	setInterval(function() {
		Player.find(function(err, player_data) {
			io.emit('all players update', {players: player_data})
		})
	}, 1000);
	
});