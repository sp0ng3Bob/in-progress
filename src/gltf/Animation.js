export class Animation {

  constructor(options = {}) {
    this.name = options.name
    this.channels = options.channels
  }

  update(deltaTime) {
    // Update each channel with interpolated values
    this.channels.forEach(channel => {
      const value = channel.sampler.interpolate(deltaTime)

      switch (channel.target.path) {
        case 'translation':
          channel.target.node.translation = value
          break
        case 'rotation':
          channel.target.node.rotation = value
          break
        case 'scale':
          channel.target.node.scale = value
          break
        case 'weights':
          channel.target.node.weights = value
          break
      }
      channel.target.node.updateMatrix()
    })
  }
}
