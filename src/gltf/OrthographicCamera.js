import glMatrix from "glMatrix"

const mat4 = glMatrix.mat4

import { Camera } from './Camera.js'

export class OrthographicCamera extends Camera {

  constructor(options = {}) {
    super(options)

    //this.left = options.left ?? -1
    this.right = options.right ?? 1
    //this.bottom = options.bottom ?? -1
    this.top = options.top ?? 1
    this.near = options.near ?? -1
    this.far = options.far ?? 1

    //https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#orthographic-projection

    this.updateMatrix()
  }

  updateMatrix() {
    /*mat4.ortho(this.matrix,
      this.left, this.right,
      this.bottom, this.top,
      this.near, this.far)*/
    /*
      r be half the orthographic width, set by camera.orthographic.xmag
      t be half the orthographic height, set by camera.orthographic.ymag
      f be the distance to the far clipping plane, set by camera.orthographic.zfar
      n be the distance to the near clipping plane, set by camera.orthographic.znear.
    */
    const orthographic = mat4.create()
    const r = this.right
    const t = this.top
    const n = this.near
    const f = this.far

    orthographic[0] = 1 / r
    orthographic[5] = 1 / t
    orthographic[10] = 2 / (n - f)
    orthographic[11] = (f + n) / (n - f)

    this.matrix = orthographic
  }

}
