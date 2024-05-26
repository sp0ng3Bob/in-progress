import { Animation } from "./Animation.js"

export class AnimationsPlayer { //animation sampler

  constructor(options = {}) {
    this.animationsNames = options.names || {}
      this.animationClips = options.clips || [];
  }

  // Add an animation clip to the list
  addClip(clip) {
      this.animationClips.push(clip);
      this.animationsNames[this.animationClips.length-1] = clip.name
  }

  // Update the animations based on the elapsed time
  update(deltaTime) {
      for (const clip of this.animationClips) {
          clip.update(deltaTime);
      }
  }

  // Play a specific animation clip
  playClip(clipName) {
      const clip = this.animationClips.find(clip => clip.name === clipName);
      if (clip) {
          clip.play();
      } else {
          console.error(`Animation clip not found: ${clipName}`);
      }
  }

  // Pause a specific animation clip
  pauseClip(clipName) {
      const clip = this.animationClips.find(clip => clip.name === clipName);
      if (clip) {
          clip.pause();
      } else {
          console.error(`Animation clip not found: ${clipName}`);
      }
  }

  // Stop a specific animation clip
  stopClip(clipName) {
      const clip = this.animationClips.find(clip => clip.name === clipName);
      if (clip) {
          clip.stop();
      } else {
          console.error(`Animation clip not found: ${clipName}`);
      }
  }
}
