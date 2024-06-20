//import { Accessor } from "./Accessor.js"
//import { Node } from "./Node.js"
import glMatrix from "glMatrix"

const vec4 = glMatrix.vec4
export class Skin {

  constructor(options = {}) {
    this.name = options.name ?? ""
    this.skeleton = options.skeleton ?? null //new Node({})
    this.joints = options.joints ?? []
    this.inverseBindMatrices = options.inverseBindMatrices ?? null //new Accessor({})
  }
  /*constructor(gltf, skin) {
      this.joints = skin.joints
      this.inverseBindMatrices = null

      if (skin.inverseBindMatrices !== undefined) {
          this.inverseBindMatrices = this._getInverseBindMatrices(gltf, skin.inverseBindMatrices)
      }
  }

  _getInverseBindMatrices(gltf, accessorIndex) {
      const accessor = gltf.accessors[accessorIndex]
      const bufferView = gltf.bufferViews[accessor.bufferView]
      const buffer = gltf.buffers[bufferView.buffer]

      const byteOffset = accessor.byteOffset + (bufferView.byteOffset ?? 0)
      const byteStride = accessor.byteStride ?? 16 * Float32Array.BYTES_PER_ELEMENT

      const arrayBuffer = buffer.data.slice(byteOffset, byteOffset + accessor.count * byteStride)
      return new Float32Array(arrayBuffer)
  }

  applyJointTransforms(nodeTransforms) {
      const jointMatrices = []

      for (let i = 0; i < this.joints.length; i++) {
          const jointNode = this.joints[i]
          const jointMatrix = mat4.create()

          if (this.inverseBindMatrices) {
              mat4.multiply(jointMatrix, nodeTransforms[jointNode], this.inverseBindMatrices.subarray(i * 16, (i + 1) * 16))
          } else {
              mat4.copy(jointMatrix, nodeTransforms[jointNode])
          }

          jointMatrices.push(jointMatrix)
      }

      return jointMatrices
  }*/
}