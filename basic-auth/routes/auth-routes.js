const express = require("express");
const authRoutes = express.Router();

// User model
const User = require("../models/users");

// BCrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;

authRoutes.get("/signup", (req, res, next) => {
    res.render("auth/signup");
});


authRoutes.post("/signup", (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    const passwordRepeat = req.body.passwordRepeat;

    if (username === "" || password === "" || passwordRepeat === "") {
        res.render("auth/signup", {
            errorMessage: "Indicate a username and a password to sign up"
        });
        return;
    }
    if (password !== passwordRepeat) {
        res.render("auth/signup", {
            errorMessage: "Passwords do not match"
        });
        return;
    }
    User.findOne({ "username": username },
        "username",
        (err, user) => {
            if (user !== null) {
                res.render("auth/signup", {
                    errorMessage: "The username already exists"
                });
                return;
            }

            var salt = bcrypt.genSaltSync(bcryptSalt);
            var hashPass = bcrypt.hashSync(password, salt);

            var newUser = new User({
                username,
                email,
                password: hashPass
            });

            newUser.save((err) => {
                if (err) {
                    res.render("auth/signup", {
                        errorMessage: "Something went wrong"
                    });
                } else {
                    res.redirect("/tweets");
                }
            });
        });

});

authRoutes.get("/login", (req, res, next) => {
    res.render("auth/login");
});

authRoutes.post("/login", (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;

    if (username === "" || password === "") {
        res.render("auth/login", {
            errorMessage: "Indicate a username and a password to sign up"
        });
        return;
    }

    User.findOne({ "username": username }, (err, user) => {
        if (err || !user) {
            res.render("auth/login", {
                errorMessage: "The username doesn't exist"
            });
            return;
        }
        if (bcrypt.compareSync(password, user.password)) {
            // Save the login in the session!
            req.session.currentUser = user;
            res.redirect("/tweets");
        } else {
            res.render("auth/login", {
                errorMessage: "Incorrect password"
            });
        }
    });
});

authRoutes.get("/logout", (req, res, next) => {
    if (!req.session.currentUser) { res.redirect("/"); return; }

    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/login");
        }
    });
});

module.exports = authRoutes;