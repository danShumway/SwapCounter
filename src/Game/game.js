(function() { "use strict"; })();
//Game should have a deck
//You need debug actions.

var PlayerBuilder = require("./player.js");

exports.Game = function() {

	var _devID = 4444;//Math.floor(Math.random()*20000000); //devID is used for testing.  Comment it out for production.
	var _players = {}; var _num_players = 0; var _maxPlayers = 2; var _minPlayers = 2;
	var _bet = 0; var _min_bet = 20; var _max_bet = 80;

	var _currentRound;
	var _currentStage;
	var _running = false;
	var _board = undefined;

	//Game variables.
	var _stage = 0;
	var _stages = {"Play":0, "End":1};

	var _turn = 0;
	var _folding = false;
	var _valid_skip = false;
	var _available_actions = 1;
	var _folds = 0;

	//Nothing fancy, used purely as a hash for attaching data to the game.
	this.data = {};



	//Returns a new player ID if you were successful in joining, or -1 if you can't join.
	this.Join = function(name) {

		if(!name) { return -1; } //Cannot join without name.

		if(_num_players < _maxPlayers) {

			//Check to see if the name already exists, and modify it accordingly.
			var _found; var _index = 0;
			do {
				_found = false;
				for(player in _players) {
					if(_players[player].Name() === (_index > 0)?name+_index:name) {
						_index++;
						_found = false;
					}
				}
			} while (_found); name = (_index>0)?name+_index:name //Make the final ID.


			//Generate ID for new player.
			var _generated;
			do {

				_generated = "";
				for(var i = 0; i < 16; i++){
					_generated += String.fromCharCode(65 + Math.floor(Math.random()*64));
				}

			} while(_players[_generated]);

			//Build the new player.
			var _add = new PlayerBuilder.Player(_generated, name);
			_players[_add.Id()] = _add;
			_num_players++;
			
			//You'll use this id whenever you communicate with the game.
			return _add.Id();
		}

		return -1;
	};

	//Starts a new game.  Returns true if successful, false if unsuccessful.
	this.Start = function(bet) {
		if(!_running) { //Don't start the game if it's already been started.
			if(_num_players >= _minPlayers) { //Game can't start without all of the players.
				if(typeof bet !== 'number' || (bet%1) !== 0 || bet <= 0) { //Make sure bets are correct.
					bet = 40; //We default to 40.
				} else {
					bet = Math.min(_max_bet, Math.max(bet, _min_bet));
				}

				//Set up the board.
				//--------------------------------------------------------------

				_currentRound = 1;
				_running = true;
				_turn = 0;

				//Each player starts with 5 cards.  Probably shouldn't be hardcoded.  But then again, the game itself is pretty hardcoded 
				// - I don't really have any generalized scripts here outside of deck/card/player
				for (player in _players) {
					_players[player].Shuffle(player);
					_players[player].Draw(player, 5);
				}
				_stage = _stages.Play;

				_board = {
					"pot": { //Cards currently being bet.
						"cards":[],
						"value":0,
					},
					"player_order": [], //List of playerIDs at the table and in what order they're sitting.
					"play_areas": {} //playareas with playerID as the key.
				};

				for(var p in _players){
					_board.player_order.push(p);
					_board.play_areas[p] = {
						"cards":[], //An array of cards. These are refered to by their index.  Some of them may be tapped or something, I guess.
						"value": 0, //The total threatened value for this part of the board.
					};
				}

				return true; //The game has begun.
			}
		}

		return false; //Game could not start.
	};

	this.GetCommands = function(id) {

		var actions = [];
		//If the game is running.
		if(_running) {
			//If it's your turn.
			if(_board.player_order[_turn] === id) {
				var actions = [];
				if(_stage === _stages.Play) {

					actions.push(["play", "player_id", "card_index"]);
					actions.push(["tap", "player_id", "card_index"]);

					//If you can't play cards.
					if(_valid_skip) {
						actions.push(["end", "player_id"]);
					}

				} else if (_stage === _stages.End){
					//If no one else has folded.
					if(!_folding){
						actions.push(["bet", "player_id", "card_index"]);
						actions.push(["draw", "player_id"]);
					}
					actions.push(["fold", "player_id"]);
				}
			}

			//Figure out what's going on with the board and return.
			actions.push(["getPlayer", "player_id"]);
			actions.push(["getBoard", "player_id"]);
		}

		return actions;
	}

	this.SendCommand = function(command, command_object) {

		var player = _players[command_object.player_id];
		//Valid player and if it's your turn.
		if(player) {

			//Basic commands for info.
			if(command === "getPlayer") {
				return this.getPlayer(command_object.player_id);
			} else if(command === "getBoard") {
				return this.GetBoard(command_object.player_id);
			}


			if(_running && _board.player_order[_turn] === command_object.player_id) {
				//Stuff in here for handeling commands.  Basically the main script for the game.
				//etc...
				if(_stage === _stages.Play) {
					if(command === "play") {

						//Get the card.
						var card = player.PlayCard(command_object.player_id, command_object.card_index);

						//If it exists.
						if(card) {
							card.Tapped = false; //Set up initial state for the card.
							var playArea = _board.play_areas[command_object.player_id];

							//If it's being played onto an existing card, +1 action (just enough to play a duplicate card)
							for(var i = 0; i < playArea.cards.length; i++) {
								if(playArea.cards[i].Number === card.Number && !playArea.cards[i].Tapped) {
									_available_actions++;
									break;
								}	
							}

							//Append it to the list of played cards and update the board, if you have the actions available to do so.
							if(_available_actions != 0) {
								playArea.cards.push(card); playArea.value += card.Number;
								_available_actions--;
								_valid_skip = true;

								return true;
							}
						}

						//Return the card.
						player.TakeCard(command_object.player_id, card);
						return false;

					} else if (command === "tap") {
						var playArea = _board.play_areas[command_object.player_id];
						//If the card exists and is not already played.
						if(playArea[command_object.card_index] && !playArea[command_object.card_index].Tapped) {

							//If it's being tapped into an already tapped stack.
							playArea[command_object.card_index].Tapped = true;
							//playAreass
						}

					} else {
						//Unrecognized or invalid command.
						return false;
					}

				} else if (_stage === _stages.End){

					if(command === "fold") {
						//

						_folding = true;

						endTurn();
					} else {

						//If you're not forced into the previous action (ie, other people haven't folded.)
						if(!_folding){
							if(command === "bet") {

								var card = player.PlayCard(command_object.player_id, command_object.card_index);

								//If it exists.
								if(card) {

									var pot = _board.pot;
									pot.cards.push(card); playArea.value += card.Number;
									endTurn();
									//
									return true;
								}

								//you got here and it's not good.
								return false;

							} else if (command === "draw") {

								player.Draw(command_object.player_id, 1);

								endTurn();
							}
						} 
					}

					//Unrecognized or invalid command.
				}
			}

			//Either bad ID or it's not your turn.
		};


		//-----------------------------------------------------
		//internally used functions.  These will definitely not pass jshint.
		//-----------------------------------------------------

		function endTurn(){
			if(_folds === _num_players) {
				//Check to see if everyone has folded, and
				//if so, add up points for the round.


				//Is the whole game over?

				//Normally this is where trading would go, but time constraints mean we're not doing trading.



				//End it by reseting the round.
				for (player in _players) {
				_players[player].Shuffle(player);
				_players[player].Draw(player, 5);
			}


			} else {
				if(_folding) {
					_folds++;
				}
				_turn = (_turn+1)%_board.player_order.length;
			}
		}
	}



	//Takes a player id, returns a stateobject with information on it.
	this.GetBoard = function(id) {
		if(_running) {
			var gameState = {
				"pot": {
						"cards": _board.pot.cards.map(function(element) { return element.Clone(); }), //An array of cards currently being bet.
						"value": _board.pot.value, //The total threatened value for this part of the board.
					},
				"play_areas": {}, //playareas with playerID as the key (usues a public id for your opponents obviously)
			} ;

			//do a step by step duplication of play_areas (also privatizing the IDs)
			for(var player in _board.play_areas) {
				var show = (player === id) ? player : _players[player].Name();
				gameState.play_areas[show] = {
					"cards": _board.play_areas[player].cards.map(function(element) { return element.Clone(); }), //An array of cards currently being bet.
					"value": _board.play_areas[player].value, //The total threatened value for this part of the board.
				};
			}


			return gameState;
		}

		return false;
	};

	//Pass in either an ID or name and we'll try and get the info back to you.
	this.GetPlayer = function(id_or_name) {
		if(_players[id_or_name]) {
			return _players[id_or_name].GetInfo(id_or_name);
		} else {
			for(player in _players) {
				if(_players[player].Name() === id_or_name) {
					return _players[player].GetInfo(id_or_name);
				}
			}
		}

		return false;
	}

	//Still figuring this out.
	this.GameState = function() {
		var toReturn =  {
			"players": _num_players,
			"joined": []
		};

		for(player in _players) {
			toReturn.joined.push(_players[player].Name());
		}

		return toReturn;
	}
}