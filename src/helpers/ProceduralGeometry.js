//const mat4 = require('gl-matrix/mat4')
//import from "../libs/gl-matrix.min.js"

// proceduralGeometry.js

import { updateMapping } from "./Textures.js"
import glMatrix from "glMatrix"
const mat4 = glMatrix.mat4

//export const geometryObjects = [] // Initialize an array to store objects

/* Private helpers */
function createAndBindBuffer(gl, data, target = undefined, usage = undefined) {
  target = target ?? gl.ARRAY_BUFFER
  usage = usage ?? gl.STATIC_DRAW

  const buffer = gl.createBuffer();
  gl.bindBuffer(target, buffer);
  if (data.length > 0) {
    gl.bufferData(target, data, usage);
  }
  return buffer;
}

function prepareBuffers(gl, bufferData) {
  const { positions, normals, indices, uvs } = bufferData

  const positionBuffer = createAndBindBuffer(gl, positions);
  const normalBuffer = createAndBindBuffer(gl, normals);
  const indexBuffer = createAndBindBuffer(gl, indices, gl.ELEMENT_ARRAY_BUFFER);
  const uvBuffer = createAndBindBuffer(gl, uvs);

  return {
    positions: positionBuffer,
    normals: normalBuffer,
    indices: indexBuffer,
    indexCount: indices.length,
    uvs: uvBuffer,
  };
}

function createPlaneGeometry(size = 1, position) {
  const halfSize = size / 2;
  const positions = new Float32Array([
    -halfSize, 0, halfSize, // top-left
    halfSize, 0, halfSize, // top-right
    halfSize, 0, -halfSize, // bottom-right
    -halfSize, 0, -halfSize // bottom-left
  ]);

  const normals = new Float32Array([
    0, 1, 0, // top-left normal
    0, 1, 0, // top-right normal
    0, 1, 0, // bottom-right normal
    0, 1, 0 // bottom-left normal
  ]);

  const indices = new Uint16Array([
    0, 1, 2,
    2, 3, 0
  ]);

  const uvs = new Float32Array([
    0, 1, // top-left
    1, 1, // top-right
    1, 0, // bottom-right
    0, 0 // bottom-left
  ]);

  return { positions, normals, indices, uvs };
}

function createCubeGeometry(size = 1) {
  const halfSize = size / 2;
  const positions = new Float32Array([
    // Front face
    -halfSize, -halfSize, halfSize,
    halfSize, -halfSize, halfSize,
    halfSize, halfSize, halfSize,
    -halfSize, halfSize, halfSize,

    // Back face
    -halfSize, -halfSize, -halfSize,
    -halfSize, halfSize, -halfSize,
    halfSize, halfSize, -halfSize,
    halfSize, -halfSize, -halfSize,

    // Top face
    -halfSize, halfSize, -halfSize,
    -halfSize, halfSize, halfSize,
    halfSize, halfSize, halfSize,
    halfSize, halfSize, -halfSize,

    // Bottom face
    -halfSize, -halfSize, -halfSize,
    halfSize, -halfSize, -halfSize,
    halfSize, -halfSize, halfSize,
    -halfSize, -halfSize, halfSize,

    // Right face
    halfSize, -halfSize, -halfSize,
    halfSize, halfSize, -halfSize,
    halfSize, halfSize, halfSize,
    halfSize, -halfSize, halfSize,

    // Left face
    -halfSize, -halfSize, -halfSize,
    -halfSize, -halfSize, halfSize,
    -halfSize, halfSize, halfSize,
    -halfSize, halfSize, -halfSize,
  ]);

  const normals = new Float32Array([
    // Front
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,

    // Back
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,

    // Top
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,

    // Bottom
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,

    // Right
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,

    // Left
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
  ]);

  const indices = new Uint16Array([
    0, 1, 2, 0, 2, 3,    // front
    4, 5, 6, 4, 6, 7,    // back
    8, 9, 10, 8, 10, 11,  // top
    12, 13, 14, 12, 14, 15, // bottom
    16, 17, 18, 16, 18, 19, // right
    20, 21, 22, 20, 22, 23  // left
  ]);

  const uvs = new Float32Array([])

  return { positions, normals, indices, uvs };
}

function createSphereGeometry(radius = 1, latBands = 30, longBands = 30) {
  const positions = [];
  const normals = [];
  const indices = [];

  for (let lat = 0; lat <= latBands; lat++) {
    const theta = lat * Math.PI / latBands;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let lon = 0; lon <= longBands; lon++) {
      const phi = lon * 2 * Math.PI / longBands;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      const x = cosPhi * sinTheta;
      const y = cosTheta;
      const z = sinPhi * sinTheta;

      positions.push(radius * x, radius * y, radius * z);
      normals.push(x, y, z);
    }
  }

  for (let lat = 0; lat < latBands; lat++) {
    for (let lon = 0; lon < longBands; lon++) {
      const first = (lat * (longBands + 1)) + lon;
      const second = first + longBands + 1;

      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }

  const uvs = new Float32Array([])

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: new Uint16Array(indices),
    uvs
  };
}

function createTorusGeometry(outerRadius = 1, innerRadius = 0.4, radialSegments = 30, tubularSegments = 30) {
  const positions = []
  const normals = []
  const indices = []

  for (let j = 0; j <= radialSegments; j++) {
    const theta = j * 2 * Math.PI / radialSegments;
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);

    for (let i = 0; i <= tubularSegments; i++) {
      const phi = i * 2 * Math.PI / tubularSegments;
      const cosPhi = Math.cos(phi);
      const sinPhi = Math.sin(phi);

      const x = (outerRadius + innerRadius * cosPhi) * cosTheta;
      const y = innerRadius * sinPhi;
      const z = (outerRadius + innerRadius * cosPhi) * sinTheta;

      const nx = cosPhi * cosTheta;
      const ny = sinPhi;
      const nz = cosPhi * sinTheta;

      positions.push(x, y, z);
      normals.push(nx, ny, nz);
    }
  }

  for (let j = 1; j <= radialSegments; j++) {
    for (let i = 1; i <= tubularSegments; i++) {
      const a = (tubularSegments + 1) * j + i - 1;
      const b = (tubularSegments + 1) * (j - 1) + i - 1;
      const c = (tubularSegments + 1) * (j - 1) + i;
      const d = (tubularSegments + 1) * j + i;

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const uvs = new Float32Array([])

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: new Uint16Array(indices),
    uvs
  };
}
/* ----- */

export function createPlane(gl, size, position, rotation, color, textureImage, textureMappings) {
  const bufferData = createPlaneGeometry(size, position)
  bufferData.baseColor = color
  // textures - TODO
  const outModel = prepareBuffers(gl, bufferData)
  updateMapping(gl, outModel, textureMappings)
  return outModel
}

/*export function updatePlane(gl, model, size, position, rotation, color, textureImage, textureMappings) {
  return
}*/

export function createCube(gl, size, position, rotation, color, textureImage) {
  const bufferData = createCubeGeometry(size)
  return prepareBuffers(gl, bufferData)
}

export function createSphere(gl, radius, position, rotation, color, textureImage) {
  const bufferData = createSphereGeometry(radius)
  return prepareBuffers(gl, bufferData)
}

export function createTorus(gl, radius, holeRadius, position, rotation, color, textureImage) {
  const bufferData = createTorusGeometry(radius, holeRadius)
  return prepareBuffers(gl, bufferData)
}