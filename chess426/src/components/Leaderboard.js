import * as Chess from "../../node_modules/chess.js/chess"
import React, {useState, useEffect} from 'react';
import Chessboard from "chessboardjsx";
import axios from "axios";
//import "../node_modules/bulma/css/bulma.css"
import {domain} from "../variables/domain";

export default function Leaderboard() {
    const [leaders, setLeaders] = useState([]);
    let getLeaders = async function() {
        try {
            const result = await axios({
                method: "get",
                url: `${domain}/leaderboardGet`,
                withCredentials: true
            });
            if (result.data != undefined) {
                setLeaders(result.data);
            }
        }
        catch(err) {
            console.log(err);
        }
    }
    useEffect(() => {
        getLeaders().then();
    }, [])
    return (
        <div className={"container"}>
            <div className={"columns is-centered"}>
                <div className={"column is-narrow"}>
                    <div className={"center"}>
                        <table className={"table center"}>
                            <thead>
                            <tr>
                                <th><abbr title={"Position"}>Pos</abbr></th>
                                <th>Username</th>
                                <th>Elo</th>
                                <th>Wins</th>
                                <th>Losses</th>
                                <th>Draws</th>
                            </tr>
                            {leaders.sort(function(a, b) {
                                return b.elo - a.elo;
                            }).map((user, index) => (
                                <tr key={user.username}>
                                    <th>{index+1}</th>
                                    <td>{user.username}</td>
                                    <td>{user.elo}</td>
                                    <td>{user.wins}</td>
                                    <td>{user.losses}</td>
                                    <td>{user.draws}</td>
                                </tr>
                            ))}
                            </thead>
                        </table>
                    </div>
                </div>
            </div>
        </div>


    )

}