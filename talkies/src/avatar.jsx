import { useEffect } from "react"

export default function Avatar({userId,displayname, color}) {

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
            <div className={"w-10 h-10 rounded-full flex items-center"} style={{backgroundColor: color,}}>
                <span className="text-center w-full font-bold">{displayname[0]}</span>
            </div>
        )

    }
}