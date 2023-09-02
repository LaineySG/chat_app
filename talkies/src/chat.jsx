import { useEffect, useRef, useState } from "react"
import Avatar from "./avatar";
import ColorPicker, { getContext } from "./colorpicker";
import { userContext } from './userContext.jsx';
import { useContext } from 'react';
import React from 'react';
import ReactDOM from 'react-dom';
import { uniqBy } from "lodash";
import Parser from 'html-react-parser'
import axios from "axios";
import bbCodeParser from "../api/bbcodeParser.cjs";
import Contact from "./contact";

export default function chat() {
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [ws, setwebsocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState({});
    const [OnlineColors, setOnlineUserColors] = useState({});
    const [offlineUsers, setOfflineUsers] = useState({});
    const [newMsgText, setNewMsgText] = useState('');
    const [messageList, setMessageList] = useState([]);
    const messagescrollbox = useRef();
    const messageForm = useRef();
    const {username, setUsername, id, setId, displayname, setDisplayName, color, setColor} = useContext(userContext);
    getContext();
    


    useEffect(() => {
        connectToWs();
    }, []);

    function connectToWs() {
        const ws = new WebSocket('ws://localhost:4000');
        setwebsocket(ws);
        ws.addEventListener('message', handleMessage);
        ws.addEventListener('close', () => connectToWs());

    }

    function showOnlineUsers(userlist) {
        const users = {};
        const colors = {};
        userlist.forEach(({userId,displayname,color}) => {
            users[userId] = displayname;
            colors[userId] = color;
        });
        setOnlineUsers(users);
        setOnlineUserColors(colors);
    }

    function handleMessage(evt) {
        
        const msgData = JSON.parse(evt.data);
        if ('onlineUsers' in msgData) {
            console.log("connection reset")
            showOnlineUsers(msgData.onlineUsers);
        } 
        console.log(selectedUserId);
        if ('content' in msgData) {
           if (msgData.sender === selectedUserId) {
                setMessageList(prev => ([...prev, {...msgData}]));
            } else {
                console.log("sender" + msgData.sender)
                console.log("selected" + selectedUserId)
            }
;        }
    }

    
    function logout(evt) {
        axios.post('/logout').then(() => {
            setId(null);
            setwebsocket(null);
            setUsername(null);
            setDisplayName(null);
            setColor(null);
        });
    }
    
    function sendMsg(evt, file = null) {
        if (evt) {
            evt.preventDefault();
        }
        const recipient = selectedUserId;
        const contentPreBBCode = newMsgText;
        const content = bbCodeParser(contentPreBBCode);
        const sender = id;
        const _id = Date.now();
        var today = new Date();
        const messageSentTime = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate() + " " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        ws.send(JSON.stringify({
                recipient,
                content,
                sender,
                _id,
                file,
                messageSentTime,
            }));
        setNewMsgText(''); /* clear message */

        if (file) {
            axios.get('/messages/' + selectedUserId).then( res => {
                setMessageList(res.data);
        });} else {
            setMessageList(prev => ([...prev, {recipient, content, sender, _id, messageSentTime}]));
        }
        

    }

    function sendFile(evt) {
        const reader = new FileReader();
        reader.readAsDataURL(evt.target.files[0]); /* returns b64 data */
        reader.onload = () => {
            sendMsg(null, {
                name: evt.target.files[0].name,
                data: reader.result,
            });
        };

    }

    useEffect(() => {
    const div = messagescrollbox.current;
    if (div) {
        div.scrollTop = div.scrollHeight;
    }
    }, [messageList]);

    useEffect(() => {
        axios.get('/users').then(res => {
            const offlineUserArray = res.data.filter(p => p._id !== id).filter(p => !Object.keys(onlineUsers).includes(p._id));
            const offlineUsersDict = {};
            offlineUserArray.forEach(p => {
                offlineUsersDict[p._id] = p;
            });
            setOfflineUsers(offlineUsersDict);
        });
        }, [onlineUsers]);

    useEffect(() => {
        console.log(selectedUserId);
        if (selectedUserId) {
            axios.get('/messages/' + selectedUserId).then( res => {
                setMessageList(res.data);
            }
            )
        }
    },[selectedUserId]); /* when selected user changed */

    function processkeypress(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13) { //Enter keycode
        const msgform = messageForm.current;
        sendMsg();
    }
    }

    const onlineUsersOther = {...onlineUsers};
    delete onlineUsersOther[id];
    const messageListNoDuplicates = uniqBy(messageList, '_id')

    return (
        <div className="flex h-screen">
            <div className="bg-rose w-1/3 p-2 flex flex-col">
                <img src="src/assets/talkie.png" className="mx-auto mb-2" />

                <div className="border border-raspberry shadow shadow-xl rounded-md p-2 flex flex-col"><span className="text-center text-slate-50 font-bold text-lg">Friends</span>

                { Object.keys(onlineUsersOther).map(userId => (
                    <Contact userId={userId} 
                    offlineUsers={offlineUsers} 
                    onlineUsers={onlineUsers} 
                    selectedUserId={selectedUserId} 
                    key={userId}
                    OnlineColors={OnlineColors}
                    status='online'
                    onClick={()=> setSelectedUserId(userId)}/>
                ))}
                { Object.keys(offlineUsers).map(userId => (
                    <Contact userId={userId} 
                    offlineUsers={offlineUsers} 
                    onlineUsers={onlineUsers} 
                    key={userId}
                    OnlineColors={OnlineColors}
                    selectedUserId={selectedUserId} 
                    status='offline'
                    onClick={()=> setSelectedUserId(userId)}/>
                ))}


                </div>
                

                <div key={id} className="p-2 mt-auto rounded-md text-center text-white flex items-center gap-4 bg-raspberry">
                    <ColorPicker/>
                    <span>{displayname}</span>
                    <button className="p-2 ml-auto rounded-md text-center text-white border border-burgundy" onClick={logout}>Log Out</button>
                </div>

            </div>  
            <div className="bg-dogwood w-2/3 flex flex-col">

            <div className="flex flex-grow pl-5 pt-5 pr-0 pb-2 h-full">
                
                
                {!!selectedUserId && (<div className="text-raspberry ">Please select a user to see chat history.</div>)}
                
                {!!selectedUserId && (
                    <div className="relative h-full w-full"> 
                    <div ref={messagescrollbox} className="overflow-y-auto absolute inset-0">
                    {messageListNoDuplicates.map( msgData => (
                        <div key={msgData._id}>
                        <span>
                            <b style={{color:OnlineColors[msgData.sender]}}>{onlineUsers[msgData.sender]} </b>
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-sm italic">{"[" + msgData.messageSentTime + "]"} </span><br/>
                            <span className="break-words">{Parser(msgData.content)}
                            {msgData.file && (<React.Fragment>
                                <img src={axios.defaults.baseURL + "/uploads/" + String(msgData.file)}></img>
                            </React.Fragment>)}</span>
                        </span>
                        </div>
                    ))}
                    </div></div>
                    
                
                )
                }
            </div>
            <div>
                {!!selectedUserId && (

                <form ref={messageForm} className="flex-grow mt-auto p-1" onSubmit={sendMsg}>
                <div className="bg-dogwood border p-2 border-burgundy rounded-md w-full flex">
                    <textarea type="text" id="txt" cols="40" rows="5" onKeyPress={processkeypress} className="bg-white border rounded-md border-burgundy p5 flex-grow overflow-x-auto break-all" value={newMsgText} onChange={evt => setNewMsgText(evt.target.value)}></textarea>
                    <div className="flex-col flex justify-center">
                        <label className="p-1 border rounded-md border-burgundy cursor-pointer mb-auto ml-3">
                            <input type="file" className="hidden" onChange={sendFile}></input>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#b6465f" className="w-6 h-6 m-auto">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                            </svg>
                        </label>
                        <button className="p-1 border rounded-md border-burgundy mb-auto ml-3">

                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#b6465f" className="w-5 h-5 m-auto">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                        </button>
                        <button className="p-1 border rounded-md border-burgundy mb-auto ml-3">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#b6465f" className="w-5 h-5 m-auto">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                        </button>
                    </div>
                        <button type="submit" className="basis-1/12 border border-burgundy rounded-md m-5 p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#b6465f" className="w-10 h-10 m-auto">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>


                    </button>

                </div>
                
                </form>
                )}
                </div>
            </div>  
        </div>
    )
}