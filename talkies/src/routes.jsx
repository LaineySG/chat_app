import { useContext } from 'react';
import Register from './LoginAndRegister.jsx'
import Chat from './chat.jsx'
import { userContext } from './userContext.jsx';


export default function Routes() {
    const {username, id, displayname, color} = useContext(userContext);
    if (displayname) {
        return (<Chat/>)
    }
    return (
        <Register/>
    );
}