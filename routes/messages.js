const express = require('express');
const router = express.Router();

const Message = require('../models/message');

router.get('/', (req, res, next) => {
   Message.find()
       .exec((err, messages) => {
           if (err) {
               return res.status(500).json({
                   title: 'An error occurred',
                   error: err
               });
           }
           res.status(200).json({
               message: 'Success',
               obj: messages
           });
       });
});

router.post('/', (req, res, next) => {
   const message = new Message({
       content: req.body.content
    });

   message.save((err, result) => {
      if (err) {
          return res.status(500).json({
              title: 'An error occurred',
              error: err
          });
      }
      res.status(201).json({
         message: 'Saved message',
         obj: result
      });
   });
});

router.patch('/:id', (req, res, next) => {
   Message.findById(req.params.id, (err, message) => {
      if (err) {
          return res.status(500).json({
              title: 'An error occured',
              error: err
          });
      }
      if (!message) {
          return res.status(500).json({
              title: 'No Message Found!',
              error: {message: 'Message not found'}
          });
      }
      message.content = req.body.content;
      message.save(err, result => {
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

router.delete('/:id', (req, res, next) => {
    Message.findById(req.params.id, (err, message) => {
        if (err) {
            return res.status(500).json({
                title: 'An error occured',
                error: err
            });
        }
        if (!message) {
            return res.status(500).json({
                title: 'No Message Found!',
                error: {message: 'Message not found'}
            });
        }
        message.remove(err, result => {
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            res.status(200).json({
                message: 'Deleted message',
                obj: result
            });
        });
    });
});

module.exports = router;