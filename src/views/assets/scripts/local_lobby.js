var templates = {}
templates.games = Handlebars.compile(document.querySelector("#template_games").innerHTML);

console.log("connecting");
var socket = io.connect('http://localhost:3000');


function create() {
	var name = document.getElementById('name').value || "Player";
	sessionStorage.setItem("player_name", name);
	socket.emit("create", {player_name:name});
}

function joinGame(_id) {
	var name = document.getElementById('name').value || "Player";
	sessionStorage.setItem("player_name", name);
	sessionStorage.setItem("game_id", _id);
	//
	window.location = "/game";
	//socket.emit("join", {game_id:_id, player_name:name});
}





//---------------RUNS------------------------------

//Connection.
socket.on('connect', function() {
	console.log('connected');
	socket.emit("games", {});

	setInterval(function() { socket.emit("games", {}); }, 5000);
});

//When you get games back, update the template.
socket.on('games', function(games) {
	var data = {games: []};
	console.log(games);
	for(var g in games) {
		//if(games[g].players === 1) {
			data.games.push({
				game_id:g, 
				player_host:games[g].joined[0],
				open:games[g].players !== 2
			});
		//}
	}
	document.getElementById("games").innerHTML = templates.games(data);
});

socket.on('created', function(data) {

	//Set a session variable.
	sessionStorage.setItem("game_id", data.game_id);
	window.location = "/game";
});


//Recieve results
socket.on('response', function(data) {
	//Get results and translate them into doing stuff.	
});