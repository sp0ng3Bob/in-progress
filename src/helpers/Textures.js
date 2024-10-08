import glMatrix from "glMatrix"

const vec3 = glMatrix.vec3
const mat4 = glMatrix.mat4
const quat = glMatrix.quat

/* Texture (UV) mapping */
function calculatePlanarMapping(vertices, projectionDirection = [0, 0, 1]) {
  const uvs = []

  const projDir = vec3.create()
  vec3.normalize(projDir, projectionDirection)
  const alignDirection = vec3.fromValues(0, 1, 0)

  const rotationQuat = quat.create()
  quat.rotationTo(rotationQuat, projDir, alignDirection)

  const rotationMatrix = mat4.fromQuat(mat4.create(), rotationQuat)

  for (let i = 0; i < vertices.length; i += 3) {
    const vertex = vec3.fromValues(vertices[i], vertices[i + 1], vertices[i + 2])
    vec3.transformMat4(vertex, vertex, rotationMatrix)
    uvs.push(vertex[0] * 0.5 + 0.5, vertex[2] * 0.5 + 0.5)
  }

  /*let min = vec3.fromValues(Infinity, Infinity, Infinity)
  let max = vec3.fromValues(-Infinity, -Infinity, -Infinity)
  const newVertices = []
  for (let i = 0; i < vertices.length; i += 3) {
    const vertex = vec3.fromValues(vertices[i], vertices[i + 1], vertices[i + 2])
    vec3.transformMat4(vertex, vertex, rotationMatrix)
    newVertices.push(...vertex)
    vec3.min(min, min, vertex)
    vec3.max(max, max, vertex)
  }

  for (let i = 0; i < vertices.length; i += 3) {
    const newVertex = [newVertices[i], newVertices[i + 1], newVertices[i + 2]]
    const u = (newVertex[0] - min[0]) / (max[0] - min[0])
    const v = (newVertex[2] - min[2]) / (max[2] - min[2])
    uvs.push(u, v)
  }*/

  return new Float32Array(uvs)
}

function calculateCylindricalMapping(vertices, projectionDirection = [0, 0, 1]) {
  const uvs = []

  const projDir = vec3.create()
  vec3.normalize(projDir, projectionDirection)
  const alignDirection = vec3.fromValues(0, 1, 0)

  const rotationQuat = quat.create()
  quat.rotationTo(rotationQuat, projDir, alignDirection)

  const rotationMatrix = mat4.fromQuat(mat4.create(), rotationQuat)

  let min = vec3.fromValues(Infinity, Infinity, Infinity)
  let max = vec3.fromValues(-Infinity, -Infinity, -Infinity)
  const newVertices = []
  for (let i = 0; i < vertices.length; i += 3) {
    const vertex = vec3.fromValues(vertices[i], vertices[i + 1], vertices[i + 2])
    vec3.transformMat4(vertex, vertex, rotationMatrix)
    newVertices.push(...vertex)
    vec3.min(min, min, vertex)
    vec3.max(max, max, vertex)
  }

  for (let i = 0; i < vertices.length; i += 3) {
    const newVertex = [newVertices[i], newVertices[i + 1], newVertices[i + 2]]
    const theta = Math.atan2(newVertex[2], newVertex[0])
    const u = (theta + Math.PI) / (2 * Math.PI)
    //const v = (newVertex[2] - min[2]) / (max[2] - min[2])
    const v = (newVertex[1] - min[1]) / (max[1] - min[1] || 1)
    uvs.push(u, v)
  }

  return new Float32Array(uvs)
}

function calculateSphericalMapping(vertices, projectionDirection = [0, 0, 1]) {
  const uvs = []

  const projDir = vec3.create()
  vec3.normalize(projDir, projectionDirection)
  const alignDirection = vec3.fromValues(0, 1, 0)

  const rotationQuat = quat.create()
  quat.rotationTo(rotationQuat, projDir, alignDirection)

  const rotationMatrix = mat4.fromQuat(mat4.create(), rotationQuat)

  for (let i = 0; i < vertices.length; i += 3) {
    const vertex = vec3.fromValues(vertices[i], vertices[i + 1], vertices[i + 2])

    vec3.transformMat4(vertex, vertex, rotationMatrix)

    const length = vec3.length(vertex)
    const theta = Math.atan2(vertex[2], vertex[0])
    const phi = Math.acos(vertex[1] / length)

    const u = (theta + Math.PI) / (2 * Math.PI)
    const v = phi / Math.PI
    uvs.push(u, v)
  }

  return new Float32Array(uvs)
}

/* Texture transformation */
function translateUVs(uvs, tx, ty) {
  for (let i = 0; i < uvs.length; i += 2) {
    uvs[i] += tx
    uvs[i + 1] += ty
  }
  return uvs
}

function scaleUVs(uvs, sx, sy) {
  for (let i = 0; i < uvs.length; i += 2) {
    uvs[i] *= 1 / sx
    uvs[i + 1] *= 1 / sy
  }
  return uvs
}

function rotateUVs(uvs, angle) {
  const cosA = Math.cos(angle)
  const sinA = Math.sin(angle)
  for (let i = 0; i < uvs.length; i += 2) {
    const x = uvs[i] - 0.5
    const y = uvs[i + 1] - 0.5

    uvs[i] = cosA * x - sinA * y + 0.5
    uvs[i + 1] = sinA * x + cosA * y + 0.5
  }
  return uvs
}

/* READ THIS:
  - https://webgl2fundamentals.org/webgl/lessons/webgl-3d-textures.html
  - https://webgl2fundamentals.org/webgl/lessons/webgl-3d-perspective-correct-texturemapping.html
  - https://webgl2fundamentals.org/webgl/lessons/webgl-planar-projection-mapping.html
  - https://webgl2fundamentals.org/webgl/lessons/webgl-render-to-texture.html
  
  (and this)
  - https://webgl2fundamentals.org/webgl/lessons/webgl-data-textures.html
  - https://webgl2fundamentals.org/webgl/lessons/webgl-2-textures.html
  - https://stackoverflow.com/questions/30960403/multitexturing-theory-with-texture-objects-and-samplers

  - https://stackoverflow.com/questions/29577205/opengl-glgeneratemipmap-before-loading-texture-data
  [ glGenerateMipmap() takes the current content of the base level image (where the base level is the 
  level set as GL_TEXTURE_BASE_LEVEL, 0 by default), and generates all the mipmap levels from base 
  level + 1 to the maximum level.

  This means that glGenerateMipmap() has no effect on future calls to glTexImage2D(). 
  If you want your mipmaps to be updated after modifying the texture data with calls like 
  glTexImage2D() or glTexSubImage2D(), you have to call glGenerateMipmap() again. ]

*/
export function updateMapping(bufferData, options, type) {
  if (!options?.mapping) { return }

  if (options.mapping === "Planar") {
    bufferData.uvs = updateUVs(calculatePlanarMapping(bufferData.positions, options.projectionDirection), options)
  } else if (options.mapping === "Cylindrical") {
    bufferData.uvs = updateUVs(calculateCylindricalMapping(bufferData.positions, options.projectionDirection), options) //options.projectionDirection
  } else if (options.mapping === "Spherical") {
    bufferData.uvs = updateUVs(calculateSphericalMapping(bufferData.positions, options.projectionDirection), options)
  } else {
    bufferData.uvs = bufferData.defaultUVs.slice(0)
    bufferData.uvs = updateUVs(bufferData.uvs, options)
  }
}

function updateUVs(uvs, options) {
  uvs = rotateUVs(uvs, options.rotate)
  uvs = scaleUVs(uvs, options.scaleX, options.scaleY)
  uvs = translateUVs(uvs, options.translateX, options.translateY)
  return uvs
}

export function fetchImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = "Anonymous"
    image.addEventListener('load', e => resolve(image))
    image.addEventListener('error', reject)
    image.src = url
  })
}