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

function sort_by_word_popularity(words_list) {
  const word_pop = fs
    .readFileSync("google-10000-english-no-swears-4-to-9.txt")
    .toString()
    .split("\n");

  const common_words = [];
  const uncommon_words = [];
  for (let i = 0; i < words_list.length; i++) {
    const word = words_list[i];
    if (word_pop.indexOf(word) === -1) {
      uncommon_words.push(word);
      continue;
    }
    common_words.push(word);
  }

  common_words.sort((a, b) => {
    const indexA = word_pop.indexOf(a);
    const indexB = word_pop.indexOf(b);
    return indexA - indexB;
  });

  const sorted_words = common_words.concat(uncommon_words);
  return sorted_words;
}

function create_scramble_map(words_list, debug) {
  const scrambleMap = {};
  const scrambledWords = [];
  for (let i = 0; i < words_list.length; i++) {
    const word = words_list[i];
    const scrambledSuggestion = word.split("").sort().join("");

    if (scrambledSuggestion in scrambleMap) {
      scrambleMap[scrambledSuggestion].push(word);
    } else {
      scrambleMap[scrambledSuggestion] = [word];
      scrambledWords.push(scrambledSuggestion);
    }
  }

  if (debug === true) {
    // const file = fs.createWriteStream("suggestions-scrambled.txt");
    // file.on("error", function (err) {
    //   console.error(err);
    // });
    // scrambledWords.forEach((v) => file.write(v + "\n"));
    // file.end();

    fs.writeFileSync(
      "suggestions-scrambled.txt",
      scrambledWords.join("\n"),
      function (err) {
        if (err) {
          console.error("pooped on suggestions-scrambled.txt");
        }
      }
    );

    fs.writeFileSync(
      "map-scrambled.json",
      JSON.stringify(scrambleMap),
      function (err) {
        if (err) {
          console.error("crap");
        }
      }
    );
  }

  return { scrambleMap, scrambledWords };
}

module.exports = {
  filter_dict,
  sort_by_word_popularity,
  create_scramble_map,
};
