import Avatar from "./avatar"

export default function Contact({userId, offlineUsers, onlineUsers, selectedUserId, onClick, status, OnlineColors}) {
    function showAvatarColor(user, userId, status,onlineUsers,offlineUsers) {
        if (status === 'online') {
            return <Avatar status={status} displayname={onlineUsers[userId]} userId={userId} color={OnlineColors[userId]} />
        } else {
            return <Avatar status={status} displayname={offlineUsers[userId].displayname} userId={userId} color={offlineUsers[userId].color} />
        }
    }

        if (status === 'online') {
            return (
                <div key={userId} onClick={() => onClick(userId)} className={"p-2 m-1 rounded-md text-center text-white flex items-center gap-4 " + (userId === selectedUserId ? 'bg-burgundy font-bold' : 'bg-raspberry')}>
        
                {showAvatarColor(onlineUsers[userId],userId,status, onlineUsers,offlineUsers)}
                <span>{onlineUsers[userId]}</span>
                </div>

                )
        } else {
            return(
            <div key={userId} onClick={() => onClick(userId)} className={"p-2 m-1 rounded-md text-center text-white flex items-center gap-4 " + (userId === selectedUserId ? 'bg-burgundy font-bold' : 'bg-raspberry')}>
    
            {showAvatarColor(offlineUsers[userId].displayname,userId,status,onlineUsers,offlineUsers)}
            <span>{offlineUsers[userId].displayname}</span>
            </div>
            )
        }

}