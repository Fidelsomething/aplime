var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
	secret: process.env.JWT_SECRET,
	userProperty: 'payload'
});


//Authentication Routes

router.post('/login', ctrlAuth.login);
router.post('/register', ctrlAuth.register);