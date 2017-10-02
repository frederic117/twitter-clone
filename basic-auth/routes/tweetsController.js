const express = require("express");
const authRoutes = express.Router();

// User model
const User = require("../models/users");

// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const tweetsController = express.Router();
const Tweet = require("../models/tweet");
const moment = require("moment");


tweetsController.use((req, res, next) => {
    if (req.session.currentUser) { next(); } else { res.redirect("/auth/login"); }
});

tweetsController.get("/", (req, res, next) => {
    User
        .findOne({ username: req.session.currentUser.username }, "_id username")
        .exec((err, user) => {
            if (!user) { return; }

            Tweet.find({ "user_name": user.username }, "tweet created_at")
                .sort({ created_at: -1 })
                .exec((err, tweets) => {
                    res.render("profile/show", {
                        tweets,
                        moment,
                        username: user.username,
                        session: req.session.currentUser
                    });
                });
        });
});


tweetsController.get("/new", (req, res, next) => {
    res.render("tweets/new", { username: req.session.currentUser.username });
});

tweetsController.post("/", (req, res, next) => {
    const user = req.session.currentUser;

    User.findOne({ username: user.username }).exec((err, user) => {

        const newTweet = new Tweet({
            user_id: user._id,
            user_name: user.username,
            tweet: req.body.tweetText
        });

        newTweet.save((err) => {
            if (err) {
                res.render("tweets/new", {
                    username: user.username,
                    errorMessage: err.errors.tweet.message
                });
            } else {
                res.redirect("/tweets");
            }
        });
    });
});




module.exports = tweetsController;