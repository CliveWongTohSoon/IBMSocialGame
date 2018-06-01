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

router.post('/init', (req, res, next) => {
    const battleShipdata = req.body;
    console.log(battleShipdata);
    Start.findOne({shipId: battleShipdata.shipId}, (err, ship) => {
        ship.x = battleShipdata.x;
        ship.y = battleShipdata.y;
        ship.dir = battleShipdata.dir;
        ship.reHealth = battleShipdata.totalHp;
        ship.leHealth = battleShipdata.totalHp;
        ship.rwHealth = battleShipdata.totalHp;
        ship.lwHealth = battleShipdata.totalHp;
        ship.reAlive = true;
        ship.leAlive = true;
        ship.lwAlive = true;
        ship.rwAlive = true;
        ship.phase = 'start';
        ship.save(err, _ => {
            if (err) return res.status(500).json({title: 'An error occurred', error: err});
            return res.status(200).json({message: 'Success'});
        });
    });
});

module.exports = router;