const express = require('express');
const router = express.Router();

const Instruction = require('../models/instruction');

// get all instruction
router.get('/', (req, res, next) => {
    Instruction.find()
        .exec((err, instruction) => {
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            res.status(200).json({
                message: 'Success',
                obj: instruction
            });
        });
});

router.patch('/:id', (req, res, next) => {
    Instruction.findOne({shipId: req.params.id}, (err, instruction) => {
        if (err) {
            return res.status(500).json({
                title: 'An error occured',
                error: err
            });
        }
        if (!instruction) {
            return res.status(500).json({
                title: 'No Instruction Found!',
                error: {message: 'Instruction not found'}
            });
        }
        instruction.instruction0 = req.body.instruction0;
        instruction.instruction1 = req.body.instruction1;
        instruction.instruction2 = req.body.instruction2;
        instruction.phase = req.body.phase;

        instruction.save(err, result => {
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            res.status(201).json({
                message: 'Updated message',
                obj: result
            });
        });
    });
});
//
// router.delete('/:id', (req, res, next) => {
//     Message.findById(req.params.id, (err, message) => {
//         if (err) {
//             return res.status(500).json({
//                 title: 'An error occured',
//                 error: err
//             });
//         }
//         if (!message) {
//             return res.status(500).json({
//                 title: 'No Message Found!',
//                 error: {message: 'Message not found'}
//             });
//         }
//         message.remove(err, result => {
//             if (err) {
//                 return res.status(500).json({
//                     title: 'An error occurred',
//                     error: err
//                 });
//             }
//             res.status(200).json({
//                 message: 'Deleted message',
//                 obj: result
//             });
//         });
//     });
// });

module.exports = router;