/*require("http");

var port = process.env.PORT || process.env.NODE_PORT || 8000;

http.createServer(onRequest).listen(3000);

var io = socketio.listen(server);

function onRequest = function(){
	print("hello world");
};*/

Game = require("./game/game.js");

console.log("starting up");
var game = new Game.Game();
console.log("created new game");

var player1 = game.Join("Danny");
var player2 = game.Join("Danny");
var player3 = game.Join("Carl"); //Doesn't work and it shouldn't work.

/*console.log("Joined: " + player1);
console.log("Joined: " + player2);
console.log("Attempted join: " + player3); //See?*/

console.log("Starting game: " + game.Start());

console.log(game.GetCommands(player1));
console.log(game.GetPlayer(player1));
//console.log(game.GetCommands(player2));

console.log("");
console.log("");
console.log("");
console.log("");

console.log("playing 2 cards: " + 
	game.SendCommand("play", {"player_id":player1, "card_index":1}) + ", " + 
	game.SendCommand("play", {"player_id":player1, "card_index":1}));
console.log(game.GetBoard(player1));