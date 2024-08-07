export class AnimationsPlayer {

  constructor() {
    this.animations = undefined
    this.currentTime = 0
    this.isPlaying = false
    this.isPaused = false
    this.animationsToPlay = new Set()
    this.animationsCount = 0
    this.animationsDuration = 0
  }

  addAnimations(animations) {
    this.animations = animations
    this.animationsToPlay.clear()
    this.animationsCount = this.animations.length
    this.animationsDuration = this.animations.reduce((max, anim) => {
      return Math.max(max, anim.duration)
    }, 0)
  }

  toggleAnimationToPlaylist(animationIndex) {
    if (this.animationsToPlay.has(animationIndex)) {
      this.animationsToPlay.delete(animationIndex)
    } else {
      this.animationsToPlay.add(animationIndex)
    }
  }

  getCurrentTime() {
    return this.currentTime % this.animationsDuration || 0
  }

  play() {
    this.isPlaying = true
    this.isPaused = false
  }

  pause() {
    this.isPaused = true
    this.isPlaying = false
  }

  stop() {
    this.isPaused = false
    this.isPlaying = false
    this.currentTime = 0
    this.resetPositions()
  }

  update(deltaTime) {
    if (!this.isPlaying) return

    for (const animationIndex of this.animationsToPlay.keys()) {
      this.animations[animationIndex].update(this.currentTime)
    }

    this.currentTime += deltaTime
  }

  resetPositions() {
    this.animations.forEach(animation => animation.reset())
  }

  delete() {
    this.animations = undefined
    this.currentTime = 0
    this.isPlaying = false
    this.isPaused = false
    this.animationsToPlay.clear()
    this.animationsCount = 0
  }
}
