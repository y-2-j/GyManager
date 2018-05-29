// Require Passport
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

// User files
const { Trainer } = require("../models");

// Serialize Trainer
passport.serializeUser((trainer, done) => {
    // If its not a trainer, don't try to serialize, and pass the responsibility to other serialize functions
    if (!trainer.id)
        return done("pass");
    done(null, { id: trainer.id, type: "trainer" });
});

// Deserialize Trainer
passport.deserializeUser(async ({ id, type }, done) => {
    try {
        // If type is not trainer, dont try to deserialize it, and pass responsibility to other functions
        if (type !== "trainer")
            return done("pass");
        
        const trainer = await Trainer.findById(id);
        // If trainer not found, error!
        if (trainer === null)
            throw new Error("Serialized Trainer not found!!");
        
        done(null, { ...trainer.dataValues, type: "trainer" });
        
    } catch (err) {
        console.error(err);
        done(err);
    }
});


// Local Strategy
passport.use("trainer", new LocalStrategy(async (id, password, done) => {
    try {
        const trainer = await Trainer.findById(id);
        // If trainer not found
        if (trainer === null)
            return done(null, false, { message: "Incorrect id!" });
        // Incorrect Password
        if (trainer.dataValues.password !== password)
            return done(null, false, { message: "Incorrect password" });
        // Correct Credentials
        return done(null, trainer.dataValues);

    } catch (err) {
        console.error(err);
        done(err);
    }
}));

module.exports = passport;