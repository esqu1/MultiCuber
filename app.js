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

var ensureAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	} else {
		req.flash('error_msg', 'You are not logged in');
		res.redirect('/users/login');
	}
}

var getRoomInfo = (id, callback) => {
	mongo.MongoClient.connect(url, (err, db) => {
		var collection = db.collection('rooms');
		var room = collection.findOne({_id: mongo.ObjectID(id.toString())}, (err, room) => {
			if (err) throw err;
			callback(room);
		});
	})
}

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'layout'}));
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
	Room.getAllRooms((r) => {
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
			users: [{username: req.user.username}]
		})

		let id = '';

		Room.createRoom(newRoom, (err, room) => {
			if (err) throw err;
			id = room._id.valueOf();

			var nsp = io.of('/rooms/' + id)
			// nsp.on('connection', (socket) => {
			// 	socket.join(id);
			// 	console.log(id);
			// 	io.to(id).emit('user join', req.user.username)

			// 	socket.on('disconnection', (socket) => {
			// 		delete socket;
			// 		console.log('oh');
			// 	})
			// })
			res.redirect('/rooms/play/' + id);
		})
	}
})

io.of('/rooms/play/').on('connection', (socket) => {
	var username, roomID;
	socket.on('user connection', (data) => {
		roomID = data[0]; username = data[1]
		socket.join(roomID);
		console.log(roomID);
		io.to(roomID).emit('user join', username)
	})	
	socket.on('disconnection', (socket) => {
		delete socket;
		console.log('oh');
	})
})

app.get('/rooms/play/', ensureAuthenticated, (req, res) => {
	var id = req.query.id;
	getRoomInfo(id, (r) => {
		res.render('singleroom', {id: id, r: r})
	});
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



io.on('connection', (socket) => {
	var user, currentRoom;
	socket.on('chat message', (arr) => {
		io.emit('chat ' + arr[0], arr[1], arr[2]);
	});

	// socket.on('user connection', (data) => {
	// 	user = data[1];
	// 	currentRoom = data[0];
	// 	console.log('connected')
	// 	Room.addUserToRoom(data[0], data[1], (r) => {
	// 		io.emit('user ' + data[0], r.users);
	// 	});
	// });
	// socket.on('disconnection', () => {
	// 	console.log('disconnected')
	// 	Room.removeUserFromRoom(currentRoom, user, (r) => {
	// 		console.log(r);
	// 	})
	// })
})

server.listen(3000, () => {
	console.log('listening on 3000')
});