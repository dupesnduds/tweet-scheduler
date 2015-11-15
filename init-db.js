var lowdb = require('lowdb');
var db = lowdb('data/db.json');

module.exports = db;
