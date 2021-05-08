import * as Chess from "../../node_modules/chess.js/chess"
import React, {useState, useEffect} from 'react';
import Chessboard from "chessboardjsx";
import axios from "axios";
import io from "socket.io-client";
import {socket} from "../variables/socket.js"


//Messages have format {speaker, message}
export default function ChatBox({messages}) {

}