//I should have some type of object. 
//Internally, we keep track of variables, and then take commands.
//This is more secure.  This part of the client should not care about
//sockets or anything.  We'll wire those in later.



//Game can do a couple of things.


//It's divided into rounds.
//round.begin();

//At which point, the person who gets to go first goes.
	//You have one action.
		//Some things cost 0 actions.

	//You can draw, bet, or fold.
		//That might set an flag for the next person, that they have to fold.
			//Which could either be automatic or not.

//Keep on repeating.

//You need debug actions.

exports.Game = function() {

	var _players = [];
	var _currentRound;

	this.Start = function(_bet) {
		if(typeof _bet !== 'number' || (_bet%1) !== 0) {
			_bet = 40; //We default to 40.
		}

		_currentRound = 1;

		return id
	}

	this.EndRound = function(){

	}

	this.GetState = function(id) {

	}

}