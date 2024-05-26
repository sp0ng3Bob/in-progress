import glMatrix from "glMatrix"

const vec3 = glMatrix.vec3
const mat4 = glMatrix.mat4
const quat = glMatrix.quat

export class PointLight {

	constructor(options) {
		this.position = options.position || "0, 2, 0"
    this.color = options.color || [200, 200, 200]
    this.diffuseColor = options.diffuseColor || [255, 120, 120]
    this.specularColor = options.specularColor || [120, 255, 120]
    this.ambientalColor = options.ambientalColor || [140, 150, 140]
    this.shininess = options.shininess || 150
    this.attenuation = options.attenuation || 0.8
    this.renderType = options.type || "Light"
	}

  getPositionNormalised() { return this.position.split(",").map(Number) }
  getColorNormalised() { return this.color.map(u => u/255) }
  getDiffuseColorNormalised() { return this.diffuseColor.map(u => u/255) }
  getSpecularColorNormalised() { return this.specularColor.map(u => u/255) }
  getAmbientalColorNormalised() { return this.ambientalColor.map(u => u/255) }

}

export class LightHelpers {
  constructor() { }

  getNormalisedRGB(unsignedRGB) { return unsignedRGB.map(u => u/255) }

}