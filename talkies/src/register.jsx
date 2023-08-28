import {useState} from 'react';

export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    return (
        <div className = 'bg-dogwood h-screen flex items-center'>
        <form className="w-80 mx-auto mb-12">
            <input type="text" value={username} 
                onChange={ev => setUsername(ev.target.value)} 
                placeholder="username" 
                className="block w-full rounded-md p-2 mb-5 border-2 border-raspberry"/>
            <input type="text" value={password} 
                onChange={ev => setPassword(ev.target.value)} 
                placeholder="password" 
                className="block w-full rounded-md p-2 mb-5 border-2 border-raspberry"/>
            <button className="bg-raspberry text-white block w-full rounded-md p-2 border-2 border-burgundy">Register</button>
        </form>

        </div>
    )
}