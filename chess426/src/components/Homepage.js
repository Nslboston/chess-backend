import * as Chess from "../../node_modules/chess.js/chess"
import React, {useState, useEffect} from 'react';
import Chessboard from "chessboardjsx";
import axios from "axios";
import io from "socket.io-client";
import {socket} from "../variables/socket.js"

import '../App.css';

export default function Homepage() {
    return (
        <div className={"container"}>
            <div className={"columns"}>
                <div className={"column is-one-half-desktop is-centered"}>
                    <h1 className={"title is-3"}>Welcome to Chess426!</h1>
                    <p>You can use most of the features of this site without logging in. Use the top bar to view the leaderboard of the best online players,
                    and play chess against either yourself, an AI that makes random moves, or an AI that will almost certainly beat you every time.</p>
                    <br></br>
                    <p>Logging in allows you to access multiplayer games: Simply enter the multiplayer tab and start queuing to be matched using a "matchmaking system"
                        that matches you with the next person to start queuing. Don't expect your rating to have anything to do with the skill of your opponent.
                    Note that logging in and registering use the same form</p>
                    <br></br>
                    <p>This website uses an elo system to handle your ranking, so this isn't as bad as it seems; If you lose to a superior opponent, you will lose less points
                    than if you lose to an inferior one. This helps to reduce the impact of mismatched games on your overall rating, though wins and losses update the same way
                    regardless of the ranking of your opponent.</p>
                    <br></br>
                    <p>If you get stuck, try reloading the page. It usually fixes the problem.</p>
                    <br></br>
                    <p className={"title is-4"}>Libraries used:</p>
                    <b>Client Side:</b>
                    <div className={"container"}>
                        <ul className={""}>
                            <li>React</li>
                            <li>React-Router</li>
                            <li>Chess.js</li>
                            <li>Chessboard.jsx</li>
                            <li>Axios</li>
                            <li>Bulma</li>
                        </ul>
                    </div>
                    <br></br>
                    <b>Server Side:</b>
                    <div className={"container"}>
                        <ul className={""}>
                            <li>Node.js</li>
                            <li>Express.js</li>
                            <li>Express-session</li>
                            <li>Passport.js</li>
                            <li>Socket.io</li>
                            <li>MongoDB</li>
                        </ul>
                    </div>
                    <br></br>
                    <b>AJAX APIs:</b>
                    <br></br>
                    <a href={"https://github.com/albertputrapurnama/stockfish-api"}>Stockfish-API</a>



                </div>
            </div>
        </div>
    )
}