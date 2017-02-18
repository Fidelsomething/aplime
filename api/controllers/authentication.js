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
	var salt = crypto.randomBytes(8).toString('hex');
	var pass = salt + req.body.password;
	//var hash = crypto.pbkdf2Sync(req.body.password, salt, 1000, 64).toString('hex');
	var hash = sha1(pass);
	console.log("hash: " + hash);
	console.log("salt: " + salt);

	connection.query("SELECT * FROM omeka_users WHERE username = ?" ,[req.body.username], function(err, rows){
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

		const insertQuery = "INSERT INTO omeka_users (username, email, password, salt, name, active, role) values (?,?,?,?,?,?,?)";
		connection.query(insertQuery, [User.username, User.email, User.password, User.salt, 'Guest User', '1', 'guest'], function(err, rows){
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
	console.log(req.body);
	if(!req.body.username || !req.body.password){
		sendJSONresponse(res, 400, {
			"message" : req.body
		});
		return;
	}
	console.log("will try to passport.authenticate now");
	connection.query("SELECT * FROM omeka_users WHERE username = ?", [req.body.username], function(err, rows){
		if(err){
			sendJSONresponse(res, 400, err);
		}
		if(!rows.length){
			sendJSONresponse(res, 400, {
				"message": "No user with that name found"
			});
		}
		var pass = rows[0].salt + req.body.password;
		console.log("result salt: ");
		console.log(rows[0].salt);
		console.log("pass: " + pass);
		console.log(sha1(pass));
		console.log(rows[0].password);
		if(sha1(pass) !== rows[0].password){
			sendJSONresponse(res, 400, {
				"message" : "Invalid password"
			});
		} else {
			var User = rows[0];
			var expiry = new Date();
			var token = jwt.sign({
				id: User.id,
				email: User.email,
				username: User.username,
				exp: parseInt(expiry.getTime()/1000),
			}, process.env.JWT_SECRET);
			sendJSONresponse(res, 200, token);
		}

	})
}
