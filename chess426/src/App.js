import logo from './logo.svg';
import './App.css';
import Chessboard from "chessboardjsx";
import ChessboardHandler from "./components/ChessboardHandler"
//import "../node_modules/bulmaswatch/cyborg/bulmaswatch.min.css"
import "../node_modules/bulma/css/bulma.css"
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
  useRouteMatch
} from "react-router-dom";
import Leaderboard from "./components/Leaderboard";
import LoginPage from "./components/LoginPage";
import ProfilePage from "./components/ProfilePage";
import axios from "axios";
import React, {useState, useEffect} from 'react';
import QueuePage from "./components/QueuePage";
import Homepage from "./components/Homepage";
import {domain} from "./variables/domain";
function App() {
    //https://reactrouter.com/web/api/Route/component for keeping chessboard state
    const [userInfo, setUserInfo] = useState({loggedIn: false, username: "", elo: 1000})
    let getProfile = async function() {
        try {
            const result = await axios({
                method: "get",
                url: `${domain}/api/auth/profile`,
                withCredentials: true
            });
            if (result.data != "") {
                setUserInfo({loggedIn: true, username: result.data.username, elo: result.data.stats.elo});
            }
        }
        catch(err) {
        }
    }
    let logOut = async function() {
        //document.getElementById("bulmaUrl").innerHTML = '<link rel="stylesheet" id="bulmaUrl" href="https://cdn.jsdelivr.net/npm/bulma@0.9.2/css/bulma.min.css">'
        try {
            const result = await axios({
                method: "get",
                url: `${domain}/api/auth/logout`,
                withCredentials: true
            });
            setUserInfo({loggedIn: false, username: ""});
        }
        catch(e){

        }

    }
    useEffect(() => {getProfile().then()}, [])
    return (
      <Router>
          <nav className={"navbar"}>
              <div className={"navbar-menu"}>
                  <a className={"navbar-item"}>
                      <Link to={"/"}>Home</Link>
                  </a>
                  <a className={"navbar-item"}>
                      <Link to={"/leaderboard"}>Leaderboard</Link>
                  </a>
                  <a className={"navbar-item"}>
                      <Link to={"/board"}>Local Game</Link>
                  </a>

                  <a className={"navbar-item"}>
                      <Link to={"/boardai"}>Play vs. AI (Good Luck!)</Link>
                  </a>
                  <a className={"navbar-item"}>
                      <Link to={"/boardrandom"}>Play vs. AI (Random Moves)</Link>
                  </a>
                  <a className={"navbar-item"}>
                      <Link to={"/profile"}>Profile</Link>
                  </a>
                  <a className={"navbar-item"}>
                      <Link to={"/multiplayer"}>Multiplayer</Link>
                  </a>
              </div>
              <div className={"navbar-end"}>
                  <div className={"navbar-item"}>
                      <p>{userInfo.username}</p>
                  </div>
                  <div className={"navbar-item"}>
                      <button className={"button"} onClick={logOut}>Log Out</button>
                  </div>
                  <div className={"navbar-item"}>
                      <Link to={"/login"}><button className={"button"}>Login</button></Link>
                  </div>
              </div>
          </nav>
          <hr></hr>
        <Switch>
            <Route exact path = "/">
                <Homepage/>
            </Route>
            <Route path={"/board"} component={() => <ChessboardHandler opponent={""} userInfo={userInfo}/>}>

            </Route>
            <Route path={"/leaderboard"}>
                <Leaderboard/>
            </Route>
            <Route path={"/boardai"} component={() => <ChessboardHandler opponent={"AI (3000)"} side={"white"} userInfo={userInfo}/>}>

            </Route>
            <Route path={"/boardrandom"} component={() => <ChessboardHandler opponent={"Random (0)"} side={"white"} userInfo={userInfo}/>}>
            </Route>

            <Route path={"/login"}>
                <LoginPage info = {userInfo} setInfo = {setUserInfo} getProfile={getProfile}/>
            </Route>

            <Route path={"/profile"}>
                <ProfilePage/>
            </Route>

            <Route path={"/multiplayer"}>
                <QueuePage userInfo={userInfo}/>
            </Route>

        </Switch>
      </Router>
  );
}
/*function ProfileName() {
    const [name, setName] = useState({});
    let getProfile = async function() {
        try {
            const result = await axios({
                method: "get",
                url: "http://localhost:8000/api/auth/profile",
                withCredentials: true
            });
            if (result.data != undefined) {
                setName(result.data);
            }
        }
        catch(err) {
        }
    }
    useEffect(() => {
        getProfile().then();
    }, []);
    return (
        <p>{name.username}</p>
    );
}*/


export default App;
