const mongoose = require("mongoose");
const Chess = require("chess.js");

//Game id: Unique number generated for each game
//Game object: Using chess.js, store the game itself
//Winner: "" at the start, can be "Black", "White", or "Draw"
//White: Username
//Black: Username
const PlayersSchema = new mongoose.schema(
    {
        white: {
            type: String
        },
        black: {
            type: String
        }
    }
)

const GameSchema = new mongoose.Schema(
    {
        game: {
            type: Chess.Chess,
            default: new Chess.Chess()
        },
        players: {
            type: PlayersSchema
        },
        winner: {
            type: String,
            default: ""
        }
})