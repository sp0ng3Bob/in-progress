import { WebGL } from "../engine/WebGL.js"
import { getNormalisedRGB } from "./PointLight.js"
import { updateMapping } from "./Textures.js"
import glMatrix from "glMatrix"

const vec3 = glMatrix.vec3
const mat4 = glMatrix.mat4
//const quat = glMatrix.quat

//export const geometryObjects = [] // Initialize an array to store objects

/* Private helpers */
function enableAndSetUpVertexAttribute(gl, attribute, size) {
  gl.enableVertexAttribArray(attribute)
  gl.vertexAttribPointer(
    attribute,
    size, gl.FLOAT, false, 0, 0)
}

function createAndBindBuffer(gl, data, attribute = undefined, target = undefined, usage = undefined) {
  target = target ?? gl.ARRAY_BUFFER
  usage = usage ?? gl.STATIC_DRAW

  const buffer = gl.createBuffer();
  gl.bindBuffer(target, buffer);
  if (data.length > 0) {
    gl.bufferData(target, data, usage);
  }
  if (attribute) {
    enableAndSetUpVertexAttribute(gl, ...Object.values(attribute))
  }
  return buffer;
}

function prepareBuffers(gl, program, bufferData) {
  const { positions, normals, indices, uvs } = bufferData
  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)

  const positionBuffer = createAndBindBuffer(gl, positions, { attr: program.attributes.aPosition, size: 3 });
  const normalBuffer = createAndBindBuffer(gl, normals, { attr: program.attributes.aNormal, size: 2 });
  const indexBuffer = createAndBindBuffer(gl, indices, null, gl.ELEMENT_ARRAY_BUFFER);
  const uvBuffer = createAndBindBuffer(gl, uvs, { attr: program.attributes.aTexCoord, size: 2 });
  //const sampler = WebGL.createSampler(gl, {})

  //also textures..

  return { //positions, normals and indices not really needed...
    //positions: positionBuffer,
    //normals: normalBuffer,
    //indices: indexBuffer,
    //uvs: uvBuffer,
    indexCount: indices.length,
    vao,
    //sampler,
    //texture
  };
}

function applyTransformations(positions, T, R) {
  const transformMatrix = mat4.create();
  mat4.translate(transformMatrix, transformMatrix, T);

  const rotationMatrix = mat4.create();
  mat4.fromQuat(rotationMatrix, R);
  mat4.multiply(transformMatrix, transformMatrix, rotationMatrix); //rotationMatrix, transformMatrix

  const transformedPositions = [];
  for (let i = 0; i < positions.length; i += 3) {
    const vertex = vec3.fromValues(positions[i], positions[i + 1], positions[i + 2]);
    vec3.transformMat4(vertex, vertex, transformMatrix);
    transformedPositions.push(vertex[0], vertex[1], vertex[2]);
  }

  return new Float32Array(transformedPositions);
}

function createPlaneGeometry(size = 1, position = [0, 0, 0], rotation = [0, 0, 0, 1]) {
  const halfSize = size / 2;
  let positions = new Float32Array([
    -halfSize, 0, halfSize,  // top-left
    halfSize, 0, halfSize,  // top-right
    halfSize, 0, -halfSize,  // bottom-right
    -halfSize, 0, -halfSize   // bottom-left
  ]);

  const normals = new Float32Array([
    0, 1, 0, // top-left normal
    0, 1, 0, // top-right normal
    0, 1, 0, // bottom-right normal
    0, 1, 0  // bottom-left normal
  ]);

  const indices = new Uint16Array([
    0, 1, 2,
    2, 3, 0
  ]);

  const uvs = new Float32Array([
    0, 1, // top-left
    1, 1, // top-right
    1, 0, // bottom-right
    0, 0  // bottom-left
  ]);

  positions = applyTransformations(positions, position, rotation)

  return { positions, normals, indices, uvs };
}

function createCubeGeometry(size = 1, position = [0, 0, 0], rotation = [0, 0, 0, 1]) {
  const halfSize = size / 2;
  const faceDefinitions = [
    [-1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1],     // Front face
    [-1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1], // Back face
    [-1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1],     // Top face
    [-1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1], // Bottom face
    [1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1],     // Right face
    [-1, -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1]  // Left face
  ];

  let positions = [];
  const normals = [];

  faceDefinitions.forEach((face, faceIndex) => {
    for (let i = 0; i < 4; i++) {
      const x = halfSize * face[3 * i] //+ position[0];
      const y = halfSize * face[3 * i + 1] //+ position[1];
      const z = halfSize * face[3 * i + 2] //+ position[2];
      positions.push(x, y, z);
    }

    const normal = [0, 0, 0];
    normal[Math.floor(faceIndex / 2)] = faceIndex % 2 === 0 ? 1 : -1;

    for (let i = 0; i < 4; i++) {
      normals.push(...normal);
    }
  });

  const indices = new Uint16Array([
    0, 1, 2, 0, 2, 3,       // front
    4, 5, 6, 4, 6, 7,       // back
    8, 9, 10, 8, 10, 11,    // top
    12, 13, 14, 12, 14, 15, // bottom
    16, 17, 18, 16, 18, 19, // right
    20, 21, 22, 20, 22, 23  // left
  ]);

  const uvs = new Float32Array([])

  positions = applyTransformations(positions, position, rotation)

  return {
    positions,
    normals: new Float32Array(normals),
    indices,
    uvs
  };

  /*const positions = new Float32Array([
    // Front face
    -halfSize + position[0], -halfSize + position[1], halfSize + position[2],
    halfSize + position[0], -halfSize + position[1], halfSize + position[2],
    halfSize + position[0], halfSize + position[1], halfSize + position[2],
    -halfSize + position[0], halfSize + position[1], halfSize + position[2],

    // Back face
    -halfSize + position[0], -halfSize + position[1], -halfSize + position[2],
    -halfSize + position[0], halfSize + position[1], -halfSize + position[2],
    halfSize + position[0], halfSize + position[1], -halfSize + position[2],
    halfSize + position[0], -halfSize + position[1], -halfSize + position[2],

    // Top face
    -halfSize + position[0], halfSize + position[1], -halfSize + position[2],
    -halfSize + position[0], halfSize + position[1], halfSize + position[2],
    halfSize + position[0], halfSize + position[1], halfSize + position[2],
    halfSize + position[0], halfSize + position[1], -halfSize + position[2],

    // Bottom face
    -halfSize + position[0], -halfSize + position[1], -halfSize + position[2],
    halfSize + position[0], -halfSize + position[1], -halfSize + position[2],
    halfSize + position[0], -halfSize + position[1], halfSize + position[2],
    -halfSize + position[0], -halfSize + position[1], halfSize + position[2],

    // Right face
    halfSize + position[0], -halfSize + position[1], -halfSize + position[2],
    halfSize + position[0], halfSize + position[1], -halfSize + position[2],
    halfSize + position[0], halfSize + position[1], halfSize + position[2],
    halfSize + position[0], -halfSize + position[1], halfSize + position[2],

    // Left face
    -halfSize + position[0], -halfSize + position[1], -halfSize + position[2],
    -halfSize + position[0], -halfSize + position[1], halfSize + position[2],
    -halfSize + position[0], halfSize + position[1], halfSize + position[2],
    -halfSize + position[0], halfSize + position[1], -halfSize + position[2]
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

  return { positions, normals, indices, uvs };*/
}

function createSphereGeometry(radius = 1, position = [0, 0, 0], rotation = [0, 0, 0, 1], latBands = 30, longBands = 30) {
  let positions = [];
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

      //positions.push(radius * x + position[0], radius * y + position[1], radius * z + position[2]);
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

  positions = applyTransformations(positions, position, rotation)

  return {
    positions,
    normals: new Float32Array(normals),
    indices: new Uint16Array(indices),
    uvs
  };
}

function createTorusGeometry(outerRadius = 1, innerRadius = 0.4, position = [0, 0, 0], rotation = [0, 0, 0, 1], radialSegments = 30, tubularSegments = 30) {
  let positions = []
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

      const x = (outerRadius + innerRadius * cosPhi) * cosTheta + position[0];
      const y = innerRadius * sinPhi + position[1];
      const z = (outerRadius + innerRadius * cosPhi) * sinTheta + position[2];

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

  positions = applyTransformations(positions, position, rotation)

  return {
    positions,
    normals: new Float32Array(normals),
    indices: new Uint16Array(indices),
    uvs
  };
}
/* ----- */

export function createPlane(gl, program, size, position, rotation, color, textureImage, textureMappings) {
  const bufferData = createPlaneGeometry(size, position, rotation)
  const outModel = prepareBuffers(gl, program, bufferData)

  // textures - TODO
  updateMapping(gl, outModel, textureMappings)

  outModel.baseColor = getNormalisedRGB(color)
  return outModel
}

/*export function updatePlane(gl, model, size, position, rotation, color, textureImage, textureMappings) {
  return
}*/

export function createCube(gl, program, size, position, rotation, color, textureImage) {
  const bufferData = createCubeGeometry(size, position, rotation)
  const outModel = prepareBuffers(gl, program, bufferData)

  outModel.baseColor = getNormalisedRGB(color)
  return outModel
}

export function createSphere(gl, program, radius, position, rotation, color, textureImage) {
  const bufferData = createSphereGeometry(radius, position, rotation)
  const outModel = prepareBuffers(gl, program, bufferData)

  outModel.baseColor = getNormalisedRGB(color)
  return outModel
}

export function createTorus(gl, program, radius, holeRadius, position, rotation, color, textureImage) {
  const bufferData = createTorusGeometry(radius, holeRadius, position, rotation)
  const outModel = prepareBuffers(gl, program, bufferData)

  outModel.baseColor = getNormalisedRGB(color)
  return outModel
}