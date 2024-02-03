const { Tree, Node } = require("./trees");
const {
  filter_dict,
  sort_by_word_popularity,
  create_scramble_map,
} = require("./preprocess-dict");

const minWordLength = 4;

function combinationTree(suggestions, offset, letters_str) {
  const tree = new Tree([]);

  const first = suggestions[offset];
  if (first === "") return null;

  const letterPool = createPool(letters_str);

  if (!subtractFromPool(letterPool, first)) return null;

  const poolLength = letters_str.length - first.length;

  for (let j = offset + 1; j < suggestions.length; j++) {
    const second = suggestions[j];
    if (second === "") continue;

    const secondPoolLength = poolLength - second.length;

    // we need minWordLength letters available for the third word
    // and minWordLength letters available for the fourth word
    if (secondPoolLength < 2 * minWordLength) continue;

    const secondPool = letterPool.slice(0);

    if (!subtractFromPool(secondPool, second)) continue;

    for (let k = j + 1; k < suggestions.length; k++) {
      const third = suggestions[k];
      if (third === "") continue;

      const thirdPoolLength = secondPoolLength - third.length;

      // we need minWordLength letters available for the fourth word
      if (thirdPoolLength < minWordLength) {
        continue;
      }

      const thirdPool = secondPool.slice(0);

      if (!subtractFromPool(thirdPool, third)) continue;

      for (let l = k + 1; l < suggestions.length; l++) {
        const fourth = suggestions[l];
        if (fourth === "") continue;

        // make sure we are using all letters when matching the last one
        if (thirdPoolLength - fourth.length !== 0) continue;

        const fourthPool = thirdPool.slice(0);

        if (!subtractFromPool(fourthPool, fourth)) continue;

        // combinations.push([first, second, third, fourth]);
        let firstNode = tree.getNodeByName(first);
        if (!firstNode) {
          const firstNode = new Node(first, [
            new Node(second, [new Node(third, [new Node(fourth)])]),
          ]);
          tree.addChild(firstNode);
          continue;
        }

        let secondNode = firstNode.getChildByName(second);

        if (!secondNode) {
          secondNode = firstNode.addChild(
            new Node(second, [new Node(third, [new Node(fourth)])])
          );
          continue;
        }

        let thirdNode = secondNode.getChildByName(third);

        if (!thirdNode) {
          secondNode.addChild(new Node(third, [new Node(fourth)]));
          continue;
        }

        let fourthNode = thirdNode.getChildByName(fourth);

        if (!fourthNode) {
          thirdNode.addChild(new Node(fourth));
          continue;
        }
      }
    }
  }
  return tree;
}

const removeList = [];
let input, letters_str, letters_array, aswners;
let debug = false;
if (process.argv.length < 6) {
  // console.error("Type in the four words pls.");
  // process.exit(1);
  input = ["potion", "wand", "wizard", "spell"];
} else {
  if (process.argv.indexOf("--debug")) {
    debug = true;
  }
  input = process.argv.slice(2, 6);
}

letters_str = input.join(" ").replace(/\s/g, "");
console.log(letters_str);

letters_array = letters_str.split("");
aswners = input;

const filtered_dictionary = filter_dict(letters_array);
const sorted_dictionary = sort_by_word_popularity(filtered_dictionary);
const { scrambleMap, scrambledWords } = create_scramble_map(
  sorted_dictionary,
  debug
);

console.log(`Searching for ${aswners} within ${letters_str}`);

while (scrambledWords.length > 0) {
  while (removeList.length > 0) {
    const removedSuggestion = removeList.pop();
    scrambledWords.splice(removedSuggestion.indexOf(removedSuggestion), 1);
  }

  const tree = combinationTree(scrambledWords, 0, letters_str);

  if (tree === null || tree.nodes.length == 0) {
    scrambledWords.splice(0, 1);
    continue;
  }

  let root = tree.nodes[0];
  let options = scrambleMap[root.name];
  console.log(`Looking within ${options}`);
  let match = null;

  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    if (aswners.includes(option)) {
      match = option;
      break;
    }
  }
  if (!match) {
    scrambledWords.splice(0, 1);
    continue;
  }
  const currAwsners = aswners.slice(0);

  console.log(`Found ${match}!`);

  currAwsners.splice(currAwsners.indexOf(match), 1);

  while (root.children.length > 0) {
    const node = root.children[0];
    options = scrambleMap[node.name];

    match = null;
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      if (currAwsners.includes(option)) {
        match = option;
        break;
      }
    }
    if (match) {
      console.log(`Found ${match}!`);
      root = node;
      currAwsners.splice(currAwsners.indexOf(match), 1);
      if (currAwsners.length === 0) {
        console.log("-------");
        console.log("Finished!");
        process.exit(0);
      }
      continue;
    }

    removeList.push(node.name);
    root.removeChildByName(node.name);
  }
}

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
 * adapted from https://codereview.stackexchange.com/a/179179
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
