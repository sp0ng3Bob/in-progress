import glMatrix from "glMatrix"

const mat4 = glMatrix.mat4

import { Camera } from './Camera.js'

export class PerspectiveCamera extends Camera {

  constructor(options = {}) {
    super(options)

    this.aspect = options.aspect ?? 1.618
    this.fov = options.fov ?? (45 * Math.PI / 180)
    this.near = options.near ?? 0.1
    this.far = options.far ?? Infinity

    this.updateMatrix()
  }

  updateMatrix() {
    mat4.perspective(this.matrix,
      this.fov, this.aspect,
      this.near, this.far)
  }

}
