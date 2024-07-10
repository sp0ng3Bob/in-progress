import glMatrix from "glMatrix"

const mat4 = glMatrix.mat4

import { WebGL } from '../engine/WebGL.js'

import { shaders } from '../glsl/shaders.js'

// This class prepares all assets for use with WebGL
// and takes care of rendering.

export class Renderer {

  constructor(gl) {
    this.gl = gl
    this.glObjects = new Map()
    let shaderSources = structuredClone(shaders)
    delete shaderSources.axes
    this.programs = WebGL.buildPrograms(gl, shaderSources) //simple) // COMPILING AXES SHADER TWO TIMES!!!!!!!

    gl.clearColor(1, 1, 1, 1)
    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)

    // Texture global options
    /*this.wrappingModeS = gl.REPEAT
    this.wrappingModeT = gl.REPEAT
    this.filteringModeMin = gl.NEAREST
    this.filteringModeMag = gl.NEAREST
    this.mipsEnabled = true*/

    // this is an application-scoped convention, matching the shader
    this.attributeNameToIndexMap = {
      POSITION: 0,
      TEXCOORD_0: 1,
      NORMAL: 2,
      JOINTS_0: 3,
      JOINTS_1: 4,
      WEIGHTS_0: 5,
      WEIGHTS_1: 6,
      TANGENT: 7
    }
    this.morphAttributeNameToIndexMap = {
      POSITION: 8,
      NORMAL: 10,
      TANGENT: 12
    }
  }

  changeClearColor(color) {
    const fraction = 1 / 255
    this.gl.clearColor(color[0] * fraction, color[1] * fraction, color[2] * fraction, 1)
  }

  setWrappingModeS(mode) {
    //this.gl.activeTexture(this.gl.TEXTURE0)
    for (let o of this.glObjects.values()) {
      if (o instanceof WebGLSampler) {
        this.gl.samplerParameteri(o, this.gl.TEXTURE_WRAP_S, mode)
      } else if (o instanceof WebGLTexture) {
        this.gl.bindTexture(this.gl.TEXTURE_2D, o)
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, mode)
      }
    }
  }

  setWrappingModeT(mode) {
    for (let o of this.glObjects.values()) {
      if (o instanceof WebGLSampler) {
        this.gl.samplerParameteri(o, this.gl.TEXTURE_WRAP_T, mode)
      } else if (o instanceof WebGLTexture) {
        this.gl.bindTexture(this.gl.TEXTURE_2D, o)
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, mode)
      }
    }
  }

  setFilteringModeMin(mode) {
    for (let o of this.glObjects.values()) {
      if (o instanceof WebGLSampler) {
        this.gl.samplerParameteri(o, this.gl.TEXTURE_MIN_FILTER, mode)
      } else if (o instanceof WebGLTexture) {
        this.gl.bindTexture(this.gl.TEXTURE_2D, o)
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, mode)
      }
    }
  }

  setFilteringModeMag(mode) {
    for (let o of this.glObjects.values()) {
      if (o instanceof WebGLSampler) {
        this.gl.samplerParameteri(o, this.gl.TEXTURE_MAG_FILTER, mode)
      } else if (o instanceof WebGLTexture) {
        this.gl.bindTexture(this.gl.TEXTURE_2D, o)
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, mode)
      }
    }
  }

  setMipMaps(mode) {
    this.mips = mode
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

  prepareImage(image) {
    if (this.glObjects.has(image)) {
      return this.glObjects.get(image)
    }

    const glTexture = WebGL.createTexture(this.gl, { image })
    this.glObjects.set(image, glTexture)
    return glTexture
  }

  prepareTexture(texture) {
    const gl = this.gl

    const texSampler = this.prepareSampler(texture.sampler)
    const glTexture = this.prepareImage(texture.image)

    const mipmapModes = [
      gl.NEAREST_MIPMAP_NEAREST,
      gl.NEAREST_MIPMAP_LINEAR,
      gl.LINEAR_MIPMAP_NEAREST,
      gl.LINEAR_MIPMAP_LINEAR,
    ]

    console.log(texture, texSampler, glTexture)
    //console.log(this.wrappingModeS, this.wrappingModeT, this.filteringMode, this.mips)

    if (!texture.hasMipmaps && mipmapModes.includes(texture.sampler.min)) { //this.mips && 
      gl.bindTexture(gl.TEXTURE_2D, glTexture)
      //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.filteringMode)
      //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrappingModeS)
      //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrappingModeT)
      gl.generateMipmap(gl.TEXTURE_2D)
      texture.hasMipmaps = true
    } /*else {
            gl.bindTexture(gl.TEXTURE_2D, glTexture)
            texture.hasMipmaps = false
        }*/
  }

  prepareMaterial(material) {
    /*const program = this.programs.simple
    this.gl.useProgram(program.program)
    this.gl.uniform1i(program.uniforms.uTexture, 0)
    this.gl.uniform1i(program.uniforms.uNormalTexture, 1)
    this.gl.uniform1i(program.uniforms.uEmissiveTexture, 2)
    this.gl.uniform1i(program.uniforms.uMetallicRoughnessTexture, 3)
    this.gl.uniform1i(program.uniforms.uOcclusionTexture, 4)*/

    if (material.baseColorTexture) {
      this.prepareTexture(material.baseColorTexture)
    }
    if (material.metallicRoughnessTexture) {
      this.prepareTexture(material.metallicRoughnessTexture)
    }
    if (material.normalTexture) {
      this.prepareTexture(material.normalTexture)
    }
    if (material.occlusionTexture) {
      this.prepareTexture(material.occlusionTexture)
    }
    if (material.emissiveTexture) {
      this.prepareTexture(material.emissiveTexture)
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

      if (!bufferView.target) {
        bufferView.target = gl.ELEMENT_ARRAY_BUFFER
      }

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

        const buffer = this.prepareBufferView(bufferView)
        gl.bindBuffer(bufferView.target, buffer)
        gl.enableVertexAttribArray(attributeIndex)
        gl.vertexAttribPointer(
          attributeIndex,
          accessor.numComponents,
          accessor.componentType,
          accessor.normalized,
          bufferView.byteStride,
          accessor.byteOffset)
      }
    }

    for (let target in primitive.targets) {
      if (Number(target) < 2) {
        for (let name in primitive.targets[target]) {
          const accessor = primitive.targets[target][name]
          const bufferView = accessor.bufferView
          const attributeIndex = this.morphAttributeNameToIndexMap[name]

          if (attributeIndex !== undefined) {
            if (!bufferView.target) {
              bufferView.target = gl.ARRAY_BUFFER
            }

            const buffer = this.prepareBufferView(bufferView)
            gl.bindBuffer(bufferView.target, buffer)
            gl.enableVertexAttribArray(attributeIndex)
            gl.vertexAttribPointer(
              attributeIndex,
              accessor.numComponents,
              accessor.componentType,
              accessor.normalized,
              bufferView.byteStride,
              accessor.byteOffset)
          }
        }
      }
    }

    this.glObjects.set(primitive, vao)
    //gl.bindBuffer(gl.ARRAY_BUFFER, null)
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
    for (const node of scene.nodes) {
      this.prepareNode(node)
    }
  }

  /*prepareLights(lights) {
    const program = this.programs.simple
    this.gl.useProgram(program.program)
    this.gl.uniform1i(program.uniforms.uNumberOfLights, Object.keys(lights.lights).length)
    for (let l in lights.lights) { // move out of here
      this.gl.uniform3fv(program.uniforms[`uLightPositions[${l}]`], lights.lights[l].getPositionNormalised())
      this.gl.uniform3fv(program.uniforms[`uLightColors[${l}]`], lights.lights[l].getColorNormalised())
      this.gl.uniform3fv(program.uniforms[`uDiffuseColor[${l}]`], lights.lights[l].getDiffuseColorNormalised())
      this.gl.uniform3fv(program.uniforms[`uSpecularColor[${l}]`], lights.lights[l].getSpecularColorNormalised())
      this.gl.uniform3fv(program.uniforms[`uAmbientalColor[${l}]`], lights.lights[l].getAmbientalColorNormalised())
      this.gl.uniform1f(program.uniforms[`uShininess[${l}]`], lights.lights[l].shininess)
      this.gl.uniform1f(program.uniforms[`uAttenuation[${l}]`], lights.lights[l].attenuation)
    }
  }*/

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

  render(scene, camera, lights) {
    const gl = this.gl

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const program = this.programs.simple
    gl.useProgram(program.program)
    gl.uniform1i(program.uniforms.uTexture, 0)
    gl.uniform1i(program.uniforms.uNormalTexture, 1)
    gl.uniform1i(program.uniforms.uEmissiveTexture, 2)
    gl.uniform1i(program.uniforms.uMetallicRoughnessTexture, 3)
    gl.uniform1i(program.uniforms.uOcclusionTexture, 4)

    gl.uniform1i(program.uniforms.uNumberOfLights, Object.keys(lights.lights).length)
    for (let l in lights.lights) { // move out of here
      gl.uniform3fv(program.uniforms[`uLightPositions[${l}]`], lights.lights[l].getPositionNormalised())
      gl.uniform3fv(program.uniforms[`uLightColors[${l}]`], lights.lights[l].getColorNormalised())
      gl.uniform3fv(program.uniforms[`uDiffuseColor[${l}]`], lights.lights[l].getDiffuseColorNormalised())
      gl.uniform3fv(program.uniforms[`uSpecularColor[${l}]`], lights.lights[l].getSpecularColorNormalised())
      gl.uniform3fv(program.uniforms[`uAmbientalColor[${l}]`], lights.lights[l].getAmbientalColorNormalised())
      gl.uniform1f(program.uniforms[`uShininess[${l}]`], lights.lights[l].shininess)
      gl.uniform1f(program.uniforms[`uAttenuation[${l}]`], lights.lights[l].attenuation)
    }

    const mvpMatrix = this.getViewProjectionMatrix(camera)

    for (const light of scene.lights ?? []) {
      this.renderGeoNode(light, null, mvpMatrix)
    }

    for (const geo of scene.geoNodes ?? []) {
      this.renderGeoNode(geo, null, mvpMatrix)
    }

    for (const node of scene.nodes) {
      this.renderNode(node, mvpMatrix)
    }

    //gl.bindBuffer(gl.ARRAY_BUFFER, null)
    //gl.useProgram(null)
    //console.error(gl.getError())
  }

  renderGeoNode(geoBuffers, programInfoo, mvpMatrix) {
    const gl = this.gl;
    const programInfo = this.programs.simple;
    mvpMatrix = mat4.clone(mvpMatrix)

    // Bind position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, geoBuffers.position);
    gl.vertexAttribPointer(
      programInfo.attributes.aPosition,
      3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attributes.aPosition);

    // Bind normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, geoBuffers.normals);
    gl.vertexAttribPointer(
      programInfo.attributes.aNormal,
      3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attributes.aNormal);

    // Bind index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geoBuffers.indices);

    // Use shader program
    //gl.useProgram(programInfo.program);

    // Set uniforms (like model-view-projection matrix)
    gl.uniformMatrix4fv(programInfo.uniforms.uMvpMatrix, false, mvpMatrix)
    gl.uniform4fv(programInfo.uniforms.uBaseColor, [1, 1, 1, 1])
    gl.uniform1f(programInfo.uniforms.uMetallicFactor, 0.5)
    gl.uniform1f(programInfo.uniforms.uRoughnessFactor, 0.5)
    gl.uniform1i(programInfo.uniforms.uHasSkinning, 0)
    gl.uniform1i(programInfo.uniforms.uHasBaseColorTexture, 0)
    gl.uniform1i(programInfo.uniforms.uHasNormalTexture, 0)
    gl.uniform1i(programInfo.uniforms.uHasEmissiveTexture, 0)
    gl.uniform1i(programInfo.uniforms.uHasMetallicRoughnessTexture, 0)
    gl.uniform1i(programInfo.uniforms.uHasOcclusionTexture, 0)

    // Draw the plane
    gl.drawElements(gl.TRIANGLES, geoBuffers.indexCount, gl.UNSIGNED_SHORT, 0);
  }

  renderNode(node, mvpMatrix) {
    const gl = this.gl

    mvpMatrix = mat4.clone(mvpMatrix)
    mat4.mul(mvpMatrix, mvpMatrix, node.matrix)

    const program = this.programs.simple

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
      //const program = this.programs.simple
      gl.uniformMatrix4fv(program.uniforms.uMvpMatrix, false, mvpMatrix)

      let w0 = 0.0
      let w1 = 0.0
      if (node.mesh.weights) {
        w0 = node.mesh.weights[0]
        w1 = node.mesh.weights[1] ?? 0.0
      }
      gl.uniform1f(program.uniforms.uMorphTargetWeight0, w0)
      gl.uniform1f(program.uniforms.uMorphTargetWeight1, w1)

      for (const primitive of node.mesh.primitives) {
        this.renderPrimitive(primitive)
      }
    }

    for (const child of node.children) {
      this.renderNode(child, mvpMatrix)
    }
  }

  renderPrimitive(primitive) {
    const gl = this.gl

    const vao = this.glObjects.get(primitive)
    const material = primitive.material

    let texture
    let glTexture
    let glSampler

    gl.uniform4fv(this.programs.simple.uniforms.uBaseColor, material.baseColorFactor)
    gl.uniform1f(this.programs.simple.uniforms.uMetallicFactor, material.metallicFactor)
    gl.uniform1f(this.programs.simple.uniforms.uRoughnessFactor, material.roughnessFactor)

    if (material.baseColorTexture !== null) {
      texture = material.baseColorTexture
      glTexture = this.glObjects.get(texture.image)
      glSampler = this.glObjects.get(texture.sampler)

      gl.bindVertexArray(vao)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, glTexture)
      gl.bindSampler(0, glSampler)

      gl.uniform1i(this.programs.simple.uniforms.uHasBaseColorTexture, 1)
    } else {
      gl.uniform1i(this.programs.simple.uniforms.uHasBaseColorTexture, 0)
    }

    if (material.normalTexture !== null) {
      texture = material.normalTexture
      glTexture = this.glObjects.get(texture.image)
      glSampler = this.glObjects.get(texture.sampler)

      gl.bindVertexArray(vao)
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, glTexture)
      gl.bindSampler(1, glSampler)

      gl.uniform1f(this.programs.simple.uniforms.uNormalTextureScale, material.normalFactor)
      gl.uniform1i(this.programs.simple.uniforms.uHasNormalTexture, 1)
    } else {
      gl.uniform1i(this.programs.simple.uniforms.uHasNormalTexture, 0)
    }

    if (material.emissiveTexture !== null) {
      texture = material.emissiveTexture
      glTexture = this.glObjects.get(texture.image)
      glSampler = this.glObjects.get(texture.sampler)

      gl.bindVertexArray(vao)
      gl.activeTexture(gl.TEXTURE2)
      gl.bindTexture(gl.TEXTURE_2D, glTexture)
      gl.bindSampler(2, glSampler)

      gl.uniform3fv(this.programs.simple.uniforms.uEmissiveFactor, material.emissiveFactor)
      gl.uniform1i(this.programs.simple.uniforms.uHasEmissiveTexture, 1)
    } else {
      gl.uniform1i(this.programs.simple.uniforms.uHasEmissiveTexture, 0)
    }

    if (material.metallicRoughnessTexture !== null) {
      texture = material.metallicRoughnessTexture
      glTexture = this.glObjects.get(texture.image)
      glSampler = this.glObjects.get(texture.sampler)

      gl.bindVertexArray(vao)
      gl.activeTexture(gl.TEXTURE3)
      gl.bindTexture(gl.TEXTURE_2D, glTexture)
      gl.bindSampler(3, glSampler)

      gl.uniform1i(this.programs.simple.uniforms.uHasMetallicRoughnessTexture, 1)
    } else {
      gl.uniform1i(this.programs.simple.uniforms.uHasMetallicRoughnessTexture, 0)
    }

    if (material.occlusionTexture !== null) {
      texture = material.occlusionTexture
      glTexture = this.glObjects.get(texture.image)
      glSampler = this.glObjects.get(texture.sampler)

      gl.bindVertexArray(vao)
      gl.activeTexture(gl.TEXTURE4)
      gl.bindTexture(gl.TEXTURE_2D, glTexture)
      gl.bindSampler(4, glSampler)

      gl.uniform1f(this.programs.simple.uniforms.uOcclusionStrength, material.occlusionFactor)
      gl.uniform1i(this.programs.simple.uniforms.uHasOcclusionTexture, 1)
    } else {
      gl.uniform1i(this.programs.simple.uniforms.uHasOcclusionTexture, 0)
    }

    //Drawing
    if (primitive.indices) {
      const mode = primitive.mode
      const count = primitive.indices.count
      const type = primitive.indices.componentType
      gl.drawElements(mode, count, type, 0)
      //gl.drawElements(gl.LINES, count, type, 0)
    } else {
      const mode = primitive.mode
      const count = primitive.attributes.POSITION.count
      gl.drawArrays(mode, 0, count)
    }
  }

}
