var assert = require('assert');

var Automata = require('./re-stream.js')
	, a = new Automata('a(bb)+c', function(m){console.log(m)})
	, str = "aaabbbbbbc"
	;

for (var i = 0, l = str.length; i < l; i++) {
	a.push(str[i]);
}


