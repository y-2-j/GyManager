module.exports = {
    checkTrainerLoggedIn: (req, res, next) => {
        if (req.user && req.user.type === "trainer")
            return next();
        res.status(401).send({ err: "You must be a trainer to do that!" });
    },

    checkCustomerLoggedIn: (req, res, next) => {
        if (req.user && req.user.type === "customer")
            return next();
        res.status(401).send({ err: "You must join the Gym to do that!" });
    },

    checkBranchLoggedIn: (req, res, next) => {
        if (req.user && req.user.type === "branch")
            return next();
        res.status(401).send({ err: "You must have Admin Rights over the Gym to do that!" });
    }
};