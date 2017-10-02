const express = require("express");
const profileController = express.Router();

// User model
const User = require("../models/users");
const Tweet = require("../models/tweet");

// Moment to format dates
const moment = require("moment");

profileController.get("/:username/timeline", (req, res) => {
    const currentUser = req.session.currentUser;
    currentUser.following.push(currentUser._id);

    Tweet.find({ user_id: { $in: currentUser.following } })
        .sort({ created_at: -1 })
        .exec((err, timeline) => {
            res.render("profile/timeline", {
                username: currentUser.username,
                timeline,
                moment
            });
        });
});


profileController.use((req, res, next) => {
    if (req.session.currentUser) { next(); } else { res.redirect("/login"); }
});

profileController.get("/:username", (req, res, next) => {
    User
        .findOne({ username: req.params.username }, "_id username")
        .exec((err, user) => {
            if (!user) { return next(err); }

            if (req.session.currentUser) {
                isFollowing = req.session.currentUser.following.indexOf(user._id.toString()) > -1;
            }

            Tweet.find({ "user_name": user.username }, "tweet created_at")
                .sort({ created_at: -1 })
                .exec((err, tweets) => {
                    res.render("profile/show", {
                        username: user.username,
                        tweets,
                        moment,
                        session: req.session.currentUser,
                        button_text: isFollowing ? "Unfollow" : "Follow"
                    });
                });
        });
});


profileController.post("/:username/follow", (req, res) => {
    User.findOne({ "username": req.params.username }, "_id").exec((err, follow) => {
        if (err) {
            res.redirect("/profile/" + req.params.username);
            return;
        }

        User
            .findOne({ "username": req.session.currentUser.username })
            .exec((err, currentUser) => {
                var followingIndex = currentUser.following.indexOf(follow._id);

                if (followingIndex > -1) {
                    currentUser.following.splice(followingIndex, 1)
                } else {
                    currentUser.following.push(follow._id);
                }

                currentUser.save((err) => {
                    req.session.currentUser = currentUser;
                    res.redirect("/profile/" + req.params.username);
                });
            });
    });
});

profileController.get('/:id/edit', (req, res, next) => {
    const profileId = req.params.id;
    const profileSessionId = req.session.currentUser._id;

    if (profileId === profileSessionId) {
        User.findById(profileId, (err, profile) => {
            if (err) { return next(err) }
            res.render('profile/edit', {
                profile,
                user: req.session.currentUser
            })
        })
    }
})

profileController.post('/:id/edit', (req, res, next) => {
    const profileId = req.params.id;
    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(req.body.password, salt);

    const update = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,

    }

    User.findByIdAndUpdate(profileId, update, (err, profile) => {
        if (err) { return next(err) }

        return res.redirect(`/profile/${profileId}`)
    })
})



module.exports = profileController;