var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
	secret: process.env.JWT_SECRET,
	userProperty: 'payload'
});
var ctrlAuth = require('../controllers/authentication');

//Authentication Routes

router.post('/login', ctrlAuth.login);
router.post('/register', ctrlAuth.register);


module.exports = router;
