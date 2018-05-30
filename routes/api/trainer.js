const route = require("express").Router();

const passport = require("passport");

const { Trainer } = require("../../models");


// HELPERS
const authenticateTrainer = (req, res, next) => {
    passport.authenticate("trainer", (err, trainer) => {
        if (err)
            return next(err);
        if (!trainer)
            return res.status(401).send({ err: "Invalid Credentials!" });
        req.logIn(trainer, err => {
            if (err)
                return next(err);
            return res.send({ id: req.user.id, name: req.user.name });
        });
    })(req, res, next);
};


// Signup
route.post("/signup", async (req, res, next) => {
    try {
        const { name, password, startTime, endTime } = req.body;

        const experience = req.body.experience || undefined;

        const trainer = await Trainer.create({ name, password, startTime, endTime, experience });
        req.body.id = trainer.dataValues.id;

        authenticateTrainer(req, res, next);

    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

// Login
route.post("/login", authenticateTrainer);


module.exports = route;