const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const mongoose = require("mongoose");
mongoose.set('useCreateIndex', true);
const passport = require("./passport/setup");
const auth = require("./routes/auth");
const User = require("./models/Users")
const PORT = process.env.PORT || 8000;
const cors = require('cors');

const corsOptions = {
    origin: function(origin, callback) {
        callback(null, true);
    },
    credentials: true,
}
const http = require("http");
const app = express();

const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server, {
    cors: corsOptions
});
const Chess = require("chess.js");
const MONGO_URI = process.env.MONGODB_URL  || "mongodb://127.0.0.1:27017/Login-Test" //|| //"mongodb+srv://Admin:Noahsamax21@chess-storage.8hzgy.mongodb.net/ChessData?retryWrites=true&w=majority";
const EloCalc = require("arpad");
const eloCalc = new EloCalc();
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log(`MongoDB connected ${MONGO_URI}`);
        restOfTheCode();

//User.findOne({}, "_id").then((result) => console.log(result._id));



    })
    .catch(err => console.log(err));

function restOfTheCode() {
    app.use(express.urlencoded({ extended: false }));
    const userStorage = MongoStore.create({client: mongoose.connection.getClient(), autoRemove:"native"});
    const sessionMiddleware = session({
        secret: process.env.SECURITYCODE || "super secret code",
        resave: false,
        saveUninitialized: false,
        store: userStorage,
        key: "express.sid",
        unset: "destroy",
        cookie: {
            sameSite: "none",
            secure: false,
            httpOnly: true
        }
    })
    app.use(sessionMiddleware);
    io.use(wrap(sessionMiddleware));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.json());
    io.use(wrap(passport.initialize()));
    io.use(wrap(passport.session()));
    app.use(cors(corsOptions));


    async function getTest() {
        let result = await User.find({})
        //console.log(result);
    }
    getTest().then();

//User.updateOne({}, {$set: {stats: {wins: 0, losses: 0, draws: 0, elo: 1000}}}, {multi: true});

//User.updateOne({"username": "bestchessplayer"}, {"$set": {"stats.elo": 3000}}).then().catch((err) => console.log(err));

// Routes


    app.use("/api/auth", auth);

//https://github.com/socketio/socket.io/blob/master/examples/passport-example/index.js#L76-L80



//Not login stuff

    const Elo = require("arpad");
    const elo = new Elo()


    let num = 0;
    app.get("/api", cors(), (req, res) => {
        res.json({message: `Hello! ${num}`, user: res.locals.currentUser});
        console.log(req.user);
        num += 1;
    });
    app.get("/leaderboard", cors(), (req, res) => {
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        console.log(req.user);
        User.find({}).then((result) => res.send(result.map((val) => {
            return {
                username: val.username,
                wins: val.stats.wins,
                losses: val.stats.losses,
                draws: val.stats.draws,
                elo: val.stats.elo
            }
        })));
        //res.send(people);
    })
    app.get("/api/auth/profile", (req, res) => {
        res.json(req.user);
    })
//Handle multiplayer mechanics
    /*A game is an object with the following format:
    id: {
        white and black: usernames
        whiteTime and blackTime
        state: Chess.js object
        prevTime: time when the last move was made
        winner: String, changes from empty string to winner or "draw"
    }
    Once the game is over, update the elo of both players and push to the database
    This means that the games aren't saved afterward, but that's ok
     */
    let games = {};
//Increment by 1 when starting a new game, give the new value to the game, so game 1 has id 0, game2 has id 1, etc.
    let idVal = 0;
//The queue stores players waiting to start a game. If length >= 2, the first two are ejected
    let queue = [];


//Implement way to count time
    io.on("connect", (socket) => {
        console.log("user connected");
        socket.on("disconnect", () => {
            socket.removeAllListeners();
            console.log("user disconnected");
        })
        socket.on("message", (msg) => {
            //console.log(`message ${msg}`);
            io.emit("response", `${msg} received by server`);
        })
        //Chess board message format: move, gameid
        socket.on("chess board", (msg) => {
            //console.log(msg);
            io.emit("chess response", msg);
        })

        socket.on("queue", (callback) => {
            if (socket.request.user == undefined || queue.find((elem) => (elem == socket.request.user.username)) != undefined) {// || queue.find((val) => (val == socket.request.user.username)) != undefined) {
                callback({status: "not logged in"});
                return;
            }
            //Join a specific room for the game
            socket.join(socket.request.user.username);
            callback({status: "ok"});
            queue.push(socket.request.user.username);
            if (queue.length >= 2) {
                startGame().then();
            }
            /*setTimeout(() => {
                socket.emit("game start", {side: "black", name: "tester", elo: 10000})
            }, 1000)*/
        })
        socket.on("exit queue", (callback) => {
            queue = queue.filter((elem) => (elem != socket.request.user.username));
            callback({status: "ok"});
        })
        //Message has game id, move
        socket.on("chess move", (msg) =>{
            if (games[msg.id] == undefined) {
                return;
            }

            let gameRef = games[msg.id];
            if (gameRef.state.turn() == "w") {
                gameRef.whiteTime = gameRef.whiteTime - (Date.now() - gameRef.prevTime);
            }
            else {
                gameRef.blackTime = gameRef.blackTime - (Date.now() - gameRef.prevTime);
            }
            if (gameRef.whiteTime < 0) {
                endGame("win", gameRef.black, gameRef.white).then();
                return;
            }
            if (gameRef.blackTime < 0) {
                endGame("win", gameRef.white, gameRef.black).then();
                return;
            }
            gameRef.prevTime = Date.now();
            let move = gameRef.state.move(msg.move);
            io.to(gameRef.white).to(gameRef.black).emit("chess response", {pgn: gameRef.state.pgn(), whiteTime: gameRef.whiteTime, blackTime: gameRef.blackTime});
            if(gameRef.state.game_over()) {
                if (gameRef.state.in_checkmate()) {
                    if (gameRef.state.turn() == "b") {
                        io.to(gameRef.white).to(gameRef.black).emit("game over", {winner: gameRef.white})
                        endGame("win", gameRef.white, gameRef.black).then();
                    }
                    else {
                        io.to(gameRef.white).to(gameRef.black).emit("game over", {winner: gameRef.black})
                        endGame("win", gameRef.black, gameRef.white).then();
                    }
                }
                else {
                    io.to(gameRef.white).to(gameRef.black).emit("game over", {winner: "draw"})
                    endGame("draw", gameRef.white, gameRef.black).then();
                }
            }

        })
    })
    let defaultTime = 1000*60*5;
    let startGame = async function() {
        let white = queue.shift();
        let black = queue.shift();
        //Randomize who plays white (white has 52-56% chance of winning in an even game)
        if (Math.random() > 0.5) {
            let temp = black;
            black = white;
            white = temp;
        }
        let whiteInfo = {}, blackInfo = {};
        try {
            whiteInfo = await User.findOne({username: white});
            blackInfo = await User.findOne({username: black});
            console.log(whiteInfo);
        }
        catch (err) {
            io.to(white).to(black).emit("error", "database failure");
            return;
        }
        io.to(white).emit("game start", {side: "white", name:blackInfo.username, elo:blackInfo.stats.elo, id: idVal, time: defaultTime})
        io.to(black).emit("game start", {side: "black", name:whiteInfo.username, elo:whiteInfo.stats.elo, id: idVal, time: defaultTime})
        games[idVal] = {white: whiteInfo.username, black: blackInfo.username, state: new Chess.Chess(), winner: "", prevTime: Date.now(), whiteTime: defaultTime, blackTime: defaultTime};
        idVal = idVal + 1;


    }
//Handle elo calculation, takes "win" or "draw" and the username of the two players.
    let endGame = async function(type, winner, loser) {
        let winnerInfo = await User.findOne({username: winner});
        let loserInfo = await User.findOne({username: loser});
        let winnerElo = winnerInfo.stats.elo;
        let loserElo = loserInfo.stats.elo;
        let newWinElo = 0;
        let newLossElo = 0;
        if (type == "win") {
            newWinElo = eloCalc.newRatingIfWon(winnerElo, loserElo);
            newLossElo = eloCalc.newRatingIfLost(loserElo, winnerElo);
            await User.updateOne({username: winner}, {$inc: {"stats.wins": 1}, $set: {"stats.elo": newWinElo}});
            await User.updateOne({username: loser}, {$inc: {"stats.losses": 1}, $set: {"stats.elo": newLossElo}});

        }
        else {
            newWinElo = eloCalc.newRatingIfTied(winnerElo, loserElo);
            newLossElo = eloCalc.newRatingIfTied(loserElo, winnerElo);
            await User.updateOne({username: winner}, {$inc: {"stats.draws": 1}, $set: {"stats.elo": newWinElo}});
            await User.updateOne({username: loser}, {$inc: {"stats.draws": 1}, $set: {"stats.elo": newLossElo}});
        }
        io.to(winner).to(loser).emit("elo message", {winner: {username: winner, elo: newWinElo}, loser: {username: loser, elo: newLossElo}});

    }

    server.listen(PORT, () => {
        console.log(`Listening on ${PORT}`);
    });

}
