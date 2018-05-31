const route = require("express").Router();

const passport = require("passport");

const { Trainer } = require("../../models");
const { checkTrainerLoggedIn } = require("../../utils/auth");


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


// GET Route for a single Trainer
route.get("/:id", async (req, res) => {
    try {
        const attributes = ["id", "name", "startTime", "endTime", "experience", "branchId"];
        if (req.user && req.user.id == req.params.id) { // Explicit coersion of id in user to string
            attributes.push("salary");
        }

        const trainer = await Trainer.findById(req.params.id, { attributes, raw: true });
        if (trainer === null)
            return res.status(404).send({ err: "Trainer not found!" });
        
        res.send(trainer);

    } catch (err) {
        console.error(err.stack);
        res.sendStatus(500);
    }
});

// PUT Route to update a trainers information
route.put("/:id", checkTrainerLoggedIn, async (req, res) => {
    try {
        // Check if trainer is same as being requested for
        if (req.user.id != req.params.id)    // explicit coersion
            return res.status(401).send({ err: "Cannot change other trainer's data!" });
        
        const { id, branchId, ...updateValues } = req.body;
        await Trainer.update(updateValues, {
            where: { id: req.params.id }
        });

        const trainer = await Trainer.findById(req.params.id, {
            attributes: ["id", "name", "startTime", "endTime", "salary", "experience", "branchId"],
            raw: true
        });
        res.send(trainer);

    } catch (err) {
        console.error(err.stack);
        res.sendStatus(500);
    }
});

module.exports = route;