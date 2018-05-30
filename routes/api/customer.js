const route = require("express").Router();

// Requiring passport
const Passport = require("passport");

//Requiring customer model
const { Customer } = require("../../models");

// HELPERS
const authenticateCustomer = (req, res, next) => {
    Passport.authenticate("customer", (err, customer) => {
        if (err)
            return next(err);
        if (!customer)
            return res.status(401).send({ err: "Invalid Credentials!" });
        req.logIn(customer, err => {
            if (err)
                return next(err);
            return res.send({ membershipNo: req.user.membershipNo, name: req.user.name });
        });
    })(req, res, next);
};


// Login the user
route.post("/login", authenticateCustomer);

// Signup
route.post("/signup", async (req, res, next) => {
    try {
        const { name, password, age, height, weight } = req.body;

        const joiningDate = Date.now();
        const customer = await Customer.create({ name, password, age, height, weight, joiningDate });
        req.body.membershipNo = customer.dataValues.membershipNo;

        authenticateCustomer(req, res, next);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

module.exports = route;