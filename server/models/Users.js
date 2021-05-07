const mongoose = require("mongoose");
//const passportLocalMongoose = require('passport-local-mongoose');

const ThirdPartyProviderSchema = new mongoose.Schema(
    {
        provider_name: {
            type: String,
            default: null
        },
        provider_id: {
            type: String,
            default: null
        },
        provider_data: {
            type: {},
            default: null
        }
    },
    {strict: false}
)

const EloSchema = new mongoose.Schema(
    {
        wins: {
            type: Number,
            default: 0
        },
        losses: {
            type: Number,
            default: 0
        },
        draws: {
            type: Number,
            default: 0
        },
        elo: {
            type: Number,
            default: 1000
        },
    }
)

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            unique: true
        },
        password: {
            type: String
        },
        third_party_auth: [ThirdPartyProviderSchema],
        date: {
            type: Date,
            default: Date.now
        },
        stats: {
            type: EloSchema,
            default: {}
        }
    },
    {strict: false}
)


//UserSchema.plugin(passportLocalMongoose);


module.exports = User = mongoose.model("users", UserSchema);
//module.exports = Elo = mongoose.model("elo", EloSchema);