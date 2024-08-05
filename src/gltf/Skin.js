//import { Accessor } from "./Accessor.js"
//import { Node } from "./Node.js"
import glMatrix from "glMatrix"

const mat4 = glMatrix.mat4
const vec4 = glMatrix.vec4
export class Skin {

  constructor(options = {}) {
    this.name = options.name ?? ""
    this.skeleton = options.skeleton ?? null //new Node({})
    this.joints = options.joints
    this.inverseBindMatrices = this.setInverseMatrices(options.inverseBindMatrices) // ?? mat4.create() //new Accessor({})
    //this.jointMatrices = new Float32Array(16 * this.joints.length)
  }

  setInverseMatrices(inverseBindMatricesBuffer) {
    let ibm = []

    for (let i in this.joints) { //can be undefined .. use the identity
      i = Number(i)

      if (inverseBindMatricesBuffer) {
        ibm[i] = new Float32Array(
          inverseBindMatricesBuffer.bufferView.buffer,
          inverseBindMatricesBuffer.byteOffset + inverseBindMatricesBuffer.bufferView.byteOffset + 16 * 4 * i,
          16
        )
      } else {
        ibm[i] = mat4.identity(mat4.create())
      }
    }

    return ibm
  }

  updateJointMatrices(i, childNode, parentMatrix) {
    const jointMatrix = mat4.identity(mat4.create())
    const joint = childNode ? childNode : this.joints[i] //typeof i == "object" ? i : this.joints[i]

    // If there is a parent transform, multiply it with the current joint's matrix
    if (parentMatrix || joint.parent?.matrix) {
      mat4.mul(jointMatrix, parentMatrix ?? joint.parent.matrix, joint.matrix)
    } else {
      mat4.copy(jointMatrix, joint.matrix)
    }

    // Apply the inverse bind matrix
    mat4.mul(jointMatrix, jointMatrix, this.inverseBindMatrices[i])

    // Recursively update child joints
    joint.children.forEach(childNode => {
      this.updateJointMatrices(i, childNode, jointMatrix)
    })

    /*const worldInverse = mat4.invert(mat4.create(), joint.matrix)
    mat4.mul(jointMatrix, joint.matrix, this.inverseBindMatrices[i])
    */

    /*joint.children.forEach(childNode => {
      const tmpMat = mat4.identity(mat4.create())
      mat4.mul(tmpMat, joint.matrix, childNode.matrix)
      //mat4.mul(tmpMat, worldInverse, childNode.matrix)

      mat4.mul(tmpMat, tmpMat, this.inverseBindMatrices[i])
      mat4.mul(jointMatrix, jointMatrix, tmpMat)
    })*/

    return jointMatrix
  }

  /*updateJointMatrices(i) {
    //for (let i = 0; i < this.joints.length; ++i) {
    const jointMatrix = this.jointMatrices.subarray(i * 16, (i + 1) * 16)
    const joint = this.joints[i]
    // Get the joint's world transform
    const worldTransform = joint.matrix

    //const inverseBindMatrix = new Float32Array(16)
    const inverseBindMatrix = new Float32Array(
      this.inverseBindMatrices.bufferView.buffer,
      this.inverseBindMatrices.byteOffset + this.inverseBindMatrices.bufferView.byteOffset + 16 * 4 * i,
      16
    )
    // Fetch the inverse bind matrix for this joint
    //this.gltf.getMatrixFromAccessor(this.inverseBindMatrices, i, inverseBindMatrix)
    // Multiply world transform with the inverse bind matrix
    mat4.multiply(jointMatrix, worldTransform, inverseBindMatrix)
    return jointMatrix
    //}
  }*/

  /*getJointMatrix(index) {
    return this.jointMatrices.subarray(index * 16, (index + 1) * 16)
  }*/

  /*setUniforms(gl, program) {
    gl.uniformMatrix4fv(program.uniforms["JointMatrix.matrix"], false, this.jointMatrices)
  }*/

}