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

function createPoolDict(letters) {
  const obj = {};
  for (let i = 0; i < letters.length; i++) {
    obj[letters[i]] = 0;
  }
  for (let i = 0; i < letters.length; i++) {
    obj[letters[i]] += 1;
  }
  return obj;
}

const letters = "aaaaceeefilmmnoprrrrstt";
const poolDict = createPoolDict(letters);
const pool = createPool(letters);

for (let i = 0; i < 1000000; i++) {
  const objCopy = Object.assign({}, poolDict);
  // const poolCopy = pool.slice(0);
}
