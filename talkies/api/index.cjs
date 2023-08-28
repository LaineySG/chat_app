const express = require('express');
const app = express();
const user = require('./models/user.cjs');
const jsonwt = require('jsonwebtoken');
const cors = require('cors');
app.use(express.json());

const mongoose = require('mongoose');

require('dotenv').config();
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
}));

const jsonwtkey = process.env.JWT_KEY;
const mongooseurl = process.env.MONGO_URL;
mongoose.connect(mongooseurl);

app.get ('/test', (req,res) => {
    res.json('test success');
});

app.post('/register', async (req,res) => {
    const {username, password, displayname} = req.body;
    try {
    const newuser = await user.create({username,password, displayname});
    await jsonwt.sign({userId: newuser._id}, jsonwtkey, {},
    (err, token) => {
        if (err) throw err;
        res.cookie('token', token).status(201).json('ok');
    });
    }
    catch(err) {
        throw err;
    }
    
});

app.listen(4000);