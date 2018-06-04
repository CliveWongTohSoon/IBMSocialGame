const express = require('express');
const router = express.Router();

let cachedUser = {};
router.get('/', (req, res, next) => {
    // cachedUser = req.user;
    res.render('index');
});

router.get('/introduction', (req, res, next) => {
    cachedUser = req.user;
    res.render('index');
});

router.get('/getuser', (req, res, next) => {
    res.status(200).json({
        message: 'Successfully logged in',
        obj: cachedUser
    });
    cachedUser = {};
});

module.exports = router;
