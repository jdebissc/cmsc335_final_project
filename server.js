"use strict";

if (process.argv.length !== 3) {
    console.log("Usage: node server.js <port_number>");
    process.exit(1);
}

const port_number = parseInt(process.argv[2]);

const express = require("express");
const app = express();
const router = express.Router();
const path = require("path");
const body_parser = require("body-parser");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const db_name = "CMSC335DB";
const collection_name = "scores";

const Score = mongoose.model("Score", new mongoose.Schema({
    name: String,
    score: Number,
    date: Date
}));

// dotenv.config({path: path.resolve(__dirname, ".env")});

const uri = process.env.MONGO_CONNECTION_STRING;

app.use(express.static(__dirname));
app.use(body_parser.urlencoded({extended: false}));
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));

const DICTIONARY_API = "https://api.dictionaryapi.dev/api/v2/entries/en/";

router.get("/", async (req, res) => {
    let scores = [];
    try {
        await mongoose.connect(uri, {dbName: db_name});
        scores = await Score.find({});
        scores = scores.sort((a, b) => b.score - a.score);
        mongoose.disconnect();
    } catch(error) {
        console.error(error);
    } finally {
        res.render("home.ejs", {scores});
    }
});

app.get("/scores", (req, res) => {
    res.redirect("/");
});

app.use("/", router);

app.get("/hangman", (req, res) => {
    res.render("hangman.ejs", {});
});

app.get("/dictionary", async (req, res) => {
    const {word} = req.query;
    if (!word)
        return res.render("dictionary.ejs", {valid: false})
    let response = await fetch(DICTIONARY_API + word);
    let result = response.ok ? (await response.json()) : {};
    if (Array.isArray(result))
        result = result[0];
    else
        result = {word, phonetic: "WORD NOT FOUND"};
    result.phonetic ??= word;
    result.origin ??= "";
    result.meanings ??= [{partOfSpeech: "", definitions: [{definition: "", example: ""}]}];
    result.valid = true;
    res.render("dictionary.ejs", result);
});

app.post("/hangman", async (req, res) => {
    try {
        await mongoose.connect(uri, {dbName: db_name});
        const date = new Date();
        let {name, score} = req.body;
        score = +score == score ? +score : 0;
        const data = new Score({name, score, date});
        await data.save();
        mongoose.disconnect();
    } catch(error) {
        console.error(error);
    } finally {
        res.render("hangman.ejs", {});
    }
});

app.listen(port_number);
console.log(`Listening on port ${port_number}`);