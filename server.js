"use strict";
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const Search = require("./models/Search");
const playerRouter = require("./routes/playerRoutes");

const app = express();

if (process.argv.length !== 3) {
    console.log("Usage: node server.js PORT_NUMBER_HERE");
    process.exit(1);
}

const portNumber = process.argv[2];

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));
app.use(express.static(path.resolve(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.listen(portNumber);
console.log(`Web server started and running at http://localhost:${portNumber}`);
process.stdout.write("Stop to shutdown the server: ");

process.stdin.setEncoding("utf8");
process.stdin.on("readable", () => {
    const dataInput = process.stdin.read();
    if (dataInput !== null) {
        const command = dataInput.trim();
        if (command === "stop") {
            process.stdout.write("Shutting down the server\n");
            process.exit(0);
        } else {
            process.stdout.write("Invalid command: " + command + "\n");
        }
        process.stdout.write("Stop to shutdown the server: ");
        process.stdin.resume();
    }
});

// Home
app.get("/", (req, res) => {
    res.render("index");
});

// Mount GOAT picker routes
app.use("/players", playerRouter);

// History page — now counts LeBron vs Jordan
app.get("/history", async (req, res) => {
    try {
        const searches = await Search.find().sort({ createdAt: -1 }).lean();

        const lebronCount = searches.filter(s => s.playerName === "LeBron James").length;
        const jordanCount = searches.filter(s => s.playerName === "Michael Jordan").length;

        res.render("history", { searches, lebronCount, jordanCount });
    } catch (e) {
        console.error(e);
        res.render("history", { searches: [], lebronCount: 0, jordanCount: 0 });
    }
});


// Clear history
app.post("/history/clear", async (req, res) => {
    try {
        await Search.deleteMany({});
        res.redirect("/history");
    } catch (e) {
        console.error(e);
        res.redirect("/history");
    }
});

async function main() {
    const uri = process.env.MONGO_CONNECTION_STRING;
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB via Mongoose");
    } catch (e) {
        console.error("Mongo connection error:", e);
    }
}

main();
