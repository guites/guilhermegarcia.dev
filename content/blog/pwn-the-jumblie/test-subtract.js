const letters = "errofmleapciamarattrsen";

const suggestions = ["camera", "lens", "frame", "portraits"];

const pool = prep(letters);
console.log(pool);
for (let i = 0; i < suggestions.length; i++) {
  const suggestion = suggestions[i];
  console.log(suggestion, scramble(pool, suggestion));
}

function prep(letters) {
  var arr = new Array(256);
  for (let i = 0; i < 256; i++) {
    arr[i] = 0;
  }

  for (i = 0; i < letters.length; i++) {
    arr[letters.charCodeAt(i)] += 1;
  }
  return arr;
}

function scramble(pool, seed) {
  for (let i = 0; i < seed.length; i++) {
    pool[seed.charCodeAt(i)] -= 1;
    if (pool[seed.charCodeAt(i)] < 0) {
      return false;
    }
  }
  return true;
}
