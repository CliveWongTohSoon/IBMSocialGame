const PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3');
const watsonCredentials = require('../config/config');

const personalityInsights = new PersonalityInsightsV3({
    // If unspecified here, the PERSONALITY_INSIGHTS_USERNAME and
    // PERSONALITY_INSIGHTS_PASSWORD env properties will be checked
    // After that, the SDK will fall back to the bluemix-provided
    // VCAP_SERVICES environment property
    username: watsonCredentials.personalityInsightsUsername,
    password: watsonCredentials.personalityInsightsPassword,
    version_date: '2017-10-13'
});

const parentId = function(tweet) {
    if (tweet.in_reply_to_screen_name != null) {
        return tweet.in_reply_to_user_id;
    } else if (tweet.retweeted && (tweet.current_user_retweet != null)) {
        return tweet.current_user_retweet.id_str;
    }
};

const toContentItem = (tweet) => {
    return {
        id: tweet.id_str,
        language: tweet.lang,
        contenttype: 'text/plain',
        content: tweet.text.replace('[^(\\x20-\\x7F)]*',''),
        created: Date.parse(tweet.created_at),
        reply: tweet.in_reply_to_screen_name != null,
        parentid: parentId(tweet)
    };
};

const getProfile = (params) =>
    new Promise((resolve, reject) => {
        if (params.language) {
            params.headers = {
                'Content-Language': params.language,
            };
        }
        return personalityInsights.profile(params, (err, profile) => {
            if (err) {
                reject(err);
            } else {
                resolve(profile);
            }
        });
    });

const profileFromTweets = (params) => (tweets) => {
    params.content_items = tweets.map(toContentItem);
    return getProfile(params);
};

module.exports = {
    profileFromText: getProfile,
    profileFromTweets,
};