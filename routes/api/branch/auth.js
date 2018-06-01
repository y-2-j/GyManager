const route = require("express").Router();

const passport = require("passport");

const { Branch } = require("../../../models");

const authenticateBranch = (req, res, next) => {
    passport.authenticate("branch", (err, branch) => {
        if (err)
            return next(err);
        if (!branch)
            return res.status(401).send({ err: "Invalid Credentials!" });
        req.logIn(branch, err => {
            if (err)
                return next(err);
            return res.send({ id: req.user.id, name: req.user.name });
        });
    })(req, res, next);
};

// Create new Branch
route.post("/", async (req, res, next) => {
    try {
        const { id, ...branchDetails } = req.body;

        const branch = await Branch.create(branchDetails);
        req.body.id = branch.dataValues.id;

        // Log the user in
        authenticateBranch(req, res, next);

    } catch (err) {
        console.error(err.stack);
        res.sendStatus(500);
    }
});

// Branch Login
route.post("/login", authenticateBranch);


module.exports = route;