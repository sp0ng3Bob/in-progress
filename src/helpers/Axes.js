import { WebGL } from '../engine/WebGL.js'
import { shaders } from '../glsl/shaders.js'

import glMatrix from "glMatrix"
const mat4 = glMatrix.mat4


export class Axes {

  constructor(options = {}) {
    this.gl = options.glContext
    //this.gl = options.axesCanvas.getContext("webgl2")
    //this.program = options.program

    // Define the vertices for the colored coordinate axes
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
    // Create a buffer to store the vertices
    this.buffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertices, this.gl.STATIC_DRAW)

    //camera
    this.projectionMatrix = mat4.create()
    mat4.perspective(this.projectionMatrix, Math.PI / 3, 1, 0.1, 100)

    this.viewMatrix = mat4.create()
    mat4.lookAt(this.viewMatrix, [0, 0, 2], [0, 0, 0], [0, 1, 0])

    let shaderSources = structuredClone(shaders)
    delete shaderSources.simple
    this.programs = WebGL.buildPrograms(this.gl, shaderSources).axes

    this.gl.clearColor(1, 1, 1, 1)
    this.gl.enable(this.gl.DEPTH_TEST)
    this.gl.enable(this.gl.CULL_FACE)
  }

  changeClearColor(color) {
    const fraction = 1 / 255
    this.gl.clearColor(color[0] * fraction, color[1] * fraction, color[2] * fraction, 1)
  }

  draw(camera) { //rotation of the camera
    //this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

    this.gl.useProgram(this.programs.program)
    this.gl.bindVertexArray(this.vao)
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer)

    this.gl.enableVertexAttribArray(this.programs.attributes.aPosition)
    this.gl.vertexAttribPointer(this.programs.attributes.aPosition, 3, this.gl.FLOAT, false, 0, 0)

    let modelViewProjection = mat4.create()
    mat4.multiply(modelViewProjection, this.projectionMatrix, this.viewMatrix)
    const cameraRotation = mat4.create()
    mat4.fromQuat(cameraRotation, camera.rotation) // to je ful narobe. obračam lookat point in ne camero...
    mat4.multiply(modelViewProjection, cameraRotation, modelViewProjection)

    this.gl.uniformMatrix4fv(this.programs.uniforms.uModelViewProjection, false, modelViewProjection)

    this.gl.drawArrays(this.gl.LINES, 0, 6)

    this.gl.disableVertexAttribArray(this.programs.attributes.aPosition)
  }
}



/*export class Axes {

  constructor(options = {}) {
    //this.
    this.gl = options.gl
    // Define the vertices for the colored coordinate axes
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
    // Create a buffer to store the vertices
    this.buffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertices, this.gl.STATIC_DRAW)
  }
  
  drawAxes(gl, program, camera) {
    this.gl.useProgram(program.program)
    this.gl.bindVertexArray(this.vao)
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer)
  
    // Get the attribute and uniform locations
    //const aPosition = gl.getAttribLocation(program, 'aPosition')
    //const uModelViewProjection = gl.getUniformLocation(program, 'uModelViewProjection')
    
    // Enable the attribute
    this.gl.enableVertexAttribArray(program.attributes.aPosition)
    this.gl.vertexAttribPointer(program.attributes.aPosition, 3, this.gl.FLOAT, false, 0, 0)

    // Create a projection matrix (perspective in this case)
    const projectionMatrix = mat4.create()
    mat4.perspective(projectionMatrix, Math.PI/3, this.gl.canvas.width / this.gl.canvas.height, 0.1, 1000)
    //mat4.ortho(projectionMatrix, -1, 1, -1, 1, -1, 1)
    //const projectionMatrix = mat4.clone(camera.camera.matrix)
  
    // Create a view matrix (camera)
    const viewMatrix = mat4.create()
    mat4.lookAt(viewMatrix, [2, 2, 5], [0, 0, 0], [0, 1, 0])
    //const viewMatrix = mat4.clone(camera.matrix)

    // Create a model matrix (for the coordinate axes, identity matrix)
    //const modelMatrix = mat4.create()
  
    // Create a model-view-projection matrix
    const modelViewProjection = mat4.create()
    mat4.multiply(modelViewProjection, projectionMatrix, viewMatrix)
    //mat4.multiply(modelViewProjection, projectionMatrix, modelViewProjection)
    //mat4.multiply(modelViewProjection, modelViewProjection, camera.matrix)
    //const modelViewProjection = mat4.clone(camera.matrix)
  
    // Pass the model-view-projection matrix to the shader
    //gl.uniformMatrix4fv(uModelViewProjection, false, modelViewProjection)
    this.gl.uniformMatrix4fv(program.uniforms.uModelViewProjection, false, modelViewProjection)

    // Draw the coordinate axes
    //gl.drawElements(gl.LINES, 0, 6)
    this.gl.drawArrays(gl.LINES, 0, 6)

    // Unbind the buffer and program
    //gl.bindBuffer(gl.ARRAY_BUFFER, null)
    //gl.useProgram(null)
  }
  
}*/