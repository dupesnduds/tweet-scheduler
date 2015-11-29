var db = require('../init-db');

module.exports.getScheduledTweet = function(userId) {
  return db('tweets').where({userId: userId});
};

module.exports.scheduleTweet = function(userId, tweet, scheduleDate) {
  return db('tweets').push({
    userId: userId,
    tweet: tweet,
    scheduleDate: scheduleDate
  });
};

module.exports.removeTweet = function(tweet) {
  return db('tweets').remove(tweet);
};

module.exports.getTweetsScheduledBefore = function(date) {
  return db('tweets').filter((tweet) => {
    return tweet.scheduleDate <= date
  });
};
