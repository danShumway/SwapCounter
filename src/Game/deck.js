//Card is an internal data strcture.
exports.Card = function(_number, _suite, _deckID) {
	this.Number = function(){ return _number; },
	this.Suite = function(){ return _suite; }

	//I want card ids to go here.
}

//
exports.Deck = function(_startIndex, _endIndex, _suite) {
	//Error checking.
	if(!_startIndex) { _startIndex = 1; };
	if(!_endIndex) { _endIndex = 13; };
	if(!_suite) { _suite = 0; };
	//Internal variables.
	var _cards, _draw;

	//----------------------------
	//Constructor, auto-calls.
	//---------------------------
	(function init() {
		//Build deck.
		for(var i = _startIndex; i < _endIndex; i++) {
			var _c = new Card(i, _suite);
			_cards.push(_c); _draw.push(_c);
		}

	})();

	//------------------------------
	//User Exposed functions
	//-----------------------------

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

	//
	this.Place = function(_card, _bottom) {
		if(_bottom) {
			_draw.unshift(_card);
		} else {
			_draw.push(_card);
		}

		return 1; //Success.
	}

	this.TakeCard = function(_card) {}

	//Not implemented.
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

	this.Reset = function() {

	}
}