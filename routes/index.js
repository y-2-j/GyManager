const route = require("express").Router();

route.get("/user", (req, res) => res.send(req.user));

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