const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    shipId: {type: String, required: true},
    phase: {type: String, required: true}, // phase can be either start or end
    x: {type: Number, required: true},
    y: {type: Number, required: true},
    dir: {type: Number, required: true},


    reHealth: {type: Number, required: true},
    leHealth: {type: Number, required: true},
    lwHealth: {type: Number, required: true},
    rwHealth: {type: Number, required: true},
    // reAlive: {type: Boolean, required:true},
    // leAlive: {type: Boolean, required:true},
    // lwAlive: {type: Boolean, required:true},
    // rwAlive: {type: Boolean, required:true},
});

module.exports = mongoose.model('Start', schema);