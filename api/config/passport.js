var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var connection = require('../models/db');
var crypto = require('crypto');

var sha1 = function(data) {
     var generator = crypto.createHash('sha1');
     generator.update( data )  
     return generator.digest('hex') 
}


passport.use('local-login', new LocalStrategy({
	username: 'username',
	password: 'password',
	passReqToCallback: true
}, function(req, username, password, done){
	connection.query("SELECT * FROM fidel.users WHERE email = ?",
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
			var pass = rows[0].salt + password;

			if(sha1(pass) !== rows[0].password){
				return done(null, false, {
					message: 'Invalid password.'
				});
			}
			return done(null, rows[0]);
		});
	}
));