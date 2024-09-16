import { WebGL } from "../engine/WebGL.js"

import {
  getNormalisedRGB,
  getUnsignedRGB,
  getPositionNormalised,
  getPositionString
} from "./PointLight.js"

import {
  updateMapping,
  fetchImage,
  setUVBuffer
} from "./Textures.js"

import glMatrix from "glMatrix"

const vec3 = glMatrix.vec3
const mat4 = glMatrix.mat4
const mat3 = glMatrix.mat3
//const quat = glMatrix.quat

//export const geometryObjects = [] // Initialize an array to store objects
//const defaultSampler

/* Private helpers */
function enableAndSetUpVertexAttribute(gl, attribute, size, type) {
  gl.enableVertexAttribArray(attribute)
  gl.vertexAttribPointer(attribute, size, type, false, 0, 0)
}

function createAndBindBuffer(gl, data, attribute = undefined, target = undefined, usage = undefined) {
  target = target ?? gl.ARRAY_BUFFER
  usage = usage ?? gl.STATIC_DRAW

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
  const sampler = WebGL.createSampler(gl, { wrapS: gl.REPEAT, wrapT: gl.REPEAT, min: gl.NEAREST_MIPMAP_LINEAR, mag: gl.LINEAR })
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

function applyTransformations(positions, T, R) {
  const transformMatrix = mat4.create()
  mat4.fromRotationTranslationScale(transformMatrix, R, T, [1, 1, 1])

  const transformedPositions = []
  for (let i = 0; i < positions.length; i += 3) {
    const vertex = vec3.fromValues(positions[i], positions[i + 1], positions[i + 2])
    vec3.transformMat4(vertex, vertex, transformMatrix)
    transformedPositions.push(...vertex)
  }

  return new Float32Array(transformedPositions)
}

function createPlaneGeometry(size = 1, position = [0, 0, 0], rotation = [0, 0, 0, 1]) {
  const halfSize = size / 2
  let positions = new Float32Array([
    -halfSize, 0, halfSize,  // top-left
    halfSize, 0, halfSize,  // top-right
    halfSize, 0, -halfSize,  // bottom-right
    -halfSize, 0, -halfSize   // bottom-left
  ])

  const normals = new Float32Array([
    0, 1, 0, // top-left normal
    0, 1, 0, // top-right normal
    0, 1, 0, // bottom-right normal
    0, 1, 0  // bottom-left normal
  ])

  const indices = new Uint16Array([
    0, 1, 2,
    2, 3, 0
  ])

  const uvs = new Float32Array([
    0, 1, // top-left
    1, 1, // top-right
    1, 0, // bottom-right
    0, 0  // bottom-left
  ])

  positions = applyTransformations(positions, position, rotation)

  return { positions, normals, indices, uvs }
}

function createCubeGeometry(size = 1, position = [0, 0, 0], rotation = [0, 0, 0, 1]) {
  const halfSize = size / 2
  const faceDefinitions = [
    [-1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1],     // Front face
    [-1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1], // Back face
    [-1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1],     // Top face
    [-1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1], // Bottom face
    [1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1],     // Right face
    [-1, -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1]  // Left face
  ]

  const faceUVs = [
    [0, 0, 1, 0, 1, 1, 0, 1], // Front
    [0, 0, 1, 0, 1, 1, 0, 1], // Back
    [0, 0, 1, 0, 1, 1, 0, 1], // Top
    [0, 0, 1, 0, 1, 1, 0, 1], // Bottom
    [0, 0, 1, 0, 1, 1, 0, 1], // Right
    [0, 0, 1, 0, 1, 1, 0, 1]  // Left
  ]

  let positions = []
  const normals = []
  const uvs = []

  faceDefinitions.forEach((face, faceIndex) => {
    for (let i = 0; i < 4; i++) {
      const x = halfSize * face[3 * i] //+ position[0]
      const y = halfSize * face[3 * i + 1] //+ position[1]
      const z = halfSize * face[3 * i + 2] //+ position[2]
      positions.push(x, y, z)
      uvs.push(faceUVs[faceIndex][2 * i], faceUVs[faceIndex][2 * i + 1])
    }

    const normal = [0, 0, 0]
    normal[Math.floor(faceIndex / 2)] = faceIndex % 2 === 0 ? 1 : -1

    for (let i = 0; i < 4; i++) {
      normals.push(...normal)
    }
  })

  const indices = new Uint16Array([
    0, 1, 2, 0, 2, 3,       // front
    4, 5, 6, 4, 6, 7,       // back
    8, 9, 10, 8, 10, 11,    // top
    12, 13, 14, 12, 14, 15, // bottom
    16, 17, 18, 16, 18, 19, // right
    20, 21, 22, 20, 22, 23  // left
  ])

  positions = applyTransformations(positions, position, rotation)

  return {
    positions,
    normals: new Float32Array(normals),
    indices,
    uvs: new Float32Array(uvs)
  }
}

function createSphereGeometry(radius = 1, position = [0, 0, 0], rotation = [0, 0, 0, 1], latBands = 36, longBands = 36) {
  let positions = []
  const normals = []
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

      positions.push(radius * x, radius * y, radius * z)
      normals.push(x, y, z)
      uvs.push(lon / longBands, 1 - lat / latBands)

      if (lat < latBands && lon < longBands) {
        /*const first = (lat * longBands) + lon
        const second = first + longBands
        const nextLon = (lon + 1) % longBands
        indices.push(first, second, first + 1)
        indices.push(second, second + nextLon, first + nextLon)*/
        const first = (lat * (longBands + 1)) + lon
        const second = first + longBands + 1

        indices.push(first, second, first + 1)
        indices.push(second, second + 1, first + 1)
      }
    }
  }

  positions = applyTransformations(positions, position, rotation)

  return {
    positions,
    normals: new Float32Array(normals),
    indices: new Uint16Array(indices),
    uvs: new Float32Array(uvs)
  }
}

function createTorusGeometry(outerRadius = 1, innerRadius = 0.4, position = [0, 0, 0], rotation = [0, 0, 0, 1], radialSegments = 36, tubularSegments = 36) {
  let positions = []
  const normals = []
  const indices = []
  const uvs = []

  const radius = outerRadius - innerRadius

  for (let j = 0; j < radialSegments; j++) {
    const theta = j * 2 * Math.PI / radialSegments
    const cosTheta = Math.cos(theta)
    const sinTheta = Math.sin(theta)

    for (let i = 0; i < tubularSegments; i++) {
      const phi = i * 2 * Math.PI / tubularSegments
      const cosPhi = Math.cos(phi)
      const sinPhi = Math.sin(phi)

      const x = (radius + innerRadius * cosPhi) * cosTheta
      const y = innerRadius * sinPhi
      const z = (radius + innerRadius * cosPhi) * sinTheta
      positions.push(x, y, z)

      const nx = cosPhi * cosTheta
      const ny = sinPhi
      const nz = cosPhi * sinTheta
      normals.push(nx, ny, nz)

      uvs.push(j / radialSegments, i / tubularSegments)

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

  positions = applyTransformations(positions, position, rotation)

  return {
    positions,
    normals: new Float32Array(normals),
    indices: new Uint16Array(indices),
    uvs: new Float32Array(uvs)
  }
}

async function setUpTexture(gl, textureImage, textureImageBlob) {
  if (textureImage != "") {
    try {
      if (textureImageBlob) {
        const texture = WebGL.createTexture(gl, {
          image: textureImageBlob,
          mip: true,
          wrapS: gl.REPEAT,
          wrapT: gl.REPEAT,
          min: gl.NEAREST_MIPMAP_LINEAR,
          mag: gl.LINEAR,
        })

        return texture
      } else {
        const url = new URL(textureImage, window.location)
        const image = await fetchImage(url)
        const texture = WebGL.createTexture(gl, {
          image,
          mip: true,
          wrapS: gl.REPEAT,
          wrapT: gl.REPEAT,
          min: gl.NEAREST_MIPMAP_LINEAR,
          mag: gl.LINEAR,
        })

        return texture
      }

    } catch (error) {
      console.error('Error loading image:', error)
      return undefined
    }
  }
  return undefined
}
/* ----- */

export async function createPlane(gl, program, options) {
  const bufferData = createPlaneGeometry(options.size, options.position, options.rotation)
  bufferData.defaultUVs = bufferData.uvs.slice(0)
  updateMapping(bufferData, options.textureMappings)
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
  return outModel
}

export async function createCube(gl, program, options) {
  const bufferData = createCubeGeometry(options.size, options.position, options.rotation)
  bufferData.defaultUVs = bufferData.uvs.slice(0)
  updateMapping(bufferData, options.textureMappings)
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
  return outModel
}

export async function createSphere(gl, program, options) {
  const bufferData = createSphereGeometry(options.radius, options.position, options.rotation, options.latBands, options.lonBands)
  bufferData.defaultUVs = bufferData.uvs.slice(0)
  updateMapping(bufferData, options.textureMappings)
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
  return outModel
}

export async function createTorus(gl, program, options) {
  const bufferData = createTorusGeometry(options.radius, options.holeRadius, options.position, options.rotation, options.radialSegments, options.tubularSegments)
  bufferData.defaultUVs = bufferData.uvs.slice(0)
  updateMapping(bufferData, options.textureMappings)
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
  return outModel
}

export async function updateGeoBuffers(gl, program, model) {
  let bufferData

  switch (model.type) {
    case "Plane":
      bufferData = createPlaneGeometry(model.geometry.size, getPositionNormalised(model.geometry.position), getPositionNormalised(model.geometry.rotation))
      break
    case "Cube":
      bufferData = createCubeGeometry(model.geometry.size, getPositionNormalised(model.geometry.position), getPositionNormalised(model.geometry.rotation))
      break
    case "Sphere":
      bufferData = createSphereGeometry(model.geometry.size, getPositionNormalised(model.geometry.position), getPositionNormalised(model.geometry.rotation), model.geometry.lat, model.geometry.lon)
      break
    case "Torus":
      bufferData = createTorusGeometry(model.geometry.size, model.geometry.innerHole, getPositionNormalised(model.geometry.position), getPositionNormalised(model.geometry.rotation), model.geometry.lat, model.geometry.lon)
      break
    default:
      console.error("Unknown model type")
      return
  }


  const newModel = await prepareBuffers(gl, program, bufferData, model.baseColor, "")

  model.vao = newModel.vao
  model.indexCount = newModel.indexCount
}

export async function updateGeoTexture(gl, model) {
  gl.bindVertexArray(model.vao)
  const newTex = await setUpTexture(gl, model.texturing.texture, model.texturing.textureBlob)
  model.texture = newTex
}

export async function updateGeoTextureMapping(gl, program, model) {
  updateMapping(model.bufferData, model.texturing.textureMappings)
  gl.bindVertexArray(model.vao)
  //setUVBuffer(gl, model.buffers.uvs, model.bufferData.uvs)
  model.buffers.uvs = createAndBindBuffer(gl, model.bufferData.uvs, { attr: program.attributes.aTexCoord, size: 2, type: gl.FLOAT })
}