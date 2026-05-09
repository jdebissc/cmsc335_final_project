const express = require("express");
const app = express();
const path = require("path");
const portNumber = 7003;
const bodyParser = require("body-parser");
const { MongoClient, ServerApiVersion } = require("mongodb");

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));

// const databaseName = "CMSC335DB";
// const collectionName = "dictionary";
// const uri = process.env.MONGO_CONNECTION_STRING;
// const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

const DICTIONARY_API = "https://api.dictionaryapi.dev/api/v2/entries/en/";

app.get("/", async (req, res) => {
    res.render("home.ejs");
});

app.get("/scores", async (req, res) => {
    res.redirect("/");
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

app.get("/hangman", async (req, res) => {
    res.render("hangman.ejs", {});
});

app.listen(portNumber);
console.log(`Listening on http://localhost:${portNumber}/`);