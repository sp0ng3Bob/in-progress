export class Scene {

  constructor(options = {}) {
    this.nodes = [...(options.nodes ?? [])]
    this.animations = [...(options.animations ?? [])]

    this.transparentNodes = [...(options.transparentNodes ?? [])]
    this.opaqueNodes = [...(options.opaqueNodes ?? [])]
  }
}
