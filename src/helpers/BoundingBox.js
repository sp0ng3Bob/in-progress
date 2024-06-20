export function calculate(vertices) {
  let minX = Infinity, minY = Infinity, minZ = Infinity
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity

  // Iterate through vertices to compute the bounding box
  //   for (const vertex of vertices) {
  //     const [x, y, z] = vertex
  for (let v = 0; v < vertices.length; v += 3) {
    const [x, y, z] = [vertices[v], vertices[v + 1], vertices[v + 2]]
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    minZ = Math.min(minZ, z)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
    maxZ = Math.max(maxZ, z)
  }

  const min = { x: minX, y: minY, z: minZ }
  const max = { x: maxX, y: maxY, z: maxZ }

  return { min, max }
}