const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: {type: String, unique: true},
    password: String,
    displayname: String,
    color: String, /* Hex code */
}, {
    timestamps: true
});

const userModel = mongoose.model('user', userSchema);
module.exports = userModel;