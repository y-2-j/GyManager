// Require Passport
const passport = require("passport");
const LocalStrategy = require("passport-local");

// User files
const { Trainer } = require("../models");

// Serialize Trainer
passport.serializeUser((trainer, done) => done(null, trainer.id));

// Deserialize Trainer
passport.deserializeUser(async (id, done) => {
    try {
        const trainer = await Trainer.findById(id);
        done(null, trainer);
    } catch (err) {
        console.error(err);
        done(err);
    }
});


// Local Strategy
passport.use(new LocalStrategy(async (id, password, done) => {
    try {
        const trainer = await Trainer.findById(id);
        // If trainer not found
        if (trainer === null)
            return done(null, false, { message: "Incorrect id!" });
        // Incorrect Password
        if (trainer.password !== password)
            return done(null, false, { message: "Incorrect password" });
        // Correct Credentials
        return done(null, trainer);

    } catch (err) {
        console.error(err);
        done(err);
    }
}));

module.exports = passport;