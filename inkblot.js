#!/usr/bin/env node

'use strict';

var fs = require('fs');
var ReadlineEngine = require('./engine');
var Scanner = require('./scanner');
var OutlineLexer = require('./outline-lexer');
var InlineLexer = require('./inline-lexer');
var Parser = require('./parser');
var Story = require('./story');
var grammar = require('./grammar');
var exec = require('shon/exec');
var usage = require('./inkblot.json');

function main() {
    var config = exec(usage);

    if (!config) {
        return;
    }

    read(config.script, 'utf8', onScript);

    function onScript(err, ink) {
        if (err) {
            return;
        }

        if (config.debugInput) {
            console.log(ink);
        }

        var story = new Story();
        var interactive = true;

        var p = new Parser(grammar.start(story));
        var il = new InlineLexer(p);
        var ol = new OutlineLexer(il);
        var s = new Scanner(ol);

        if (config.debugParser) {
            p.debug = true;
            interactive = false;
        }
        if (config.debugInlineLexer) {
            il.debug = true;
            interactive = false;
        }
        if (config.debugOutlineLexer) {
            ol.debug = true;
            interactive = false;
        }
        if (config.debugScanner) {
            s.debug = true;
            interactive = false;
        }

        s.next(ink);
        s.return();

        if (config.json) {
            console.log(JSON.stringify(story.states, null, 4));
            interactive = false;
        }

        if (config.dot) {
            console.log(p.dot());
            interactive = false;
        }

        if (interactive) {
            var engine = new ReadlineEngine(story.states, config.start);
            engine.continue();
        }
    }

}

function read(stream, encoding, callback) {
    stream.on('data', onData);
    stream.on('end', onEnd);
    stream.on('error', onEnd);
    stream.setEncoding(encoding);
    var string = '';
    function onData(chunk) {
        string += chunk;
    }
    function onEnd(err) {
        if (err) {
            callback(err);
            return;
        }
        callback(null, string);
    }
}

main();
