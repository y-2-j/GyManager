const route = require("express").Router();

// Requiring passport
const Passport = require("passport");

//Requiring customer model
const { Customer } = require("../models");

// Login the user
route.post("/login", Passport.authenticate("customer", {
    successRedirect: "/",
    failureRedirect: "/"
}));

// Signup
route.post("/signup", async (req, res, next) => {
    try {
        const { name, password, age, height, weight } = req.body;

        const joiningDate = Date.now();
        const customer = await Customer.create({ name, password, age, height, weight, joiningDate });
        req.body.username = customer.dataValues.membershipNo;

        Passport.authenticate("customer", {
            successRedirect: "/",
            failureRedirect: "/"
        })(req, res, next);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});


module.exports = route;