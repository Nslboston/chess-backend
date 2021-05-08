import * as Chess from "../../node_modules/chess.js/chess"
import React, {useState, useEffect} from 'react';
import Chessboard from "chessboardjsx";
import axios from "axios";
import io from "socket.io-client";
import {socket} from "../variables/socket.js"
import {domain} from "../variables/domain";
//Server sends game info with game id to send back,
export default function ChessboardHandler({opponent, side, userInfo, gameInfo}) {
    let onlineGame = (opponent) => (opponent != "AI (3000)" && opponent != "Random (0)" && opponent != "");

    const [board, setBoard] = useState("start");
    let [game, setGame] = useState(new Chess());
    let [time, setTime] = useState({white: (1000*60*5), black: (1000*60*5)});
    let [endMessage, setEndMessage] = useState("")
    let prevTime;
    //let [squareStyle, setSquareStyle] = useState({});
    let callServer = async function() {
        try {
            const result = await axios({
                method: "get",
                url: `${domain}/api`
            })
            //console.log(result.data.message);
        }
        catch (err) {
            console.log(`The error is ${err}`);
        }
    }

    useEffect(() => {
        //callServer().then();
        //goAgain();
        //Don't mess with the server if the opponent is not another player

        if (onlineGame(opponent)) {
            let interval = setInterval(() => {updateTime()}, 100);
            prevTime = Date.now();
            //Res has {pgn, whiteTime, blackTime}
            socket.on("chess response", (res) => {
                let newGame = new Chess();
                newGame.load_pgn(res.pgn);
                time = {white: res.whiteTime, black: res.blackTime};
                setTime({white: res.whiteTime, black: res.blackTime});
                setBoard(newGame.fen())
                game = newGame;
                setGame(newGame);
                if (game.in_check()) {
                    let nextMove = (myMove()) ? "You are" : `${opponent} is`;
                    endMessage = endMessage.concat(`${nextMove} in check!\n`)
                    setEndMessage(endMessage)
                }
                else {
                    endMessage = "";
                    setEndMessage("");
                }
            })
            socket.on("game over", (msg) => {
                clearInterval(interval);
                setTimeout(() => {
                    if (msg.winner == "draw") {
                        //alert("Draw! No one wins!")
                        endMessage = endMessage.concat("Draw! No one wins!")
                        setEndMessage(endMessage);
                    }
                    else {
                        //alert(`Game Over! ${msg.winner} wins!`);
                        endMessage = endMessage.concat(`Game Over! ${msg.winner} wins!`)
                        setEndMessage(endMessage);
                    }
                }, 100);

            });
            socket.on("elo message", (msg) => {
                setTimeout(() => {
                    endMessage = endMessage.concat(`\n${msg.winner.username} now has elo ${msg.winner.elo} and ${msg.loser.username} now has elo ${msg.loser.elo}`)
                    setEndMessage(endMessage);
                }, 200);

                //alert(`${msg.winner.username} now has elo ${msg.winner.elo} and
                //${msg.loser.username} now has elo ${msg.loser.elo}`);
            })


            return function() {
                socket.removeAllListeners("chess response");
                socket.removeAllListeners("game over");
                socket.removeAllListeners("elo message");
                clearInterval(interval);
                //socket.disconnect();

            }
        }
    }, [])
    function makeRandomMove() {
        let possibleMoves = game.moves();
        if (game.game_over()) {
            return;
        }
        let randomInd = Math.floor(Math.random()     * possibleMoves.length);
        game.move(possibleMoves[randomInd]);
        //setGame(game);
        setBoard(game.fen());
        updateGameMessagesLocal();

        //goAgain();
    }
    function goAgain() {
        setTimeout(makeRandomMove, 1000);
    }
    let recMove = async function() {
        try {
            const result = await axios({
                method: "post",
                url: "https://chess.apurn.com/nextmove",
                headers: {
                    "Content-Type": "text/plain"
                },
                data: game.fen()
            })
            makeMove(result.data.substring(0,2), result.data.substring(2,4));
        }
        catch (err) {

        }
    }
    let makeMove = function(sourceSquare, targetSquare) {
        let moveObj = {from: sourceSquare, to: targetSquare, promotion: "q"};
        let move = game.move(moveObj)
        if (move == null) return false;
        setBoard(game.fen());
        updateGameMessagesLocal();
        if (onlineGame(opponent)) {
            let message = {id: gameInfo.id, move: moveObj}
            socket.emit("chess move", message);
        }
        return true;

    }
    let updateGameMessagesLocal = function() {
        let newEndMessage = ""
        if (game.in_check() && !onlineGame(opponent)) {
            if (side != undefined) {
                newEndMessage = newEndMessage.concat(`${myMove() ? "You are" : "Your opponent is"} in check!\n`)
            }
            else {
                newEndMessage = newEndMessage.concat(`${game.turn()=="w" ? "White" : "Black"} is in check!\n`)
            }

        }
        else if (!game.in_check() && !onlineGame(opponent)) {
            setEndMessage("");
        }

        if (game.game_over() && !onlineGame(opponent)) {
            newEndMessage = newEndMessage.concat("Game Over!")
        }
        setEndMessage(newEndMessage);

    }

    function onDrop({sourceSquare, targetSquare}) {
        if ((side == "white" && game.turn() == "b") || (side == "black" && game.turn() == "w")) {
            return;
        }
        if (makeMove(sourceSquare, targetSquare)) {
            if (opponent == "AI (3000)") {
                recMove();
            }
            else if (opponent == "Random (0)") {
                setTimeout(() => {makeRandomMove()}, 200);

            }
        }

    }
    function sendMessage() {
        socket.emit("message", "WOWOWOWOW");
    }
    function updateTime() {
        if (!game.game_over()) {
            let curTime = Date.now()

            if (game.turn() == "w") {

                let newTime = time.white - (curTime - prevTime);
                time = {white: newTime, black: time.black}
                setTime(() => {return {white: newTime, black: time.black}})
            }
            else {
                let newTime = time.black - (curTime - prevTime);
                time = {white: time.white, black: newTime}
                setTime({white: time.white, black: newTime});
            }
            prevTime = curTime;
            //setInterval(() => {updateTime()}, 1000);
        }
    }
    function getMinSec(mills) {
        if (mills < 0) {
            return "Out of Time!";
        }
        return new Date(mills).toISOString().substr(11, 8);
    }
    function myMove() {
        return ((game.turn() == "w" && side == "white") || (game.turn() == "b" && side == "black") || (game.turn() == "w" && side == ""));
    }
    return (
        <div className={"container"}>
            <div className={"columns is-centered"}>
                <div className={"column is-desktop is-half"}>
                    <h5 className={"title is-5"}>{opponent}</h5>
                    <Chessboard transitionDuration = {0} position = {board} onDrop = {onDrop} orientation = {side} className={"centered"}/>
                    <br></br>
                    <p className={"title is-5"}>{(userInfo.loggedIn) ? `${userInfo.username} (${userInfo.elo})` : "Guest (1000?)"}</p>
                    {(opponent == "" || opponent == "AI (3000)" || opponent == "Random (0)") ? <button className={"button"} onClick={() => {
                        setBoard("start");
                        setGame(new Chess());
                        setEndMessage("");
                    }}>Reset</button> : <React.Fragment></React.Fragment>}
                    {onlineGame(opponent) ? <div><p className={myMove() ? "" : "bolded"}>{`Opponent: ${getMinSec((side == "white") ? time.black: time.white)}`}</p>
                            <p className={myMove() ? "bolded" : ""}>{`You: ${getMinSec((side == "white") ? time.white: time.black)}`}</p></div>
                         : <React.Fragment></React.Fragment>}
                    <div className={"container"}>
                        <p className={"title is-5 wNewLine"}>{endMessage}</p>
                    </div>

                </div>
            </div>
        </div>


    )
}
