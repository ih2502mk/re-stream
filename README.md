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

ToDo
====

1. Use Node Srteams for this finally! One of the ways to go would be to create a separate module that builds a streaming parser based on NFA of some certain format. Maybe use node through module for that.
2. There is a project [debuggex](http://www.debuggex.com), it is closed source but it uses some opensource modules to work one of them is [node-pcre](http://npmjs.org/package/pcre) - node bindings for pcre c library. Look into that cause node-pcre lets you save state machine produced by pcre as node buffer. If there is a way to make sence out of that buffer it's definately a way to go.
3. Alternatively look into [TRE](http://laurikari.net/tre/) to make bindings for that which will be complicated.

