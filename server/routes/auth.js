const express = require("express");
const router = express.Router();
const passport = require("passport");
const cors = require('cors');

let blacklist = ["AI (3000)", "Random (0)", "draw"];
router.post("/register_login", (req, res, next) => {
    if (blacklist.find((val) => val == req.username) != undefined) {return;}
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return res.status(400).json({ errors: err });
        }
        if (!user) {
            return res.status(400).json({ errors: "No user found" });
        }
        req.logIn(user, function(err) {
            if (err) {
                return res.status(400).json({ errors: err });
            }
            return res.status(200).json({ success: `logged in ${user.id}` });
        });
    })(req, res, next);
});

router.get('/logout', function(req, res){
    req.session.destroy();
    //console.log(req.session);
    req.session = null;
    console.log("Bye!");
    return res.status(200).json({success: "logged out"});
});

module.exports = router;