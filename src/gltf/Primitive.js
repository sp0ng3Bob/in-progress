import { Material } from './Material.js'
export class Primitive {

  constructor(options = {}) {
    this.attributes = { ...(options.attributes ?? {}) }
    this.indices = options.indices ?? null
    this.mode = options.mode ?? 4 //options.mode !== undefined ? options.mode : 4
    this.material = options.material ?? new Material()
    this.targets = [...(options.targets ?? [])] //{ ...(options.targets ?? []) } //{}) }
  }

  clone() {
    return new Primitive({
      ...this,
      attributes: { ...this.attributes },
      material: this.material.clone(),
      targets: this.targets.map(target => target.clone()),
    })
  }
}