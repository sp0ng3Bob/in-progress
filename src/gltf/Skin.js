//import { Accessor } from "./Accessor.js"
//import { Node } from "./Node.js"

export class Skin {

  constructor(options = {}) {
      this.name = options.name || ""
      this.skeleton = options.skeleton || null //new Node({})
      this.joints = options.joints || []
      this.inverseBindMatrices = options.inverseBindMatrices || null //new Accessor({})
  }

}