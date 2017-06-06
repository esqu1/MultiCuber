var express = require('express');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var exphbs = require('express-handlebars')
var expressValidator = require('express-validator')
var flash = require('connect-flash')
var session = require('express-session')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var scramble = require('./assets/scramble');
var mongo = require('mongodb');
var mongoose = require('mongoose');
let url = 'mongodb://localhost:27017/test';
mongoose.connect(url);
var db = mongoose.connection;
var server = require('http').Server(app);
var io = require('socket.io')(server);

//var routes = require('./routes/index');
var users = require('./routes/users');
var User = require('./models/user');
var Room = require('./models/room');

var getRoomInfo = (id, callback) => {
	mongo.MongoClient.connect(url, (err, db) => {
		var collection = db.collection('rooms');
		var room = collection.findOne({_id: mongo.ObjectID(id.toString())}, (err, room) => {
			if (err) throw err;
			callback(room);
		});
	})
}

var ensureAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	} else {
		req.flash('error_msg', 'You are not logged in');
		res.redirect('/users/login');
	}
}

var ensureValidRoom = (req, res, next) => {
	var id = req.query.id;
	try {
		var modifiedID = mongo.ObjectID(id.toString());
		Room.getAllRooms({_id: modifiedID}, (rooms) => {
			if (rooms.length == 0 ) {
				req.flash('error_msg', 'The specified room does not exist.');
				res.redirect('/rooms')
			} else {
				next();
			}
		})
	} catch (err) {
		req.flash('error_msg', 'Invalid room.')
		res.redirect('/rooms')
	}
	
}

var ensurePassword = (req, res, next) => {
	getRoomInfo(req.query.id, (room) => {
		if (!(room.password == '')) {
			req.flash('error_msg', 'This room requires a password in order to join.');
			req.flash('password', 'blah');
			res.redirect('/rooms/locked?id=' + req.query.id);
		} else {
			return next();
		}
	});
}

var hbs = exphbs.create({
	defaultLayout: 'layout',
	helpers: {
		reverse: function(arr) {arr.reverse();},
	}	
})

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

// Public folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
	secret: 'secret',
	saveUninitialized: true,
	resave: true,
	store: new session.MemoryStore({ reapInterval: 600 * 10 })
}))

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
	errorFormatter: (param, msg, value) => {
		var namespace = param.split('.')
		, root    = namespace.shift()
		, formParam = root;
		while(namespace.length) {
			formParam += '[' + namespace.shift() + ']';
		}
		return {
			param : formParam,
			msg   : msg,
			value : value
		};
	},
	customValidators: { // code from: https://maketips.net/tip/161/validate-username-available-using-express-validator
		userTaken: (value) => {
			return new Promise((resolve, reject) => {
				User.findOne({ username: value }, (err, user) => {
					if (err) throw err;
					if(user == null) {
						resolve();
					} else {
						reject();
					}
				});
			});
		},
		emailTaken: (value) => {
			return new Promise((resolve, reject) => {
				User.findOne({ email: value }, (err, email) => {
					if (err) throw err;
					if(email == null) {
						resolve();
					} else {
						reject();
					}
				});
			});
		}
	}
}));

// Flash
app.use(flash());

app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	next();
})


//app.use('/', routes);
app.use('/users', users);

app.get('/', (req, res) => {
	res.render('index')
})

app.get('/rooms', ensureAuthenticated, (req, res) => {
	Room.getAllRooms({}, (r) => {
		res.render('rooms', {rooms: r});
	})
})

app.post('/rooms', (req, res) => {
	var name = req.body.name;
	var event = req.body.event;
	var password = req.body.password;

	req.checkBody('name', 'Name is required').notEmpty();

	var errors = req.validationErrors();

	if (errors) {
		res.render('rooms', {
			errors: errors
		})
	} else {
		var newRoom = new Room({
			name: name,
			event: event,
			password: password,
			users: [],
			currentRow: 0,
			times: [],
			currentTime: [],
		})
		Room.createRoom(newRoom, (err, room) => {
			if (err) throw err;
			var id = room._id.valueOf();
			res.redirect('/rooms/play/?id=' + id);
		})
	}
})

var nsp = io.of('/rooms/play/')

nsp.on('connection', (socket) => {
	var username, roomID = 0, event;

	// when user connects to a room
	socket.on('user connection', (data) => {
		roomID = data[0]; username = data[1];
		socket.join(roomID, (err) => {
			if (err) throw err;
			console.log('connected')
			getRoomInfo(roomID, (room1) => {
				event = room1.event;
				if (room1.users.length == 0) {
					Room.addUserToRoom(roomID, username, (r) => {
						socket.emit('load page', r.times, r.currentTime, r.users);
						nsp.in(roomID).emit('user join', username, r.users);
						socket.emit('new host', username);
					})
				} else {
					Room.addUserToRoom(roomID, username, (r) => {
						socket.emit('load page', r.times, r.currentTime, r.users);
						nsp.in(roomID).emit('user join', username, r.users);
					})
				}
			})
		})
	})

	// when user leaves a room
	socket.on('disconnection', (socket) => {
		delete socket;
		console.log('disconnected')
		Room.removeUserFromRoom(roomID, username, (r) => {
			if (r.users.length == 0) {
				//Room.deleteRoom(roomID, () => {});
			} else {
				Room.decNumUsers(roomID, (r3) => { 
					nsp.in(roomID).emit('new host', r.users[0].username);
					nsp.in(roomID).emit('user leave', username, r.users);
					console.log(r3.numUsers);
					console.log(r3.currentTime.length);
					if(r3.numUsers == r3.currentTime.length) {
						Room.updateTimeDatabase(roomID, (r2) => {
							nsp.in(roomID).emit('times', r.currentTime)
						})
					}
				})
			}
		})
	})

	// when user chats
	socket.on('chat message', (arr) => {
		nsp.in(roomID).emit('chat', arr[1], arr[2]);
	});

	socket.on('ready', (host) => {
		scramble.scramble(event, (s) => {
			nsp.in(roomID).emit('new scramble', s.scramble_string)
			Room.updateNumUsers(roomID, (r) => {
				console.log(r);
				if(r.currentTime.length != 0) {
					Room.updateTimeDatabase(roomID, (r2) => {
						nsp.in(roomID).emit('times', r.currentTime);
					})
				}
			})
		});
		
	})

	socket.on('new time', (username, time, penalty) => {
		Room.addTimeToRoom(roomID, username, time, penalty, (r) => { 
			if(r.numUsers == r.currentTime.length) {
				Room.updateTimeDatabase(roomID, (r2) => {
					nsp.in(roomID).emit('times', r.currentTime)
				})
			}
		})
	})
})

app.get('/rooms/play/', ensureAuthenticated, ensureValidRoom, ensurePassword, (req, res) => {
	var id = req.query.id;
	Room.getAllRooms({_id: mongo.ObjectID(id.toString()), 'users.username': req.user.username}, (rooms) => {
		if (rooms.length == 0) {
			getRoomInfo(id, (r) => {
				res.render('singleroom', {id: id, r: r})
			});
		} else {
			Room.getAllRooms({}, (r) => {
				res.render('rooms', {rooms: r, errors: [{msg: 'You are already in this room.'}]})
			})
		}
	})
})

app.get('/rooms/locked', (req, res) => {
	res.render('rooms')
})

app.get('/api/user_data', function(req, res) {
	if (req.user === undefined) {
		// The user is not logged in
		res.json({});
	} else {
		res.json({
			username: req.user.username
		});
	}
});

server.listen(3000, () => {
	console.log('listening on 3000')
	scramble.initialize();
});