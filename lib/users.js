var mongoose = require('mongoose')
Schema= require('mongoose').Schema
const validator= require('validator');

var UsersSchema = mongoose.Schema({
    username : {type: String, index: true, unique: true},
    email: String,
	password : String,
    type: String,
    cart:[],
    products:[],
    products_bought: [],
    wishlist:[],
	lastlogin : {type: Date, default : Date.now}
});


var Users = mongoose.model('Users', UsersSchema);
module.exports = Users;