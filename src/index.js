//------------------------------------------------------------
//-----------Set up game--------------------------------------
//-----------------------------------------------------------

Game = require("./game/game.js");

var games = {}; //A dictionary of all of the active games.

//On creation of a new game.
var NewGame = function() {

	//Build ID and pseudo-password.
	var _generated;
	do {

		_generated = "";
		for(var i = 0; i < 16; i++){
			_generated += String.fromCharCode(65 + Math.floor(Math.random()*64));
		}

	} while(games[_generated]);

	//Create game and return IDs.
	games[_generated] = new Game.Game();

	return _generated; //You'll need both of these IDs to talk to a game.  
	//Actually I'm not sure about that.
}

//Whenever a new player connects to the game.
var Connect = function(name, gameID) {


	var playerID = -1; //Default
	if(games[gameID]) {
		playerID = games[gameID].Join(name);
	}

	return [gameID, playerID];
}

//-------------------------------------------------------------
//-----------Set up server itself------------------------------
//-------------------------------------------------------------

var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');

var port = process.env.PORT || process.env.NODE_PORT || 8000;

app.use('/_images', express.static(path.join(__dirname, '../views/images/')));
app.get('/', function(req, res){
	//res.send('<h1>Hello world</h1>');
	res.sendFile(path.join(__dirname, '/views/index.html'));
});

var port = process.env.PORT || process.env.NODE_PORT || 3000;
http.listen(port, function(){
	console.log('listening on *:3000');
});


//------------------------------------------------------------
//------------Handle io connections---------------------------
//------------------------------------------------------------

var io = require('socket.io')(http);


io.on('connection', function (socket) {

	console.log('new connection');
	//io.to(socket.id).emit('getCurrentConnection', canvas);

	socket.on('join', function (data) {
		//Find a game that could use another person in it if nothing is specified, otherwise, to the specified game.
	});

	socket.on('new', function (data) {
		//
	});

	socket.on('command', function (data) {
		if(games[data.game_id]) {
			//Foward the command along.
			var response = games[data.game_id].sendCommand(data.command, data);
			io.to(socket.id).emit(data.command, response);
			return;
		}

		io.to(socket.id).emit('error', {"message":"not connected to a valid game"});
		
		//socket.broadcast.emit('newImage', data);
	});
});

//------------------------------------------------------------
//----------Testing-------------------------------------------
//------------------------------------------------------------

/*

var gameID = NewGame();

var player1 = Connect("Danny", gameID);

*/




/*

console.log("starting up");
var game = new Game.Game();
console.log("created new game");

var player1 = game.Join("Danny");
var player2 = game.Join("Danny");
var player3 = game.Join("Carl"); //Doesn't work and it shouldn't work.

console.log("Joined: " + player1);
console.log("Joined: " + player2);
console.log("Attempted join: " + player3); //See?

console.log("Starting game: " + game.Start());

console.log(game.GetCommands(player1));
console.log(game.GetPlayer(player1));

console.log("");
console.log("");
console.log("");
console.log("");

console.log("playing 2 cards: " + 
	game.SendCommand("play", {"player_id":player1, "card_index":1}) + ", " + 
	game.SendCommand("play", {"player_id":player1, "card_index":1}));
console.log(game.GetBoard(player1));

*/