var db = require('../init-db');

module.exports.saveUser = function(user) {
    return db('users').push(user);
};

module.exports.findUser = function(id) {
    return db('users').find({ twitterId: id });
};
