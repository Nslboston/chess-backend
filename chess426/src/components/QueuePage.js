import React, {useState, useEffect} from 'react';
import Chessboard from "chessboardjsx";
import axios from "axios";
import io from "socket.io-client";
import {socket} from "../variables/socket.js"
//import {Center} from "chakra-ui";
import ChessboardHandler from "./ChessboardHandler";
import "../App.css"

export default function QueuePage({userInfo}) {
    const [info, setInfo] = useState({name: "Loading...", elo: 1000});
    const [disp, setDisp] = useState("");
    async function enterQueue() {
        let status = "";
        await socket.emit("queue", (response) => {
            if (response.status == "ok") {
                setDisp("queuing");
            } // ok
        });

    }
    async function exitQueue() {
        let status = "";
        await socket.emit("exit queue", (response) => {
            if (response.status == "ok") {
                setDisp("");
            } // ok
        });
    }
    useEffect(() => {
        socket.on("game start", (res) => {
            setInfo(res);
            setDisp("game");
        });
        return (() => {
          exitQueue().then();
        })
    }, [])
    //Response format: {side: "white" or "black", opponent: name and elo}
    if (!userInfo.loggedIn) {
        return (
            <p>Not logged in!</p>
        )
    }
    else if (disp == "") {
        return (
                <div className={"container"}>
                    <div className={"columns is-centered"}>
                        <div className={"column is-narrow"}>
                            <button onClick = {enterQueue} className={"button center"}>Start queueing</button>
                        </div>
                    </div>
                    <p className={"center"}>You may need to reload for this button to work.</p>
                </div>
        )
    }
    else if (disp == "queuing") {
        return (
            <div className={"container"}>
                <div className={"columns is-centered"}>
                    <div className={"column is-narrow"}>
                        <button onClick = {exitQueue} className={"button"}>Stop queueing</button>
                    </div>
                </div>
            </div>

        )
    }
    else if (disp == "game") {
        return (
            <ChessboardHandler opponent={`${info.name} (${info.elo})`} side = {info.side} userInfo={userInfo} gameInfo={{id: info.id, time: info.time}}/>
        );
    }
    else {
        return (
            <p>You shouldn't see this</p>
        )
    }
}