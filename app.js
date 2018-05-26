// Node Packages
const express = require("express");


// User Files
const CONFIG = require("./config");


// Initialization
const app = express();


// Start the server
app.listen(CONFIG.SERVER.PORT, () => {
    console.log(`Server started at http://${CONFIG.SERVER.HOST}:${CONFIG.SERVER.PORT}`);
});