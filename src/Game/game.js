//Game should have a deck
//You need debug actions.

var Player = require("./player.js");

exports.Game = function() {

	var _devID = 4444;//Math.floor(Math.random()*20000000); //devID is used for testing.  Comment it out for production.
	var _players = []; var _maxPlayers = 2; var _minPlayers = 2;
	var _currentRound;
	var _currentStage;
	var _running = false;

	//Returns a new player ID if you were successful in joining, or -1 if you can't join.
	this.Join = function() {
		if(_players.length < _maxPlayers) {

			//Generate ID for new player.
			var _inUse, _generated;
			do {
				_inUse = false; _generated = Math.floor(Math.random()*20000);
				for(var i = 0; i < _players.length; i++) {
					if(_players[i].Id() === _generated) { _inUse = true; }
				}
			} while(_inUse);

			//Build the new player.
			var _add = new Player.Player(_generated);
			_players.push(_add);

			//You'll use this id whenever you communicate with the game.
			return _add.Id();
		}

		return -1;
	};

	//Starts a new game.  Returns true if successful, false if unsuccessful.
	this.Start = function(bet) {
		if(!_running) { //Don't start the game if it's already been started.
			if(_players.length >= _minPlayers) { //Game can't start without all of the players.
				if(typeof bet !== 'number' || (bet%1) !== 0 || bet <= 0) { //If there's some type of error.
					bet = 40; //We default to 40.
				}

				_currentRound = 1;
				_running = true;

				return true; //The game has begun.
			}
		}

		return false; //Game could not start.
	};

	this.GetCommands = function(id) {
		if(_running) {
			var actions = [];
		}

		return [];
	}

	this.SendCommand = function(id) {

	}

	//Takes a player id, returns a stateobject with information on it.
	this.GetState = function(id) {
		if(_running) {
			var gameState = {}
		}
	};
}