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
	callback(scramblers['333'].getRandomScramble());
}

var scramble222 = (callback) => {
	callback(scramblers['222'].getRandomScramble());
}

var scramble444 = (callback) => {
	callback(scramblers['444'].getRandomScramble());
}

var scramble555 = (callback) => {
	callback(scramblers['555'].getRandomScramble());
}

var scramble666 = (callback) => {
	callback(scramblers['666'].getRandomScramble());
}

var scramble777 = (callback) => {
	callback(scramblers['777'].getRandomScramble());
}

var scrambleSq1 = (callback) => {
	callback(scramblers['sq1'].getRandomScramble());
}

var scrambleClock = (callback) => {
	callback(scramblers['clock'].getRandomScramble());
}

var scramblePyram = (callback) => {
	callback(scramblers['pyram'].getRandomScramble());
}

var scrambleMinx = (callback) => {
	callback(scramblers['minx'].getRandomScramble());
}

module.exports = {
	scramble333: scramble333,
	scramble222: scramble222,
	scramble444: scramble444,
	scramble555: scramble555,
	scramble666: scramble666,
	scramble777: scramble777,
	scrambleSq1: scrambleSq1,
	scrambleClock: scrambleClock,
	scramblePyram: scramblePyram,
	scrambleMinx: scrambleMinx,
}