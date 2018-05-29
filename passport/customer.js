
//Requiring passport
const passport = require("passport");

const LocalStrategy = require("passport-local").Strategy;

// Requiring Customer Model
const { Customer } = require("../models");

// Serializing user
passport.serializeUser((customer, done) => done(null, customer.membershipNo));

// Deserializing User
passport.deserializeUser(async (customerId, done) => {
    try {
        const customer = await Customer.findById(customerId);
        done(null, customer.dataValues);
    } catch (err) {
        console.error(err);
        done(err);
    }
});

// Using local Strategy
passport.use("customer", new LocalStrategy(async (id, password, done) => {
    try {
        const customer = await Customer.findById(id);
        //No such user
        if (customer === null)
            return done(null, false, { message: "User not found!" });
        //Wrong password
        if (customer.dataValues.password !== password)
            return done(null, false, { message: "Password doesn't match!" });
        //Correct credentials
        return done(null, customer.dataValues);

    } catch (err) {
        console.error(err);
        done(err);
    }
}));

module.exports = passport;