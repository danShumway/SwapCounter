Deck = require("./deck.js")

exports.Player = function(_id, _name) {
	if(!_id) { throw "player cannot be innitialized without id."; }
	var _deck = new Deck.Deck(0, 13, 1);
	var _hand = []; var _folded = false;
	//
	this.Id = function() { return _id; };
	this.Name = function() { return _name || "anonymous"; };


	//---------Things that I can do as a player-------------

	this.Reset = function() {
		_hand = []; _folded = false;

		//Draw a new hand.
		this.Draw(5);
	};

	this.Draw = function(_number) { 
		_hand.append(_deck.Draw(_number));
	};

	this.Fold = function() {
		_hand = [];
		_folded = true;
	};

	this.GetInfo = function(_self) {
		var toReturn;
		if(_self) { //If I'm getting info about myself.

		} else { //What I share with other players.
		}
	};

}
