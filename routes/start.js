const express = require('express');
const router = express.Router();

const Start = require('../models/start');

// get all instruction
router.get('/', (req, res, next) => {
    Start.find() // Find all
        .exec((err, start) => {
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            res.status(200).json({
                message: 'Success',
                obj: start
            });
        });
});

module.exports = router;