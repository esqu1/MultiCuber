var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var Room = require('../models/room')
var ObjectID = require('mongodb').ObjectID

let url = 'mongodb://localhost:27017/test'


var ensureAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	} else {
		req.flash('error_msg', 'You are not logged in');
		res.redirect('/users/login');
	}
}

// var getRoomInfo = (id, callback) => {
// 	MongoClient.connect(url, (err, db) => {
// 		var collection = db.collection('rooms');
// 		var room = collection.findOne({_id: ObjectID(id.toString())}, (err, room) => {
// 			if (err) throw err;
// 			callback(room);
// 		});
// 	})
// }

router.get('/', (req, res) => {
	res.render('index')
})

// router.get('/rooms', ensureAuthenticated, (req, res) => {
// 	Room.getAllRooms((r) => {
// 		res.render('rooms', {rooms: r});
// 	})
// })

// router.post('/rooms', (req, res) => {
// 	var name = req.body.name;
// 	var event = req.body.event;
// 	var password = req.body.password;

// 	req.checkBody('name', 'Name is required').notEmpty();

// 	var errors = req.validationErrors();

// 	if (errors) {
// 		res.render('rooms', {
// 			errors: errors
// 		})
// 	} else {
// 		var newRoom = new Room({
// 			name: name,
// 			event: event,
// 			password: password,
// 			users: [{username: req.user.username}]
// 		})

// 		let id = '';

// 		Room.createRoom(newRoom, (err, room) => {
// 			if (err) throw err;
// 			id = room._id.valueOf();
// 			res.redirect('/rooms/' + id);
// 		})
// 	}
// })

// router.get('/rooms/:id', ensureAuthenticated, (req, res) => {
// 	var id = req.params.id;
// 	getRoomInfo(id, (r) => {
// 		res.render('singleroom', {id: id, r: r})
// 	});
// })

// router.get('/api/user_data', function(req, res) {
// 	if (req.user === undefined) {
// 		// The user is not logged in
// 		res.json({});
// 	} else {
// 		res.json({
// 			username: req.user.username
// 		});
// 	}
// });

module.exports = {
	router:router,
	ensureAuthenticated: ensureAuthenticated
};