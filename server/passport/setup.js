const bcrypt = require("bcryptjs");
const User = require("../models/Users");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    })
})

passport.use(
    new LocalStrategy({usernameField: "username"},(username, password, done) => {
        User.findOne({username: username})
            .then(user => {
                // Create new User
                if (!user) {

                    const newUser = new User({ username, password });
                    // Hash password before saving in database
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            newUser.password = hash;
                            console.log("Should work");
                            newUser
                                .save()
                                .then(user => {
                                    return done(null, user);
                                })
                                .catch(err => {
                                    console.log(err);
                                    return done(null, false, { message: err });
                                });
                        });
                    });
                    // Return other user
                } else {
                    // Match password
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err;

                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: "Wrong password" });
                        }
                    });
                }
            })
            .catch(err => {
                return done(null, false, { message: err });
            });
    })
);

module.exports = passport;