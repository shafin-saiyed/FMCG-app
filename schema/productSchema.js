const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
userid: {
    type: mongoose.Schema.ObjectId,
    required: true
},
product_name: {
    type: String,
    required: true
},
product_category_id: {
    type: mongoose.Schema.ObjectId,
    required: true  
},
product_price: {
    type: Number,
    default:0,
    required: true,
},
product_quantity: {
    type: Number,
    default:1,
}
});

const productSchema = mongoose.model('product', ProductSchema);

module.exports = productSchema;