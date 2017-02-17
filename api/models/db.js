var pcfg = require('../config/projectconfig');
const mysql = require('mysql');

const pool = mysql.createPool({
  host     : pcfg.host,
  user     : pcfg.user,
  password : pcfg.password,
  database : pcfg.database
});

module.exports = pool;