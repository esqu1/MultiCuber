var scramble_333 = require('./jsss/scramble_333.js');
var scramble_sq1 = require('./jsss/scramble_sq1.js');
var scramble_222 = require('./jsss/scramble_222.js');
var scramble_NNN = require('./jsss/scramble_NNN.js');
var scramble_minx = require('./jsss/scramble_minx.js');
var scramble_pyram = require('./jsss/scramble_pyram.js');
var scramble_clock = require('./jsss/scramble_clock.js');

const scramblers = Object.assign({}, scramble_333.scramblers, scramble_sq1.scramblers, scramble_222.scramblers, scramble_NNN.scramblers, scramble_minx.scramblers,
	scramble_pyram.scramblers, scramble_clock.scramblers);

console.log(scramblers)