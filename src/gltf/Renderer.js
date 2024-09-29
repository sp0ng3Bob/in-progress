import glMatrix from "glMatrix"

const mat4 = glMatrix.mat4

import { WebGL } from '../engine/WebGL.js'
import { getNormalisedRGB } from "../helpers/PointLight.js"
import { shaders } from '../glsl/shaders.js'

// This class prepares all assets for use with WebGL
// and takes care of rendering.

export class Renderer {

  constructor(gl) {
    this.gl = gl
    this.glObjects = new Map()
    let shaderSources = structuredClone(shaders)
    //delete shaderSources.axes
    //delete shaderSources.simple
    this.programs = WebGL.buildPrograms(gl, shaderSources) //simple) // COMPILING AXES SHADER TWO TIMES!!!!!!!

    this.gl.clearColor(0.89, 0.78, 0.78, 1)

    this.gl.enable(this.gl.DEPTH_TEST)
    this.gl.depthFunc(this.gl.LEQUAL)
    this.gl.frontFace(this.gl.CCW)

    // Disable color space conversion - https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#images
    this.gl.pixelStorei(this.gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, this.gl.NONE)

    // this is an application-scoped convention, matching the shader
    this.attributeNameToIndexMap = {
      POSITION: 0,
      TEXCOORD_0: 1,
      NORMAL: 2,
      JOINTS_0: 3,
      JOINTS_1: 4,
      WEIGHTS_0: 5,
      WEIGHTS_1: 6,
      TANGENT: 7,
      COLOR_0: 14,
      TEXCOORD_1: 15
    }
    this.morphAttributeNameToIndexMap = {
      POSITION: 8,
      NORMAL: 10,
      TANGENT: 12
    }
  }

  changeClearColor(color) {
    this.gl.clearColor(...color, 1)
  }

  updateBaseColorTexture(userData) {
    const image = userData.data
    this.globalBaseColorTexture = WebGL.createTexture(this.gl, {
      image,
      unit: 0,
      wrapS: this.gl.REPEAT,
      wrapT: this.gl.REPEAT,
      min: this.gl.LINEAR_MIPMAP_LINEAR,
      mag: this.gl.LINEAR
    })
  }

  setWrappingModeS(mode) {
    if (this.defaultSampler) {
      const glSampler = this.glObjects.get(this.defaultSampler)
      this.gl.samplerParameteri(glSampler, this.gl.TEXTURE_WRAP_S, mode)
    }
  }

  setWrappingModeT(mode) {
    if (this.defaultSampler) {
      const glSampler = this.glObjects.get(this.defaultSampler)
      this.gl.samplerParameteri(glSampler, this.gl.TEXTURE_WRAP_T, mode)
    }
  }

  setFilteringModeMin(mode) {
    if (this.defaultSampler) {
      const glSampler = this.glObjects.get(this.defaultSampler)
      this.gl.samplerParameteri(glSampler, this.gl.TEXTURE_MIN_FILTER, mode)
    }
  }

  setFilteringModeMag(mode) {
    if (this.defaultSampler) {
      const glSampler = this.glObjects.get(this.defaultSampler)
      this.gl.samplerParameteri(glSampler, this.gl.TEXTURE_MAG_FILTER, mode)
    }
  }

  resetSampler() {
    if (this.defaultSampler) {
      const glSampler = this.glObjects.get(this.defaultSampler) //WebGL.createSampler(this.gl, this.defaultSampler)
      //this.glObjects.set(this.defaultSampler, glSampler)

      this.gl.samplerParameteri(glSampler, this.gl.TEXTURE_WRAP_S, this.defaultSampler.wrapS)
      this.gl.samplerParameteri(glSampler, this.gl.TEXTURE_WRAP_T, this.defaultSampler.wrapT)
      this.gl.samplerParameteri(glSampler, this.gl.TEXTURE_MIN_FILTER, this.defaultSampler.min)
      this.gl.samplerParameteri(glSampler, this.gl.TEXTURE_MAG_FILTER, this.defaultSampler.mag)

      this.generateMipMapsForMainTexture()
    }
  }

  generateMipMapsForMainTexture() {
    if (this.defaultImage) {
      const glTexture = this.glObjects.get(this.defaultImage)
      this.gl.bindTexture(this.gl.TEXTURE_2D, glTexture)
      this.gl.generateMipmap(this.gl.TEXTURE_2D)
      //this.glObjects.set(this.defaultImage, glTexture)
    }
  }

  prepareBufferView(bufferView) {
    if (this.glObjects.has(bufferView)) {
      return this.glObjects.get(bufferView)
    }

    const buffer = new DataView(
      bufferView.buffer,
      bufferView.byteOffset,
      bufferView.byteLength)
    const glBuffer = WebGL.createBuffer(this.gl, {
      target: bufferView.target,
      data: buffer
    })
    this.glObjects.set(bufferView, glBuffer)
    return glBuffer
  }

  prepareSampler(sampler) {
    if (this.glObjects.has(sampler)) {
      return this.glObjects.get(sampler)
    }

    const glSampler = WebGL.createSampler(this.gl, sampler)
    this.glObjects.set(sampler, glSampler)
    return glSampler
  }

  prepareImage(image, options) {
    if (this.glObjects.has(image)) {
      return this.glObjects.get(image)
    }

    const glTexture = WebGL.createTexture(this.gl, { image, ...options })
    this.glObjects.set(image, glTexture)
    return glTexture
  }

  prepareTexture(texture, unit) {
    this.prepareSampler(texture.sampler)
    this.prepareImage(texture.image, { unit, ...texture.sampler })

    if (unit === 0) {
      this.defaultSampler = texture.sampler
      this.defaultImage = texture.image
    }
  }

  prepareMaterial(material) {
    if (material.baseColorTexture) {
      this.prepareTexture(material.baseColorTexture, 0)
    }
    if (material.metallicRoughnessTexture) {
      this.prepareTexture(material.metallicRoughnessTexture, 3)
    }
    if (material.normalTexture) {
      this.prepareTexture(material.normalTexture, 1)
    }
    if (material.occlusionTexture) {
      this.prepareTexture(material.occlusionTexture, 4)
    }
    if (material.emissiveTexture) {
      this.prepareTexture(material.emissiveTexture, 2)
    }
  }

  preparePrimitive(primitive) {
    if (this.glObjects.has(primitive)) {
      return this.glObjects.get(primitive)
    }

    this.prepareMaterial(primitive.material)

    const gl = this.gl
    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    if (primitive.indices) {
      const bufferView = primitive.indices.bufferView
      bufferView.target = gl.ELEMENT_ARRAY_BUFFER
      const buffer = this.prepareBufferView(bufferView)
      gl.bindBuffer(bufferView.target, buffer)
    }

    for (const name in primitive.attributes) {
      const accessor = primitive.attributes[name]
      const bufferView = accessor.bufferView
      const attributeIndex = this.attributeNameToIndexMap[name]

      if (attributeIndex !== undefined) { //https://stackoverflow.com/questions/50712696/when-to-release-a-vertex-array-object
        if (!bufferView.target) {
          bufferView.target = gl.ARRAY_BUFFER
        }

        if (name === "COLOR_0" && accessor.numComponents === 3) {
          const buffer = this.prepareBufferView(bufferView)
          //gl.bindBuffer(bufferView.target, buffer)

          // Expand vec3 to vec4
          const numVertices = accessor.count
          const newBuffer = new Float32Array(numVertices * 4)

          // Access the original buffer's data
          const originalBuffer = new Float32Array(bufferView.buffer, bufferView.byteOffset + accessor.byteOffset, accessor.count * accessor.numComponents)

          for (let i = 0; i < numVertices; i++) {
            newBuffer[i * 4] = originalBuffer[i * 3]
            newBuffer[i * 4 + 1] = originalBuffer[i * 3 + 1]
            newBuffer[i * 4 + 2] = originalBuffer[i * 3 + 2]
            newBuffer[i * 4 + 3] = 1.0
          }

          // Create a new WebGL buffer with the expanded data
          const expandedBuffer = gl.createBuffer()
          gl.bindBuffer(bufferView.target, expandedBuffer)
          gl.bufferData(bufferView.target, newBuffer, gl.DYNAMIC_DRAW) //gl.STATIC_DRAW)

          // Set up the vertex attribute for vec4
          gl.enableVertexAttribArray(attributeIndex)
          gl.vertexAttribPointer(
            attributeIndex,
            4,
            accessor.componentType,
            accessor.normalized,
            0,
            0)
        } else {
          // Normal case for other attributes
          const buffer = this.prepareBufferView(bufferView);
          gl.bindBuffer(bufferView.target, buffer);
          gl.enableVertexAttribArray(attributeIndex);
          gl.vertexAttribPointer(
            attributeIndex,
            accessor.numComponents,
            accessor.componentType,
            accessor.normalized,
            bufferView.byteStride,
            accessor.byteOffset);
        }
      }
    }

    this.glObjects.set(primitive, vao)
    return vao
  }

  prepareMesh(mesh) {
    for (const primitive of mesh.primitives) {
      this.preparePrimitive(primitive)
    }
  }

  prepareNode(node) {
    if (node.mesh) {
      this.prepareMesh(node.mesh)
    }
    for (const child of node.children) {
      this.prepareNode(child)
    }
  }

  prepareScene(scene) {
    this.globalBaseColorTexture = undefined
    for (const node of scene.nodes) {
      this.prepareNode(node)
    }
  }

  prepareLights(lights) {
    const gl = this.gl
    const MAX_LIGHTS = 8

    // Pre-fill arrays with default values
    const lightPositions = new Float32Array(MAX_LIGHTS * 3).fill(0)
    const lightColors = new Float32Array(MAX_LIGHTS * 3).fill(0)
    const lightIntensities = new Float32Array(MAX_LIGHTS).fill(0)
    const lightConstants = new Float32Array(MAX_LIGHTS).fill(0)
    const lightLinears = new Float32Array(MAX_LIGHTS).fill(0)
    const lightQuadratics = new Float32Array(MAX_LIGHTS).fill(0)

    for (let l in lights.lights) {
      const lightIndex = Number(l)
      //if (lightIndex >= MAX_LIGHTS) { break }

      const light = lights.lights[l]
      const pos = light.getPositionNormalised()
      const color = light.getColorNormalised()

      lightPositions.set(pos, lightIndex * 3)
      lightColors.set(color, lightIndex * 3)
      lightIntensities[l] = light.intensity
      lightConstants[l] = light.constantAttenuation
      lightLinears[l] = light.linearAttenuation
      lightQuadratics[l] = light.quadraticAttenuation
    }

    for (let program of [this.programs.gltf, this.programs.geo]) {
      gl.useProgram(program.program)
      gl.uniform3fv(program.uniforms.uAmbientalColor, getNormalisedRGB(lights.ambientalColor))
      gl.uniform1i(program.uniforms.uNumberOfLights, Object.keys(lights.lights).length)

      gl.uniform3fv(gl.getUniformLocation(program.program, "uLightPositions"), lightPositions)
      gl.uniform3fv(gl.getUniformLocation(program.program, "uLightColors"), lightColors)
      gl.uniform1fv(gl.getUniformLocation(program.program, "uLightIntensities"), lightIntensities)
      gl.uniform1fv(gl.getUniformLocation(program.program, "uAttenuationConstant"), lightConstants)
      gl.uniform1fv(gl.getUniformLocation(program.program, "uAttenuationLinear"), lightLinears)
      gl.uniform1fv(gl.getUniformLocation(program.program, "uAttenuationQuadratic"), lightQuadratics)
    }
  }

  getViewProjectionMatrix(camera) {
    const vpMatrix = mat4.clone(camera.matrix)
    let parent = camera.parent
    while (parent) {
      mat4.mul(vpMatrix, parent.matrix, vpMatrix)
      parent = parent.parent
    }
    mat4.invert(vpMatrix, vpMatrix)
    mat4.mul(vpMatrix, camera.camera.matrix, vpMatrix)
    return vpMatrix
  }

  calculateDistance(cameraPosition, objectPosition) {
    const dx = cameraPosition[0] - objectPosition[0]
    const dy = cameraPosition[1] - objectPosition[1]
    const dz = cameraPosition[2] - objectPosition[2]
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  render(scene, camera, lights) {
    const gl = this.gl

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    this.prepareLights(lights)

    let program = this.programs.gltf
    gl.useProgram(program.program)
    gl.uniform3fv(program.uniforms.uCameraPosition, camera.translation)
    gl.uniform1i(program.uniforms.uTexture, 0)
    gl.uniform1i(program.uniforms.uNormalTexture, 1)
    gl.uniform1i(program.uniforms.uEmissiveTexture, 2)
    gl.uniform1i(program.uniforms.uMetallicRoughnessTexture, 3)
    gl.uniform1i(program.uniforms.uOcclusionTexture, 4)

    const vpMatrix = this.getViewProjectionMatrix(camera)

    /*scene.transparentNodes.sort((a, b) => {
      const distanceA = this.calculateDistance(camera.translation, a.translation)
      const distanceB = this.calculateDistance(camera.translation, b.translation)
      return distanceB - distanceA
    })*/

    /*for (const node of scene.opaqueNodes) {
      this.renderNode(scene.globalSampler, node, camera, vpMatrix)
    }
    for (const node of scene.transparentNodes) {
      this.renderNode(scene.globalSampler, node, camera, vpMatrix)
    }*/
    for (const node of scene.nodes) {
      this.renderNode(node, camera, vpMatrix)
    }
    /*for (const node of scene.nodes) {
      this.renderNode("opaquePrimitives", scene.globalSampler, node, camera, vpMatrix)
    }
    for (const node of scene.nodes) {
      this.renderNode("transparentPrimitives", scene.globalSampler, node, camera, vpMatrix)
    }*/

    program = this.programs.geo
    gl.useProgram(program.program)
    gl.uniform3fv(program.uniforms.uCameraPosition, camera.translation)

    gl.disable(gl.CULL_FACE)

    for (const light of scene.lights) {
      this.renderGeoNode(light, "geo", vpMatrix)
    }

    for (const geo of scene.geoNodes) {
      this.renderGeoNode(geo, "geo", vpMatrix)
    }
  }

  renderGeoNode(geoBuffers, prog, vpMatrix) {
    const gl = this.gl

    const mvMatrix = mat4.create()

    const mvpMatrix = mat4.create()
    mat4.mul(mvpMatrix, vpMatrix, mvMatrix)

    // Use shader program
    const program = this.programs[prog]
    gl.useProgram(program.program)

    gl.bindVertexArray(geoBuffers.vao)

    // Set uniforms
    gl.uniformMatrix4fv(program.uniforms.uMvpMatrix, false, mvpMatrix)
    gl.uniformMatrix4fv(program.uniforms.uModelMatrix, false, mvMatrix)
    gl.uniform4fv(program.uniforms.uBaseColor, [...getNormalisedRGB(geoBuffers.baseColor), 1])

    let shadingModel = 0
    if (geoBuffers.shadingModel.type === "Phong") {
      shadingModel = 1
    } else if (geoBuffers.shadingModel.type === "Blinn-Phong") {
      shadingModel = 2
    }
    gl.uniform1i(program.uniforms.uShadingModel, shadingModel)
    gl.uniform3fv(program.uniforms.uDiffuseColor, geoBuffers.shadingModel.diffuseColor)
    gl.uniform3fv(program.uniforms.uSpecularColor, geoBuffers.shadingModel.specularColor || new Float32Array([1, 1, 1]))
    gl.uniform1f(program.uniforms.uShininess, geoBuffers.shadingModel.shininess || 1.0)

    if (geoBuffers.texture) {
      gl.uniform1i(program.uniforms.uTexture, 0)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, geoBuffers.texture)

      gl.bindSampler(0, geoBuffers.sampler)
      /*if (globalSampler) {
        gl.bindSampler(0, globalSampler)
      } else {
        gl.bindSampler(0, geoBuffers.sampler)
      }*/

      gl.uniform1i(program.uniforms.uHasBaseColorTexture, 1)
    } else {
      gl.uniform1i(program.uniforms.uHasBaseColorTexture, 0)
    }

    gl.drawElements(gl.TRIANGLES, geoBuffers.indexCount, gl.UNSIGNED_SHORT, 0)
  }

  //renderNode(primitiveKind, globalSampler, node, camera, vpMatrix, mvMatrix = mat4.create()) {
  renderNode(node, camera, vpMatrix, mvMatrix = mat4.create()) {
    const gl = this.gl

    mvMatrix = mat4.clone(mvMatrix)
    mat4.mul(mvMatrix, mvMatrix, node.matrix)

    const mvpMatrix = mat4.create()
    mat4.mul(mvpMatrix, vpMatrix, mvMatrix)

    const program = this.programs.gltf

    if (node.skin) {
      //node.skin.updateJointMatrices()
      for (const i in node.skin.joints) {
        //gl.uniformMatrix4fv(program.uniforms.u_jointMatrix[i], false, node.skin.getJointMatrix(Number(i)))
        gl.uniformMatrix4fv(program.uniforms[`u_jointMatrix[${i}]`], false, node.skin.updateJointMatrices(Number(i), null, null))
      }
      gl.uniform1i(program.uniforms.uHasSkinning, 1)
    } else {
      gl.uniform1i(program.uniforms.uHasSkinning, 0)
    }

    if (node.mesh) {
      gl.uniform3fv(program.uniforms.uCameraPosition, camera.translation)
      gl.uniformMatrix4fv(program.uniforms.uModelMatrix, false, mvMatrix)
      gl.uniformMatrix4fv(program.uniforms.uMvpMatrix, false, mvpMatrix)

      let w0 = 0.0
      let w1 = 0.0
      if (node.mesh.weights) {
        w0 = node.mesh.weights[0]
        w1 = node.mesh.weights[1] ?? 0.0
      }
      gl.uniform1f(program.uniforms.uMorphTargetWeight0, w0)
      gl.uniform1f(program.uniforms.uMorphTargetWeight1, w1)

      //https://github.com/KhronosGroup/glTF-Sample-Renderer/blob/4c87bce87b43dd85dd4b7133bfdb638ee2be34a8/source/Renderer/renderer.js
      if (mat4.determinant(mvMatrix) < 0.0) {
        gl.frontFace(gl.CW)
      } else {
        gl.frontFace(gl.CCW)
      }

      for (const primitive of node.mesh.primitives) {
        this.renderPrimitive(primitive)
      }
      /*for (const primitive of node.mesh[primitiveKind]) {
        this.renderPrimitive(primitive, globalSampler)
      }*/
    }

    for (const child of node.children) {
      //this.renderNode(primitiveKind, globalSampler, child, camera, vpMatrix, mvMatrix)
      this.renderNode(child, camera, vpMatrix, mvMatrix)
    }
  }

  renderPrimitive(primitive) {
    const gl = this.gl

    const vao = this.glObjects.get(primitive)
    const material = primitive.material

    gl.bindVertexArray(vao)

    gl.uniform4fv(this.programs.gltf.uniforms.uBaseColor, material.baseColorFactor)
    gl.uniform1f(this.programs.gltf.uniforms.uMetallicFactor, material.metallicFactor)
    gl.uniform1f(this.programs.gltf.uniforms.uRoughnessFactor, material.roughnessFactor)

    let texture, glTexture, glSampler

    if (material.doubleSided) {
      gl.disable(gl.CULL_FACE)
    } else {
      gl.enable(gl.CULL_FACE)
    }

    if (primitive.attributes["COLOR_0"]) {
      gl.uniform1i(this.programs.gltf.uniforms.uHasColor0, 1)
    } else {
      gl.uniform1i(this.programs.gltf.uniforms.uHasColor0, 0)
    }

    if (material.alphaMode === "OPAQUE") { // Enable writing to the depth buffer
      gl.disable(gl.BLEND)
      gl.depthMask(true)
      gl.uniform1i(this.programs.gltf.uniforms.uAlphaMode, 0)
    } else if (material.alphaMode === "MASK") {
      gl.disable(gl.BLEND)
      gl.depthMask(true)
      gl.uniform1i(this.programs.gltf.uniforms.uAlphaMode, 1)
    } else if (material.alphaMode === "BLEND") {
      gl.enable(gl.BLEND)
      gl.depthMask(false)
      // Using the "over" operator - https://dl.acm.org/doi/pdf/10.1145/964965.808606
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      gl.blendEquation(gl.FUNC_ADD)
      gl.uniform1i(this.programs.gltf.uniforms.uAlphaMode, 2)
      //the primitives that have the aplhaMode set to BLEND should be sorted based on the distance from the camera
    }
    gl.uniform1f(this.programs.gltf.uniforms.uAlphaCutoff, material.alphaCutoff)

    // Binding textures
    if (material.baseColorTexture !== null) {
      texture = material.baseColorTexture
      glTexture = this.globalBaseColorTexture ? this.globalBaseColorTexture : this.glObjects.get(texture.image)
      glSampler = this.glObjects.get(texture.sampler)

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, glTexture)
      gl.bindSampler(0, glSampler)

      gl.uniform1i(this.programs.gltf.uniforms.uHasBaseColorTexture, 1)
    } else {
      gl.uniform1i(this.programs.gltf.uniforms.uHasBaseColorTexture, 0)
    }

    if (material.normalTexture !== null) {
      texture = material.normalTexture
      glTexture = this.glObjects.get(texture.image)
      glSampler = this.glObjects.get(texture.sampler)

      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, glTexture)
      gl.bindSampler(1, glSampler)

      gl.uniform1f(this.programs.gltf.uniforms.uNormalTextureScale, material.normalFactor)
      gl.uniform1i(this.programs.gltf.uniforms.uHasNormalTexture, 1)
    } else {
      gl.uniform1i(this.programs.gltf.uniforms.uHasNormalTexture, 0)
    }

    if (material.emissiveTexture !== null) {
      texture = material.emissiveTexture
      glTexture = this.glObjects.get(texture.image)
      glSampler = this.glObjects.get(texture.sampler)

      gl.activeTexture(gl.TEXTURE2)
      gl.bindTexture(gl.TEXTURE_2D, glTexture)
      gl.bindSampler(2, glSampler)

      gl.uniform3fv(this.programs.gltf.uniforms.uEmissiveFactor, material.emissiveFactor)
      gl.uniform1i(this.programs.gltf.uniforms.uHasEmissiveTexture, 1)
    } else {
      gl.uniform1i(this.programs.gltf.uniforms.uHasEmissiveTexture, 0)
    }

    if (material.metallicRoughnessTexture !== null) {
      texture = material.metallicRoughnessTexture
      glTexture = this.glObjects.get(texture.image)
      glSampler = this.glObjects.get(texture.sampler)

      gl.activeTexture(gl.TEXTURE3)
      gl.bindTexture(gl.TEXTURE_2D, glTexture)
      gl.bindSampler(3, glSampler)

      gl.uniform1i(this.programs.gltf.uniforms.uHasMetallicRoughnessTexture, 1)
    } else {
      gl.uniform1i(this.programs.gltf.uniforms.uHasMetallicRoughnessTexture, 0)
    }

    if (material.occlusionTexture !== null) {
      texture = material.occlusionTexture
      glTexture = this.glObjects.get(texture.image)
      glSampler = this.glObjects.get(texture.sampler)

      gl.activeTexture(gl.TEXTURE4)
      gl.bindTexture(gl.TEXTURE_2D, glTexture)
      gl.bindSampler(4, glSampler)

      gl.uniform1f(this.programs.gltf.uniforms.uOcclusionStrength, material.occlusionFactor)
      gl.uniform1i(this.programs.gltf.uniforms.uHasOcclusionTexture, 1)
    } else {
      gl.uniform1i(this.programs.gltf.uniforms.uHasOcclusionTexture, 0)
    }

    gl.uniform1i(this.programs.gltf.uniforms.uBaseColorTexCoord, material.baseColorTexCoord)
    gl.uniform1i(this.programs.gltf.uniforms.uNormalTexCoord, material.normalTexCoord)
    gl.uniform1i(this.programs.gltf.uniforms.uMetallicRoughnessTexCoord, material.metallicRoughnessTexCoord)
    gl.uniform1i(this.programs.gltf.uniforms.uEmissiveTexCoord, material.emissiveTexCoord)
    gl.uniform1i(this.programs.gltf.uniforms.uOcclusionTexCoord, material.occlusionTexCoord)

    //Drawing
    if (primitive.indices) {
      const mode = primitive.mode
      const count = primitive.indices.count
      const type = primitive.indices.componentType
      const offset = primitive.indices.byteOffset
      gl.drawElements(mode, count, type, offset)
    } else {
      const mode = primitive.mode
      const count = primitive.attributes.POSITION.count
      gl.drawArrays(mode, 0, count)

      //const offset = primitive.attributes.POSITION.byteOffset
      //gl.drawArrays(mode, offset, count)
    }
  }
}