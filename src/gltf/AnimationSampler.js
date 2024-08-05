/*
A morph target animation frame is defined by a sequence of scalars of length equal to the number of targets in the animated morph target. These scalar sequences MUST lie end-to-end as a single stream in the output accessor, whose final size is equal to the number of morph targets times the number of animation frames.

Morph target animation is by nature sparse, consider using Sparse Accessors for storage of morph target animation. When used with CUBICSPLINE interpolation, tangents (ak, bk) and values (vk) are grouped within keyframes:
a1,a2,…​an,v1,v2,…​vn,b1,b2,…​bn

See Appendix C for additional information about interpolation modes.

Skinned animation is achieved by animating the joints in the skin’s joint hierarchy.
*/

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
    this.setUpRandomShiet()
  }

  getAccessorData(accessor) {
    return new Float32Array(accessor.bufferView.buffer, accessor.bufferView.byteOffset + accessor.byteOffset, accessor.count * accessor.numComponents)
  }

  setUpRandomShiet() {
    if (this.path == "rotation") {
      this.csbs = 4
      this.dim = quat
    } else if (this.path == "weights") {
      this.csbs = 1
      this.dim = 1
    } else {
      this.csbs = 3
      this.dim = vec3
    }

    this.size = this.csbs
    if (this.interpolation != "CUBICSPLINE") {
      this.csbs = 0 //cubicSplineBufferStride .. or something.. to long tho
    } else {
      //When used with CUBICSPLINE interpolation, tangents (ak, bk) and values (vk) are grouped within keyframes:
      //a1, a2,…​an, v1, v2,…​vn, b1, b2,…​bn
      const size = this.input.length
      /*const firtsThird = size * this.csbs
      const secondThird = firtsThird * 2
      this.aTangents = this.output.slice(0, firtsThird)
      this.bTangents = this.output.slice(secondThird)
      this.output = this.output.slice(firtsThird, secondThird)*/

      this.aTangents = new Float32Array(size * this.csbs)
      this.bTangents = new Float32Array(size * this.csbs)
      let values = new Float32Array(size * this.csbs)

      for (let i = 0; i < size; i++) {
        for (let j = 0; j < this.csbs; j++) {
          this.aTangents[i * this.csbs + j] = this.output[(i * 3 * this.csbs) + j]
          values[i * this.csbs + j] = this.output[(i * 3 * this.csbs) + this.csbs + j]
          this.bTangents[i * this.csbs + j] = this.output[(i * 3 * this.csbs) + (2 * this.csbs) + j]
        }
      }

      this.output = values
    }
  }

  extractValue(index, aSet, bSet, csbs = 0) {
    let a = []
    let b = []
    for (let base = 0; base < this.size; base++) {
      a[base] = aSet[(index - 1) * this.size + base + csbs]
      b[base] = bSet[index * this.size + base + csbs]
    }
    return [a, b]
  }

  getStartingPosition() {
    if (this.path == "rotation") {
      //maybe normalise it also?
      return quat.fromValues(this.output[0], this.output[1], this.output[2], this.output[3]) //(this.output.at(-4), this.output.at(-3), this.output.at(-2), this.output.at(-1))
    } else if (this.path == "weights") {
      return this.output[0]
    } else {
      return vec3.fromValues(this.output[0], this.output[1], this.output[2]) //(this.output.at(-3), this.output.at(-2), this.output.at(-1))
    }
  }

  //https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#appendix-c-interpolation
  interpolate(time, i) {
    const previousKeyframe = this.input[i - 1] //i == 0 ? 0 : this.input[i - 1]
    const nextKeyframe = this.input[i]
    const deltaTime = nextKeyframe - previousKeyframe
    let t = (time - previousKeyframe) / deltaTime
    //t = t > 0 ? t : 0

    const cubeSplineData = []
    if (this.interpolation == "CUBICSPLINE") {
      //the input tangent of the first keyframe and the output tangent of the last keyframe are totally ignored
      let outTangent, inTangent
      if (this.path == "weights") {
        outTangent = this.bTangents[i - 1]
        inTangent = this.aTangents[i]

        outTangent = outTangent * deltaTime
        inTangent = inTangent * deltaTime
      } else {
        const [atx, btx] = this.extractValue(i, this.bTangents, this.aTangents)
        outTangent = this.dim.fromValues(...atx)
        inTangent = this.dim.fromValues(...btx)

        this.dim.scale(outTangent, outTangent, deltaTime)
        this.dim.scale(inTangent, inTangent, deltaTime)
      }
      cubeSplineData.push(outTangent, inTangent, deltaTime)
    }

    let a, b
    if (this.path == "weights") {
      a = this.output[(i - 1)] // + this.csbs]
      b = this.output[i] // + this.csbs]
    } else {
      const [ax, bx] = this.extractValue(i, this.output, this.output) //, this.csbs)
      a = this.dim.fromValues(...ax)
      b = this.dim.fromValues(...bx)
    }

    return this.interpolateValue(a, b, t, cubeSplineData)
  }

  //https://github.com/KhronosGroup/glTF-Tutorials/blob/main/gltfTutorial/gltfTutorial_007_Animations.md
  interpolateValue(a, b, t, cubeSplineData) {
    switch (this.interpolation) {
      case "STEP":
        return a
      case "LINEAR":
        if (this.dim === quat) { //rotation -> quaternions
          return this.slerp(a, b, t)
        } else if (this.dim === vec3) {
          const ta = this.dim.scale(this.dim.create(), a, (1 - t))
          const tb = this.dim.scale(this.dim.create(), b, t)
          return this.dim.add(this.dim.create(), ta, tb)
        } else {
          return (1 - t) * a + t * b //(b - a) * t + a
        }
      case "CUBICSPLINE":
        /*
        When writing out rotation values, exporters SHOULD take care to not write out values that can result in an invalid quaternion with all zero values being produced by the interpolation.

        Implementation Note:
          This can be achieved by ensuring that a != −b for all keyframes.
        */
        if (this.dim === quat) {
          //quat.normalize(a, a)
          //quat.normalize(b, b)
          let out = this.cubicSpline(a, b, ...cubeSplineData, t)
          out = out.every(item => item === 0) ? quat.create() : out
          quat.normalize(out, out)
          return out
        }
        return this.cubicSpline(a, b, ...cubeSplineData, t)
    }
  }

  slerp(a, b, t) {
    //quat.normalize(a, a)
    //quat.normalize(b, b)
    const dotProduct = quat.dot(a, b)
    const arc = Math.acos(Math.abs(dotProduct))
    const s = Math.sign(dotProduct) // dotProduct/Math.abs(dotProduct)

    if (s * dotProduct < 0.3) { //When a is close to zero, spherical linear interpolation turns into regular linear interpolation. -- HOW CLOSE?
      const ta = this.dim.scale(this.dim.create(), a, (1 - t))
      const tb = this.dim.scale(this.dim.create(), b, t)
      return this.dim.add(this.dim.create(), ta, tb)
      /*let res = quat.lerp(quat.create(), a, b, t)
      quat.normalize(res, res)
      return res*/
    }

    const sinA = Math.sin(arc)
    let sA = Math.sin(arc * (1 - t)) / sinA
    let sB = s * Math.sin(arc * t) / sinA

    let scaledA = quat.scale(quat.create(), a, sA)
    let scaledB = quat.scale(quat.create(), b, sB)

    return quat.add(quat.create(), scaledA, scaledB)
    //return quat.slerp(quat.create(), a, b, t)
  }

  cubicSpline(a, b, aOutTangent, bInTangent, td, t) {
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
    const term1 = (2 * t3 - 3 * t2 + 1)
    const term2 = td * (t3 - 2 * t2 + t)
    const term3 = (-2 * t3 + 3 * t2)
    const term4 = td * (t3 - t2)

    if (this.dim === 1) {
      return term1 * a + term2 * aOutTangent + term3 * b + term4 * bOutTangent
    } else {
      const s1 = this.dim.create()
      const s2 = this.dim.create()
      const s3 = this.dim.create()
      const s4 = this.dim.create()
      const res = this.dim.create()

      this.dim.scale(s1, a, term1)
      this.dim.scale(s2, aOutTangent, term2)
      this.dim.scale(s3, b, term3)
      this.dim.scale(s4, bInTangent, term4)

      this.dim.add(res, s1, s2)
      this.dim.add(res, res, s3)
      this.dim.add(res, res, s4)
      return res
    }
  }
}
