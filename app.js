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

var routes = require('./routes/index');
var users = require('./routes/users');
var User = require('./models/user');

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
	resave: true
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

app.use('/', routes);
app.use('/users', users);

io.on('connection', (socket) => {
	console.log('lit')
})

server.listen(3000, () => {
	console.log('listening on 3000')
});