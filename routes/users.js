var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var MongoClient = require('mongodb').MongoClient;

let url = 'mongodb://localhost:27017/test'

var User = require('../models/user');

var checkDups = (key, valueToCheck, callback) => {
	MongoClient.connect(url, (err, db) => {
		if (err) throw err;
		var collection = db.collection('users');
		var userDups = collection.find({'username': valueToCheck})
	})
}

router.get('/register', (req, res) => {
	res.render('register');
})


router.get('/login', (req, res) => {
	res.render('login');
})

router.post('/register', (req, res) => {
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
	req.checkBody('username', 'Username is already taken').userTaken();
	req.checkBody('email', 'Email is already taken').emailTaken();


	req.asyncValidationErrors().then(() => {
		var newUser = new User({
			name: name,
			email: email,
			username: username,
			password: password
		});

		User.createUser(newUser, (error, user) => {
			if (error) throw error;
			console.log(user);
		});

		req.flash('success_msg', 'You are registered.');

		res.redirect('/users/login')

	}).catch((errors) => {
		res.render('register', {
			errors: errors
		});
	});
})

passport.use(new LocalStrategy(
	(username, password, done) => {
		User.getUserByUsername(username, (err, user) => {
			if (err) throw err;
			if (!user) {
				return done(null, false, {message: 'Unknown User'})
			}

			User.comparePassword(password, user.password, (err, isMatch) => {
				if (err) throw err;
				if (isMatch) {
					return done(null, user);
				} else {
					return done(null, false, {message: 'Incorrect password'});
				}
			})
		})
	}
));

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	User.getUserById(id, (err, user) => {
		done(err, user);
	});
});

router.post('/login',
	passport.authenticate('local', {successRedirect:'/rooms', failureRedirect:'/users/login',failureFlash: true}),
	(req, res) => {
		res.redirect('/rooms')
	});

router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/users/login')
})
module.exports = router;