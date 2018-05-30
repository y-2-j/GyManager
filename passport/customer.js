
//Requiring passport
const passport = require("passport");

const LocalStrategy = require("passport-local").Strategy;

// Requiring Customer Model
const { Customer } = require("../models");

// Serializing user
passport.serializeUser((customer, done) => {
    // If its not a customer, don't try to serialize, and pass the responsibility to other serialize functions
    if (!customer.membershipNo)
        return done("pass");
    done(null, { membershipNo: customer.membershipNo, type: "customer" });
});

// Deserializing User
passport.deserializeUser(async ({ membershipNo, type }, done) => {
    try {
        // If type is not customer, dont try to deserialize it, and pass responsibility to other functions
        if (type !== "customer")
            return done("pass");

        const customer = await Customer.findById(membershipNo);

        // If customer not found, error!
        if (customer === null)
            throw new Error("Serialized Customer not found!!");

        done(null, { ...customer.dataValues, type: "customer" });
        
    } catch (err) {
        console.error(err);
        done(err);
    }
});

// Using local Strategy
passport.use("customer", new LocalStrategy({
    usernameField: "membershipNo",
    passwordField: "password"
}, async (id, password, done) => {
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