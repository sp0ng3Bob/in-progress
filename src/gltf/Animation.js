export class Animation {

  constructor(options = {}) {
    this.name = options.name
    this.channels = options.channels
    this.duration = this.calculateAnimationDuration()
  }

  calculateAnimationDuration() {
    let max = 0
    for (const channel of this.channels) {
      max = Math.max(max, Math.max(...channel.sampler.input))
    }
    return max
  }

  reset() {
    this.channels.forEach(channel => {
      this.updateNodeValue(channel, channel.sampler.getStartingPosition())
    })
  }

  update(deltaTime) {
    deltaTime %= this.duration

    this.channels.forEach(channel => {
      if (channel.target.node) {
        for (let i = 1; i < channel.sampler.input.length; i++) {
          if (deltaTime > channel.sampler.input[i - 1] && deltaTime < channel.sampler.input[i]) {
            const value = channel.sampler.interpolate(deltaTime, i)
            this.updateNodeValue(channel, value)
          }
        }
      }
    })
  }

  updateNodeValue(channel, value) {
    switch (channel.target.path) {
      case 'translation':
      case 'rotation':
      case 'scale':
        channel.target.node[channel.target.path] = value
        channel.target.node.updateMatrix()
        break
      case 'weights':
        channel.target.node.mesh.weights = value
        break
    }
  }
}
