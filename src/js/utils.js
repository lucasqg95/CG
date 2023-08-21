const TREES_POSTION = Array.from({ length: 50 }, (_, index) => [
  randomBetweenMinus20And20() + (index + 1) * 5 * randomPositiveOrNegative(),
  0,
  randomBetweenMinus20And20() + (index + 1) * 5 * randomPositiveOrNegative(),
]);

const degToRad = (d) => (d * Math.PI) / 180;

const radToDeg = (r) => (r * 180) / Math.PI;

function randomBetweenMinus20And20() {
  let randomNumber;

  do {
    // Generate a random number between -20 (inclusive) and 20 (exclusive)
    randomNumber = Math.floor(Math.random() * 40) - 20;
  } while (randomNumber >= -10 && randomNumber < 10);
  return randomNumber;
}

function randomPositiveOrNegative() {
  // Generate a random number between 0 (inclusive) and 1 (exclusive)
  const random = Math.random();

  // Randomly determine if the number should be positive or negative
  const randomNumber = random < 0.5 ? -1 * 1 : 1;

  return randomNumber;
}
