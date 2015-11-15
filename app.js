var express = require('express');
var passport = require('passport');
var TwitterStrategy = require('passport-twitter');
var config = require('./config.js');

var app = express();

app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new TwitterStrategy({
    consumerKey: config.TWITTER_CONSUMER_KEY,
    consumerSecret: config.TWITTER_CONSUMER_SECRET,
    callbackURL: "http://127.0.0.1:8080/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    var user = UserStore.findUser(profile.id);

    if (!user) {
      user = {
        twitterId: profile.id,
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

app.get('/', function(req, res) {
  res.send(req.user);
});

app.listen(8080, function() {
  console.log('Server listening on port: ' + this.address().port);
});
