(function(){ "use strict"; })();

Deck = require("./deck.js")

exports.Player = function(_id, _name) {
	if(!_id) { throw "player cannot be innitialized without id."; }
	if(!_name) { throw "player cannot be innitialized without name."; }
	var _deck = new Deck.Deck(0, 13, Math.floor(Math.random()*4) + 1);
	var _hand = []; var _folded = false;
	//
	this.Id = function() { return _id; };
	this.Name = function() { return _name; };

	//----------Internal functions--------------------------

	var handToString = function(hide) {
		var _toReturn = [];
		for(var i = 0; i < _hand.length; i++){
			var c = _hand[i].Clone();
			_toReturn.push(c);

			//If necessary, obsfucate card values.
			if(hide) {
				c.Number = '?';
			}
		}

		return _toReturn; //
	}

	//Used to copy out card information in a safe format.
	var validateCard = function(card) {
		return Deck.Card.Validate(card);
	}


	//---------Things that I can do as a player-------------

	this.Shuffle = function(_id) {
		if(_id === this.Id()) {
			_deck.Shuffle();

			return true;
		}

		return false;
	}

	//Not sure what this is here and how it needs to be modified.
	this.Reset = function(_id) {
		if(_id === this.Id()) {
			_hand = []; _folded = false;

			this.Shuffle();
			//Draw a new hand.
			this.Draw(5);
			return handToString();
		}
		
		return false;
	};

	//Returns your new hand.
	this.Draw = function(_id, _number) { 
		if(_id === this.Id()) {
			_hand = _hand.concat(_deck.Draw(_number));
			return handToString();
		}
		
		return false;
	};

	//Returns whether or not you folded.
	this.Fold = function(_id) {
		if(_id === this.Id()) {
			_hand = [];
			_folded = true;

			return true;
		}
		
		return false;
	};


	//Pass in the index of the card in the hand.
	//Returns the card you played.
	this.PlayCard = function(_id, _card_index) {
		if(_id === this.Id()) {
			if(_hand[_card_index]) {
				var toReturn = _hand[_card_index];
				_hand.splice(_card_index, 1); //Remove the card.

				return toReturn;
			}
		}

		return false;
	}


	//Place a card in your hand.
	this.TakeCard = function(_id, _card) {
		if(_id === this.Id()) {
			var c = validateCard(_card);
			if(c) {
				_hand.push(_card.Clone());
				return true;
			}
		}
		console.log('nope');

		return false;
	}

	this.GetInfo = function(_id) {
		var toReturn;
		if(_id === this.Id()) { //If I'm getting info about myself.
			return {
				"hand_size": _hand.length,
				"deck_size": _deck.Count(),
				"hand": handToString(),
				//"discard_size": _deck
			};

		} else { //What I share with other players.
			return {
				"hand_size": _hand.length,
				"deck_size": _deck.Count(),
				"hand": handToString(true),
			};
		}
	};

}
