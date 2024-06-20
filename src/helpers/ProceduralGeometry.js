//const mat4 = require('gl-matrix/mat4')
//import from "../libs/gl-matrix.min.js"

// proceduralGeometry.js

import glMatrix from "glMatrix"
const mat4 = glMatrix.mat4

//export const geometryObjects = [] // Initialize an array to store objects

export function createPlane(gl, size, position, color, textureImage) {
  // Define vertices for a plane
  const vertices = [
    -size, 0, -size, //make dimension of 1
    size, 0, -size,
    size, 0, size,
    -size, 0, -size,
    size, 0, size,
    -size, 0, size,
  ]

  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)
  // Create a buffer to store the vertices
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

  // Create a model matrix for positioning the plane
  const matrix = mat4.create()
  mat4.fromTranslation(matrix, position)
  //add rotation and scale

  const planeObject = {
    vertexCount: vertices.length,
    verticesBuffer: buffer,
    vao,
    matrix,
    color,
    textureImage,
    type: 'Plane'
  }

  //geometryObjects.push(planeObject) // Add the plane object to the object list

  return planeObject
}

export function createCube(gl, size, position, rotation, color, textureImage) {
  const halfSize = size / 2

  console.log(size, position, rotation, color, textureImage)

  // Define vertices for a cube
  const vertices = [
    // Front face
    -halfSize, -halfSize, halfSize,
    halfSize, -halfSize, halfSize,
    halfSize, halfSize, halfSize,
    -halfSize, -halfSize, halfSize,
    halfSize, halfSize, halfSize,
    -halfSize, halfSize, halfSize,
    // Back face
    -halfSize, -halfSize, -halfSize,
    -halfSize, halfSize, -halfSize,
    halfSize, halfSize, -halfSize,
    -halfSize, -halfSize, -halfSize,
    halfSize, halfSize, -halfSize,
    halfSize, -halfSize, -halfSize,
    // Top face
    -halfSize, halfSize, -halfSize,
    -halfSize, halfSize, halfSize,
    halfSize, halfSize, halfSize,
    -halfSize, halfSize, -halfSize,
    halfSize, halfSize, halfSize,
    halfSize, halfSize, -halfSize,
    // Bottom face
    -halfSize, -halfSize, -halfSize,
    halfSize, -halfSize, -halfSize,
    halfSize, -halfSize, halfSize,
    -halfSize, -halfSize, -halfSize,
    halfSize, -halfSize, halfSize,
    -halfSize, -halfSize, halfSize,
    // Left face
    -halfSize, -halfSize, -halfSize,
    -halfSize, halfSize, -halfSize,
    -halfSize, halfSize, halfSize,
    -halfSize, -halfSize, -halfSize,
    -halfSize, halfSize, halfSize,
    -halfSize, -halfSize, halfSize,
    // Right face
    halfSize, -halfSize, -halfSize,
    halfSize, -halfSize, halfSize,
    halfSize, halfSize, halfSize,
    halfSize, -halfSize, -halfSize,
    halfSize, halfSize, halfSize,
    halfSize, halfSize, -halfSize,
  ]

  // Create a buffer to store the vertices
  //const buffer = gl.createBuffer()
  //gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

  const modelViewMatrix = mat4.create()

  // Apply transformations to the model-view matrix
  mat4.translate(modelViewMatrix, modelViewMatrix, position)
  mat4.rotateX(modelViewMatrix, modelViewMatrix, rotation[0])
  mat4.rotateY(modelViewMatrix, modelViewMatrix, rotation[1])
  mat4.rotateZ(modelViewMatrix, modelViewMatrix, rotation[2])
  mat4.scale(modelViewMatrix, modelViewMatrix, [size, size, size])

  const cubeObject = {
    vertexCount: vertices.length / 3,
    vertices,
    modelViewMatrix,
    color,
    textureImage,
    type: 'Cube' // Add a type identifier if needed
  }

  //geometryObjects.push(cubeObject) // Add the cube object to the object list

  return cubeObject
}

export function createSphere(gl, radius, position, color, textureImage) {
  const vertices = []
  const segments = 74 // each segment is 5° of the 360°

  for (let lat = 0; lat <= segments; lat++) {
    const theta = (lat * Math.PI) / segments
    const sinTheta = Math.sin(theta)
    const cosTheta = Math.cos(theta)

    for (let lon = 0; lon <= segments; lon++) {
      const phi = (lon * 2 * Math.PI) / segments
      const sinPhi = Math.sin(phi)
      const cosPhi = Math.cos(phi)

      const x = cosPhi * sinTheta
      const y = cosTheta
      const z = sinPhi * sinTheta

      vertices.push(radius * x, radius * y, radius * z) //??????????????????????????????????????????????
    }
  }

  // Create a buffer to store the vertices
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

  // Create a model matrix for positioning the sphere
  const modelMatrix = mat4.create()
  mat4.fromTranslation(modelMatrix, position)

  return {
    vertexCount: vertices.length,
    verticesBuffer: buffer,
    modelMatrix,
    color,
    textureImage,
    type: 'Sphere'
  }
}

export function createTorus(gl, radius, holeRadius, massRadius, position, color, textureImage) {
  const vertices = []
  const segments = 72

  for (let side = 0; side < segments; side++) {
    const theta = (side * 2 * Math.PI) / segments
    const cosTheta = Math.cos(theta)
    const sinTheta = Math.sin(theta)
    //?????????????????????????????????*?*?*??*?*?*???*?*?*??=*?!*=!*?=!*?!=*!=*?!=*!=*?!=*!?=!*?=!*?=!*!=*!=
  }

  // Create a buffer to store the vertices
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

  // Create a model matrix for positioning the torus
  const modelMatrix = mat4.create()
  mat4.fromTranslation(modelMatrix, position)

  return {
    vertexCount: vertices.length,
    verticesBuffer: buffer,
    modelMatrix,
    color,
    textureImage,
    type: 'Torus'
  }
}