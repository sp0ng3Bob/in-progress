import { WebGL } from '../engine/WebGL.js'

import glMatrix from "glMatrix"
const mat4 = glMatrix.mat4

export class Axes {

  constructor(options = {}) {
    this.gl = options.glContext
    this.program = options.program

    this.vertices = new Float32Array([
      0.0, 0.0, 0.0, // Origin (black)
      1.0, 0.0, 0.0, // X-axis endpoint (red)
      0.0, 0.0, 0.0, // Origin (black)
      0.0, 1.0, 0.0, // Y-axis endpoint (green)
      0.0, 0.0, 0.0, // Origin (black)
      0.0, 0.0, 1.0  // Z-axis endpoint (blue)
    ])

    this.vao = this.gl.createVertexArray()
    this.gl.bindVertexArray(this.vao)
    this.buffer = WebGL.createBuffer(this.gl, { data: this.vertices })

    this.gl.enableVertexAttribArray(this.program.attributes.aPosition)
    this.gl.vertexAttribPointer(this.program.attributes.aPosition, 3, this.gl.FLOAT, false, 0, 0)
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

  draw(camera) {
    let modelViewProjection = this.getViewProjectionMatrix(camera)
    this.gl.useProgram(this.program.program)
    this.gl.bindVertexArray(this.vao)
    this.gl.uniformMatrix4fv(this.program.uniforms.uModelViewProjection, false, modelViewProjection)
    this.gl.drawArrays(this.gl.LINES, 0, 6)
  }
}