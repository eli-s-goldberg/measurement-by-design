export function generateDonutHoleData(
  nOuter,
  nInner,
  innerRadius,
  outerRadius
) {
  const X = [];
  const y = [];

  // Helper function to generate random points in a circular region
  function randomPointInCircle(radiusMin, radiusMax) {
    const angle = Math.random() * 2 * Math.PI;
    const radius = radiusMin + Math.random() * (radiusMax - radiusMin);
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    return [x, y];
  }

  // Generate points in the outer donut region
  for (let i = 0; i < nOuter; i++) {
    const [x, yVal] = randomPointInCircle(innerRadius, outerRadius);
    X.push([x, yVal]);
    y.push(0); // Class 0 for outer region
  }

  // Generate points in the inner hole region
  for (let i = 0; i < nInner; i++) {
    const [x, yVal] = randomPointInCircle(0, innerRadius);
    X.push([x, yVal]);
    y.push(1); // Class 1 for inner region
  }

  return { X, y };
}
