const route = require("express").Router();

route.use("/trainers", require("./trainer"));

module.exports = route;