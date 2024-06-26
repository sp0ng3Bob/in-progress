import glMatrix from "glMatrix"

const vec3 = glMatrix.vec3
const vec4 = glMatrix.vec4

export class Material {

  constructor(options = {}) {
    this.baseColorTexture = options.baseColorTexture ?? null
    this.baseColorTexCoord = options.baseColorTexCoord ?? 0
    this.baseColorFactor = options.baseColorFactor
      ? vec4.clone(options.baseColorFactor)
      : vec4.fromValues(1.0, 1.0, 1.0, 1.0)

    this.metallicRoughnessTexture = options.metallicRoughnessTexture ?? null
    this.metallicRoughnessTexCoord = options.metallicRoughnessTexCoord ?? 0
    this.metallicFactor = options.metallicFactor ?? 1 //options.metallicFactor !== undefined ? options.metallicFactor : 1
    this.roughnessFactor = options.roughnessFactor ?? 1 //options.roughnessFactor !== undefined ? options.roughnessFactor : 1

    this.normalTexture = options.normalTexture ?? null
    this.normalTexCoord = options.normalTexCoord ?? 0
    this.normalFactor = options.normalFactor ?? 1 //options.normalFactor !== undefined ? options.normalFactor : 1

    this.occlusionTexture = options.occlusionTexture ?? null
    this.occlusionTexCoord = options.occlusionTexCoord ?? 0
    this.occlusionFactor = options.occlusionFactor ?? 1 //options.occlusionFactor !== undefined ? options.occlusionFactor : 1

    this.emissiveTexture = options.emissiveTexture ?? null
    this.emissiveTexCoord = options.emissiveTexCoord ?? 0
    this.emissiveFactor = options.emissiveFactor
      ? vec3.clone(options.emissiveFactor)
      : vec3.fromValues(0, 0, 0)

    this.alphaMode = options.alphaMode ?? 'OPAQUE'
    this.alphaCutoff = options.alphaCutoff ?? 0.5 //options.alphaCutoff !== undefined ? options.alphaCutoff : 0.5
    this.doubleSided = options.doubleSided ?? false
  }
  /*constructor(gltf, materialData, textures) {
      this.name = materialData.name ?? ''
      this.doubleSided = materialData.doubleSided ?? false

      // Initialize PBR properties
      this.baseColorFactor = materialData.pbrMetallicRoughness.baseColorFactor ?? [1, 1, 1, 1]
      this.metallicFactor = materialData.pbrMetallicRoughness.metallicFactor ?? 1.0
      this.roughnessFactor = materialData.pbrMetallicRoughness.roughnessFactor ?? 1.0

      // Initialize textures
      this.baseColorTexture = this._getTexture(textures, materialData.pbrMetallicRoughness.baseColorTexture)
      this.metallicRoughnessTexture = this._getTexture(textures, materialData.pbrMetallicRoughness.metallicRoughnessTexture)
      this.normalTexture = this._getTexture(textures, materialData.normalTexture)
      this.occlusionTexture = this._getTexture(textures, materialData.occlusionTexture)
      this.emissiveTexture = this._getTexture(textures, materialData.emissiveTexture)

      this.emissiveFactor = materialData.emissiveFactor ?? [0, 0, 0]
  }

  _getTexture(textures, textureInfo) {
      if (!textureInfo) return null
      return textures[textureInfo.index]
  }

  apply(gl, programInfo) {
      // Apply uniform values
      gl.uniform4fv(programInfo.uniformLocations.baseColorFactor, this.baseColorFactor)
      gl.uniform1f(programInfo.uniformLocations.metallicFactor, this.metallicFactor)
      gl.uniform1f(programInfo.uniformLocations.roughnessFactor, this.roughnessFactor)
      gl.uniform3fv(programInfo.uniformLocations.emissiveFactor, this.emissiveFactor)

      // Bind textures
      this._bindTexture(gl, programInfo.uniformLocations.baseColorTexture, this.baseColorTexture, 0)
      this._bindTexture(gl, programInfo.uniformLocations.metallicRoughnessTexture, this.metallicRoughnessTexture, 1)
      this._bindTexture(gl, programInfo.uniformLocations.normalTexture, this.normalTexture, 2)
      this._bindTexture(gl, programInfo.uniformLocations.occlusionTexture, this.occlusionTexture, 3)
      this._bindTexture(gl, programInfo.uniformLocations.emissiveTexture, this.emissiveTexture, 4)
  }

  _bindTexture(gl, location, texture, unit) {
      if (location === undefined ?? texture === null) return
      gl.activeTexture(gl.TEXTURE0 + unit)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.uniform1i(location, unit)
  }*/
}


/* 
import Material from './Material'

class GLTFLoader {
    constructor(gl) {
        this.gl = gl
    }

    load(gltf) {
        const materials = gltf.materials.map((materialData) => {
            return new Material(gltf, materialData, this.textures)
        })

        // Use the materials in meshes or nodes as required
    }
}

export default GLTFLoader
*/