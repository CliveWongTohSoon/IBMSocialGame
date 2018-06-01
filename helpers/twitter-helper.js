const twitter = require('twitter');
const MAX_COUNT = 200;

const getTweetsFromTwitter = (user) =>
    new Promise((resolve, reject) => {
       if (!user || !user.credentials) {
           return reject(new Error('User credentials cannot be null'));
       }
       const twit = new twitter(user.credentials);
       let tweets = [];
       const params = {
           screen_name: user.userId,
           count: MAX_COUNT,
           exclude_replies: true,
           trim_user: true
       };

       const processTweets = (err, newTweets) => {
           // Check if newTweets is an error
           if (err) return reject(err);
           tweets = tweets.concat(newTweets.filter((tweet) => !tweet.retweeted));
           if (newTweets.length > 1) {
               params.max_id = newTweets[newTweets.length-1].id - 1;
               return twit.get('statuses/user_timeline', params, processTweets);
           } else {
               return resolve(tweets);
           }
       };

       twit.get('statuses/user_timeline', params, processTweets);
    });

exports.getTweets = getTweetsFromTwitter;
