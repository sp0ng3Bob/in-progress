import glMatrix from "glMatrix"

const mat4 = glMatrix.mat4

import { Camera } from './Camera.js'

export class PerspectiveCamera extends Camera {

  constructor(options = {}) {
    super(options)

    this.aspect = options.aspect ?? 1.618
    this.fov = options.fov ?? (Math.PI / 3)
    this.near = options.near ?? 0.01
    this.far = options.far ?? Infinity

    //https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#infinite-perspective-projection

    this.updateMatrix()
  }

  updateMatrix() {
    mat4.perspective(this.matrix,
      this.fov, this.aspect,
      this.near, this.far)

    /*
      a be the aspect ratio (width over height) of the field of view, set by camera.perspective.aspectRatio, or the aspect ratio of the viewport
      y be the vertical field of view in radians, set by camera.perspective.yfov
      n be the distance to the near clipping plane, set by camera.perspective.znear.
      f be the distance to the far clipping plane, set by camera.perspective.zfar
    */
    /*const perspective = mat4.create()
    const a = this.aspect
    const y = this.fov
    const n = this.near

    perspective[0] = 1 / (a * Math.tan(0.5 * y))
    perspective[5] = 1 / Math.tan(0.5 * y)
    perspective[14] = -1
    perspective[15] = 0

    if (this.far == Infinity) {
      perspective[10] = -1
      perspective[11] = -2 * n
    } else {
      const f = this.far
      perspective[10] = (f + n) / (n - f)
      perspective[11] = (2 * f * n) / (n - f)
    }

    this.matrix = perspective*/
  }
}
