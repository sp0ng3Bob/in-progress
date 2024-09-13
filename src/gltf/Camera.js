import glMatrix from "glMatrix"

const mat4 = glMatrix.mat4

export class Camera {

  constructor(options = {}) {
    this.node = options.node ?? null
    this.matrix = options.matrix
      ? mat4.clone(options.matrix)
      : mat4.create()
  }

  lookAt(cameraPosition, lookingAtPosition) {
    const viewMatrix = mat4.create()
    mat4.lookAt(viewMatrix, cameraPosition, lookingAtPosition, [0, 1, 0])
    mat4.multiply(viewMatrix, viewMatrix, this.matrix)
    return viewMatrix
  }

}
