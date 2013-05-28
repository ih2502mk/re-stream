re-stream
=========

Find a sequence that matches a regular expression in a stream of chars.

Reagular expressions that can be matched are only the basic ones, only `*+?()|` are supported.
No `.` for any character, no character subclasses, no restriction on number of repetitions. There is also no 
escaping or special characters like `\n`. So this is very limited so far.   

The idea is borrowed from http://swtch.com/~rsc/regexp/regexp1.html

BTW It also is not published on NPM.

Usage
=====

```javascript
var Automata = require('./re-stream.js');

var a = new Automata('a(bb)+c', function(matched){ 
  console.log(matched);
});

var sting = "aaaaaaabbbbbbbbbbcccc";

for (var i = 0, l = sting.length; i < l; i++) {
	a.push(sting[i]);
}

// At the step when match occurs console.log will print "abbbbbbbbbbc"

```

Why
===

The __goal__ is to have regular expression parser that would expose streaming API so one could use it like this:
```javascript

var re = new ReStream('a(bb)+c');

someStream.pipe(re);

re.on('match', function(matches){
	//do something with all the matches here 
});
```
Native implementation of regexps in JavaScript is not streaming, but having such thing might be useful.
