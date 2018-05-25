const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    shipId: {type: String},
    phase: {type: String, required: true}, // phase can be either action or report
    instruction0: {type: String, required: true},
    instruction1: {type: String, required: true},
    instruction2: {type: String, required: true}
});

module.exports = mongoose.model('Instruction', schema);