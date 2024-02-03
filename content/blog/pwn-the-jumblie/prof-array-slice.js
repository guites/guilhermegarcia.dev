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

const letters = "showclownjuggletrapeze";

const pool = createPool(letters);
for (let i = 0; i < 10000000; i++) {
  const secPool = pool.slice(0);
  // const secPool = arrayCopy(pool);
}

function arrayCopy(arr) {
  var newArr = new Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    newArr[i] = arr[i];
  }
  return newArr;
}
