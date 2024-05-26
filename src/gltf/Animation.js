export class Animation {

  constructor(options = {}) {
    this.name = options.clipName || options.channels[0].target.path
    this.channels = options.channels || []
    this.samplers = options.samplers || []
  }
  
}
