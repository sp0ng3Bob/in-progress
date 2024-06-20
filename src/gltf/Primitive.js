import { Material } from './Material.js'
export class Primitive {

  constructor(options = {}) {
    this.attributes = { ...(options.attributes ?? {}) }
    this.indices = options.indices ?? null
    this.mode = options.mode !== undefined ? options.mode : 4
    this.material = options.material ?? new Material()
    this.targets = { ...(options.targets ?? {}) }
  }
  /*constructor(gltf, primitiveData, gl) {
      this.gl = gl
      this.attributes = {}
      this.indices = null
      this.material = null

      this.initAttributes(gltf, primitiveData.attributes)
      this.initIndices(gltf, primitiveData.indices)
      this.initMaterial(gltf, primitiveData.material)
  }

  initAttributes(gltf, attributes) {
      for (const [name, accessorIndex] of Object.entries(attributes)) {
          const accessor = gltf.accessors[accessorIndex]
          const bufferView = gltf.bufferViews[accessor.bufferView]
          const buffer = gltf.buffers[bufferView.buffer]
          const data = new Float32Array(buffer.data, bufferView.byteOffset, bufferView.byteLength / Float32Array.BYTES_PER_ELEMENT)

          this.attributes[name] = {
              buffer: this.createBuffer(data),
              size: accessor.type === 'VEC3' ? 3 : 2
          }
      }
  }

  initIndices(gltf, accessorIndex) {
      if (accessorIndex !== undefined) {
          const accessor = gltf.accessors[accessorIndex]
          const bufferView = gltf.bufferViews[accessor.bufferView]
          const buffer = gltf.buffers[bufferView.buffer]
          const data = new Uint16Array(buffer.data, bufferView.byteOffset, bufferView.byteLength / Uint16Array.BYTES_PER_ELEMENT)

          this.indices = this.createBuffer(data, this.gl.ELEMENT_ARRAY_BUFFER)
      }
  }

  initMaterial(gltf, materialIndex) {
      if (materialIndex !== undefined) {
          this.material = gltf.materials[materialIndex]
      }
  }

  createBuffer(data, target = this.gl.ARRAY_BUFFER) {
      const buffer = this.gl.createBuffer()
      this.gl.bindBuffer(target, buffer)
      this.gl.bufferData(target, data, this.gl.STATIC_DRAW)
      return buffer
  }

  draw(programInfo) {
      const { gl } = this

      // Bind and enable attributes
      for (const [name, attribute] of Object.entries(this.attributes)) {
          const location = programInfo.attribLocations[name]
          if (location === undefined) continue

          gl.bindBuffer(gl.ARRAY_BUFFER, attribute.buffer)
          gl.vertexAttribPointer(location, attribute.size, gl.FLOAT, false, 0, 0)
          gl.enableVertexAttribArray(location)
      }

      // Bind indices if available
      if (this.indices) {
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices)
          gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0)
      } else {
          gl.drawArrays(gl.TRIANGLES, 0, this.attributes['POSITION'].buffer.length / this.attributes['POSITION'].size)
      }

      // Disable attributes
      for (const location of Object.values(programInfo.attribLocations)) {
          gl.disableVertexAttribArray(location)
      }
  }*/
}