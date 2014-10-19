/*require("http");

var port = process.env.PORT || process.env.NODE_PORT || 8000;

http.createServer(onRequest).listen(3000);

var io = socketio.listen(server);

function onRequest = function(){
	print("hello world");
};*/

Game = require("./Game/game.js");

console.log("starting up");
var game = new Game.Game();
console.log("created new game");

var player1 = game.Join();
var player2 = game.Join();

console.log("Joined: " + player1);
console.log("Joined: " + player2);

console.log("Starting game: " + game.Start());

