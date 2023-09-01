import { useEffect, useState } from "react"
import Avatar from "./avatar";
import ColorPicker, { getContext } from "./colorpicker";
import { userContext } from './userContext.jsx';
import { useContext } from 'react';

export default function chat() {
    const {username, id, displayname, color} = useContext(userContext);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [ws, setwebsocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState({});
    const [OnlineColors, setOnlineUserColors] = useState({});
    getContext();
    

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:4000');
        setwebsocket(ws);
        ws.addEventListener('message', handleMessage);
    }, []);

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
            showOnlineUsers(msgData.onlineUsers);
        }
    }

    function showAvatarColor(user, userId) {
        return <Avatar displayname={onlineUsers[userId]} userId={userId} color={OnlineColors[userId]} />
    }

    const onlineUsersOther = {...onlineUsers};
    delete onlineUsersOther[id];

    return (
        <div className="flex h-screen">
            <div className="bg-rose w-1/3 p-2 flex flex-col">
                <img src="src/assets/talkie.png" className="mx-auto mb-2" />
                <div className="border border-raspberry shadow shadow-xl rounded-md p-2 flex flex-col"><span className="text-center text-slate-50 font-bold text-lg">Friends</span>
                    {Object.keys(onlineUsersOther).map(userId => (
                        <div key={userId} onClick={() => setSelectedUserId(userId)} className={"p-2 m-1 rounded-md text-center text-white flex items-center gap-4 " + (userId === selectedUserId ? 'bg-burgundy' : 'bg-raspberry')}>

                        {showAvatarColor(onlineUsers[userId],userId)}
                        <span>{onlineUsers[userId]}</span>
                        </div>
                    ))}



                </div>
                

                <div key={id} className="p-2 mt-auto rounded-md text-center text-white flex items-center gap-4 bg-raspberry">
                    <ColorPicker/>
                    <span>{displayname}</span></div>

            </div>  
            <div className="bg-dogwood w-2/3 flex flex-col">
                <div className="flex-grow p-4"><p>[2023-08-30 05:45] <b> tsparkz: </b>Where is pinkie pie</p></div>
                <div className="bg-dogwood border p-3 border-burgundy rounded-md w-full flex">
                    <input type="text" className="bg-white border rounded-md border-burgundy p-5 flex-grow" placeholder="|"></input>
                    <button className="basis-1/12 border border-burgundy rounded-md m-3 p-5"><i className="fa-regular fa-paper-plane text-raspberry"></i></button>
                </div>
            </div>  
        </div>
    )
}