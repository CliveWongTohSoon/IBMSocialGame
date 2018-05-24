const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    shipId: {type: String, required: true},
    phase: {type: String, required: true}, // phase can be either start or end
    x: {type: Number, required: true},
    y: {type: Number, required: true},
    dir: {type: Number, required: true},
    // TODO:- Add Data key on mongo db manually first
});

module.exports = mongoose.model('Start', schema);