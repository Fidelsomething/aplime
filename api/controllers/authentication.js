var passport = require('passport');
var connection = require('../models/db');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');



var sendJSONresponse = function(res, status, content){
	res.status(status);
	res.json(content);
};
var sha1 = function(data) {
     var generator = crypto.createHash('sha1');
     generator.update( data )  
     return generator.digest('hex') 
}

module.exports.register = function(req, res){
	console.log(req.body);
	if(!req.body.username || !req.body.email || !req.body.password){
		sendJSONresponse(res, 400, {
			"message" : "All fields required."
		})
	}

	console.log("got here, as I have a decent bawdy");
	var salt = crypto.randomBytes(16).toString('hex');
	var pass = salt + req.body.password;
	//var hash = crypto.pbkdf2Sync(req.body.password, salt, 1000, 64).toString('hex');
	var hash = sha1(pass);
	console.log("hash: " + hash);
	console.log("salt: " + salt);

	connection.query("SELECT * FROM fidel.users WHERE username = ?" ,[req.body.username], function(err, rows){
		console.log("inside query");
		console.log(rows);
		if(err){
			sendJSONresponse(res, 400, err);
		}
		if(rows.length){
			sendJSONresponse(res, 400, {
				"message": "User already exists"
			});
		}
		const User = {
			username : req.body.username,
			email : req.body.email,
			password : hash,
			salt: salt
		};

		const insertQuery = "INSERT INTO fidel.users (username, email, password, salt) values (?,?,?,?)";
		connection.query(insertQuery, [User.username, User.email, User.password, User.salt], function(err, rows){
				if(err){
					console.log(err);
					sendJSONresponse(res, 400, err);
				}
				User.id = rows.insertId;
				var expiry = new Date();
				expiry.setDate(expiry.getDate() + 7); // 7 days

				var token = jwt.sign({
					id: User.id,
					email: User.email,
					username: User.username,
					exp: parseInt(expiry.getTime() / 1000), // exp as Unix time in seconds
				}, process.env.JWT_SECRET);
				sendJSONresponse(res, 200, token);
			});
		});
};

module.exports.login = function(req, res){
	if(!req.body.username || !req.body.password){
		sendJSONresponse(res, 400, {
			"message" : req.body
		});
		return;
	}

	passport.authenticate('local-login', function(err, user, info){
		var token;
		if(err){
			sendJSONresponse(res, 404, err);
		}
		if(user){
			//token = user.generateJwt();
			sendJSONresponse(res, 200, {
				"token" : token
			});
		} else {
			sendJSONresponse(res, 401, info);
		}
	})(req, res)
}
