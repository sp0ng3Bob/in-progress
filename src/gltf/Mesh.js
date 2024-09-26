export class Mesh {

  constructor(options = {}) {
    this.primitives = [...(options.primitives ?? [])]
    this.weights = [...(options.weights ?? [])]
    this.transparentPrimitives = [...options.transparentPrimitives]
    this.opaquePrimitives = [...options.opaquePrimitives]
  }

  clone() {
    return new Mesh({
      primitives: this.primitives.map(primitive => primitive.clone()),
      weights: [...this.weights],
      transparentPrimitives: this.transparentPrimitives.map(primitive => primitive.clone()),
      opaquePrimitives: this.opaquePrimitives.map(primitive => primitive.clone())
    })
  }
}