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

app.use('/assets', express.static(path.join(__dirname, './views/assets')));
app.get('/', function(req, res){
	//res.send('<h1>Hello world</h1>');
	res.sendFile(path.join(__dirname, '/views/lobby.html'));
});

app.get('/game', function(req, res){
	res.sendFile(path.join(__dirname, '/views/index.html'));
});

var port = process.env.PORT || process.env.NODE_PORT || 3000;
http.listen(port, function(){
	console.log('listening on *:' + port);
});


//------------------------------------------------------------
//------------Handle io connections---------------------------
//------------------------------------------------------------

var io = require('socket.io')(http);


io.on('connection', function (socket) {

	socket.on('games', function (data) {
		var toReturn = {};

		for(var g in games) {
			if(games[g]) { //Make sure that the game actually exists.
				toReturn[g] = games[g].GameState();
			}
		}

		io.to(socket.id).emit('games', toReturn);
	});

	//Start a new game.
	socket.on('create', function (data) {

		//
		gameID = NewGame();
		io.to(socket.id).emit('created', {game_id:gameID});

	});

	//When the player tries to join a game, make that happen.
	socket.on('join', function (data) {
		
		var id = -1;
		var gameID = -1;

		//Find a game that could use another person in it if nothing is specified, otherwise, to the specified game.
		if(data.game_id && games[data.game_id]) {
			gameID = data.game_id;
			id = games[gameID].Join(data.player_name);
		} 
		//Decided not to let people join random games.
		/*else {
			//Search through games and find the first one with only 1 player.
			for (var g in games) {
				if(games[g].GameState().players === 1) {
					id = games[g].Join("Player");

					gameID = g;
					console.log("joined existing game");
				}
			} //If you get to the end and there aren't any games for you to join.
			gameID = NewGame();
			id = games[gameID].Join("Player");

			console.log("made new game")
		}*/

		io.to(socket.id).emit('joined', { 'player_id':id, 'game_id':gameID});

		//Set up repeated pinging to make sure that you're still connected.
		if(id !== -1 && gameID !== -1) {

			//Log who is connected to the game.
			if(!games[gameID].data.connections) { games[gameID].data.connections = []; }
			games[gameID].data.connections.push(socket);

			var _connected = true;
			var checkTimeout = function() {
				if(_connected) {
					_connected = false;
					io.to(socket.id).emit('ping', {/*should be some unique key here each ping*/});
				} else {
					//You didn't send a response in 5 seconds.
					//That means you're not connected.

					//Emit a message to everyone connected.
					if(games[gameID]) {
						for(var i = 0; i < games[gameID].data.connections.length; i++){
							var s = games[gameID].data.connections[i];
							io.to(s.id).emit('disconnect');
						}

						games[gameID] = undefined; //End the game.

						//For testing purposes.
						console.log('disconnection suspected: ' + gameID + ', ' + id);
					}
				}
			}

			socket.on('ping', function(data) {
				//If it's correct.  Not checked right now, we just want a response.
				_connected = true;
				setTimeout(checkTimeout, 5000);
			});

			checkTimeout(); setTimeout(checkTimeout, 5000);


			//----------------Are we ready to start the game?----------------------
			if(games[gameID].GameState().players === 2) {

				games[gameID].Start();
				for(var i = 0; i < games[gameID].data.connections.length; i++){
					var s = games[gameID].data.connections[i];
					io.to(s.id).emit('begin', {player_name: data.player_name});
				}
			}

		} else {
			console.log("joining unsuccessful");
		}
	});

	socket.on('command', function (data) {
		console.log("----------------------");
		console.log(data);
		if(games[data.game_id]) {
			//Foward the command along.
			var response = {
				command: data.command,
				data: games[data.game_id].SendCommand(data.command, data),
			}
			console.log(response);
			io.to(socket.id).emit('response', response);
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