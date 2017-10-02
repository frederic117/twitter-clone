const express = require("express");
const siteRoutes = express.Router();

siteRoutes.get("/", (req, res, next) => {
    res.render("home");
});

siteRoutes.use((req, res, next) => {
    if (req.session.currentUser) {
        next();
    } else {
        res.render('auth/login', {
            errorMessage: "You need to be logged in to view this page"
        });
    }
});

siteRoutes.get("/secret", (req, res, next) => {
    res.render("auth/secret");
});

module.exports = siteRoutes;