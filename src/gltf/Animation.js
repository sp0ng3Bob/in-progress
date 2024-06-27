export class Animation {

  constructor(options = {}) {
    this.name = options.name
    this.channels = options.channels

    /* WITH #iteration cycles */
    //this.duration = this.calculateAnimationDurationAndCycles()

    /* WITH NORMALIZED INPUT */
    this.duration = this.calculateAnimationDuration()
    //this.maxCycles = this.getCycles()
    //this.normalizeInput()

    //this.reset()
  }

  normalizeInput() {
    for (const channel of this.channels) {
      let { cycles, input } = channel.sampler
      let plusTime = (this.maxCycles - cycles) * this.duration
      let prevTime = input[0]

      const inputNormalized = new Float32Array(input.length)
      inputNormalized[0] = prevTime + plusTime

      input.slice(1).forEach((time, i) => {
        if (prevTime >= time) plusTime += this.duration
        prevTime = time
        inputNormalized[i + 1] = time + plusTime
      })

      channel.sampler.inputNormalized = inputNormalized
    }
  }

  getCycles() {
    let max = 1
    for (const channel of this.channels) {
      let cycles = 1
      let prevTime = channel.sampler.input[0]

      channel.sampler.input.slice(1).forEach(time => {
        if (prevTime >= time) {
          cycles++
        }
        prevTime = time
      })

      channel.sampler.cycles = cycles
      max = Math.max(max, cycles)
    }
    return max
  }

  calculateAnimationDuration() {
    let max = 0
    for (const channel of this.channels) {
      max = Math.max(max, Math.max(...channel.sampler.input))
    }
    return max
  }

  calculateAnimationDurationAndCycles() {
    let max = 0
    for (const channel of this.channels) {
      max = Math.max(max, Math.max(...channel.sampler.input));

      /*let cycles = channel.sampler.input.slice(1).reduce((acc, time, i, arr) => {
        const prevTime = arr[i - 1] || channel.sampler.input[0];
        return prevTime >= time ? acc + 1 : acc;
      }, 1);*/
      let cycles = 1;
      let prevTime = channel.sampler.input[0];

      channel.sampler.input.slice(1).forEach(time => {
        if (prevTime >= time) {
          cycles++
        }
        prevTime = time
      })

      channel.sampler.cycles = cycles
    }
    return max
  }

  reset() {
    this.channels.forEach(channel => {
      this.updateNodeValue(channel, channel.sampler.getStartingPosition())
    })
  }

  update(deltaTime) { //, animationsDuration) {
    //deltaTime %= animationsDuration //this.duration
    deltaTime %= this.duration

    this.channels.forEach(channel => {
      if (channel.target.node) {
        //for (let i = channel.sampler.atInputIndex; i < channel.sampler.inputNormalized.length; i++) {
        for (let i = 1; i < channel.sampler.input.length; i++) {
          //for (let i = 1; i < channel.sampler.inputNormalized.length; i++) {
          if (deltaTime > channel.sampler.input[i - 1] && deltaTime < channel.sampler.input[i]) {
            //if (deltaTime >= channel.sampler.inputNormalized[i - 1] && deltaTime <= channel.sampler.inputNormalized[i]) {
            const value = channel.sampler.interpolate(deltaTime, i) //deltaTime, this.duration, i
            this.updateNodeValue(channel, value)

            //channel.sampler.atInputIndex++
          }
        }
        //if ()
      }
    })
  }

  updateNodeValue(channel, value) {
    switch (channel.target.path) {
      case 'translation':
      case 'rotation':
      case 'scale':
        //console.log(channel.target.path, channel.target.node[channel.target.path] === value, channel.target.node)
        channel.target.node[channel.target.path] = value
        channel.target.node.updateMatrix()
        break
      case 'weights':
        channel.target.node.mesh.weights = value
        break
    }
  }
}
