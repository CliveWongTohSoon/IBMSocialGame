const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    shipId: {type: String, required: true},
    phase: {type: String, required: true} // phase can be either start or end
});

module.exports = mongoose.model('Start', schema);