const fs = require("fs");

function filter_dict(daily_letters) {
  const all_letters = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
  ];
  const unwanted_letters = all_letters.filter(
    (letter) => !daily_letters.includes(letter)
  );

  const en_dict = fs.readFileSync("american-english").toString().split("\n");
  // Remove upper case and duplicate words
  const en_dict_prepd = [
    ...new Set(en_dict.map((word) => word.toLocaleLowerCase())),
  ];

  const en_dict_filtered = en_dict_prepd.filter((word) => {
    // remove empty lines
    if (word === "") return false;
    // remove apostrophised words
    if (word.includes("'")) return false;
    // filter by allowed word size
    if (word.length > 9 || word.length < 4) return false;

    const word_letters = word.split("");
    for (let i = 0; i < word_letters.length; i++) {
      const word_letter = word_letters[i];

      // remove words with invalid letters
      if (unwanted_letters.includes(word_letter)) return false;

      // number of letter occurences in word
      const qtt_in_word = word_letters.reduce((acc, curr) => {
        if (curr === word_letter) {
          return acc + 1;
        }
        return acc;
      }, 0);

      // number of available occurences for the given letter
      const qtt_allowed = daily_letters.reduce((acc, curr) => {
        if (curr === word_letter) {
          return acc + 1;
        }
        return acc;
      }, 0);

      if (qtt_in_word > qtt_allowed) return false;
    }

    return true;
  });

  return en_dict_filtered;
}

module.exports = { filter_dict };
