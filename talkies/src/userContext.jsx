import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const userContext = createContext({});

export function UserContextProvider({children}) {
    const [username, setUsername] = useState(null);
    const [id, setId] = useState(null);
    const [displayname, setDisplayName] = useState(null);
    const [color, setColor] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    useEffect(() => {
       axios.get('/profile').then(response => {
        setId(response.data.userId);
        setUsername(response.data.username);
        setDisplayName(response.data.displayname);
        setColor(response.data.color);
        setColor(response.data.SelectedUserId);
       });
    }, []);

    return (
        <userContext.Provider value = {{username, setUsername, id, setId, displayname, setDisplayName,color, setColor, selectedUserId, setSelectedUserId}}>{children} </userContext.Provider>
    );
}