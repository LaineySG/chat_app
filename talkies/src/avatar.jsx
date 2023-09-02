import { useEffect } from "react"

export default function Avatar({userId,displayname, color,status}) {

    if (displayname === "tsparkz1") {
        return (
        <img src="src/assets/ts_pfp.png" className="w-10 h-10 rounded-full" />
        )
    } else if (displayname == "rainbow_dashiez1") {
        return (
        <img src="src/assets/rbd_pfp.png" className="w-10 h-10 rounded-full" />
        )
    } else {
        return (
            <div key = {userId} className={"w-10 h-10 relative rounded-full flex items-center"} style={{backgroundColor: color,}}>
                <span className="absolute text-center w-full font-bold">{displayname[0].toLowerCase()}</span>
                {status==='online' && (
                <div className={"w-4 h-4 absolute rounded-full flex items-center bottom-0 right-0 bg-green-500 border border-green-700"}></div>
                )
                }
            </div>
        )

    }
}