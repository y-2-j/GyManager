// Node Packages
const express = require("express");
const session = require("express-session");
const passport = require("./passport");
const path = require("path");


// User Files
const CONFIG = require("./config");


// Initialization
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: CONFIG.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());


// Serve the Frontend
app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));

// ROUTES
app.use("/", require("./routes"));



// Start the server
app.listen(CONFIG.SERVER.PORT, () => {
    console.log(`Server started at http://${CONFIG.SERVER.HOST}:${CONFIG.SERVER.PORT}`);
});