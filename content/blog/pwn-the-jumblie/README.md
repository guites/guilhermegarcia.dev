This is an attempt to solve the [jumblie](https://jumblie.com) by coming up with valid combinations
from the day's letters and the following restrictions:

1. There is a pool of 20 to 30 letters,
2. Each word has 4 to 9 letters,
3. There are 4 words in total.

[Screenshot of the jumblie victory screen](<Screenshot 2024-01-23 at 17.19.55.png>)

You can check the final implementation [here](https://wherever-that-is).

## Humble begginings

I'm supposing the words picked are common enough to be found in a simple dictionary. Since I'm on ubuntu, I'm
picking up the list of words at `/usr/share/dict/american-english`, and saving it as `american-english` on my cwd.

```bash
shuf -n 10 /usr/share/dict/american-english

Barents
zombies
backstroking
rhapsodies
slump's
popularize
expanded
Ewing
eclipsed
pursing
```

The thing is, it's packed with apostrophised, capitalized and upper/lowercase words.

So our first step is filtering it by removing all words:

- with fewer than 4 letters
- with more than 9 letters
- uppercase/lowercase repetitions
- apostrophised words (since there's no `'` on the game)

additionally, we can remove all words with letters that are not on the daily roll.

Say we have the initial letters `aaaa c eee f i l mm n o p rrrr s tt`.

![Letters aaaa c eee f i l mm n o p rrrr s tt in squiggly font](<Screenshot 2024-01-23 at 17.28.29.png>)

Every word containing `b`, `d`, `g`, `h`, ..., should be removed from our initial dictionary.

After the clean up, assuming our new file is saved as `word-pool.txt`, we should have:

```bash
$ wc -l american-english
102401 american-english

$ wc -l word-pool.txt
4546 word-pool.txt
```

Quite the reduction.

Now, we think of a way to find valid combinations.

![List of word displayed as four columns](<Screenshot 2024-01-23 at 17.37.08.png>)

Since our combinations must be made of four words, we can start with a four level deep nested loop.

```js
const suggestions = fs.readFileSync("word-pool.txt").toString().split("\n");

const combinations = [];

for (let i = 0; i < suggestions.length; i++)
  for (let j = 0; j < suggestions.length; j++)
    for (let k = 0; k < suggestions.length; k++)
      for (let l = 0; l < suggestions.length; l++)
        combinations.push([
          suggestions[i],
          suggestions[j],
          suggestions[k],
          suggestions[l],
        ]);
```

Besides being wildy inefficient, we are making multiple repeated combinations.

The inner loops shouldn't start from the beggining of the list, but be offset by their parents index (as in `j = i + 1`, `k = j + 1`, `l = k + 1`).

![List of words displayed as four columns, where each column to the right is offset by their parents word](<Screenshot 2024-01-23 at 17.42.45.png>)

This assures unique combinations while reducing the overall work done.

Is this a good enough list? Well, no. We are not taking into consideration our unique combination of letters.

For example, the following combination would be invalid (theres not enough `i`s and `m`s):

![the letters "a a a a c e e e f i l m m n o p r r r r s t t" being distributed amongst the words rifle primmer tramp treason](<Screenshot 2024-01-23 at 17.51.42.png>)

We need to account for the remaining letters every time we atempt a new combination.

We could do that by keeping a register of our available letters, and each time we match a new word to a combination, subtract it's letter from our register.

```js
/**
 * Returns the remainder letters after subtracting `testLetters` from `availableLetters`
 *
 * Returns false if `testLetters` is not contained inside `availableLetters`
 * @param {Array.<string>} availableLetters list of available letters to test against
 * @param {Array.<string>} testLetters list of letters that should be inside `availableLetters`
 */
function subtractAvailableLetters(availableLetters, testLetters) {
  for (const letter of testLetters) {
    if (!availableLetters.includes(letter)) {
      return false;
    }
    availableLetters.splice(availableLetters.indexOf(letter), 1);
  }
  return availableLetters;
}
```

And then we could adapt our nested loops to only keep combinations that use all available letters.

```js
const letters = ["a","a","a","a","c","e","e","e","f","i","l","m","m","n","o","p","r","r","r","r","s","t","t"];

for (let i = 0; i < suggestions.length; i++)
    const first = suggestions[i];
    const firstLetters = first.split("");
    const availLetters = subtractAvailableLetters([...letters], firstLetters);
  for (let j = 0; j < suggestions.length; j++)
        const second = suggestions[j];
        const secondLetters = second.split("");
        let secondAvailLetters = [...availLetters];
        secondAvailLetters = subtractAvailableLetters(
            secondAvailLetters,
            secondLetters
        );
        if (!secondAvailLetters) continue;
        for (let k = 0; k < suggestions.length; k++)
            ... // repeat same logic for the third word
            for (let l = 0; l < suggestions.length; l++)
                const fourth = suggestions[l];
                const fourthLetters = fourth.split("");
                let fourthAvailLetters = [...thirdAvailLetters];

                fourthAvailLetters = subtractAvailableLetters(
                    fourthAvailLetters,
                    fourthLetters
                );

                if (!fourthAvailLetters) continue;

                // skip if we haven't used all available letters
                if (fourthAvailLetters.length != 0) continue;

                combinations.push([
                    suggestions[i],
                    suggestions[j],
                    suggestions[k],
                    suggestions[l],
                ]);
```

Does it work? Yeah. But it's slow as heck.

Even if we prevent unnecessary calculations by skipping combinations where the first two words take more than the number of letters minus eight (since the third and fourth words needs at least 4 letters each), we still have a perfomance problem.

Assuming our script is named `generate-combinations.js`, we can run it for a single iteration of `i`:

```bash
$ time node generate-combinations.js
node generate-combinations.js  27.66s user 0.15s system 98% cpu 28.287 total
```

That's for one iteration of `i`. Since our word-pool.txt has 4546 entries, going through the whole thing would take about... 38 hours?

Aside: admitedly, some of this slowness is partly due to the fact that I'm using the spread operator ( e.g. `[...letters]` ) to copy the existing arrays. If we change that over to `.splice(0)`, we get a notable speed difference.

![its a shitty drawing of a sinking ship. its written "newArr = [...arr];" and "SS PERFORMANCE" on it](./ss-performance.png)

## Optimizing for speed

Turns out that our combination of looping over every new word letters and combining `.includes` with a `.splice` is bogging us down.

What we can do instead is use a combination of dictionaries and integer operations.

Based on [this neat post on stackoverflow](https://codereview.stackexchange.com/questions/179028/checking-whether-one-string-contains-all-the-characters-of-another-string/179179#179179), I've came up with the following solution:

```js
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
```

This function allows us to map a pool of letters (say `aaaaceeefilmmnoprrrrstt`) into an array of its equivalent ascii values.

The ascii value for `a` (lower case A) is 97, for `c` (lower case C) is 99, for `e` (lower case E) is 101, etc, so for our example letters, we would have:

```js
const letters = "aaaaceeefilmmnoprrrrstt";
const letterPool = createPool(letters);
console.log(letterPool[97]); // 4
console.log(letterPool[99]); // 1
console.log(letterPool[101]); // 3
```

Now, in order to remove letters from our pool, we can perform integer subtraction:

```js
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
```

So if we ever deplete our stock of a given letter, `subtractFromPool` warns us by return `false`.

```js
for (let i = 0; i < suggestions.length; i++)
  const first = suggestions[i];
  const letterPool = createPool(letters);
  if (!subtractFromPool(letterPool, first)) continue;
  for (let j = i + 1; j < suggestions.length; j++)
    const second = suggestions[j];
    const secondPool = letterPool.slice(0);
    if (!substractFromPool(secondPool, second)) continue;
    ...
```

This speeds our process drastically, but we still need to figure out how to parse our valid combinations.

The full code up to this point can be seem in files `post-filter-v1.js` and `preprocess-v1.js` at <https://gist.github.com/guites/9974eff078324ff0ea9551773d00d9a1>.

## There are many words in the english language

Turns our that for a set of 20 to 30 letters, we are left with tens of thousands of valid four word combinations.

Since our algorithm is ignorant of the daily theme, we need to group valid combinations into an easily parsable format.

Our current results, by pushing each resulting combination of `suggestions[i],suggestions[j],suggestions[k],suggestions[l]` into an array, is as follows:

```js
[
  ["acadia", "advil", "dutch", "splurge"],
  ["acadia", "advil", "gulch", "spurted"],
  ["acadia", "advil", "scrupled", "thug"],
  ["acadia", "chivas", "pull", "trudged"],
  ["acadia", "david", "purcell", "thugs"],
  ["acadia", "davids", "purcell", "thug"],
  ["acadia", "delphi", "ducts", "vulgar"],
  ["acadia", "delphic", "drug", "vaults"],
  ["acadia", "delphic", "drugs", "vault"],
  ["acadia", "delphic", "dust", "vulgar"],
  ["acadia", "delphic", "stud", "vulgar"],
  ["acadia", "drudge", "villa", "putsch"],
  ["acadia", "drupal", "divest", "gulch"],
  ["acadia", "drupal", "guilds", "vetch"],
  ...
  ["acadia", "itch", "puddles", "vulgar"],
  ["acadia", "scrupled", "thug", "valid"],
  ["acadia", "spliced", "thud", "vulgar"],
  ["accra", "advil", "disputed", "laugh"],
  ["accra", "advil", "gushed", "plaudit"],
  ["accra", "advil", "laughed", "stupid"],
  ["accra", "david", "gullah", "dispute"],
  ["accra", "david", "lupus", "alighted"],
  ... // like 30k more rows
]
```

There is no reason to test all combinations with the word `accadia` on it. If we find out that `accadia` isn't an awsner, we should just drop every row containing it.

In fact, if we think of our possible combinations as a set of branches, we could have something like this:

![Example of possible sets of branches](<Screenshot 2024-02-03 at 13.12.53.png>)

If at any point a word is not a match, we can discard everything below it.

## Tree structures

To reproduce this in javascript we can start with a simple `Node` class, representing a word on our structure, and allow it to have multiple child nodes.

```js
class Node {
  constructor(name, children) {
    this.name = name;
    this.children = children ?? [];
  }

  getChildByName(name) {
    if (this.children && this.children.length > 0) {
      for (let i = 0; i < this.children.length; i++) {
        const child = this.children[i];
        if (child.name === name) return child;
      }
    }
    return false;
  }

  addChild(node) {
    this.children.push(node);
    return node;
  }

  removeChildByName(name) {
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if (name === child.name) {
        this.children.splice(this.children.indexOf(child), 1);
      }
    }
  }
}
```

At this point we only need a few simple methods: adding new child nodes under our current node, deleting a node directly beneath the current node, and finding our whether our current node has a child with a given name.

TODO:

- remove plural form of words? this might reduce possible combinations.

  maybe add a call to .plural() from pluralize in line 64.

```

```
