var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var connection = require('../models/db.js');
var crypto = require('crypto');

passport.use('local-login', new LocalStrategy({
	username: 'username',
	password: 'password',
	passReqToCallback: true
}, function(req, username, password, done){
	connection.query("SELECT * FROM users WHERE email = ?",
		[email],
		function(err, rows){
			if(err){
				return done(err);
			}
			if(!rows.length){
				return done(null, false, {
					message: 'Incorrect username.'
				})
			}
			if(crypto.pbkdf2Sync(password, rows[0].salt, 1000, 64).toString('hex') !== rows[0].password){
				return done(null, false, {
					message: 'Invalid password.'
				});
			}
			return done(null, rows[0]);
		});
	}
));