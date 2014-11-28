(function(){ "use strict"; })();

//Card is an internal data strcture.
var Card = function(_number, _suite, _deckID) {


	this.Number = _number; this.Suite = _suite; //For right now.

	this.Clone = function() {
		return {
			"Number": this.Number,
			"Suite": this.Suite,
			"Clone": this.Clone,
		};
	};
	/*this.Number = function(){ return _number; },
	this.Suite = function(){ return _suite; }

	//I want card ids to go here.

	//This gets set during games in order
	//to properly sync local play and online play.  Actually probably unneccessary now that I think about it.
	this.instanceID = -1;

	//Other just "settable" data.  Cards are really just open enums at this point, so you can feel free to just append data to them.
	this.tapped = false;
	//this.counters = []; and so on.  There's no reason these *need* to have been specified here.  IN fact, I kind of don't want them to have been?
	*/
}

//Attached function for validating cards and copying them when you don't trust them.
Card.Validate = function(card) {
	if(card && typeof(card.Number) === "number" && typeof(card.Suite) === "number") {
		return new Card(card.Number, card.Suite);
	}

	return false;
}



//Decks don't have a discard.  You draw a card and then do whatever you want with it.
//You should manage discard on your own, and then place the discard pile back into your deck before shuffling.
var Deck = function(_startIndex, _endIndex, _suite) {
	//Error checking.
	if(!_startIndex) { _startIndex = 1; };
	if(!_endIndex) { _endIndex = 13; };
	if(!_suite) { _suite = 0; };
	//Internal variables.
	var _cards, _draw; //Lists that correspond to what cards are in the deck, and what cards are left to draw.
	
	//----------------------------
	//Constructor, auto-calls.
	//---------------------------
	(function init() {
		//Build deck.
		_cards = []; _draw = [];
		for(var i = _startIndex; i < _endIndex; i++) {
			var _c = new Card(i, _suite, undefined);
			_cards.push(_c); _draw.push(_c);
		}

		_given = {}; //What cards have been taken out of the deck.

	})();

	//------------------------------
	//User Exposed functions
	//-----------------------------

	this.Count = function() {
		return _draw.length;
	}

	//Uses Fisher-Yates Shuffle - Copied from http://bost.ocks.org/mike/shuffle/
	this.Shuffle = function() {
		var m = _draw.length, t, i;
		while(m) {
			i = Math.floor(Math.random() * m--);
			t = _draw[m];
			_draw[m] = _draw[i];
			_draw[i] = t;
		}

		return 1; //Success.
	};

	this.Draw = function(_number) {
		if(!_number) { _number = 1; };
		var _return = [];
		for(var i = 0; i < _number; i++){
			_return.push(_draw.pop());
		}
		return _return;
	};


	//You can place a card on either the top or bottom of your deck.
	//You can also pass in an array of cards.
	this.Place = function(_card, _bottom) {
		if(_bottom) {
			if(Array.isArray(_card)){
				_draw.concat(_card);
			} else {
				_draw.unshift(_card);
			}
		} else {
			if(Array.isArray(_card)){
				_card.concat(_bottom)
			} else {
				_draw.push(_card);
			}
		}

		return 1; //Success.
	}

	//Not implemented.  Will need to be implemented.
	this.Trade = function(_card, _deck) {
		throw "Trading not implemented";
		if(_deck) {
			/*if(_card) {
				//Check to see if you have the card you're trading.
				var _index = _cards.indexOf(_card);
				if(_index !== -1) {
					_deck.Take(_card); //Give to other deck.
					_cards.splice(_index, 1); //
				}
			}*/
		}
	}
}

exports.Card = Card;
exports.Deck = Deck;