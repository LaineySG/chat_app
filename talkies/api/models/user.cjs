const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: {type: String, unique: true},
    password: String,
    displayname: String,
    userID: {type:Number, unique: true},
}, {
    timestamps: true
});

const userModel = mongoose.model('user', userSchema);
module.exports = userModel;