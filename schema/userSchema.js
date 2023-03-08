const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const roles = require('../helper/roles')

const UserSchema = new Schema({
email: {
    type: String,
    required: true,
    trim: true
},
password: {
    type: String,
    required: true
},
name: {
    type: String,
    required: true  
},
role: {
    type: String,
    default: roles.customer,
    enum: [roles.customer, roles.admin]
}
});

const userSchema = mongoose.model('user', UserSchema);

module.exports = userSchema;