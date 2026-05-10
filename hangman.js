"use strict";

const max_guesses = 9;
const guess_input = document.getElementById("guess-input");
const guess_counter = document.getElementById("guess-count");
const guess_display = document.getElementById("guessed-word");
const score_counter = document.getElementById("score-count");
const submit_button = document.getElementById("submit-button");
const timer = document.getElementById("timer");
const timer_update_ms = 500;

let word = "";
let guessed_word = "";
let guessed_letters = new Set();
let num_incorrect = 0;
let time_start = new Date();
let interval = -1;

function calculate_score() {
    const guess_penalty = 1 + num_incorrect;
    const time_penalty = 1 + elapsed_time_sec();
    return Math.floor(1000 * word.length / (guess_penalty * time_penalty));
}

function elapsed_time_sec() {
    return Math.round((new Date() - time_start) / 1000);
}

function is_game_running() {
    return word !== "";
}

const words = ["complex", "words"];

function display_elapsed_time() {
    let sec = elapsed_time_sec();
    let min = Math.floor(sec / 60);
    sec %= 60;
    timer.innerText = min === 0 ? `${sec}s` : `${min}m ${sec}s`;
    score_counter.value = calculate_score();
}

function new_hangman_game() {
    if (words.length === 0)
        return console.log("No words found!");
    for (let tile of document.getElementsByClassName("tile")) {
        tile.setAttribute("opaque", "true");
    }
    time_start = new Date();
    num_incorrect = 0;
    guessed_letters.clear();
    word = words[Math.floor(Math.random() * words.length)].toUpperCase();
    clearInterval(interval);
    interval = setInterval(display_elapsed_time, timer_update_ms);
    update_guess();
}

function update_guess() {
    guessed_word = word.split("").map((x) => guessed_letters.has(x) ? x : "_").join("");
    guess_display.innerText = guessed_word;
}

function show_tiles() {
    const tiles = document.querySelectorAll(".tile[opaque=true]");
    const letters_left = (guessed_word.match(/_/g) ?? []).length;
    const n = Math.ceil(max_guesses * letters_left / word.length);
    // Uncover the terrapin image based on ratio of letters correctly guessed
    for (let i = 0; i < tiles.length - n; ++i)
        tiles[i].setAttribute("opaque", "false");
}

function guess_letter(letter) {
    if (!is_game_running() || num_incorrect >= max_guesses || letter.length !== 1)
        return;
    // Count duplicates as an incorrect guess
    if (guessed_letters.has(letter) || word.indexOf(letter) === -1)
        guess_counter.innerText = `${++num_incorrect} out of ${max_guesses}`;;
    guessed_letters.add(letter);
    update_guess();
}

function guess_letters(form_event) {
    form_event.preventDefault();
    let letters = guess_input.value.toUpperCase().split("");
    for (let letter of letters)
        guess_letter(letter);
    guess_input.value = "";
    show_tiles();
}

function enable_save_score() {
    submit_button.setAttribute("disabled", null);
}

function disable_save_score() {
    submit_button.setAttribute("disabled", "");
}

function save_score() {
    if (!is_game_running()) return;
    clearInterval(interval);
    // connect to mongodb
    // upload to mongo
}

disable_save_score();