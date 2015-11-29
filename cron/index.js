var TweetStore = require('../stores/TweetStore');
var UserStore = require('../stores/UserStore');
var Twit = require('twit')
var config = require('../config');
var CronJob = require('cron').CronJob;

function check() {
  console.log('CHECK FOR NEW TWEET');
  var tweets = TweetStore.getTweetsScheduledBefore((new Date()).getTime());

  tweets.forEach((tweet) => {
    var user = UserStore.findUser(tweet.userId);

    var client = new Twit({
      consumer_key: config.TWITTER_CONSUMER_KEY,
      consumer_secret: config.TWITTER_CONSUMER_SECRET,
      access_token: user.twitterToken,
      access_token_secret: user.twitterTokenSecret
    });

    client.post('statuses/update', { status: tweet.tweet }, function(err, data, response) {

    });

    TweetStore.removeTweet(tweet);
  });
};

var job = new CronJob('* * * * *', check);

job.start();

