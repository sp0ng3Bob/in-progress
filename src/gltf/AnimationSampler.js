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
    } else if (this.path == "weights") { //maybe just float by float...?
      position = vec2.fromValues(this.output.at(-2), this.output.at(-1))
    } else {
      position = vec3.fromValues(this.output.at(-3), this.output.at(-2), this.output.at(-1))
    }
    return position
  }

  //https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#appendix-c-interpolation
  interpolate(time, i) {
    const previousKeyframe = this.input[i - 1]
    const nextKeyframe = this.input[i]
    const deltaTime = nextKeyframe - previousKeyframe
    const t = (time - previousKeyframe) / deltaTime
    let csbs = 0 //cubicSplineBufferStride .. or something.. to long tho
    let cubeSplineData = []

    if (this.interpolation == "CUBICSPLINE") {
      //the input tangent of the first keyframe and the output tangent of the last keyframe are totally ignored
      let aTangent, bTangent
      if (this.path == "rotation") {
        csbs = 4
        aTangent = quat.fromValues(this.output[(i - 1) * 4 + csbs * 2], this.output[(i - 1) * 4 + 1 + csbs * 2], this.output[(i - 1) * 4 + 2 + csbs * 2], this.output[(i - 1) * 4 + 3 + csbs * 2]) //The output tangent direction of previousTime keyframe
        bTangent = quat.fromValues(this.output[i * 4], this.output[i * 4 + 1], this.output[i * 4 + 2], this.output[i * 4 + 3]) //The input tangent direction of nextTime keyframe
        quat.scale(aTangent, aTangent, deltaTime)
        quat.scale(bTangent, bTangent, deltaTime)
      } else if (this.path == "weights") {
        csbs = 2
        aTangent = vec2.fromValues(this.output[(i - 1) * 2 + csbs * 2], this.output[(i - 1) * 2 + 1 + csbs * 2])
        bTangent = vec2.fromValues(this.output[i * 2], this.output[i * 2 + 1])
        vec2.scale(aTangent, aTangent, deltaTime)
        vec2.scale(bTangent, bTangent, deltaTime)
      } else {
        csbs = 3
        aTangent = vec3.fromValues(this.output[(i - 1) * 3 + csbs * 2], this.output[(i - 1) * 3 + 1 + csbs * 2], this.output[(i - 1) * 3 + 2 + csbs * 2])
        bTangent = vec3.fromValues(this.output[i * 3], this.output[i * 3 + 1], this.output[i * 3 + 2])
        vec3.scale(aTangent, aTangent, deltaTime)
        vec3.scale(bTangent, bTangent, deltaTime)
      }
      cubeSplineData.push(aTangent, bTangent)
    }

    let a, b
    if (this.path == "rotation") {
      a = quat.fromValues(this.output[(i - 1) * 4 + csbs], this.output[(i - 1) * 4 + 1 + csbs], this.output[(i - 1) * 4 + 2 + csbs], this.output[(i - 1) * 4 + 3 + csbs])
      b = quat.fromValues(this.output[i * 4 + csbs], this.output[i * 4 + 1 + csbs], this.output[i * 4 + 2 + csbs], this.output[i * 4 + 3 + csbs])
    } else if (this.path == "weights") {
      a = vec2.fromValues(this.output[(i - 1) * 2 + csbs], this.output[(i - 1) * 2 + 1 + csbs])
      b = vec2.fromValues(this.output[i * 2 + csbs], this.output[i * 2 + 1 + csbs])
    } else {
      a = vec3.fromValues(this.output[(i - 1) * 3 + csbs], this.output[(i - 1) * 3 + 1 + csbs], this.output[(i - 1) * 3 + 2 + csbs])
      b = vec3.fromValues(this.output[i * 3 + csbs], this.output[i * 3 + 1 + csbs], this.output[i * 3 + 2 + csbs])
    }

    return this.interpolateValue(a, b, t, a.length, cubeSplineData)
  }

  //https://github.com/KhronosGroup/glTF-Tutorials/blob/main/gltfTutorial/gltfTutorial_007_Animations.md
  interpolateValue(a, b, t, dimensions, cubeSplineData) {
    switch (this.interpolation) {
      case "STEP":
        return a
      case "LINEAR":
        if (dimensions == 4) { //rotation -> quaternions
          return this.slerp(a, b, t)
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
        if (dimensions == 4) { //rotation -> quaternions
          return this.cubicSpline(a, b, ...cubeSplineData, t, quat)
        } else if (dimensions == 2) {
          return this.cubicSpline(a, b, ...cubeSplineData, t, vec2)
        } else {
          return this.cubicSpline(a, b, ...cubeSplineData, t, vec3)
        }
    }
  }

  slerp(a, b, t) {
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
  }

  cubicSpline(a, b, aTangent, bTangent, t, dim) {
    /*
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
    
    t2 = t * t
    t3 = t2 * t
            
    return (2 * t3 - 3 * t2 + 1) * a + (t3 - 2 * t2 + t) * aTangent + (-2 * t3 + 3 * t2) * b + (t3 - t2) * bTangent
            */
    const t2 = t * t
    const t3 = t2 * t
    const term1 = dim.create();
    const term2 = dim.create();
    const term3 = dim.create();
    const term4 = dim.create();
    const res = dim.create();

    dim.scale(term1, a, (2 * t3 - 3 * t2 + 1));
    dim.scale(term2, aTangent, (t3 - 2 * t2 + t));
    dim.scale(term3, b, (-2 * t3 + 3 * t2));
    dim.scale(term4, bTangent, (t3 - t2));

    dim.add(res, term1, term2);
    dim.add(res, res, term3);
    dim.add(res, res, term4);
    return res
  }
}
