//import { mat4 } from 'gl-matrix'

export class AnimationsPlayer {

  constructor() {
    this.animations = undefined
    this.currentTime = 0
    this.isPlaying = false
    this.isPaused = false
    this.animationsToPlay = new Set()
    this.animationsCount = 0
    //this.startTime = 0
  }

  addAnimations(animations) {
    this.animations = animations
    this.animationsToPlay.clear()
    this.animationsCount = this.animations.length
    this.animationsDuration = this.animations.reduce((max, anim) => {
      return Math.max(max, anim.duration * anim.maxCycles);
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
    return this.currentTime % this.animationsDuration //this.animations[0].duration
  }

  play() {
    this.isPlaying = true
    //this.startTime = performance.now();
    //requestAnimationFrame(this.update.bind(this));
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

    //const elapsed = (currentTime - this.startTime) / 1000

    for (const animationIndex of this.animationsToPlay.keys()) {
      this.animations[animationIndex].update(this.getCurrentTime()) //(elapsed)
    }

    this.currentTime += deltaTime

    //requestAnimationFrame(this.update.bind(this));
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
