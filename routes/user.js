const express = require('express');
const router = express.Router();
const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

router.post('/', (req, res, next) => {
    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: bycrypt.hashSync(req.body.password, 10),
        email: req.body.email
    });
    user.save((err, result) => {
       if (err) {
           return res.status(500).json({
              title: 'An error occured',
              error: err
           });
       }
       res.status(201).json({
           message: 'User created',
           obj: result
       });
    });
});

router.post('/signin', (req, res, next) => {
    User.findOne({email: req.body.email}, (err, user) => {
        if (err) {
            return res.status(500).json({
                title: 'An error occured',
                error: err
            })
        }
        if (!user) {
            return res.status(401).json({
               title: 'Login failed',
               error: {message: 'Invalid login credentials'}
            });
        }
        if (!bycrypt.compareSync(req.body.password, user.password)) {
            return res.status(401).json({
                title: 'Login failed',
                error: {message: 'Invalid login credentials'}
            });
        }
        const token = jwt.sign({user: user}, 'secret', {expiresIn: 7200});
        res.status(200).json({
            message: 'Successfully logged in',
            token: token,
            userId: user._id
        });
    });
});

module.exports = router;
