var express = require('express');
var passport = require('passport');
var TwitterStrategy = require('passport-twitter');
var config = require('./config.js');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
var moment = require('moment-timezone');

var app = express();

var hbs = require('express-hbs');

hbs.registerHelper('format_date', function(date) {
  date = moment(date);

  return date.from(moment.tz('America/Montreal'));
});

// Use `.hbs` for extensions and find partials in `views/partials`.
app.engine('hbs', hbs.express4({
  partialsDir: __dirname + '/views/partials'
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  store: new FileStore({
    path: __dirname + '/sessions'
  }),
  ttl: 86400
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new TwitterStrategy({
    consumerKey: config.TWITTER_CONSUMER_KEY,
    consumerSecret: config.TWITTER_CONSUMER_SECRET
  },
  function(token, tokenSecret, profile, done) {
    var user = UserStore.findUser(profile.id);

    if (!user) {
      user = {
        twitterId: profile.id,
        twitterTokenSecret: tokenSecret,
        username: profile.username,
        twitterToken: token,
        twitterTokenSecret: tokenSecret
      }

      UserStore.saveUser(user);
    }

    done(false, user);
  }
));

var UserStore = require('./stores/UserStore');

passport.serializeUser(function(user, done) {
  done(null, user.twitterId);
});

passport.deserializeUser(function(id, done) {
  var user = UserStore.findUser(id);

  if (!user) {
    return done(new Error('User does not exists'));
  }

  done(false, user);
});

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
  res.redirect('/');
});

var securedRoute = function(req, res, next) {
  if (req.user) {
    return next();
  }

  res.redirect('/auth/twitter');
};
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req, res) {
  if (req.user) {
    return res.redirect('/scheduler');
  }
  res.render('index');
});

app.use(securedRoute);

var moment = require('moment-timezone');
var TweetStore = require('./stores/TweetStore');

app.get('/scheduler', function(req, res) {
  res.render('scheduler', {
    user: req.user,
    tweets: TweetStore.getScheduledTweet(req.user.twitterId)
  });
});

app.post('/scheduler/tweets', function(req, res) {
  TweetStore.scheduleTweet(req.user.twitterId,
    req.body.tweet,
    moment.tz(req.body.date, "America/Montreal").valueOf()
  );

  res.redirect('/scheduler');
});

app.get('/scheduler/tweets/:uuid/delete', function(req, res) {
  var tweet = TweetStore.getScheduledTweetByUuid(req.params.uuid);

  TweetStore.removeTweet(tweet);

  res.redirect('/scheduler');
});

app.listen(8080, function() {
  console.log('Server listening on port: ' + this.address().port);
});

require('./cron/index');

