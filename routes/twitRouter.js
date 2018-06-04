const express = require('express');
const router = express.Router();
const passport = require('passport');
const twitterHelper = require('../helpers/twitter-helper');
const personalityHelper = require('../helpers/personality-insights-helper');
const profileFromTweets = personalityHelper.profileFromTweets;

// personality profile from tweets
router.post('/api/profile/twitter', (req, res, next) => {
    // console.log(req.body);
    // console.log(req.body.userId);

    if (!req.body.userId) {
        return next({ code: 400, error: 'Missing required parameters: userId' });
    }

    const user = {
        credentials : req.body.credentials,
        userId: req.body.userId,
    };

    return twitterHelper.getTweets(user)
        .then(profileFromTweets(req.body))
        .then(res.json.bind(res))
        .catch(next);
});

// twitter oauth
router.get('/auth/twitter', passport.authenticate('twitter'));
router.get('/auth/twitter/callback', passport.authenticate('twitter', {
    failureRedirect: '/#error',
    successRedirect: '/introduction'
}));

module.exports = router;