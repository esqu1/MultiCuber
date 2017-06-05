var scramble_333 = require('../public/jsss/scramble_333.js');
var scramble_sq1 = require('../public/jsss/scramble_sq1.js');
var scramble_222 = require('../public/jsss/scramble_222.js');
var scramble_NNN = require('../public/jsss/scramble_NNN.js');
var scramble_minx = require('../public/jsss/scramble_minx.js');
var scramble_pyram = require('../public/jsss/scramble_pyram.js');
var scramble_clock = require('../public/jsss/scramble_clock.js');

const scramblers = Object.assign({}, scramble_333.scramblers, scramble_sq1.scramblers, scramble_222.scramblers, scramble_NNN.scramblers, scramble_minx.scramblers,
	scramble_pyram.scramblers, scramble_clock.scramblers);


var scramble333 = (callback) => {
	callback(scramblers['333'].getRandomScramble().scramble_string);
}