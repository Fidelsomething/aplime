var pcfg = require('../config/projectconfig');
const mysql = require('mysql');

const connection = mysql.createConnection({
  host     : pcfg.db.host,
  user     : pcfg.db.user,
  password : pcfg.db.password,
  database : pcfg.db.database
});

console.log(pcfg.db.host);
console.log(pcfg.db.user);
console.log(pcfg.db.password);
console.log(pcfg.db.database);
connection.connect();

module.exports = connection;