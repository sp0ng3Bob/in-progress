import glMatrix from "glMatrix"

const vec3 = glMatrix.vec3
const mat4 = glMatrix.mat4
const quat = glMatrix.quat

/* Texture (UV) mapping */
function calculatePlanarMapping(vertices, projectionDirection = [0, 0, 1]) {
  const uvs = []

  // Step 1: Normalize the projection direction
  const projDir = vec3.normalize(vec3.create(), projectionDirection)
  const alignDirection = vec3.fromValues(0, 1, 0) // Y-axis for planar projection

  // Step 2: Calculate the quaternion that rotates projDir to alignDirection
  const rotationQuat = quat.create()
  quat.rotationTo(rotationQuat, projDir, alignDirection)

  // Step 3: Convert quaternion to a rotation matrix
  const rotationMatrix = mat4.fromQuat(mat4.create(), rotationQuat)

  for (let i = 0; i < vertices.length; i += 3) {
    const vertex = vec3.fromValues(vertices[i], vertices[i + 1], vertices[i + 2])

    // Step 4: Transform the vertex to align with the projection direction
    vec3.transformMat4(vertex, vertex, rotationMatrix)

    // Step 5: Use x and z for UV mapping
    uvs.push(vertex[0] * 0.5 + 0.5, vertex[2] * 0.5 + 0.5)
  }

  return new Float32Array(uvs)
}

function calculateCylindricalMapping(vertices, projectionDirection = [0, 0, 1]) {
  const uvs = []

  // Step 1: Normalize the projection direction
  const projDir = vec3.normalize(vec3.create(), projectionDirection)
  const alignDirection = vec3.fromValues(0, 1, 0) // Y-axis for cylindrical projection

  // Step 2: Calculate the quaternion that rotates projDir to alignDirection
  const rotationQuat = quat.create()
  quat.rotationTo(rotationQuat, projDir, alignDirection)

  // Step 3: Convert quaternion to a rotation matrix
  const rotationMatrix = mat4.fromQuat(mat4.create(), rotationQuat)

  for (let i = 0; i < vertices.length; i += 3) {
    const vertex = vec3.fromValues(vertices[i], vertices[i + 1], vertices[i + 2])

    // Step 4: Transform the vertex to align with the projection direction
    vec3.transformMat4(vertex, vertex, rotationMatrix)

    // Step 5: Compute theta (angle) and v for cylindrical mapping
    const theta = Math.atan2(vertex[2], vertex[0])
    const v = vertex[1] * 0.5 + 0.5 // Y axis

    uvs.push((theta + Math.PI) / (2 * Math.PI), v)
  }

  return new Float32Array(uvs)
}

function calculateSphericalMapping(vertices, projectionDirection = [0, 0, 1]) {
  const uvs = []

  // Step 1: Normalize the projection direction
  const projDir = vec3.normalize(vec3.create(), projectionDirection)
  const alignDirection = vec3.fromValues(0, 1, 0) // Y-axis for spherical projection

  // Step 2: Calculate the quaternion that rotates projDir to alignDirection
  const rotationQuat = quat.create()
  quat.rotationTo(rotationQuat, projDir, alignDirection)

  // Step 3: Convert quaternion to a rotation matrix
  const rotationMatrix = mat4.fromQuat(mat4.create(), rotationQuat)

  for (let i = 0; i < vertices.length; i += 3) {
    const vertex = vec3.fromValues(vertices[i], vertices[i + 1], vertices[i + 2])

    // Step 4: Transform the vertex to align with the projection direction
    vec3.transformMat4(vertex, vertex, rotationMatrix)

    // Step 5: Compute spherical coordinates
    const length = vec3.length(vertex)
    const theta = Math.atan2(vertex[2], vertex[0]) // X and Z
    const phi = Math.acos(vertex[1] / length) // Y

    uvs.push((theta + Math.PI) / (2 * Math.PI), phi / Math.PI)
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
    uvs[i] *= sx
    uvs[i + 1] *= sy
  }
  return uvs
}

function rotateUVs(uvs, angle) {
  const cosA = Math.cos(angle)
  const sinA = Math.sin(angle)
  for (let i = 0; i < uvs.length; i += 2) {
    const x = uvs[i]
    const y = uvs[i + 1]
    uvs[i] = cosA * x - sinA * y
    uvs[i + 1] = sinA * x + cosA * y
  }
  return uvs
}

export function setUVBuffer(gl, model, newUVs) {
  gl.bindBuffer(gl.ARRAY_BUFFER, model.uvs)
  gl.bufferData(gl.ARRAY_BUFFER, newUVs, gl.STATIC_DRAW)
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
export function updateMapping(bufferData, options) {
  if (!options?.mapping) { return }

  if (options.mapping === "Planar") {
    bufferData.uvs = updateUVs(calculatePlanarMapping(bufferData.positions, options.projectionDirection), options)
  } else if (options.mapping === "Cylindrical") {
    bufferData.uvs = updateUVs(calculateCylindricalMapping(bufferData.positions, options.projectionDirection), options) //options.projectionDirection
  } else if (options.mapping === "Spherical") {
    bufferData.uvs = updateUVs(calculateSphericalMapping(bufferData.positions, options.projectionDirection), options)
  } else {
    bufferData.uvs = updateUVs(bufferData.defaultUVs, options)
  }
}

function updateUVs(uvs, options) {
  uvs = translateUVs(uvs, options.translateX, options.translateY)
  uvs = rotateUVs(uvs, options.rotate)
  uvs = scaleUVs(uvs, options.scaleX, options.scaleY)
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