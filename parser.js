'use strict';

module.exports = Parser;

var debug = process.env.DEBUG_PARSER;

function Parser(generator) {
    this.generator = generator;
    this.debug = debug;
}

Parser.prototype.next = function next(type, text, scanner) {
    var prior = this.generator.type;
    this.generator = this.generator.next(type, text, scanner);
    // istanbul ignore if
    if (this.debug) {
        console.error(
            'PAR',
            scanner.position(),
            type, JSON.stringify(text),
            prior + '->' + this.generator.type
        );
    }
    return this;
};

Parser.prototype.write = function write(story) {
    if (this.generator.prev) {
        this.generator.prev.write(story, 'end');
        story.end = {type: 'end'};
    } else {
        story.start = {type: 'end'};
    }
};

Parser.prototype.dot = function dot() {
	var dot = '';
	dot += 'digraph {\n';
	dot += 'graph [ rankdir = "TB" ];\n';
	dot += 'node [ shape = "record" ];\n';
	dot += this.generator.dot({});
	dot += '}\n';
	return dot;
};