var count = "abbdd".split("").reduce((acc, curr) => {
  if (curr === "b") {
    return acc + 1;
  }
  return acc;
}, 0);
console.log(count);
