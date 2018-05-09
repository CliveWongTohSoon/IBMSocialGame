const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    user: {type: Schema.Types.ObjectId},
    instruction0: {type: String, required: true},
    instruction1: {type: String, required: true},
    instruction2: {type: String, required: true},
    content: {type: String, required: true}
});

module.exports = mongoose.model('Game', schema);