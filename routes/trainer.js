const route = require("express").Router();

const passport = require("passport");

const { Trainer } = require("../models");

// Signup
route.post("/signup", async (req, res, next) => {
    try {
        const { name, password, startTime, endTime } = req.body;

        const experience = req.body.experience || undefined;

        const trainer = await Trainer.create({ name, password, startTime, endTime, experience });
        req.body.username = trainer.dataValues.id;

        passport.authenticate("trainer", {
            successRedirect: "/",
            failureRedirect: "/"
        })(req, res, next);

    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

// Login
route.post("/login", passport.authenticate("trainer", {
    successRedirect: "/",
    failureRedirect: "/"
}));

route.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});



module.exports = route;