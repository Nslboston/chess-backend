import React, {useState, useEffect} from 'react';
import Chessboard from "chessboardjsx";
import axios from "axios";
import io from "socket.io-client";
import {socket} from "../variables/socket.js"
import {domain} from "../variables/domain";

export default function ProfilePage() {
    const [profile, setProfile] = useState({});
    let getProfile = async function() {
        console.log("Finding profile");
        try {
            const result = await axios({
                method: "get",
                url: `${domain}/api/auth/profile`,
                withCredentials: true
            });
            if (result.data != undefined) {
                setProfile(result.data);
            }
            console.log(result.data)
        }
        catch(err) {
            console.log(err);
        }
    }
    useEffect(() => {
        getProfile().then();
    }, []);
    if (profile != undefined && JSON.stringify(profile) != "{}" && JSON.stringify(profile) != "\"\"") {
        console.log(JSON.stringify(profile));
        console.log("This is ")
        return (
            <div className={"centered"}>
                <p className={"title is-3"}>{profile.username}</p>
                <p className={"title is-5"}>{`Record: ${profile.stats.wins}-${profile.stats.losses}-${profile.stats.draws}`}</p>
                <p className={"title is-5"}>{`Elo: ${profile.stats.elo}`}</p>
            </div>

        );
    }
    else {
        return (
            <p></p>
        )
    }

}