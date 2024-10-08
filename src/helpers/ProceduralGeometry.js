import { WebGL } from "../engine/WebGL.js"

import {
  getPositionNormalised,
  getPositionString
} from "./PointLight.js"

import {
  updateMapping,
  fetchImage
} from "./Textures.js"

import * as BB from "./BoundingBox.js"

import glMatrix from "glMatrix"

const vec3 = glMatrix.vec3
const mat4 = glMatrix.mat4
const mat3 = glMatrix.mat3
const quat = glMatrix.quat

/* Private helpers */
function enableAndSetUpVertexAttribute(gl, attribute, size, type) {
  gl.enableVertexAttribArray(attribute)
  gl.vertexAttribPointer(attribute, size, type, false, 0, 0)
}

function createAndBindBuffer(gl, data, attribute = undefined, target = undefined, usage = undefined) {
  target = target ?? gl.ARRAY_BUFFER
  usage = usage ?? gl.DYNAMIC_DRAW

  const buffer = gl.createBuffer()
  gl.bindBuffer(target, buffer)
  if (data.length > 0) {
    gl.bufferData(target, data, usage)
  }
  if (attribute) {
    enableAndSetUpVertexAttribute(gl, ...Object.values(attribute))
  }
  return buffer
}

async function prepareBuffers(gl, program, bufferData, color, textureImage, textureImageBlob) {
  const { positions, normals, indices, uvs } = bufferData

  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)

  const positionBuffer = createAndBindBuffer(gl, positions, { attr: program.attributes.aPosition, size: 3, type: gl.FLOAT })
  const normalBuffer = createAndBindBuffer(gl, normals, { attr: program.attributes.aNormal, size: 3, type: gl.FLOAT })
  const indexBuffer = createAndBindBuffer(gl, indices, null, gl.ELEMENT_ARRAY_BUFFER)
  const uvBuffer = createAndBindBuffer(gl, uvs, { attr: program.attributes.aTexCoord, size: 2, type: gl.FLOAT })

  const texture = await setUpTexture(gl, textureImage, textureImageBlob)
  const sampler = WebGL.createSampler(gl, {
    wrapS: gl.REPEAT,
    wrapT: gl.REPEAT,
    min: gl.LINEAR_MIPMAP_LINEAR,
    mag: gl.LINEAR
  })
  const baseColor = color

  return {
    indexCount: indices.length,
    vao,
    texture,
    sampler,
    baseColor,
    buffers: {
      positions: positionBuffer,
      indices: indexBuffer,
      normals: normalBuffer,
      uvs: uvBuffer
    }
  }
}

function updateBufferData(gl, data, buffer, target = gl.ARRAY_BUFFER, usage = gl.DYNAMIC_DRAW) {
  gl.bindBuffer(target, buffer)
  gl.bufferData(target, data, usage)
  //gl.bufferSubData(target, 0, data)
}

async function updateBuffers(gl, model) {
  gl.bindVertexArray(model.vao)

  updateBufferData(gl, model.bufferData.positions, model.buffers.positions)
  updateBufferData(gl, model.bufferData.normals, model.buffers.normals)
  updateBufferData(gl, model.bufferData.indices, model.buffers.indices, gl.ELEMENT_ARRAY_BUFFER)
  updateBufferData(gl, model.bufferData.uvs, model.buffers.uvs)

  model.indexCount = model.bufferData.indices.length
}

function applyTransformations(pos, norm, T, R) {
  const transformMatrix = mat4.create()
  mat4.fromRotationTranslationScale(transformMatrix, R, T, [1, 1, 1])

  const transformedPositions = []
  //let min = vec3.fromValues(Infinity, Infinity, Infinity)
  //let max = vec3.fromValues(-Infinity, -Infinity, -Infinity)
  for (let i = 0; i < pos.length; i += 3) {
    const vertex = vec3.fromValues(pos[i], pos[i + 1], pos[i + 2])
    vec3.transformMat4(vertex, vertex, transformMatrix)
    transformedPositions.push(...vertex)

    //vec3.min(min, min, vertex)
    //vec3.max(max, max, vertex)
  }

  return {
    positions: new Float32Array(transformedPositions),
    //min,
    //max
    //normals: new Float32Array(transformedNormals)
  }
}

function createPlaneGeometry(size = 1, position = [0, 0, 0], rotation = [0, 0, 0, 1]) {
  const halfSize = size / 2
  const defaultPositions = new Float32Array([
    -halfSize, 0, halfSize,
    halfSize, 0, halfSize,
    halfSize, 0, -halfSize,
    -halfSize, 0, -halfSize
  ])

  const defaultNormals = new Float32Array([
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0
  ])

  const indices = new Uint16Array([
    0, 1, 2,
    2, 3, 0
  ])

  const uvs = new Float32Array([
    0, 1,
    1, 1,
    1, 0,
    0, 0
  ])

  const { positions, min, max } = applyTransformations(defaultPositions, defaultNormals, position, rotation)

  return { positions, normals: new Float32Array(defaultNormals), indices, uvs, min, max }
}

function createCubeGeometry(size = 1, position = [0, 0, 0], rotation = [0, 0, 0, 1]) {
  const halfSize = size / 2
  const faceDefinitions = [
    [1, -1, 1, 1, -1, -1, 1, 1, -1, 1, 1, 1],     // Right
    [-1, -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1], // Left
    [-1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1],     // Top
    [-1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1], // Bottom
    [-1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1],     // Front
    [1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, -1]  // Back
  ]

  const faceUVs = [0, 1, 1, 1, 1, 0, 0, 0]

  const defaultPositions = []
  const defaultNormals = []
  const uvs = []

  faceDefinitions.forEach((face, faceIndex) => {
    for (let i = 0; i < 4; i++) {
      const x = halfSize * face[3 * i]
      const y = halfSize * face[3 * i + 1]
      const z = halfSize * face[3 * i + 2]
      defaultPositions.push(x, y, z)
      uvs.push(faceUVs[2 * i], faceUVs[2 * i + 1])
    }

    const normal = [0, 0, 0]
    normal[Math.floor(faceIndex / 2)] = faceIndex % 2 === 0 ? 1 : -1

    for (let i = 0; i < 4; i++) {
      defaultNormals.push(...normal)
    }
  })

  const indices = new Uint16Array([
    0, 1, 2, 0, 2, 3,
    4, 5, 6, 4, 6, 7,
    8, 9, 10, 8, 10, 11,
    12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19,
    20, 21, 22, 20, 22, 23
  ])

  const { positions, min, max } = applyTransformations(defaultPositions, defaultNormals, position, rotation)

  return {
    positions,
    normals: new Float32Array(defaultNormals),
    indices,
    uvs: new Float32Array(uvs),
    min,
    max
  }
}

function createSphereGeometry(radius = 1, position = [0, 0, 0], rotation = [0, 0, 0, 1], latBands = 36, longBands = 36) {
  const defaultPositions = []
  const defaultNormals = []
  const indices = []
  const uvs = []

  for (let lat = 0; lat <= latBands; lat++) {
    const theta = lat * Math.PI / latBands
    const sinTheta = Math.sin(theta)
    const cosTheta = Math.cos(theta)

    for (let lon = 0; lon <= longBands; lon++) {
      const phi = lon * 2 * Math.PI / longBands
      const sinPhi = Math.sin(phi)
      const cosPhi = Math.cos(phi)

      const x = cosPhi * sinTheta
      const y = cosTheta
      const z = sinPhi * sinTheta

      defaultPositions.push(radius * x, radius * y, radius * z)
      defaultNormals.push(x, y, z)

      uvs.push(lon / longBands, 1 - lat / latBands)
      /*const u = ((lon / longBands) * 2) % 1
      const v = lat / latBands
      uvs.push(u, v)*/

      if (lat < latBands && lon < longBands) {
        //uvs.push(lon / longBands, 1 - lat / latBands)
        const first = (lat * (longBands + 1)) + lon
        const second = first + longBands + 1

        indices.push(first, second, first + 1)
        indices.push(second, second + 1, first + 1)
      } /*else {
        if (lon === longBands) {
          uvs.push(0.5, 1 - lat / latBands)
        }
      }*/
    }
  }

  const { positions, min, max } = applyTransformations(defaultPositions, defaultNormals, position, rotation)

  return {
    positions,
    normals: new Float32Array(defaultNormals),
    indices: new Uint16Array(indices),
    uvs: new Float32Array(uvs),
    min,
    max
  }
}

function createTorusGeometry(outerRadius = 1, innerRadius = 0.4, position = [0, 0, 0], rotation = [0, 0, 0, 1], radialSegments = 36, tubularSegments = 36) {
  const defaultPositions = []
  const defaultNormals = []
  const indices = []
  const uvs = []

  const radius = outerRadius - innerRadius

  for (let j = 0; j < radialSegments; j++) {
    const theta = j * 2 * Math.PI / radialSegments
    const cosTheta = Number(Math.cos(theta).toFixed(3))
    const sinTheta = Number(Math.sin(theta).toFixed(3))

    for (let i = 0; i < tubularSegments; i++) {
      const phi = i * 2 * Math.PI / tubularSegments
      const cosPhi = Number(Math.cos(phi).toFixed(3))
      const sinPhi = Number(Math.sin(phi).toFixed(3))

      const x = (radius + innerRadius * cosPhi) * cosTheta
      const y = innerRadius * sinPhi
      const z = (radius + innerRadius * cosPhi) * sinTheta
      defaultPositions.push(x, y, z)

      const nx = cosPhi * cosTheta
      const ny = sinPhi
      const nz = cosPhi * sinTheta
      defaultNormals.push(nx, ny, nz)

      uvs.push(j / (radialSegments - 1), i / (tubularSegments - 1))

      const nextJ = (j + 1) % radialSegments
      const nextI = (i + 1) % tubularSegments
      const a = (tubularSegments * j) + i
      const b = (tubularSegments * nextJ) + i
      const c = (tubularSegments * nextJ) + nextI
      const d = (tubularSegments * j) + nextI
      indices.push(a, b, d)
      indices.push(b, c, d)
    }
  }

  const { positions, min, max } = applyTransformations(defaultPositions, defaultNormals, position, rotation)

  return {
    positions,
    normals: new Float32Array(defaultNormals),
    indices: new Uint16Array(indices),
    uvs: new Float32Array(uvs),
    min,
    max
  }
}

async function setUpTexture(gl, textureImage, textureImageBlob) {
  if (textureImage === "") { return undefined }

  try {
    let texture
    if (textureImageBlob) {
      texture = WebGL.createTexture(gl, {
        image: textureImageBlob,
        unit: 0,
        wrapS: gl.REPEAT,
        wrapT: gl.REPEAT,
        min: gl.LINEAR_MIPMAP_LINEAR,
        mag: gl.LINEAR
      })
    } else {
      const url = new URL(textureImage, window.location)
      const image = await fetchImage(url)
      texture = WebGL.createTexture(gl, {
        image,
        unit: 0,
        wrapS: gl.REPEAT,
        wrapT: gl.REPEAT,
        min: gl.LINEAR_MIPMAP_LINEAR,
        mag: gl.LINEAR
      })
    }
    return texture
  } catch (error) {
    console.error('Error loading image:', error)
    return undefined
  }
}


export function resetSampler(gl, model) {
  /*gl.bindTexture(gl.TEXTURE_2D, model.texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)*/

  /*WebGL.setMipMaps(gl, gl.TEXTURE_2D, model.texture, {
    unit: 0,
    wrapS: gl.REPEAT,
    wrapT: gl.REPEAT,
    min: gl.NEAREST_MIPMAP_NEAREST,
    mag: gl.NEAREST
  })*/

  gl.samplerParameteri(model.sampler, gl.TEXTURE_WRAP_S, gl.REPEAT)
  gl.samplerParameteri(model.sampler, gl.TEXTURE_WRAP_T, gl.REPEAT)
  gl.samplerParameteri(model.sampler, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
  gl.samplerParameteri(model.sampler, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

  //model.texture = 
  //generateMipmaps(gl, model.texture)
}

export function generateMipmaps(gl, texture) {
  WebGL.setMipMaps(gl, gl.TEXTURE_2D, texture, { unit: 0 })

  //gl.bindTexture(gl.TEXTURE_2D, texture)
  //gl.generateMipmap(gl.TEXTURE_2D)
}
/* ----- */

export async function createPlane(gl, program, options) {
  const bufferData = createPlaneGeometry(options.size, options.position, options.rotation)

  if (options.textureMappingsFromUser) {
    if (options.textureMappingsFromUser.length / 2 === bufferData.positions / 3) {
      bufferData.uvs = new Float32Array(options.textureMappingsFromUser)
    } else {
      console.error(`Invalid number of texture mappings provided. Expected ${bufferData.positions / 3} (U,V) pairs, but supplied only ${options.textureMappingsFromUser.length / 2}.`)
    }
  }
  bufferData.defaultUVs = bufferData.uvs.slice(0)
  updateMapping(bufferData, options.textureMappings, "Plane")

  const outModel = await prepareBuffers(gl, program, bufferData, options.material.color, options.texture, options.textureBlob)
  outModel.type = "Plane"
  outModel.bufferData = bufferData
  outModel.geometry = {
    size: options.size,
    position: getPositionString(options.position),
    rotation: getPositionString(options.rotation)
  }
  outModel.texturing = {
    texture: options.texture,
    textureMappings: options.textureMappings
  }
  outModel.shadingModel = {
    type: options.material.type,
    diffuseColor: options.material.diffuseColor,
    specularColor: options.material.specularColor,
    shininess: options.material.shininess
  }

  const minMax = BB.calculate(bufferData.positions)
  const bb = {
    x: (minMax.max.x - minMax.min.x).toFixed(3),
    y: (minMax.max.y - minMax.min.y).toFixed(3),
    z: (minMax.max.z - minMax.min.z).toFixed(3)
  }
  outModel.info = {
    numberOfVertices: bufferData.positions.length / 3,
    numberOfIndices: outModel.indexCount / 3,
    boundingBox: `x: ${bb.x} | y: ${bb.y} | z: ${bb.z}`
  }
  return outModel
}

export async function createCube(gl, program, options) {
  const bufferData = createCubeGeometry(options.size, options.position, options.rotation)

  if (options.textureMappingsFromUser) {
    if (options.textureMappingsFromUser.length / 2 === bufferData.positions / 3) {
      bufferData.uvs = new Float32Array(options.textureMappingsFromUser)
    } else {
      console.error(`Invalid number of texture mappings provided. Expected ${bufferData.positions / 3} (U,V) pairs, but supplied only ${options.textureMappingsFromUser.length / 2}.`)
    }
  }
  bufferData.defaultUVs = bufferData.uvs.slice(0)
  updateMapping(bufferData, options.textureMappings, "Cube")

  const outModel = await prepareBuffers(gl, program, bufferData, options.material.color, options.texture, options.textureBlob)
  outModel.type = "Cube"
  outModel.bufferData = bufferData
  outModel.geometry = {
    size: options.size,
    position: getPositionString(options.position),
    rotation: getPositionString(options.rotation)
  }
  outModel.texturing = {
    texture: options.texture,
    textureMappings: options.textureMappings
  }
  outModel.shadingModel = {
    type: options.material.type,
    diffuseColor: options.material.diffuseColor,
    specularColor: options.material.specularColor,
    shininess: options.material.shininess
  }

  const minMax = BB.calculate(bufferData.positions)
  const bb = {
    x: (minMax.max.x - minMax.min.x).toFixed(3),
    y: (minMax.max.y - minMax.min.y).toFixed(3),
    z: (minMax.max.z - minMax.min.z).toFixed(3)
  }
  outModel.info = {
    numberOfVertices: bufferData.positions.length / 3,
    numberOfIndices: outModel.indexCount / 3,
    boundingBox: `x: ${bb.x} | y: ${bb.y} | z: ${bb.z}`
  }
  return outModel
}

export async function createSphere(gl, program, options) {
  const bufferData = createSphereGeometry(options.radius, options.position, options.rotation, options.latBands, options.lonBands)

  if (options.textureMappingsFromUser) {
    if (options.textureMappingsFromUser.length / 2 === bufferData.positions / 3) {
      bufferData.uvs = new Float32Array(options.textureMappingsFromUser)
    } else {
      console.error(`Invalid number of texture mappings provided. Expected ${bufferData.positions / 3} (U,V) pairs, but supplied only ${options.textureMappingsFromUser.length / 2}.`)
    }
  }
  bufferData.defaultUVs = bufferData.uvs.slice(0)
  updateMapping(bufferData, options.textureMappings, "Sphere")

  const outModel = await prepareBuffers(gl, program, bufferData, options.material.color, options.texture, options.textureBlob)
  outModel.type = "Sphere"
  outModel.bufferData = bufferData
  outModel.geometry = {
    size: options.radius,
    position: getPositionString(options.position),
    rotation: getPositionString(options.rotation),
    lat: options.latBands,
    lon: options.lonBands
  }
  outModel.texturing = {
    texture: options.texture,
    textureMappings: options.textureMappings
  }
  outModel.shadingModel = {
    type: options.material.type,
    diffuseColor: options.material.diffuseColor,
    specularColor: options.material.specularColor,
    shininess: options.material.shininess
  }

  const minMax = BB.calculate(bufferData.positions)
  const bb = {
    x: (minMax.max.x - minMax.min.x).toFixed(3),
    y: (minMax.max.y - minMax.min.y).toFixed(3),
    z: (minMax.max.z - minMax.min.z).toFixed(3)
  }
  outModel.info = {
    numberOfVertices: bufferData.positions.length / 3,
    numberOfIndices: outModel.indexCount,
    boundingBox: `x: ${bb.x} | y: ${bb.y} | z: ${bb.z}`
  }
  return outModel
}

export async function createTorus(gl, program, options) {
  const bufferData = createTorusGeometry(options.radius, options.holeRadius, options.position, options.rotation, options.radialSegments, options.tubularSegments)

  if (options.textureMappingsFromUser) {
    if (options.textureMappingsFromUser.length / 2 === bufferData.positions / 3) {
      bufferData.uvs = new Float32Array(options.textureMappingsFromUser)
    } else {
      console.error(`Invalid number of texture mappings provided. Expected ${bufferData.positions / 3} (U,V) pairs, but supplied only ${options.textureMappingsFromUser.length / 2}.`)
    }
  }
  bufferData.defaultUVs = bufferData.uvs.slice(0)
  updateMapping(bufferData, options.textureMappings, "Torus")

  const outModel = await prepareBuffers(gl, program, bufferData, options.material.color, options.texture, options.textureBlob)
  outModel.type = "Torus"
  outModel.bufferData = bufferData
  outModel.geometry = {
    size: options.radius,
    innerHole: options.holeRadius,
    position: getPositionString(options.position),
    rotation: getPositionString(options.rotation),
    lat: options.radialSegments,
    lon: options.tubularSegments
  }
  outModel.texturing = {
    texture: options.texture,
    textureMappings: options.textureMappings
  }
  outModel.shadingModel = {
    type: options.material.type,
    diffuseColor: options.material.diffuseColor,
    specularColor: options.material.specularColor,
    shininess: options.material.shininess
  }

  const minMax = BB.calculate(bufferData.positions)
  const bb = {
    x: (minMax.max.x - minMax.min.x).toFixed(3),
    y: (minMax.max.y - minMax.min.y).toFixed(3),
    z: (minMax.max.z - minMax.min.z).toFixed(3)
  }
  outModel.info = {
    numberOfVertices: bufferData.positions.length / 3,
    numberOfIndices: outModel.indexCount / 3,
    boundingBox: `x: ${bb.x} | y: ${bb.y} | z: ${bb.z}`
  }
  return outModel
}

export async function updateGeoBuffers(gl, model) {
  switch (model.type) {
    case "Plane":
      model.bufferData = createPlaneGeometry(model.geometry.size, getPositionNormalised(model.geometry.position), getPositionNormalised(model.geometry.rotation))
      break
    case "Cube":
      model.bufferData = createCubeGeometry(model.geometry.size, getPositionNormalised(model.geometry.position), getPositionNormalised(model.geometry.rotation))
      break
    case "Sphere":
      model.bufferData = createSphereGeometry(model.geometry.size, getPositionNormalised(model.geometry.position), getPositionNormalised(model.geometry.rotation), model.geometry.lat, model.geometry.lon)
      break
    case "Torus":
      model.bufferData = createTorusGeometry(model.geometry.size, model.geometry.innerHole, getPositionNormalised(model.geometry.position), getPositionNormalised(model.geometry.rotation), model.geometry.lat, model.geometry.lon)
      break
    default:
      console.error("Unknown model type")
      return
  }

  await updateBuffers(gl, model)

  const minMax = BB.calculate(model.bufferData.positions)
  const bb = {
    x: (minMax.max.x - minMax.min.x).toFixed(3),
    y: (minMax.max.y - minMax.min.y).toFixed(3),
    z: (minMax.max.z - minMax.min.z).toFixed(3)
  }
  model.info.numberOfVertices = model.bufferData.positions.length / 3
  model.info.numberOfIndices = model.indexCount / 3
  model.info.boundingBox = `x: ${bb.x} | y: ${bb.y} | z: ${bb.z}`
}

export async function updateGeoTexture(gl, model) {
  gl.bindVertexArray(model.vao)
  const newTex = await setUpTexture(gl, model.texturing.texture, model.texturing.textureBlob)
  model.texture = newTex
}

export async function updateGeoTextureMapping(gl, model) {
  updateMapping(model.bufferData, model.texturing.textureMappings, model.type)
  gl.bindVertexArray(model.vao)

  if (model.texturing.textureMappings.mapping === "From a local file" && model.texturing.textureMappingsFromUser) {
    if (model.texturing.textureMappingsFromUser.length / 2 === model.bufferData.positions / 3) {
      model.bufferData.uvs = new Float32Array(model.texturing.textureMappingsFromUser)
      updateBufferData(gl, model.bufferData.uvs, model.buffers.uvs)
    } else {
      console.error(`Invalid number of texture mappings provided. Expected ${model.bufferData.positions / 3} (U,V) pairs, but supplied only ${model.texturing.textureMappingsFromUser.length / 2}.`)
      updateBufferData(gl, model.bufferData.defaultUVs, model.buffers.uvs)
    }
  } else {
    updateBufferData(gl, model.bufferData.uvs, model.buffers.uvs)
  }
}