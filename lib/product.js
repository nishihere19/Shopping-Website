var mongoose = require('mongoose')
Schema= require('mongoose').Schema
const validator= require('validator');

var ProductSchema = mongoose.Schema({
    seller: String,
    name: String,
    category: String,
    stock: Number,
    sold: Number,
    buyers: [],
    wishlist:[],
    cart:[],
    price: Number,
    img:String,
    description: String,
    keywords: [],
    features: String,
    brand: String,
    modl: String,
    size: String,
    ratings: {type: Number, max: 10},
    color: String,
    uploadDate:{type: Date, default: Date.now}
});


var Products = mongoose.model('Products', ProductSchema);
module.exports = Products;