const { filter_dict } = require("./preprocess-v1.js");
const fs = require("fs");

const minWordLength = 4;
const letters = "datagraphdividecalculus";
const suggestions = filter_dict(letters.split(""));

const combinations = [];

for (let i = 0; i < suggestions.length; i++) {
  const first = suggestions[i];
  const letterPool = createPool(letters);
  if (!subtractFromPool(letterPool, first)) continue;
  const poolLength = letters.length - first.length;

  for (let j = i + 1; j < suggestions.length; j++) {
    const second = suggestions[j];
    const secondPoolLength = poolLength - second.length;
    if (secondPoolLength < 2 * minWordLength) continue;
    const secondPool = letterPool.slice(0);
    if (!subtractFromPool(secondPool, second)) continue;

    for (let k = j + 1; k < suggestions.length; k++) {
      const third = suggestions[k];
      const thirdPoolLength = secondPoolLength - third.length;
      if (thirdPoolLength < minWordLength) continue;
      const thirdPool = secondPool.slice(0);
      if (!subtractFromPool(thirdPool, third)) continue;

      for (let l = k + 1; l < suggestions.length; l++) {
        const fourth = suggestions[l];
        if (thirdPoolLength - fourth.length !== 0) continue;
        const fourthPool = thirdPool.slice(0);
        if (!subtractFromPool(fourthPool, fourth)) continue;
        combinations.push([first, second, third, fourth]);
      }
    }
  }
}

fs.writeFileSync(
  "post-filter-v1.json",
  JSON.stringify(combinations),
  function (err) {
    if (err) {
      console.error("crap");
    }
  }
);

/**
 * Returns an array where the index represents the ascii
 * code and the value represents the number of occurences
 * for each letter in `letters`.
 *
 * @param {String} letters
 * @returns {Array.<int>}
 */
function createPool(letters) {
  var arr = new Array(256);
  for (let i = 0; i < 256; i++) {
    arr[i] = 0;
  }

  for (i = 0; i < letters.length; i++) {
    arr[letters.charCodeAt(i)] += 1;
  }
  return arr;
}

/**
 * Returns whether all characters from `seed`
 * are present in the given `pool`.
 *
 * This method modifies `pool` by subtracting all
 * characters from `seed`.
 *
 * @param {Array.<int>} pool
 * @param {String} seed
 * @returns {Boolean}
 */
function subtractFromPool(pool, seed) {
  for (let i = 0; i < seed.length; i++) {
    pool[seed.charCodeAt(i)] -= 1;
    if (pool[seed.charCodeAt(i)] < 0) {
      return false;
    }
  }
  return true;
}
