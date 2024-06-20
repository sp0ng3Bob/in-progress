import { Sampler } from './Sampler.js'

export class Texture {

  constructor(options = {}) {
    this.image = options.image ?? null
    this.sampler = options.sampler ?? new Sampler()
    this.hasMipmaps = false
  }
  /*constructor(gl, textureInfo, images) {
      this.gl = gl
      this.textureInfo = textureInfo
      this.texture = gl.createTexture()
      this.target = gl.TEXTURE_2D
      this.images = images
      this.initTexture()
  }

  initTexture() {
      const { gl, textureInfo } = this
      const image = this.images[textureInfo.source]

      gl.bindTexture(this.target, this.texture)

      // Set texture parameters
      const sampler = textureInfo.sampler ?? {}
      gl.texParameteri(this.target, gl.TEXTURE_WRAP_S, sampler.wrapS ?? gl.REPEAT)
      gl.texParameteri(this.target, gl.TEXTURE_WRAP_T, sampler.wrapT ?? gl.REPEAT)
      gl.texParameteri(this.target, gl.TEXTURE_MIN_FILTER, sampler.minFilter ?? gl.LINEAR_MIPMAP_LINEAR)
      gl.texParameteri(this.target, gl.TEXTURE_MAG_FILTER, sampler.magFilter ?? gl.LINEAR)

      // Upload the image into the texture
      gl.texImage2D(this.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

      if (sampler.minFilter === gl.LINEAR_MIPMAP_LINEAR ?? sampler.minFilter === gl.NEAREST_MIPMAP_LINEAR) {
          gl.generateMipmap(this.target)
      }

      gl.bindTexture(this.target, null)
  }

  bind(textureUnit) {
      const { gl } = this
      gl.activeTexture(gl.TEXTURE0 + textureUnit)
      gl.bindTexture(this.target, this.texture)
  }

  unbind(textureUnit) {
      const { gl } = this
      gl.activeTexture(gl.TEXTURE0 + textureUnit)
      gl.bindTexture(this.target, null)
  }*/
}