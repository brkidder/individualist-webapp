const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
// Dependencies
const path = require("path");
const express = require("express");

const morgan = require("morgan");
const colors = require("colors");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const passport = require("./passport");
const mongoUtil = require("./config/db");
const https = require("https");
var http = require("http");
const fs = require("fs");
// Set env path

//HTTPS options
const options = {
    key: fs.readFileSync("./SSL/server.key.pem"),
    ca: [fs.readFileSync("./SSL/intermediate.crt.pem")],
    cert: fs.readFileSync("./SSL/server.crt.pem"),
    requestCert: false,
    rejectUnauthorized: false,
};

// DB Connect
mongoUtil.connectDB(process.env.MONGO_URI, function (err, client) {
    if (err) console.log(err);

    // Express
    const app = express();

    app.use(express.json());
    if (process.env.NODE_ENV === "development") {
        app.use(morgan("dev"));
    }
    app.use(express.urlencoded({ extended: true }));
    // Express Session
    app.use(
        session({
            secret: process.env.SESSION_SECRET,
            store: new MongoStore({ mongooseConnection: mongoUtil.getConnection() }),
            resave: false,
            saveUninitialized: false,
        })
    );
    app.use(passport.initialize());
    app.use(passport.session());

    // Passport Middleware
    if (process.env.LOGING_LEVEL === "verbose") {
        app.use((req, res, next) => {
            if (process.env.LOGING_LEVEL === "verbose") {
                console.log("req.session", req.session);
            }
            return next();
        });
    }

    // Routes
    const recipes = require("./routes/Recipes");
    const shoppingList = require("./routes/ShoppingList");
    const settings = require("./routes/Settings");
    const login = require("./routes/Login");

    // Direct Routes
    app.use("/api/v1.1/recipes", recipes);
    app.use("/api/v1.1/shoppingList", shoppingList);
    app.use("/api/v1.1/settings", settings);
    app.use("/api/v1.1/login", login);

    // If production build serve index.html from static path on startup
    if (process.env.NODE_ENV === "production") {
        app.use(express.static("client/build"));
        app.get("*", (req, res) => res.sendFile(path.resolve(__dirname, "client", "build", "index.html")));
    }

    // Set server listening port
    const PORT = process.env.PORT || 50001;
    if (process.env.NODE_ENV === "production") {
        https.createServer(options, app).listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));
        // Redirect from http port 80 to https
        var http = require("http");
        http.createServer(function (req, res) {
            console.log("redirect");
            res.writeHead(307, { Location: "https://" + req.headers["host"] + req.url });
            res.end();
        }).listen(80, console.log(`Redirect Server running in ${process.env.NODE_ENV} mode on port 80`.yellow.bold));
    } else {
        app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));
    }
});
