import glMatrix from "glMatrix"

const vec3 = glMatrix.vec3
const mat4 = glMatrix.mat4

/* Texture (UV) mapping */
function calculatePlanarMapping(vertices, projectionDirection = "Z") {
  const uvs = []
  for (let i = 0; i < vertices.length; i += 3) {
    let u, v

    if (projectionDirection === "X") {
      u = vertices[i + 1] * 0.5 + 0.5 // Y
      v = vertices[i + 2] * 0.5 + 0.5 // Z
    } else if (projectionDirection === "Y") {
      u = vertices[i] * 0.5 + 0.5     // X
      v = vertices[i + 2] * 0.5 + 0.5 // Z
    } else {  // Default: Z projection
      u = vertices[i] * 0.5 + 0.5     // X
      v = vertices[i + 1] * 0.5 + 0.5 // Y
    }

    uvs.push(u, v)
  }
  return new Float32Array(uvs)
}

function calculateCylindricalMapping(vertices, projectionDirection = "Y") {
  const uvs = []
  for (let i = 0; i < vertices.length; i += 3) {
    let theta, v

    if (projectionDirection === "X") {
      theta = Math.atan2(vertices[i + 2], vertices[i + 1])  // Z and Y
      v = vertices[i] * 0.5 + 0.5                           // X
    } else if (projectionDirection === "Z") {
      theta = Math.atan2(vertices[i + 1], vertices[i])  // Y and X
      v = vertices[i + 2] * 0.5 + 0.5                   // Z
    } else {  // Default: Y projection
      theta = Math.atan2(vertices[i + 2], vertices[i])  // Z and X
      v = vertices[i + 1] * 0.5 + 0.5                   // Y
    }

    uvs.push((theta + Math.PI) / (2 * Math.PI), v)
  }
  return new Float32Array(uvs)
}

function calculateSphericalMapping(vertices, projectionDirection = "Y") {
  const uvs = []
  for (let i = 0; i < vertices.length; i += 3) {
    const length = Math.sqrt(vertices[i] ** 2 + vertices[i + 1] ** 2 + vertices[i + 2] ** 2)
    let theta, phi

    if (projectionDirection === "X") {
      theta = Math.atan2(vertices[i + 2], vertices[i + 1])  // Z and Y
      phi = Math.acos(vertices[i] / length)                 // X
    } else if (projectionDirection === "Z") {
      theta = Math.atan2(vertices[i + 1], vertices[i])  // Y and X
      phi = Math.acos(vertices[i + 2] / length)         // Z
    } else {  // Default: Y projection
      theta = Math.atan2(vertices[i + 2], vertices[i])  // Z and X
      phi = Math.acos(vertices[i + 1] / length)         // Y
    }

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

/* WebGL texture helper stuff, lol */
function getUVFromGeoModel(model) {
  return model.uvs
}

function getCurrentUVFromGeoModel(gl, model) {
  gl.bindBuffer(gl.ARRAY_BUFFER, model.uvs)
  const uvData = new Float32Array(model.uvs.length)
  gl.getBufferSubData(gl.ARRAY_BUFFER, 0, uvData)
  return uvData
}

function getCurrentDataFromGeoModel(gl, glBuffer) {
  gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer)
  const data = new Float32Array(glBuffer.length)
  gl.getBufferSubData(gl.ARRAY_BUFFER, 0, data)
  return data
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

  if ("Planar") {
    bufferData.uvs = updateUVs(calculatePlanarMapping(bufferData.positions), options)
  } else if ("Cylindrical") {
    bufferData.uvs = updateUVs(calculateCylindricalMapping(bufferData.positions), options) //options.projectionDirection
  } else if ("Spherical") {
    bufferData.uvs = updateUVs(calculateSphericalMapping(bufferData.positions), options)
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