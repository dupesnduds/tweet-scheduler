var uuid = require('node-uuid');
var db = require('../init-db');

module.exports.getScheduledTweet = function(userId) {
  return db('tweets').where({userId: userId});
};

module.exports.scheduleTweet = function(userId, tweet, scheduleDate) {
  return db('tweets').push({
    uuid: uuid.v4(),
    userId: userId,
    tweet: tweet,
    scheduleDate: scheduleDate
  });
};

module.exports.getScheduledTweetByUuid = function(uuid) {
  return db('tweets').find({uuid: uuid});
};

module.exports.removeTweet = function(tweet) {
  return db('tweets').remove(tweet);
};

module.exports.getTweetsScheduledBefore = function(date) {
  return db('tweets').filter((tweet) => {
    return tweet.scheduleDate <= date
  });
};
