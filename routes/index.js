const route = require("express").Router();

route.get("/user", (req, res) => res.send(req.user));

// API Routes
route.use("/api", require("./api"));

module.exports = route;