import {useState, useContext} from 'react';
import axios from 'axios';
import { userContext } from './userContext';

export default function Register() {
    const [username, setUsername] = useState('');
    const [LoginOrRegister, setLoginOrRegister] = useState('login');
    const [password, setPassword] = useState('');
    const [displayname, setDisplayName] = useState('');
    const [color, setColor] = useState('');
    const {setUsername:SetLoggedInUsername, setId, setDisplayName:SetLoggedInDisplayname, setColor: setLoggedInColor} = useContext(userContext);



    function genColor(){
        let maxVal = 0xFFFFFF;
        let randNum = Math.random() * maxVal; 
        randNum = Math.floor(randNum);
        randNum = randNum.toString(16);
        let randColor = randNum.padStart(6, 0);   
        return `#${randColor.toUpperCase()}`
    }

    async function register(evt) {
        const color = genColor();
        setColor(String(color))
        evt.preventDefault();
        const {data} = await axios.post('/register', {username, password, displayname, color});
        SetLoggedInDisplayname(displayname);
        setLoggedInColor(color);
        SetLoggedInUsername(username);
        setId(data.id);
    }

    async function login(evt) {
        evt.preventDefault();
        const {data} = await axios.post('/login', {username, password, displayname, color});
        SetLoggedInDisplayname(displayname);
        setLoggedInColor(color);
        SetLoggedInUsername(username);
        setId(data.id);
        
    }

async function formSubmitted(evt) {
    evt.preventDefault();
    LoginOrRegister === 'register' ? register(evt) : login(evt);
}


    return (
        <div className = 'bg-dogwood h-screen flex items-center'>
        <form className="w-80 mx-auto mb-12" onSubmit={formSubmitted}>
        <img src="src/assets/talkie.png" className="mx-auto mb-20" />
            <input type="text" value={username} 
                onChange={ev => setUsername(ev.target.value)} 
                placeholder="username" 
                className="block w-full rounded-md p-2 mb-5 border-2 border-raspberry"/>
            <input type="text" value={password} 
                onChange={ev => setPassword(ev.target.value)} 
                placeholder="password" 
                className="block w-full rounded-md p-2 mb-5 border-2 border-raspberry"/>
            <input type="text" value={displayname} 
                onChange={ev => setDisplayName(ev.target.value)} 
                placeholder="display name" 
                className="block w-full rounded-md p-2 mb-5 border-2 border-raspberry"/>
            <button className="bg-raspberry text-white block w-full rounded-md p-2 border-2 border-burgundy" onClick = {() => setLoginOrRegister('login')}>Log In</button>
            <button className="bg-raspberry text-white block w-full rounded-md p-2 mt-5 border-2 border-burgundy" onClick = {() => setLoginOrRegister('register')}>Register</button>
        </form>

        </div>
    )
}