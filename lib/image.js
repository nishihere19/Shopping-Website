var mongoose = require('mongoose')
Schema= require('mongoose').Schema
const validator= require('validator');

var ImageSchema = mongoose.Schema({
    imagename: String,
    uploadDate:{type: Date, default: Date.now}
});


var Image = mongoose.model('Image', ImageSchema);
module.exports = Image;