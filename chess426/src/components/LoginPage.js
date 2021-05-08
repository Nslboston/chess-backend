import React, {useState, useEffect} from 'react';
import Chessboard from "chessboardjsx";
import axios from "axios";
import io from "socket.io-client";
import "../App.css";
import {domain} from "../variables/domain";

export default function LoginPage({info, setInfo}) {
    //testAcc has password abcde
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    function onUserChange(event) {
        setUsername(event.target.value);
    }
    function onPasswordChange(event) {
        setPassword(event.target.value);
    }
    async function sendLoginRequest() {
        try {
            const result = await axios({
                method: "post",
                url: `${domain}/api/auth/register_login`,
                data: {
                    username: username,
                    password: password
                },
                withCredentials: true
            });
            console.log(result);
            setInfo({loggedIn: true, username: username})
            setUsername("");
            setPassword("");
            // eslint-disable-next-line no-restricted-globals
            //location.reload();
        }
        catch (e) {
            console.log(e);
        }

    }
    if (!info.loggedIn) {
        return (
            <div className={"container"}>
                <div className={"columns"}>
                    <div className={"column is-narrow-desktop is-centered"}>
                        <div className={"field"}>
                            <input type={"text"} className = {"input"} placeholder={"Username"} onChange={onUserChange} value={username}/>
                            <input type={"password"} className={"input"} placeholder={"Password"} onChange={onPasswordChange} value={password}/>
                            <button onClick={sendLoginRequest} className={"button"}>Login</button>
                        </div>
                    </div>
                </div>
            </div>


        )
    }
    else {
        return (
            <p className={"center"}>You have successfully logged in as {info.username}</p>
        )
    }

}