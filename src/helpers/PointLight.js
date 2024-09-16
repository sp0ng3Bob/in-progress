import glMatrix from "glMatrix"

const vec3 = glMatrix.vec3
const mat4 = glMatrix.mat4
const quat = glMatrix.quat

export class PointLight {

  constructor(options) {
    this.position = options.position || "0, 2, 0"
    this.color = options.color || [200, 200, 200]
    this.intensity = options.intensity || 1.1
    this.constantAttenuation = options.constant || 1.0
    this.linearAttenuation = options.linear || 0.09
    this.quadraticAttenuation = options.quadratic || 0.032
  }

  getPositionNormalised() {
    return new Float32Array(
      this.position.split(",").map(s => Number(s.replace("−", "-")))
    )
  }
  getColorNormalised() { return new Float32Array(this.color.map(u => u / 255)) }
}

export function getNormalisedRGB(unsignedRGB) { return new Float32Array(unsignedRGB.map(u => u / 255)) }
export function getUnsignedRGB(normalisedRGB) { return new Float32Array(normalisedRGB.map(n => n * 255)) }
export function getPositionNormalised(positionString) {
  return new Float32Array(
    positionString.split(",").map(s => Number(s.replace("−", "-"))) //Number.parseFloat(s.replace("−", "-"))
  )
}
export function getPositionString(position) { return position.join(", ") }