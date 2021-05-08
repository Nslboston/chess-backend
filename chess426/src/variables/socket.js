import {domain} from "./domain";
import io from "socket.io-client";
export const socket = io(`${domain}`, {withCredentials: true, secure:true});
