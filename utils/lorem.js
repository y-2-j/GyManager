const lorem = require("lorem-ipsum");

module.exports = {
    word: () => lorem({ count: 1, units: "words" }),
    words: (count) => lorem({ count: count, units: "words" })
}