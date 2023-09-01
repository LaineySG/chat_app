const express = require('express');
const cookieparser = require('cookie-parser');
const app = express();
const user = require('./models/user.cjs');
const jsonwt = require('jsonwebtoken');
const cors = require('cors');
const websocket = require('ws')
const crypt = require('bcryptjs');
app.use(express.json());
app.use(cookieparser());

const mongoose = require('mongoose');

require('dotenv').config();
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
}));

const jsonwtkey = process.env.JWT_KEY;
const bcryptsalt = crypt.genSaltSync(10)
const mongooseurl = process.env.MONGO_URL;
mongoose.connect(mongooseurl);

app.get ('/test', (req,res) => {
    res.json('test success');
});

app.get ('/profile', (req, res) => {
    const login_talkie_cookie = req.cookies?.login_talkie_cookie;
    if (login_talkie_cookie) {
        
    jsonwt.verify(login_talkie_cookie, jsonwtkey, {}, (err, userData) => {
        if (err) throw err;
        res.json(
            userData
        );
    })
    
} else {
    res.status(418).json('no cookie found');
}
})

app.post('/register', async (req,res) => {
    const {username, password, displayname, color} = req.body;
    try {
        const hashpass = crypt.hashSync(password, bcryptsalt);
        const newuser = await user.create({username,password:hashpass, displayname, color});
        await jsonwt.sign({userId: newuser._id, username,displayname, color}, jsonwtkey, {},
    (err, login_talkie_cookie) => {
        if (err) throw err;
        res.cookie('login_talkie_cookie', login_talkie_cookie, {maxAge:2592000000, sameSite:'none', secure:true}).status(201).json({
            id: newuser._id,
            username: username,
            displayname: displayname,
            color: color,
    });
    });
}
    catch(err) {
        throw err;
    }
    
});


app.post('/updateaccount', async (req,res) => {
    const {username, displayname, color} = req.body;
    console.log(username);
    const foundUser = await user.findOne({username});
    console.log("founduser start:");
    console.log(foundUser);
    console.log("founduser stop");
    if (foundUser) {
        try {
        const updated = await user.updateOne(
            {username: String(foundUser.username)},
            { $set: {color:String(color)}},
        );
        await jsonwt.sign({userId: foundUser._id, username: foundUser.username, displayname: foundUser.displayname, color}, jsonwtkey, {},
            (err, login_talkie_cookie) => {
                if (err) throw err;
                res.cookie('login_talkie_cookie', login_talkie_cookie, {maxAge:2592000000, sameSite:'none', secure:true}).status(201).json({
                    id: foundUser._id,
                    username: username,
                    displayname: displayname,
                    color: color,
            });
            });
            
}
catch(err) {
    throw err;
}
          
};
});

app.post('/login', async (req,res) => {
    const {username, password, displayname, color} = req.body;
    try {
        const foundUser = await user.findOne({username});
        console.log("loginUserFound: ");
        console.log(foundUser);
        if (foundUser) {
            const passOk = crypt.compareSync(password,foundUser.password);
            if (passOk) {
                await jsonwt.sign({userId: foundUser._id, username: foundUser.username, displayname: foundUser.displayname, color: foundUser.color}, jsonwtkey, {},
                    (err, login_talkie_cookie) => {
                        if (err) throw err;
                        res.cookie('login_talkie_cookie', login_talkie_cookie, {maxAge:2592000000, sameSite:'none', secure:true}).status(201).json({
                            id: foundUser._id,
                            username: username,
                            displayname: foundUser.displayname,
                            color: foundUser.color,
                    });
                    });
            }
        } else {
            console.log("Username or Password incorrect.")
        }    
}
    catch(err) {
        throw err;
    }
    
});


const server = app.listen(4000);

/* create websocket server */
const websocketserver = new websocket.WebSocketServer({server});
websocketserver.on('connection', (connection, req) => {
    const cookies = req.headers.cookie;
    if (cookies) {
        /* cookies are separated by semicolons */
        const logincookiestring = cookies.split(';').find(str => str.startsWith('login_talkie_cookie='));
        if (logincookiestring) {
            const cookiedata = logincookiestring.split('=')[1]; /*removes data before = */
            
        if (cookiedata) {
            jsonwt.verify(cookiedata,jsonwtkey, {},  (err, userData) => {
                if (err) throw err
                const {userId, username, displayname, color} = userData;
                console.log(userData);
                connection.userId = userId;
                connection.displayname = displayname;
                connection.username = username;
                connection.color = color;
            });
        }
        }

    }
    [...websocketserver.clients].forEach(client => {
        client.send(JSON.stringify({
            onlineUsers : [...websocketserver.clients].map(c => ({userId: c.userId, displayname: c.displayname, color: c.color})),
        }));
    })
});
