// camera mouse movement

export function cameraMovement(e, cameraTarget) {
  const deltaX = e.movementX;
  const deltaY = e.movementY;

  const sensitivity = 1.5;
  cameraTarget[0] += deltaX * sensitivity;
  cameraTarget[1] -= deltaY * sensitivity;

  return cameraTarget;
}

export function cubicBezierPointAndTangent(controlPoints, t) {
  const n = controlPoints.length - 1;
  const p = [0, 0, 0];
  const tangent = [0, 0, 0];
  for (let i = 0; i <= n; i++) {
    const b =
      binomialCoefficient(n, i) * Math.pow(1 - t, n - i) * Math.pow(t, i);
    for (let j = 0; j < 3; j++) {
      p[j] += controlPoints[i][j] * b;
      if (i < n) {
        const tangentTerm = n * (controlPoints[i + 1][j] - controlPoints[i][j]);
        tangent[j] += tangentTerm * b;
      }
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
