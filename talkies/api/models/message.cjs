const mongoose = require('mongoose');
const msgSchema = new mongoose.Schema({
    recipient: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    content: String,
    messageSentTime: String,
    file: String,
}, {
    timestamps: true
});

const msgModel = mongoose.model('message', msgSchema);
module.exports = msgModel;