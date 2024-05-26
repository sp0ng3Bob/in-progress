import { BufferView } from './BufferView.js';
import { Accessor } from './Accessor.js';
import { Sampler } from './Sampler.js';
import { AnimationSampler } from './AnimationSampler.js';
import { Texture } from './Texture.js';
import { Material } from './Material.js';
import { Primitive } from './Primitive.js';
import { Mesh } from './Mesh.js';
import { PerspectiveCamera } from './PerspectiveCamera.js';
import { OrthographicCamera } from './OrthographicCamera.js';
import { Node } from './Node.js';
import { Scene } from './Scene.js';
import { Skin } from "./Skin.js"

import * as BB from "../helpers/BoundingBox.js"

// This class loads all GLTF resources and instantiates
// the corresponding classes. Keep in mind that it loads
// the resources in series (care to optimize?).

export class GLTFLoader {

    constructor() {
        this.gltf = null;
        this.gltfUrl = null;
        this.dirname = null;

        this.cache = new Map();
    }

    fetchJson(url) {
        return fetch(url).then(response => response.json());
    }

    fetchBuffer(url) {
        return fetch(url).then(response => response.arrayBuffer());
    }

    fetchImage(url) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', e => resolve(image));
            image.addEventListener('error', reject);
            image.src = url;
        });
    }

    findByNameOrIndex(set, nameOrIndex, index) {
        if (typeof nameOrIndex === 'number') {
            return set[nameOrIndex];
        } else {
            if (index > -1) {
                return set.find(element => element.camera === index);
            } else {
                return set.find(element => element.name === nameOrIndex);
            }
        }
    }

    async load(url) {
        this.gltfUrl = new URL(url, window.location);
        this.gltf = await this.fetchJson(url);
        this.defaultScene = this.gltf.scene || 0;
        this.defaultCamera = 0;
    }

    async loadImage(nameOrIndex) {
        const gltfSpec = this.findByNameOrIndex(this.gltf.images, nameOrIndex);
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        if (gltfSpec.uri) {
            const url = new URL(gltfSpec.uri, this.gltfUrl);
            const image = await this.fetchImage(url);
            this.cache.set(gltfSpec, image);
            return image;
        } else {
            const bufferView = await this.loadBufferView(gltfSpec.bufferView);
            const blob = new Blob([bufferView], { type: gltfSpec.mimeType });
            const url = URL.createObjectURL(blob);
            const image = await this.fetchImage(url);
            URL.revokeObjectURL(url);
            this.cache.set(gltfSpec, image);
            return image;
        }
    }

    async loadBuffer(nameOrIndex) {
        const gltfSpec = this.findByNameOrIndex(this.gltf.buffers, nameOrIndex);
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        const url = new URL(gltfSpec.uri, this.gltfUrl);
        const buffer = await this.fetchBuffer(url);
        this.cache.set(gltfSpec, buffer);
        return buffer;
    }

    async loadBufferView(nameOrIndex) {
        const gltfSpec = this.findByNameOrIndex(this.gltf.bufferViews, nameOrIndex);
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        const bufferView = new BufferView({
            ...gltfSpec,
            buffer: await this.loadBuffer(gltfSpec.buffer),
        });
        this.cache.set(gltfSpec, bufferView);
        return bufferView;
    }

    async loadAccessor(nameOrIndex) {
        const gltfSpec = this.findByNameOrIndex(this.gltf.accessors, nameOrIndex);
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        const accessorTypeToNumComponentsMap = {
            SCALAR : 1,
            VEC2   : 2,
            VEC3   : 3,
            VEC4   : 4,
            MAT2   : 4,
            MAT3   : 9,
            MAT4   : 16,
        };

        const accessor = new Accessor({
            ...gltfSpec,
            bufferView    : await this.loadBufferView(gltfSpec.bufferView),
            numComponents : accessorTypeToNumComponentsMap[gltfSpec.type],
        });
        this.cache.set(gltfSpec, accessor);
        return accessor;
    }

    async loadSampler(nameOrIndex, kind) {
        const gltfSpec = this.findByNameOrIndex(this.gltf[kind], nameOrIndex);
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        let sampler
        if (kind == "samplers") {
          sampler = new Sampler({
              min   : gltfSpec.minFilter,
              mag   : gltfSpec.magFilter,
              wrapS : gltfSpec.wrapS,
              wrapT : gltfSpec.wrapT,
          });
        } else {  
          sampler = new AnimationSampler({
            input         : gltfSpec.input,
            output        : gltfSpec.output,
            interpolation : gltfSpec.interpolation
          });
        }

        this.cache.set(gltfSpec, sampler);
        return sampler;
    }

    async loadTexture(nameOrIndex) {
        const gltfSpec = this.findByNameOrIndex(this.gltf.textures, nameOrIndex);
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        const options = {};
        if (gltfSpec.source !== undefined) {
            options.image = await this.loadImage(gltfSpec.source);
        }
        if (gltfSpec.sampler !== undefined) {
            options.sampler = await this.loadSampler(gltfSpec.sampler, "samplers");
        }

        const texture = new Texture(options);
        this.cache.set(gltfSpec, texture);
        return texture;
    }

    async loadMaterial(nameOrIndex) {
        const gltfSpec = this.findByNameOrIndex(this.gltf.materials, nameOrIndex);
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        const options = {};
        const pbr = gltfSpec.pbrMetallicRoughness;
        if (pbr) {
            if (pbr.baseColorTexture) {
                options.baseColorTexture = await this.loadTexture(pbr.baseColorTexture.index);
                options.baseColorTexCoord = pbr.baseColorTexture.texCoord;
            }
            if (pbr.metallicRoughnessTexture) {
                options.metallicRoughnessTexture = await this.loadTexture(pbr.metallicRoughnessTexture.index);
                options.metallicRoughnessTexCoord = pbr.metallicRoughnessTexture.texCoord;
            }
            options.baseColorFactor = pbr.baseColorFactor;
            options.metallicFactor = pbr.metallicFactor;
            options.roughnessFactor = pbr.roughnessFactor;
        }

        if (gltfSpec.normalTexture) {
            options.normalTexture = await this.loadTexture(gltfSpec.normalTexture.index);
            options.normalTexCoord = gltfSpec.normalTexture.texCoord;
            options.normalFactor = gltfSpec.normalTexture.scale;
        }

        if (gltfSpec.occlusionTexture) {
            options.occlusionTexture = await this.loadTexture(gltfSpec.occlusionTexture.index);
            options.occlusionTexCoord = gltfSpec.occlusionTexture.texCoord;
            options.occlusionFactor = gltfSpec.occlusionTexture.strength;
        }

        if (gltfSpec.emissiveTexture) {
            options.emissiveTexture = await this.loadTexture(gltfSpec.emissiveTexture.index);
            options.emissiveTexCoord = gltfSpec.emissiveTexture.texCoord;
        }
          
        options.emissiveFactor = gltfSpec.emissiveFactor;
        options.alphaMode = gltfSpec.alphaMode;
        options.alphaCutoff = gltfSpec.alphaCutoff;
        options.doubleSided = gltfSpec.doubleSided;
        console.log("MATERIAL WHAAT??",gltfSpec,options)

        const material = new Material(options);
        this.cache.set(gltfSpec, material);
        return material;
    }

    async loadMesh(nameOrIndex) {
        const gltfSpec = this.findByNameOrIndex(this.gltf.meshes, nameOrIndex);
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        const options = { primitives: [], weights: [] };
        for (const primitiveSpec of gltfSpec.primitives) {
            const primitiveOptions = { targets: {} };
            primitiveOptions.attributes = {};
            for (const name in primitiveSpec.attributes) {
                primitiveOptions.attributes[name] = await this.loadAccessor(primitiveSpec.attributes[name]);
            }
            if (primitiveSpec.indices !== undefined) {
                primitiveOptions.indices = await this.loadAccessor(primitiveSpec.indices);
            }
            if (primitiveSpec.material !== undefined) {
                primitiveOptions.material = await this.loadMaterial(primitiveSpec.material);
            }
            primitiveOptions.mode = primitiveSpec.mode;

            // morphing targets
            if (primitiveSpec.targets) {
              for (const target in primitiveSpec.targets) {
                primitiveOptions.targets[target] = {}
                for (const name in primitiveSpec.targets[target]) {
                  primitiveOptions.targets[target][name] = await this.loadAccessor(primitiveSpec.targets[target][name]);
                }
              }
            }

            const primitive = new Primitive(primitiveOptions);
            options.primitives.push(primitive);
          }
          
        if (gltfSpec.weights) {
          options.weights = [...gltfSpec.weights]
        }

        const mesh = new Mesh(options);
        this.cache.set(gltfSpec, mesh);
        return mesh;
    }

    async loadCamera(nameOrIndex) {
        const gltfSpec = this.findByNameOrIndex(this.gltf.cameras, nameOrIndex);
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }
        
        if (gltfSpec.type === 'perspective') {
            const persp = gltfSpec.perspective;
            const camera = new PerspectiveCamera({
                aspect : persp.aspectRatio,
                fov    : persp.yfov,
                near   : persp.znear,
                far    : persp.zfar,
            });
            this.cache.set(gltfSpec, camera);
            return camera;
        } else if (gltfSpec.type === 'orthographic') {
            const ortho = gltfSpec.orthographic;
            const camera = new OrthographicCamera({
                left   : -ortho.xmag,
                right  : ortho.xmag,
                bottom : -ortho.ymag,
                top    : ortho.ymag,
                near   : ortho.znear,
                far    : ortho.zfar,
            });
            this.cache.set(gltfSpec, camera);
            return camera;
        }
    }

    async loadNode(nameOrIndex, index = -1) {
        const gltfSpec = this.findByNameOrIndex(this.gltf.nodes, nameOrIndex, index);
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }
        if (gltfSpec == undefined) {
          return
        }

        const options = { ...gltfSpec, children: [] };
        console.log(nameOrIndex,this.cache, gltfSpec)

        if (gltfSpec.children !== undefined) {
            for (const nodeIndex of gltfSpec.children) {
                const node = await this.loadNode(nodeIndex);
                options.children.push(node);
            }
        }

        if (gltfSpec.camera !== undefined) {
            options.camera = await this.loadCamera(gltfSpec.camera);
        }

        if (gltfSpec.mesh !== undefined) {
            options.mesh = await this.loadMesh(gltfSpec.mesh);
        }
        
        if (gltfSpec.skin !== undefined) {
            options.skin = await this.loadSkin(gltfSpec.skin);
        }

        const node = new Node(options);
        this.cache.set(gltfSpec, node);
        return node;
    }

    async loadScene(nameOrIndex) {
        const gltfSpec = this.findByNameOrIndex(this.gltf.scenes, nameOrIndex);
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        const options = { nodes: [] };
        if (gltfSpec.nodes) {
            console.log("LOAD SCENE: gltfSpec.nodes",gltfSpec.nodes)
            for (const nodeIndex of gltfSpec.nodes) {
                const node = await this.loadNode(nodeIndex);
                options.nodes.push(node);
            }
        }
        if (gltfSpec.animations) {
          options.animations = []
          for (const animationIndex of gltfSpec.animations) {
            const animation = await this.loadAnimation(animationIndex)
            options.animations.push(animation)
          }
        }

        const scene = new Scene(options);
        this.cache.set(gltfSpec, scene);
        return scene;
    }

    async loadSkin(nameOrIndex) {
      const gltfSpec = this.findByNameOrIndex(this.gltf.skins, nameOrIndex)
      if (this.cache.has(gltfSpec)) {
          return this.cache.get(gltfSpec)
      }

      let options = { joints: [] }
      options.name = gltfSpec.name ?? options.name

      if (gltfSpec.skeleton) {
        options.skeleton = await this.loadNode(gltfSpec.skeleton)
      }
      /*for (const jointIndex of gltfSpec.joints ?? []) {
        options.joints[jointIndex] = await this.loadNode(jointIndex)
      }*/
      
      for (const jointIndex of gltfSpec.joints ?? []) {
        options.joints.push(await this.loadNode(jointIndex))
      }

      if (gltfSpec.inverseBindMatrices) {
        options.inverseBindMatrices = await this.loadAccessor(gltfSpec.inverseBindMatrices)
      }

      const skin = new Skin(options);
      this.cache.set(gltfSpec, skin);
      return skin
    }

    async loadAnimation(nameOrIndex) {
      const gltfSpec = this.findByNameOrIndex(this.gltf.animations, nameOrIndex)
      if (this.cache.has(gltfSpec)) {
          return this.cache.get(gltfSpec)
      }

      let options = { channels: [], samplers: [] }

      for (const channelIndex of gltfSpec.channels) {
        const channel = {}
        channel.target = {}
        channel.target.path = gltfSpec.channels[channelIndex].target.path
        channel.target.node = await this.loadNode(gltfSpec.channels[channelIndex].target.node)
        channel.sampler = await this.loadSampler(gltfSpec.channels[channelIndex].sampler)
        options.channels.push(channel)
      }

      for (const samplerIndex of gltfSpec.samplers) {
        const sampler = {}
        sampler.interpolation = gltfSpec.samplers[samplerIndex].interpolation
        sampler.input = await this.loadAccessor(gltfSpec.samplers[samplerIndex].input)
        sampler.output = await this.loadAccessor(gltfSpec.samplers[samplerIndex].output)
        options.samplers.push(sampler)
      }

      const animation = new Animation(options)
      this.cache.set(gltfSpec, animation)
      return animation
    }

}