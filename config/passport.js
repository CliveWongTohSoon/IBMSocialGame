const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const cfenv = require('cfenv');
const appEnv = cfenv.getAppEnv();

const callbackURL = process.env.CF_APP_URL || (appEnv.isLocal ? 'http://localhost:3000' : appEnv.url);

const strategyOptions = {
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: `${callbackURL}/auth/twitter/callback`
};

const strategy = new TwitterStrategy(strategyOptions, (token, tokenSecret, profile, done) => {
    const photo = profile.photos ? profile.photos[0] : undefined;
    const userProfile = {
        handle: profile.username,
        image: photo ? photo.value.replace('_normal', '_400x400') : undefined
    };

    done(null, {
        credentials: {
            consumer_key: process.env.TWITTER_CONSUMER_KEY,
            consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
            access_token_key: token,
            access_token_secret: tokenSecret
        },
        profile: userProfile
    });
});

module.exports = (app) => {
    passport.use(strategy);
    passport.serializeUser((user, next)  => next(null, user));
    passport.deserializeUser((obj, next) => next(null, obj));

    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions
};