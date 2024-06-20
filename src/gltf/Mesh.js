//import Primitive from './Primitive.js'
export class Mesh {

  constructor(options = {}) {
    this.primitives = [...(options.primitives ?? [])]
    this.weights = [...(options.weights ?? [])]
  }

  /*constructor(gltf, meshData, gl) {
      this.gl = gl
      this.primitives = []
      this.name = meshData.name || ''

      // Initialize each primitive
      meshData.primitives.forEach(primitiveData => {
          const primitive = new Primitive(gltf, primitiveData, gl)
          this.primitives.push(primitive)
      })
  }

  draw(programInfo) {
      this.primitives.forEach(primitive => {
          primitive.draw(programInfo)
      })
  }*/
}