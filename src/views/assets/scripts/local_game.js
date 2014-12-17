
console.log("connecting");
var socket = io.connect('http://localhost:3000');


//----------INITIAL CONNECTIONS-----------------------------

var Game = {};


socket.on('connect', function() {
	console.log('connected');

	//These will have been stored as session variables from the previous page.
	//It's on you to keep track of them, the server ain't going to be bothered by it.
	var _id = sessionStorage.getItem("game_id");
	var _name = sessionStorage.getItem("player_name");


	if(_id !== undefined) {
		socket.emit("join", {game_id:_id, player_name:_name});
	}
});


socket.on("joined", function(data){
	//Joined successfully, what's the ID?
	Game.game_id = data.game_id;
	Game.player_id = data.player_id;
	if(Game.game_id === -1 || Game.player_id === -1) {
		alert("could not join game.");
		window.location = "/";
	} else {
		alert("joined game successfully.  Do not close/refresh your browser window or you will be disconnected.");
		
		socket.emit("command", {
			"game_id":Game.game_id, 
			"player_id":Game.player_id,
			"command": 'getBoard',
		});	
	}


	//Update the gameboard and get your opponent's name.
});

//Recieve results
socket.on('response', function(data) {

	//Set up events.
	if(data.command === "getBoard") {
		if(data.data) {
			console.log(data);
			updateBoard(data.data);
		}
	} else if (data.command === "getHand") {
		UpdateHand(data);
	}

});

//-----------------GAME IS READY TO BEGIN---------------------

socket.on("begin", function(data) {
	alert(data.player_name + " has joined, game is ready to begin");

	socket.emit("command", {
		"game_id":Game.game_id, 
		"player_id":Game.player_id,
		"command": 'getBoard',
	});
});


//----------------Handle connections---------------------------

socket.on('ping', function(data) {
	socket.emit('ping', {});
});

socket.on('disconnect', function(data) {
	alert("One or more players disconnected, game will end");
	window.location = "/";
});




//pass in the state of the board and update the graphics.
var updateBoard = function(board) {

	var data = {cards:[]};

	for(a in board.play_areas) {
		//Update opponent and you.
		var area = board.play_areas[a]; data = {cards:[]};
		for(var i = 0; i < area.cards.length; i++) {
			data.cards.push({card:area.cards[i].Number, rotated:area.cards[i].Tapped});
		}

		if(Game.player_id !== a) {
			Game.opponent = a; //Update who my opponente is.

			document.getElementById("opponentPlayArea").innerHTML = templates.playArea(data);
		} else {
			document.getElementById("playArea").innerHTML = templates.playArea(data);
		}
	}

	//Do the pot.
	data = {cards:[]};
	for (c in board.pot.cards) {
		data.cards.push(board.pot.cards[c].Number);
	}

	document.getElementById("betArea").innerHTML = templates.betArea(data);


	data = {cards:[]};
	for(a in board.hands) {
		//Update opponent and you.
		var area = board.hands[a]; data = {cards:[]};
		for(var i = 0; i < area.cards.length; i++) {
			data.cards.push(area.cards[i].Number);
		}

		if(Game.player_id !== a) {
			Game.opponent = a; //Update who my opponente is.

			document.getElementById("opponentHand").innerHTML = templates.hand(data);
		} else {
			document.getElementById("hand").innerHTML = templates.hand(data);
		}
	}
};


var updateHand = function(hand) {
	//Same thing. Update your hand and your opponents.

	var data = {cards:[]};

	for (c in hand){
		data.cards.push(hand[c]);
	}
};



