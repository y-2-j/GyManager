// Require Passport
const passport = require("passport");

const LocalStrategy = require("passport-local").Strategy;

// Requiring branch model
const { Branch } = require("../models");

// Serializing Branch
passport.serializeUser((branch, done) => {
    // If no branch, pass the control to other serialize functions
    if (branch.type !== "branch")
        return done("pass");
    done(null, { id: branch.id, type: "branch" });
})

// Deserializing Branch
passport.deserializeUser(async ({ id, type }, done) => {
    try {
        // If not a branch, pass the control to other deserialize functions
        if (type !== "branch")
            return done("pass");

        const branch = await Branch.findById(id);

        // If branch not found
        if (branch === null)
            throw new error("Serialized Branch not found!");

        done(null, { ...branch.dataValues, type: "branch" });

    } catch (err) {
        console.error(err);
        done(err);
    }
});

// Local Strategy
passport.use("branch", new LocalStrategy({
    usernameField: "id",
    passwordField: "password"
}, async (id, password, done) => {
    try {
        const branch = await Branch.findById(id);

        // If no such branch exists
        if (branch === null)
            return done(null, false, { message: "No such branch exists" });

        // If password doesn't match
        if (branch.dataValues.password !== password)
            return done(null, false, { message: "Password doesn't match" });

        // Correct Credentials
        return done(null, { ...branch.dataValues, type: "branch" });

    } catch (err) {
        console.error(err);
        done(err);
    }
}));

module.exports = passport;