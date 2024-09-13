/* Texture (UV) mapping */
function calculatePlanarMapping(vertices) {
  const uvs = []
  for (let i = 0; i < vertices.length; i += 3) {
    uvs.push(vertices[i] * 0.5 + 0.5, vertices[i + 2] * 0.5 + 0.5)
  }
  return new Float32Array(uvs)
}

function calculateCylindricalMapping(vertices) {
  const uvs = []
  for (let i = 0; i < vertices.length; i += 3) {
    const theta = Math.atan2(vertices[i + 2], vertices[i])
    uvs.push((theta + Math.PI) / (2 * Math.PI), vertices[i + 1] * 0.5 + 0.5)
  }
  return new Float32Array(uvs)
}

function calculateSphericalMapping(vertices) {
  const uvs = []
  for (let i = 0; i < vertices.length; i += 3) {
    const length = Math.sqrt(vertices[i] ** 2 + vertices[i + 1] ** 2 + vertices[i + 2] ** 2)
    const theta = Math.atan2(vertices[i + 2], vertices[i])
    const phi = Math.acos(vertices[i + 1] / length)
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

function setUVBuffer(gl, model, newUVs) {
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
  if (!options?.mapping) { return bufferData.uvs }

  switch (options.mapping) {
    case 'Planar':
      return updateUVs(calculatePlanarMapping(bufferData.positions), options)
    case 'Cylindrical':
      return updateUVs(calculateCylindricalMapping(bufferData.positions), options)
    case 'Spherical':
      return updateUVs(calculateSphericalMapping(bufferData.positions), options)
    default:
      return bufferData.uvs
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