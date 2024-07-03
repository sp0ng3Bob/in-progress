import glMatrix from "glMatrix"

const vec2 = glMatrix.vec2
const vec3 = glMatrix.vec3
const quat = glMatrix.quat

export class AnimationSampler {

  constructor(options = {}) {
    this.path = options.path
    this.input = this.getAccessorData(options.input)
    this.output = this.getAccessorData(options.output)
    this.interpolation = options.interpolation ?? 'LINEAR'
  }

  getAccessorData(accessor) {
    return new Float32Array(accessor.bufferView.buffer, accessor.bufferView.byteOffset + accessor.byteOffset, accessor.count * accessor.numComponents)
  }

  getStartingPosition() {
    let position
    if (this.path == "rotation") {
      position = quat.fromValues(this.output.at(-4), this.output.at(-3), this.output.at(-2), this.output.at(-1))
    } else if (this.path == "weights") {
      position = vec2.fromValues(this.output.at(-2), this.output.at(-1))
    } else {
      position = vec3.fromValues(this.output.at(-3), this.output.at(-2), this.output.at(-1))
    }
    return position
  }

  //https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#appendix-c-interpolation
  interpolate(time, i) {
    let a, b
    const t = (time - this.input[i - 1]) / (this.input[i] - this.input[i - 1])

    if (this.path == "rotation") {
      a = quat.fromValues(this.output[(i - 1) * 4], this.output[(i - 1) * 4 + 1], this.output[(i - 1) * 4 + 2], this.output[(i - 1) * 4 + 3])
      b = quat.fromValues(this.output[i * 4], this.output[i * 4 + 1], this.output[i * 4 + 2], this.output[i * 4 + 3])
    } else if (this.path == "weights") {
      a = vec2.fromValues(this.output[(i - 1) * 2], this.output[(i - 1) * 2 + 1])
      b = vec2.fromValues(this.output[i * 2], this.output[i * 2 + 1])
    } else {
      a = vec3.fromValues(this.output[(i - 1) * 3], this.output[(i - 1) * 3 + 1], this.output[(i - 1) * 3 + 2])
      b = vec3.fromValues(this.output[i * 3], this.output[i * 3 + 1], this.output[i * 3 + 2])
    }

    return this.interpolateValue(a, b, t, a.length)
  }

  //https://github.com/KhronosGroup/glTF-Tutorials/blob/main/gltfTutorial/gltfTutorial_007_Animations.md
  interpolateValue(a, b, t, dimensions) {
    switch (this.interpolation) {
      case "STEP":
        return a
      case "LINEAR":
        if (dimensions == 4) { //rotation -> quaternions
          // Step 1: Calculate the dot product
          let dotProduct = quat.dot(a, b)

          // Step 2: Ensure shortest path
          if (dotProduct < 0.0) {
            b = quat.scale(quat.create(), b, -1)
            dotProduct = -dotProduct
          }

          // Step 3: Check if quaternions are too close and perform linear interpolation if necessary
          if (dotProduct > 0.9995) {
            let res = quat.lerp(quat.create(), a, b, t)
            quat.normalize(res, res)
            return res
          }

          // Step 4: Perform the spherical linear interpolation (SLERP)
          let theta_0 = Math.acos(dotProduct)
          let theta = t * theta_0
          let sin_theta = Math.sin(theta)
          let sin_theta_0 = Math.sin(theta_0)

          let s0 = Math.cos(theta) - dotProduct * sin_theta / sin_theta_0
          let s1 = sin_theta / sin_theta_0

          let scaledA = quat.scale(quat.create(), a, s0)
          let scaledB = quat.scale(quat.create(), b, s1)

          return quat.add(quat.create(), scaledA, scaledB)
        } else if (dimensions == 2) {
          const ba = vec2.subtract(vec2.create(), b, a)
          const t_ba = vec2.scale(vec2.create(), ba, t)
          return vec2.add(vec2.create(), a, t_ba)
        } else {
          const ba = vec3.subtract(vec3.create(), b, a)
          const t_ba = vec3.scale(vec3.create(), ba, t)
          return vec3.add(vec3.create(), a, t_ba)
        }
      case "CUBICSPLINE":
        /*
        Cubic spline interpolation needs more data than just the previous and next keyframe time and values, it also need for each keyframe a couple of tangent vectors that act to smooth out the curve around the keyframe points.
  
        These tangent are stored in the animation channel. For each keyframe described by the animation sampler, the animation channel contains 3 elements :
          The input tangent of the keyframe
          The keyframe value
          The output tangent
  
          The input and output tangents are normalized vectors that will need to be scaled by the duration of the keyframe, we call that the deltaTime
            deltaTime = nextTime - previousTime
  
        To calculate the value for currentTime, you will need to fetch from the animation channel :
          The output tangent direction of previousTime keyframe
          The value of previousTime keyframe
          The value of nextTime keyframe
          The input tangent direction of nextTime keyframe
          note: the input tangent of the first keyframe and the output tangent of the last keyframe are totally ignored
  
        To calculate the actual tangents of the keyframe, you need to multiply the direction vectors you got from the channel by deltaTime
            previousTangent = deltaTime * previousOutputTangent
            nextTangent = deltaTime * nextInputTangent
        The mathematical function is described in the Appendix C of the glTF 2.0 specification.
  
        Here's a corresponding pseudocode snippet :
            Point cubicSpline(previousPoint, previousTangent, nextPoint, nextTangent, interpolationValue)
                t = interpolationValue
                t2 = t * t
                t3 = t2 * t
                
                return (2 * t3 - 3 * t2 + 1) * previousPoint + (t3 - 2 * t2 + t) * previousTangent + (-2 * t3 + 3 * t2) * nextPoint + (t3 - t2) * nextTangent
        */
        return b
    }
  }
}
