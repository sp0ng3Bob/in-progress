//import { mat4 } from 'gl-matrix'

export class AnimationsPlayer {

  constructor() {
    this.animations = undefined
    this.currentTime = 0
    this.isPlaying = false
    this.isPaused = false
    this.animationsToPlay = new Set()
    this.animationsCount = 0
  }

  addAnimations(animations) {
    this.animations = animations
    this.animationsToPlay.clear()
    this.animationsCount = this.animations.length
  }

  toggleAnimationToPlaylist(animationIndex) {
    if (this.animationsToPlay.has(animationIndex)) {
      this.animationsToPlay.delete(animationIndex)
    } else {
      this.animationsToPlay.add(animationIndex)
    }
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
    //if (!this.isPlaying || !this.currentAnimation) return
    if (!this.isPlaying) return

    this.currentTime += deltaTime
    for (const animationIndex of this.animationsToPlay.keys()) {
      this.animations[animationIndex].update(this.currentTime)
    }
  }

  resetPositions() {
    this.animations.forEach(animation => animation.update(this.currentTime))
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
