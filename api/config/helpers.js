const connection    = require('../models/db');
const passport      = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  connection.query("SELECT * FROM fidel.users WHERE id = ? ",
    [id],
    function(err, rows) {
      done(err, rows[0]);
  });
});