var express = require('express');
var router = express.Router();

var Room = require('../models/room')


var ensureAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	} else {
		req.flash('error_msg', 'You are not logged in');
		res.redirect('/users/login');
	}
}

router.get('/', (req, res) => {
	res.render('index')
})

router.get('/rooms', ensureAuthenticated, (req, res) => {
	var newRoom = new Room({
		name: 'The Great Room',
		event: '333',
		idNumber: 1,
		users: [{username: 'brandbest1'}]
	})
	res.render('rooms');
	Room.createRoom(newRoom, (e, room) => {
		if (e) throw e;
		console.log(room);
	})
})

module.exports = router;