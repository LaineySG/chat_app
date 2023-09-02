const express = require('express');
const cookieparser = require('cookie-parser');
const app = express();
const User = require('./models/user.cjs');
const Message = require('./models/message.cjs');
const jsonwt = require('jsonwebtoken');
const cors = require('cors');
const websocket = require('ws')
const crypt = require('bcryptjs');
app.use(express.json());
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(cookieparser());
const fs = require('fs');

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

async function getUserDataFromReq(req) {
    return new Promise((resolve, reject) => {
        const login_talkie_cookie = req.cookies?.login_talkie_cookie;
        if (login_talkie_cookie) {
        jsonwt.verify(login_talkie_cookie, jsonwtkey, {}, (err, userData) => {
            if (err) throw err;
            resolve(userData);
        })

    } else {
        reject('No user cookie found.');
    }
});
}

app.get ('/test', (req,res) => {
    res.json('test success');
});

app.get ('/messages/:userId', async (req,res) => {
    const {userId} = req.params;
    const userData = await getUserDataFromReq(req);
    const thisUserId = userData.userId;
    const messages = await Message.find({
        sender:{$in:[userId, thisUserId]},
        recipient:{$in:[userId, thisUserId]},
    }).sort({createdAt:1});
    res.json(messages);
    /* userId: newuser._id, username,displayname, color */

});

app.get ('/users', async (req,res) => {
    const users = await User.find(
        {}, {'_id':1, displayname:1, color:1}
    )
    res.json(users);
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
        const newuser = await User.create({username,password:hashpass, displayname, color});
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
    const foundUser = await User.findOne({username});
    if (foundUser) {
        try {
        const updated = await User.updateOne(
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

app.post('/logout', async (req,res) => {
    res.cookie('login_talkie_cookie', '', {maxAge:1, sameSite:'none', secure:true}).status(201).json("ok");
});

app.post('/login', async (req,res) => {
    const {username, password, displayname, color} = req.body;
    try {
        const foundUser = await User.findOne({username});
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

    function sendOnlineUserList() {
        [...websocketserver.clients].forEach(client => {
            client.send(JSON.stringify({
                onlineUsers : [...websocketserver.clients].map(c => ({userId: c.userId, displayname: c.displayname, color: c.color})),
            }));
        });
    }

    connection.isAlive = true;
    connection.timer = setInterval(() => {
        connection.ping();
        connection.deathTimer = setTimeout(() => {
            connection.isAlive = false;
            connection.terminate();
            clearTimeout(connection.deathTimer);
            clearInterval(connection.timer);
            sendOnlineUserList();
            console.log('user dropped');
        }, 1000);
    }, 10000);

    connection.on('pong', () => {
        clearTimeout(connection.deathTimer);
    });

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
                connection.userId = userId;
                connection.displayname = displayname;
                connection.username = username;
                connection.color = color;
            });
        }
        }

    }

    websocketserver.on('close', data => {
        console.log('disconnect', data)
    });

    connection.on('message', async (message) => {
        const msg = JSON.parse(message.toString());
        const {recipient,content, file, sender, messageSentTime} = msg;
        let filename;
        if (file) {
            const parts = file.name.split('.');
            const ext = parts[parts.length-1];
            filename = Date.now() + '.' + ext;
            const filePath = __dirname + '/uploads/' + filename;
            const bufferData = new Buffer(file.data.split(',')[1], 'base64');
            fs.writeFile(filePath, bufferData, () => {
                console.log('file saved @ ' + filePath);
            });
        };

        if (recipient && sender && messageSentTime) {
        const messageReturn = await Message.create({
            recipient: recipient,
            sender:connection.userId,
            content: content,
            file: file ? filename : null,
            messageSentTime: messageSentTime,
        });
        console.log(messageReturn);
        console.log("message returned.");

         [...websocketserver.clients].filter(c => c.userId === recipient)
         .forEach(c => c.send(JSON.stringify({
                recipient,
                content,
                sender,
                file: file ? filename : null,
                _id: messageReturn._id,
                messageSentTime: messageSentTime,
            })));   
        }
    });
    
    sendOnlineUserList();

});
