import { BufferView } from './BufferView.js'
import { Accessor } from './Accessor.js'
import { Sampler } from './Sampler.js'
import { Animation } from './Animation.js'
import { AnimationSampler } from './AnimationSampler.js'
import { Texture } from './Texture.js'
import { Material } from './Material.js'
import { Primitive } from './Primitive.js'
import { Mesh } from './Mesh.js'
import { PerspectiveCamera } from './PerspectiveCamera.js'
import { OrthographicCamera } from './OrthographicCamera.js'
import { Node } from './Node.js'
import { Scene } from './Scene.js'
import { Skin } from "./Skin.js"

import * as BB from "../helpers/BoundingBox.js"

// This class loads all GLTF resources and instantiates
// the corresponding classes. Keep in mind that it loads
// the resources in series (care to optimize?). 
// -- No, not really. Maybe some other day, kind sir.

//https://github.com/KhronosGroup/glTF-Tutorials/blob/main/gltfTutorial

export class GLTFLoader {

  constructor() {
    this.gltf = null
    this.glbBuffers = null
    this.gltfUrl = null
    this.dirname = null

    this.cache = new Map()
  }

  async fetchJson(url) {
    return fetch(url).then(response => response.json())
  }

  async fetchBuffer(url) {
    return fetch(url).then(response => response.arrayBuffer())
  }

  async fetchImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', e => resolve(image))
      image.addEventListener('error', reject)
      image.src = url
    })
  }

  findByNameOrIndex(set, nameOrIndex, index) {
    if (!isNaN(Number(nameOrIndex))) {
      return set[nameOrIndex]
    } else {
      if (index > -1) {
        return set.find(element => element.camera === index)
      } else {
        return set.find(element => element.name === nameOrIndex)
      }
    }
  }

  async load(url) {
    const extension = url.split('.').pop().toLowerCase()
    this.gltfUrl = new URL(url, window.location)
    if (extension === 'glb') {
      await this.loadGLB(url)
    } else if (extension === 'gltf') {
      await this.loadGLTF(url)
    } else {
      console.error('Unsupported file format')
    }
  }

  async loadGLTF(url) {
    try {
      this.gltf = await this.fetchJson(url)
      this.defaultScene = this.gltf.scene || 0
      this.glbBuffers = null
    } catch (error) {
      console.error(error)
    }
  }

  async loadGLB(url) {
    try {
      const data = await this.fetchBuffer(url)
      this.gltf = await this.parseGLB(data)
      this.defaultScene = this.gltf.scene || 0
    } catch (error) {
      console.error(error)
    }
  }

  async parseGLB(glb) {
    const header = new DataView(glb, 0, 12)
    const magic = header.getUint32(0, true)
    const version = header.getUint32(4, true)
    const length = header.getUint32(8, true)

    if (magic !== 0x46546C67) {
      console.error('Invalid GLB magic number')
      return null
    }

    let offset = 12
    let json = null
    let binaryBuffer = null

    while (offset < length) {
      const chunkLength = new DataView(glb, offset, 4).getUint32(0, true)
      const chunkType = new DataView(glb, offset + 4, 4).getUint32(0, true)
      offset += 8

      if (chunkType === 0x4E4F534A) { // JSON
        const jsonText = new TextDecoder().decode(new Uint8Array(glb, offset, chunkLength))
        json = JSON.parse(jsonText)

        if (json.asset.version != version) {
          console.error("Header version and json version do not match!")
        }
      } else if (chunkType === 0x004E4942) { // Binary
        binaryBuffer = glb.slice(offset, offset + chunkLength)
      }

      offset += chunkLength
    }

    this.glbBuffers = binaryBuffer
    return json
  }

  async loadImage(nameOrIndex) {
    const gltfSpec = this.findByNameOrIndex(this.gltf.images, nameOrIndex)
    if (this.cache.has(gltfSpec)) {
      return this.cache.get(gltfSpec)
    }

    if (gltfSpec.uri) {
      const url = new URL(gltfSpec.uri, this.gltfUrl)
      const image = await this.fetchImage(url)
      this.cache.set(gltfSpec, image)
      return image
    } else {
      const bufferView = await this.loadBufferView(gltfSpec.bufferView)
      const imageBuffer = this.glbBuffers.slice(bufferView.byteOffset, bufferView.byteOffset + bufferView.byteLength)
      const blob = new Blob([imageBuffer], { type: gltfSpec.mimeType })
      const image = new Image()
      image.src = URL.createObjectURL(blob)
      await image.decode()
      URL.revokeObjectURL(image.src)
      this.cache.set(gltfSpec, image)
      return image
    }
  }

  async loadBuffer(nameOrIndex) {
    const gltfSpec = this.findByNameOrIndex(this.gltf.buffers, nameOrIndex)
    if (this.cache.has(gltfSpec)) {
      return this.cache.get(gltfSpec)
    }

    if (gltfSpec.uri) {
      const url = new URL(gltfSpec.uri, this.gltfUrl)
      const buffer = await this.fetchBuffer(url)
      this.cache.set(gltfSpec, buffer)
      return buffer
    } else if (this.glbBuffers) {
      const bufferView = new DataView(this.glbBuffers, gltfSpec.byteOffset ?? 0, gltfSpec.byteLength)
      const buffer = bufferView.buffer
      this.cache.set(gltfSpec, buffer)
      return buffer
    } else {
      throw new Error("loadBuffer error: no URI or GLB buffer data found.")
    }
  }

  async loadBufferView(nameOrIndex) {
    const gltfSpec = this.findByNameOrIndex(this.gltf.bufferViews, nameOrIndex)
    if (this.cache.has(gltfSpec)) {
      return this.cache.get(gltfSpec)
    }

    const bufferView = new BufferView({
      ...gltfSpec,
      buffer: await this.loadBuffer(gltfSpec.buffer),
    })
    this.cache.set(gltfSpec, bufferView)
    return bufferView
  }

  loadSparseBufferView(nameOrIndex, sparseData) {
    const gltfSpec = this.findByNameOrIndex(this.gltf.bufferViews, nameOrIndex)
    if (this.cache.has(gltfSpec)) {
      return this.cache.get(gltfSpec)
    }

    const bufferView = new BufferView({
      byteLength: sparseData.length,
      buffer: sparseData.buffer,
    })
    this.cache.set(gltfSpec, bufferView)
    return bufferView
  }

  async loadAccessor(nameOrIndex) {
    const gltfSpec = this.findByNameOrIndex(this.gltf.accessors, nameOrIndex)
    if (this.cache.has(gltfSpec)) {
      return this.cache.get(gltfSpec)
    }

    const accessorTypeToNumComponentsMap = {
      SCALAR: 1,
      VEC2: 2,
      VEC3: 3,
      VEC4: 4,
      MAT2: 4,
      MAT3: 9,
      MAT4: 16,
    }

    const typedArrayConstructor = {
      5120: Int8Array,
      5121: Uint8Array,
      5122: Int16Array,
      5123: Uint16Array,
      5125: Uint32Array,
      5126: Float32Array
    }

    let accessor
    let bufferView
    const type = accessorTypeToNumComponentsMap[gltfSpec.type]
    const byteLength = gltfSpec.count * type
    if (gltfSpec.sparse) {
      const { count, values, indices } = gltfSpec.sparse

      const valuesAccessor = await this.loadBufferView(values.bufferView)
      const indicesAccessor = await this.loadBufferView(indices.bufferView)

      const ValuesArray = typedArrayConstructor[gltfSpec.componentType]
      let sparseData
      let startingData
      if (gltfSpec.bufferView) {
        startingData = await this.loadBufferView(gltfSpec.bufferView)
        sparseData = new ValuesArray(startingData.buffer, startingData.byteOffset, startingData.byteLength / ValuesArray.BYTES_PER_ELEMENT)
      } else {
        sparseData = new ValuesArray(byteLength)
        //sparseData.set(0.0) //not really needed
      }

      const IndicesArray = typedArrayConstructor[indices.componentType]
      const indicesData = new IndicesArray(indicesAccessor.buffer, indicesAccessor.byteOffset, indicesAccessor.byteLength / IndicesArray.BYTES_PER_ELEMENT)
      const valuesData = new ValuesArray(valuesAccessor.buffer, valuesAccessor.byteOffset, valuesAccessor.byteLength / ValuesArray.BYTES_PER_ELEMENT)

      console.log("Sparse Accessor Debugging:")
      console.log("Initial sparse data:", sparseData)
      //console.log("Indices Data:", indicesData)
      //console.log("Values Data:", valuesData)

      for (let i = 0; i < count; i++) {
        const index = indicesData[i]
        const value = valuesData.subarray(i * type, (i + 1) * type)
        //console.log(`Setting value at index ${index}:`, value)
        sparseData.set(value, index * type)
      }

      console.log("Final Sparse Data:", sparseData)
      //bufferView = sparseData
      startingData.buffer = sparseData.buffer
      bufferView = startingData

      //bufferView = this.loadSparseBufferView(gltfSpec.bufferView, sparseData)

      /*bufferView = new BufferView({
        buffer: sparseData.buffer,
        byteLength: sparseData.length * ValuesArray.BYTES_PER_ELEMENT //sparseData.byteLength //ValuesArray.BYTES_PER_ELEMENT //gltfSpec.count //gltfSpec.byteLength //type //sparseData.buffer.byteLength
      })*/
    } else {
      bufferView = await this.loadBufferView(gltfSpec.bufferView)
    }

    accessor = new Accessor({
      ...gltfSpec,
      bufferView,
      numComponents: type,
    })

    this.cache.set(gltfSpec, accessor)
    return accessor
  }

  async loadSampler(nameOrIndex, kind, animationIndex = null, animationPath = null) {
    let gltfSpec
    let sampler
    if (kind == "samplers") {
      gltfSpec = this.findByNameOrIndex(this.gltf[kind], nameOrIndex)
      if (this.cache.has(gltfSpec)) {
        return this.cache.get(gltfSpec)
      }

      sampler = new Sampler({
        min: gltfSpec.minFilter,
        mag: gltfSpec.magFilter,
        wrapS: gltfSpec.wrapS,
        wrapT: gltfSpec.wrapT,
      })
    } else {
      gltfSpec = this.findByNameOrIndex(this.gltf[kind][animationIndex].samplers, nameOrIndex)
      if (this.cache.has(gltfSpec)) {
        return this.cache.get(gltfSpec)
      }

      sampler = new AnimationSampler({
        path: animationPath,
        input: await this.loadAccessor(gltfSpec.input), //gltfSpec.input,
        output: await this.loadAccessor(gltfSpec.output), //gltfSpec.output,
        interpolation: gltfSpec.interpolation
      })
    }

    this.cache.set(gltfSpec, sampler)
    return sampler
  }

  async loadTexture(nameOrIndex) {
    const gltfSpec = this.findByNameOrIndex(this.gltf.textures, nameOrIndex)
    if (this.cache.has(gltfSpec)) {
      return this.cache.get(gltfSpec)
    }

    const options = {}
    if (gltfSpec.source !== undefined) {
      options.image = await this.loadImage(gltfSpec.source)
    }

    if (gltfSpec.sampler !== undefined) {
      options.sampler = await this.loadSampler(gltfSpec.sampler, "samplers")
    }

    const texture = new Texture(options)
    this.cache.set(gltfSpec, texture)
    return texture
  }

  async loadMaterial(nameOrIndex) {
    const gltfSpec = this.findByNameOrIndex(this.gltf.materials, nameOrIndex)
    if (this.cache.has(gltfSpec)) {
      return this.cache.get(gltfSpec)
    }

    const options = {}
    const pbr = gltfSpec.pbrMetallicRoughness
    if (pbr) {
      if (pbr.baseColorTexture) {
        options.baseColorTexture = await this.loadTexture(pbr.baseColorTexture.index)
        options.baseColorTexCoord = pbr.baseColorTexture.texCoord
      }
      if (pbr.metallicRoughnessTexture) {
        options.metallicRoughnessTexture = await this.loadTexture(pbr.metallicRoughnessTexture.index)
        options.metallicRoughnessTexCoord = pbr.metallicRoughnessTexture.texCoord
      }
      options.baseColorFactor = pbr.baseColorFactor ?? [1.0, 1.0, 1.0, 1.0]
      options.metallicFactor = pbr.metallicFactor ?? 1.0
      options.roughnessFactor = pbr.roughnessFactor ?? 1.0
    }

    if (gltfSpec.normalTexture) {
      options.normalTexture = await this.loadTexture(gltfSpec.normalTexture.index)
      options.normalTexCoord = gltfSpec.normalTexture.texCoord
      options.normalFactor = gltfSpec.normalTexture.scale
    }

    if (gltfSpec.occlusionTexture) {
      options.occlusionTexture = await this.loadTexture(gltfSpec.occlusionTexture.index)
      options.occlusionTexCoord = gltfSpec.occlusionTexture.texCoord
      options.occlusionFactor = gltfSpec.occlusionTexture.strength
    }

    if (gltfSpec.emissiveTexture) {
      options.emissiveTexture = await this.loadTexture(gltfSpec.emissiveTexture.index)
      options.emissiveTexCoord = gltfSpec.emissiveTexture.texCoord
    }

    options.emissiveFactor = gltfSpec.emissiveFactor ?? [0.0, 0.0, 0.0]
    options.alphaMode = gltfSpec.alphaMode ?? "OPAQUE"
    options.alphaCutoff = gltfSpec.alphaCutoff ?? 0.5
    options.doubleSided = gltfSpec.doubleSided ?? false

    const material = new Material(options)
    this.cache.set(gltfSpec, material)
    return material
  }

  /*
  glTF 2.0 supports only static 2D textures.
    When texture.source is undefined, the image SHOULD be provided by an extension or application-specific means, otherwise the texture object is undefined.
    Implementation Note
    Client implementations may render such textures with a predefined placeholder image or being filled with some error color (usually magenta).
  */
  async loadMesh(nameOrIndex) {
    const gltfSpec = this.findByNameOrIndex(this.gltf.meshes, nameOrIndex)
    if (this.cache.has(gltfSpec)) {
      return this.cache.get(gltfSpec)
    }

    const options = { primitives: [] }
    for (const primitiveSpec of gltfSpec.primitives) {
      const primitiveOptions = { attributes: {} }
      for (const name in primitiveSpec.attributes) {
        primitiveOptions.attributes[name] = await this.loadAccessor(primitiveSpec.attributes[name])
      }
      if (primitiveSpec.indices !== undefined) {
        primitiveOptions.indices = await this.loadAccessor(primitiveSpec.indices)
      }
      if (primitiveSpec.material !== undefined) {
        primitiveOptions.material = await this.loadMaterial(primitiveSpec.material)
      }
      primitiveOptions.mode = primitiveSpec.mode

      // morphing targets - blend shapes
      if (primitiveSpec.targets) {
        primitiveOptions.targets = []
        for (const target in primitiveSpec.targets) {
          primitiveOptions.targets[target] = {}
          for (const name in primitiveSpec.targets[target]) {
            primitiveOptions.targets[target][name] = await this.loadAccessor(primitiveSpec.targets[target][name])
          }
        }
      }

      const primitive = new Primitive(primitiveOptions)
      options.primitives.push(primitive)
    }

    if (gltfSpec.weights) {
      options.weights = [...gltfSpec.weights]
    }

    const mesh = new Mesh(options)
    this.cache.set(gltfSpec, mesh)
    return mesh
  }

  async loadCamera(nameOrIndex) {
    const gltfSpec = this.findByNameOrIndex(this.gltf.cameras, nameOrIndex)
    if (this.cache.has(gltfSpec)) {
      return this.cache.get(gltfSpec)
    }

    if (gltfSpec.type === 'perspective') {
      const persp = gltfSpec.perspective
      const camera = new PerspectiveCamera({
        aspect: persp.aspectRatio,
        fov: persp.yfov,
        near: persp.znear,
        far: persp.zfar,
      })
      this.cache.set(gltfSpec, camera)
      return camera
    } else if (gltfSpec.type === 'orthographic') {
      const ortho = gltfSpec.orthographic
      const camera = new OrthographicCamera({
        //left: -ortho.xmag,
        right: ortho.xmag,
        //bottom: -ortho.ymag,
        top: ortho.ymag,
        near: ortho.znear,
        far: ortho.zfar,
      })
      this.cache.set(gltfSpec, camera)
      return camera
    }
  }

  async loadNode(nameOrIndex, index = -1) {
    const gltfSpec = this.findByNameOrIndex(this.gltf.nodes, nameOrIndex, index)
    if (this.cache.has(gltfSpec)) {
      return this.cache.get(gltfSpec)
    }
    if (gltfSpec == undefined) {
      return
    }

    const options = { ...gltfSpec, children: [] }

    if (gltfSpec.children !== undefined) {
      for (const nodeIndex of gltfSpec.children) {
        const node = await this.loadNode(nodeIndex)
        options.children.push(node)
      }
    }

    if (gltfSpec.camera !== undefined) {
      options.camera = await this.loadCamera(gltfSpec.camera)
    }

    if (gltfSpec.mesh !== undefined) {
      options.mesh = await this.loadMesh(gltfSpec.mesh)

      /*options.transparrentPrimitives = []
      options.opaquePrimitives = []
      for (let primitive of options.mesh.primitives) {
        if (primitive.material.alphaMode === "BLEND") {
          options.transparrentPrimitives.push(primitive)
        } else {

        }
      }*/
    }

    if (gltfSpec.skin !== undefined) {
      options.skin = await this.loadSkin(gltfSpec.skin)
      /*options.skin = []
      for (const skin in gltfSpec.skins) {
        options.skin.push(await this.loadSkin(skin))
      }*/
    }

    const node = new Node(options)
    this.cache.set(gltfSpec, node)
    return node
  }

  async loadScene(nameOrIndex) {
    const gltfSpec = this.findByNameOrIndex(this.gltf.scenes, nameOrIndex)
    if (this.cache.has(gltfSpec)) {
      return this.cache.get(gltfSpec)
    }

    const options = { nodes: [] }
    if (gltfSpec.nodes) {
      console.log("LOAD SCENE: gltfSpec.nodes", gltfSpec.nodes)
      for (const nodeIndex of gltfSpec.nodes) {
        const node = await this.loadNode(nodeIndex)
        options.nodes.push(node)
      }
    }

    if (this.gltf.animations) {
      options.animations = []
      for (const animationIndex in this.gltf.animations) {
        const animation = await this.loadAnimation(animationIndex)
        options.animations.push(animation)
      }
    }

    const scene = new Scene(options)
    this.cache.set(gltfSpec, scene)
    return scene
  }

  async loadSkin(nameOrIndex) {
    const gltfSpec = this.findByNameOrIndex(this.gltf.skins, nameOrIndex)
    if (this.cache.has(gltfSpec)) {
      return this.cache.get(gltfSpec)
    }

    let options = { joints: [] }
    options.name = `Skin_${nameOrIndex}` //gltfSpec.name ?? `Skin_${nameOrIndex}`

    if (gltfSpec.skeleton) {
      options.skeleton = await this.loadNode(gltfSpec.skeleton)
    }

    for (const jointIndex of gltfSpec.joints) {
      options.joints.push(await this.loadNode(jointIndex))
    }

    if (gltfSpec.inverseBindMatrices) {
      options.inverseBindMatrices = await this.loadAccessor(gltfSpec.inverseBindMatrices)
    }

    const skin = new Skin(options)
    this.cache.set(gltfSpec, skin)
    return skin
  }

  async loadAnimation(nameOrIndex) {
    const gltfSpec = this.findByNameOrIndex(this.gltf.animations, nameOrIndex)
    if (this.cache.has(gltfSpec)) {
      return this.cache.get(gltfSpec)
    }

    let options = { name: gltfSpec.name ?? `Animation_${nameOrIndex}`, channels: [] } //, samplers: [] }

    for (const channelIndex in gltfSpec.channels) {
      const channel = {}
      channel.target = {}
      channel.target.path = gltfSpec.channels[channelIndex].target.path
      channel.target.node = await this.loadNode(gltfSpec.channels[channelIndex].target.node)
      channel.sampler = await this.loadSampler(gltfSpec.channels[channelIndex].sampler, "animations", nameOrIndex, channel.target.path)
      options.channels.push(channel)
    }

    /*for (const samplerIndex in gltfSpec.samplers) {
        const sampler = {}
        sampler.interpolation = gltfSpec.samplers[samplerIndex].interpolation
        sampler.input = await this.loadAccessor(gltfSpec.samplers[samplerIndex].input)
        sampler.output = await this.loadAccessor(gltfSpec.samplers[samplerIndex].output)
        options.samplers.push(sampler)
    }*/

    const animation = new Animation(options)
    this.cache.set(gltfSpec, animation)
    return animation
  }

}