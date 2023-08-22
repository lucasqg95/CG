export const TREES_POSTION = Array.from({ length: 50 }, (_, index) => [
  randomBetweenMinus20And20() + (index + 1) * 5 * randomPositiveOrNegative(),
  0,
  randomBetweenMinus20And20() + (index + 1) * 5 * randomPositiveOrNegative(),
]);

export const degToRad = (d) => (d * Math.PI) / 180;

export const radToDeg = (r) => (r * 180) / Math.PI;

function randomPositiveOrNegative() {
  // Generate a random number between 0 (inclusive) and 1 (exclusive)
  const random = Math.random();

  // Randomly determine if the number should be positive or negative
  const randomNumber = random < 0.5 ? -1 * 1 : 1;

  return randomNumber;
}

export function randomBetweenMinus20And20() {
  let randomNumber;

  do {
    // Generate a random number between -20 (inclusive) and 20 (exclusive)
    randomNumber = Math.floor(Math.random() * 40) - 20;
  } while (randomNumber >= -10 && randomNumber < 10);
  return randomNumber;
}

export function cubicBezierPointAndTangent(controlPoints, t) {
  const n = controlPoints.length - 1;
  const p = vec3.create();
  const tangent = vec3.create();
  for (let i = 0; i <= n; i++) {
    const b =
      binomialCoefficient(n, i) * Math.pow(1 - t, n - i) * Math.pow(t, i);
    vec3.scaleAndAdd(p, p, controlPoints[i], b);
    if (i < n) {
      const tangentTerm = n * (controlPoints[i + 1] - controlPoints[i]);
      vec3.scaleAndAdd(tangent, tangent, tangentTerm, b);
    }
  }
  return { position: p, tangent: tangent };
}

// Calculate binomial coefficient
export function binomialCoefficient(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let result = 1;
  for (let i = 1; i <= k; i++) {
    result *= (n - i + 1) / i;
  }
  return result;
}
