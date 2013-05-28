
/**
 * A state in nondeterministic finate automata
 * 
 * @param  {String} transitOn  A character which will allow for NFA to transit to next state(s) 
 * @param  {Array} nextStates  Array of states to which to transit 
 * @return {State}             State Object
 */
var State = function(transitOn, nextStates) {
	this.transitOn = transitOn;
	this.nextStates = nextStates;
}

/**
 * A constant object of type state which is used to cap every other NFA to designate finishing state
 * 
 * @type {State}
 */
var matchState = new State(false, []);

/**
 * A constructor for NFA represenatation of regular expression
 * 
 * @param  {State} startState  A starting state 
 * @return {Automata}          NFA plus some additional methods
 */
var Automata = function(re, callback) {
	this.matchedBuffer = '';
	this.activeStates = [];
	this.isStarted = false;
	this.matchCallback = callback;
	
	this.re = re;

	this.startState = null;

	this.compile(re);
}

/**
 * Make a step in parsing a string 
 * 
 * @param  {String} c A character to pass to NFA
 * @return {none}   
 */
Automata.prototype.push = function(c) {
	if (this.isStarted === false) {
		if ( c === this.startState.transitOn 
			|| this.startState.transitOn === true ) {
			this.activeStates = this.startState.nextStates;
			this.isStarted = true;
			this.matchedBuffer += c;
		}
	}
	else {
		var updActiveStates = [];
		
		for (var i = 0, l = this.activeStates.length; i < l; i++) {
			if (c === this.activeStates[i].transitOn) {
				updActiveStates = updActiveStates.concat(this.activeStates[i].nextStates);
			}
			else if (this.activeStates[i].transitOn === true) {
				this.activeStates = this.activeStates.concat(this.activeStates[i].nextStates);
				l = this.activeStates.length;
			}
		}

		if(updActiveStates.length) {
			this.activeStates = updActiveStates;
			this.matchedBuffer += c;

			for (var i = 0, l = this.activeStates.length; i < l; i++) {
				if (this.activeStates[i] === matchState) {
					this.matchCallback(this.matchedBuffer);
				}
			}

		}
		else {
			this.isStarted = false;
			this.matchedBuffer = '';
		}
	}
}

/**
 * Create a NFA representing a regular expression
 * Uses Thompson's NFA algorythm @see http://swtch.com/~rsc/regexp/  
 * 
 * @return {none}
 */
Automata.prototype.compile = function(re) {

	/**
	 * Convert regular expression to postfix notation for easier compiling to NFA
	 * 
	 * @param  {String} re Regular expressions (only a basic subset is supported)
	 * @return {String}    Regular expression in postfix notation with "." used 
	 *                     as concatenation operator.
	 */
	var re2post = function(re) {
		var nalt = 0
			, natom = 0
			, paren = []
			, p = 0
			, postfix = ''
			;

		for(var i = 0, l = re.length; i < l; i++) {
			switch (re[i]) {
				case '(':
					if(natom > 1){
						natom -= 1;
						postfix = postfix.concat('.');
					}
					paren[p] = {
						nalt: nalt,
						natom: natom
					}					
					p++;
					nalt = 0;
					natom = 0;
					break;

				case ')':
					if(p == 0) return null;
					if(natom == 0) return null;

					while(--natom > 0) {
						postfix = postfix.concat('.');
					}						
					
					for(; nalt > 0; nalt--) {					
						postfix = postfix.concat('|');
					}
						
					p -= 1;
					nalt = paren[p].nalt;
					natom = paren[p].natom;
					
					natom += 1;		
					break;

				case '|':
					if(natom == 0) return null;
					
					while(--natom > 0) {
						postfix = postfix.concat('.');
					} 					
					nalt++;				
					break;

				case '*':
				case '+':
				case '?':
					if(natom == 0) return null;
					postfix = postfix.concat(re[i]);
					break;
				
				default:
					if(natom > 1){
						natom -= 1;
						postfix = postfix.concat('.');
					}
					postfix = postfix.concat(re[i]);
					natom += 1;
					break;
			}
		}

		if(p != 0) return null;
		
		while(--natom > 0) {
			postfix = postfix.concat('.');
		}
				
		for(; nalt > 0; nalt--) {
			postfix = postfix.concat('|');
		}

		return postfix;
	}

	/**
	 * Converts regular expression in postfix notation to corresponding NFA
	 * 
	 * @param  {String} post Regular expression in postfix notation
	 * @return {State}       First (starting) state in NFA
	 */
	var post2nfa = function(post) {
	
		var fragStack = []
			, e1
			, e2
			, s
			;

		/**
		 * NFA Fragment - a set of linked State objects with starting and
		 * ending states exposed
		 * 
		 * @param  {State} startState Starting State
		 * @param  {Array} endStates  Array of states that hang 
		 															from the end of fragment
		 * @return {Frag}
		 */
		var Frag = function(startState, endStates) {
			this.startState = startState;
			this.endStates = endStates;
		}

		/**
		 * Connects all end states of a fragment to some state
		 * 
		 * @param  {State} toState State to connect to
		 * @return {none}
		 */
		Frag.prototype.patch = function(toState) {
			this.endStates.forEach(function(s){
				s.nextStates = s.nextStates.concat(toState);
			});
		}

		for(var i = 0, l = post.length; i < l; i++) {
			switch (post[i]) {
				case '.' : 
					e2 = fragStack.pop();
					e1 = fragStack.pop();	

					e1.patch(e2.startState);

					fragStack.push(new Frag(e1.startState, e2.endStates));
					
					break;

				case '|' :
					e1 = fragStack.pop();
					e2 = fragStack.pop();
					s = new State(true, [e1.startState, e2.startState]);

					fragStack.push(new Frag(s, e1.endStates.concat(e2.endStates)));

					break;

				case '?' :
					e1 = fragStack.pop();
					s = new State(true, [e1.startState]);

					fragStack.push(new Frag(s, e1.endStates.concat(s)));

					break;

				case '*' :
					e1 = fragStack.pop();
					s = new State(true, [e1.startState]);
					
					e1.patch(s);

					fragStack.push(new Frag(s, [s]));

					break;

				case '+' :
					e1 = fragStack.pop();
					s = new State(true, [e1.startState]);

					e1.patch(s);

					fragStack.push(new Frag(e1.startState, [s]));

					break;

				default:
					s = new State(post[i], []);
					fragStack.push(new Frag(s, [s]));

			}
		}

		e1 = fragStack.pop();

		if(fragStack.length) {
			console.log("Stack error");
			return null;
		} 

		e1.patch(matchState);

		return e1.startState;
	}

	this.startState = post2nfa(re2post(re));
}

module.exports = Automata;
