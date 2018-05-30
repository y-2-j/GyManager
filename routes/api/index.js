const route = require("express").Router();

// GET Request for Logging Trainer/Customer Out
route.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

// Requiring trainer's route
route.use("/trainers", require("./trainer"));

// Requiring customer's route
route.use("/customers", require("./customer"));

module.exports = route;