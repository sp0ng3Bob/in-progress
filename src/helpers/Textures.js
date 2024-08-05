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
*/
export function updateMapping(gl, model, options) {
  let uvs
  switch (options.mapping) {
    case 'Planar':
      uvs = calculatePlanarMapping(model.positions)
      break
    case 'Cylindrical':
      uvs = calculateCylindricalMapping(model.positions)
      break
    case 'Spherical':
      uvs = calculateSphericalMapping(model.positions)
      break
    default:
      uvs = model.uvs //getUVFromGeoModel(model)
      break
  }
  return uvs //updateUVs(gl, model, uvs)
}

function updateUVs(gl, model, options) {
  let uvs = getCurrentUVFromGeoModel(gl, model)
  uvs = translateUVs(uvs, options.translateX, options.translateY)
  uvs = rotateUVs(uvs, options.rotate)
  uvs = scaleUVs(uvs, options.scaleX, options.scaleY)
  setUVBuffer(gl, model, uvs)
  //return uvs
}

export function fetchImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', e => resolve(image))
    image.addEventListener('error', reject)
    image.src = url
  })
}