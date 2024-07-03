import { Application } from "./src/engine/Application.js"

import { GLTFLoader } from "./src/gltf/GLTFLoader.js"
import { Renderer } from "./src/gltf/Renderer.js"
import { Node } from "./src/gltf/Node.js"
import { Texture } from "./src/gltf/Texture.js"
import { PerspectiveCamera } from "./src/gltf/PerspectiveCamera.js"
import { OrthographicCamera } from "./src/gltf/OrthographicCamera.js"
import { AnimationsPlayer } from "./src/gltf/AnimationsPlayer.js"

import { Axes } from "./src/helpers/Axes.js"
import { Controls } from "./src/helpers/Controls.js"
import { PointLight } from "./src/helpers/PointLight.js"
import * as Geo from "./src/helpers/ProceduralGeometry.js"

import { GUI } from "./src/lib/dat.gui.module.js"

import glMatrix from "glMatrix"

const vec3 = glMatrix.vec3
const mat4 = glMatrix.mat4
const quat = glMatrix.quat

//let m = "./models/Cameras.gltf"
//let m = "./models/MultipleScenes.gltf" //doesnt work.. again (in renderer -> if (primitive.indices) ...)
const m = "./src/models/Duck.gltf"
const m0 = "./src/models/0Suzanne/Suzanne.gltf"
const m01 = "./src/models/0.1SparseAcc/SimpleSparseAccessor.gltf"
const m1 = "./src/models/1Avocado/glTF/Avocado.gltf"
const m101 = "./src/models/1Avocado/glTF-Binary/Avocado.glb"
const m2 = "./src/models/2Helmet/FlightHelmet.gltf"
const m3 = "./src/models/3Boombox/BoomBox.gltf"
const m4 = "./src/models/4PBR/Box With Spaces.gltf"
const m5 = "./src/models/5Animated/AnimatedCube.gltf"
const m6 = "./src/models/6Skins/RiggedSimple.gltf" //also this... (GL_INVALID_OPERATION: Must have element array buffer bound.)
const m7 = "./src/models/7Alpha/AlphaBlendModeTest.gltf"
const m8 = "./src/models/8AnimateMorph/AnimatedMorphCube.gltf"
const m9 = "./src/models/9BoxAnimated/BoxAnimated-EMB.gltf"
const m10 = "./src/models/10AnimSkin/SimpleSkin.gltf"
const m11 = "./src/models/11MorphTest/MorphPrimitivesTest.gltf"
const m12 = "./src/models/12UltimateTest/MorphStressTest.gltf"
const m13 = "./src/models/13ColorEnc/TextureEncodingTest.gltf"
const m14 = "./src/models/14AnimTri/AnimatedTriangle.gltf"
const m15 = "./src/models/15AnimInter/InterpolationTest.gltf" //glb" //?? (GL_INVALID_OPERATION: Insufficient buffer size.)
const m16 = "./src/models/16FoxMultiAnim/Fox.gltf"
const m99 = "./src/models/99Unicode/Unicode❤♻Test.glb"
const noModel = ""
let model = noModel //m //m1
const modelList = { "-": noModel, "Duck": m, "Suzanne": m0, "Sparse Accessors": m01, "Avocado": m1, "AvocadoBIN": m101, "Fight Helmet": m2, "BoomBox": m3, "Box": m4, "Animated Cube": m5, "Rigged Simple": m6, "Alpha Test": m7, "Morph Cube": m8, "BoxAnimated": m9, "Simple Skin": m10, "Morph Test": m11, "Stress Test": m12, "Color encoding": m13, "Simple rotation anim": m14, "Anim interpolations": m15, "Fox Multi Anim": m16, "Unicode test": m99 }
const modelListCORS = {
  "2CylinderEngine": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/2CylinderEngine/glTF-Embedded/2CylinderEngine.gltf",
  "AlphaBlendModeTest": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/AlphaBlendModeTest/glTF-Embedded/AlphaBlendModeTest.gltf",
  "AnimatedTriangle": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/AnimatedTriangle/glTF-Embedded/AnimatedTriangle.gltf",
  "Box": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Box/glTF-Embedded/Box.gltf",
  "BoxAnimated": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/BoxAnimated/glTF-Embedded/BoxAnimated.gltf",
  "BoxInterleaved": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/BoxInterleaved/glTF-Embedded/BoxInterleaved.gltf",
  "BoxTextured": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/BoxTextured/glTF-Embedded/BoxTextured.gltf",
  "BoxTexturedNonPowerOfTwo": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/BoxTexturedNonPowerOfTwo/glTF-Embedded/BoxTexturedNonPowerOfTwo.gltf",
  "BoxVertexColors": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/BoxVertexColors/glTF-Embedded/BoxVertexColors.gltf",
  "BrainStem": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/BrainStem/glTF-Embedded/BrainStem.gltf",
  "Buggy": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Buggy/glTF-Embedded/Buggy.gltf",
  "Cameras": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Cameras/glTF-Embedded/Cameras.gltf",
  "CesiumMan": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/CesiumMan/glTF-Embedded/CesiumMan.gltf",
  "CesiumMilkTruck": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/CesiumMilkTruck/glTF-Embedded/CesiumMilkTruck.gltf",
  "DamagedHelmet": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/DamagedHelmet/glTF-Embedded/DamagedHelmet.gltf",
  "Duck": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Duck/glTF-Embedded/Duck.gltf",
  "GearboxAssy": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/GearboxAssy/glTF-Embedded/GearboxAssy.gltf",
  "MeshPrimitiveModes": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/MeshPrimitiveModes/glTF-Embedded/MeshPrimitiveModes.gltf",
  "MetalRoughSpheres": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/MetalRoughSpheres/glTF-Embedded/MetalRoughSpheres.gltf",
  "MultiUVTest": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/MultiUVTest/glTF-Embedded/MultiUVTest.gltf",
  "MultipleScenes": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/MultipleScenes/glTF-Embedded/MultipleScenes.gltf",
  "NormalTangentMirrorTest": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/NormalTangentMirrorTest/glTF-Embedded/NormalTangentMirrorTest.gltf",
  "NormalTangentTest": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/NormalTangentTest/glTF-Embedded/NormalTangentTest.gltf",
  "OrientationTest": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/OrientationTest/glTF-Embedded/OrientationTest.gltf",
  "ReciprocatingSaw": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/ReciprocatingSaw/glTF-Embedded/ReciprocatingSaw.gltf",
  "RiggedFigure": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/RiggedFigure/glTF-Embedded/RiggedFigure.gltf",
  "RiggedSimple": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/RiggedSimple/glTF-Embedded/RiggedSimple.gltf",
  "SimpleMeshes": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/SimpleMeshes/glTF-Embedded/SimpleMeshes.gltf",
  "SimpleMorph": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/SimpleMorph/glTF-Embedded/SimpleMorph.gltf",
  "SimpleSkin": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/SimpleSkin/glTF-Embedded/SimpleSkin.gltf",
  "SimpleSparseAccessor": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/SimpleSparseAccessor/glTF-Embedded/SimpleSparseAccessor.gltf",
  "TextureCoordinateTest": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/TextureCoordinateTest/glTF-Embedded/TextureCoordinateTest.gltf",
  "TextureSettingsTest": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/TextureSettingsTest/glTF-Embedded/TextureSettingsTest.gltf",
  "Triangle": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Triangle/glTF-Embedded/Triangle.gltf",
  "TriangleWithoutIndices": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/TriangleWithoutIndices/glTF-Embedded/TriangleWithoutIndices.gltf",
  "VC": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/VC/glTF-Embedded/VC.gltf",
  "VertexColorTest": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/VertexColorTest/glTF-Embedded/VertexColorTest.gltf"
}

let scenesList = {}
let camerasList = {}
const globalLightsList = {}
const lightAttenuationList = { "Constant": 0, "Linear": 1, "Quadratic": 2 }
let proceduralModelsList = [] //{}
const mipmapsList = { "NEAREST_MIPMAP_NEAREST": 9984, "NEAREST_MIPMAP_LINEAR": 9986, "LINEAR_MIPMAP_NEAREST": 9985, "LINEAR_MIPMAP_LINEAR": 9987 }
const wrappingList = { "Clamp to edge": 33071, "Mirrored repeat": 33648, "Repeat": 10497 }
const filteringList = { "Linear": 9729, "Nearest": 9728 }

export class App extends Application {
  init(logsDOMElement) {
    this.gui = null

    this.state = {
      // Canvas
      axesShown: true,
      backgroundColor: [255, 255, 255],

      // Lights
      addLightColor: [255, 255, 180],
      addLightPosition: "0, 5, 0",
      addLightIntensity: 1,
      addLightAttenuation: 0,

      //Models
      selectedModel: "", //"./src/models/Duck.gltf", //"", //"./models/1Avocado/glTF/Avocado.gltf",
      numberOfVertices: 0,
      //numberOfMeshes: 0,
      numberOfIndices: 0,
      boundingBox: "undefined",
      rotateModelEnabled: false,

      //Scenes
      selectedScene: 0,

      //Cameras
      selectedCamera: 0,

      //Animations
      animationPlaybackSpeed: 1,
      animationsList: {},

      //Lights
      lightsList: [],

      //Globals
      lookingAt: "0, 0, 0",
      wrappingModeS: 10497,
      wrappingModeT: 10497,
      minFilterMode: 9728,
      magFilterMode: 9728,
      mipMaps: true
    }

    // Axes helper view
    this.axes = new Axes({
      glContext: this.gl,
      program: this.renderer.programs.axes
    })

    this.animationsPlayer = new AnimationsPlayer()
    this.frameCount = 1
    this.animationTimeLogs = logsDOMElement.querySelector("#animationTime")
    this.animationTimeLogstextContent = 0

    // User Controls
    this.controls = new Controls()
    this.freeCamera = 0

    // Lights
    this.lightsNumberLimit = 8
    this.state.lightsList.push(new PointLight({ position: "-0.6, 0.1, 0", color: [255, 120, 120], type: "" }))
    this.state.lightsList.push(new PointLight({ position: "-0.3, 0.1, 0", color: [100, 255, 100], type: "" }))
    this.state.lightsList.push(new PointLight({ position: "+0.3, 0.1, 0", color: [127, 127, 255], type: "" }))
    this.state.lightsList.push(new PointLight({ position: "+0.6, 0.1, 0", color: [200, 120, 200], type: "" }))

    //this.initGUI()
    //**/!* /!*!/ * !/*!/*!/*!/!*/!* /!*/! * /!*/! * /!*!/ * !/**!/!*/!*/*!/*!/*!*!/*!/*!/*!/*!/*/ !* /!*/! * /!************?**?*??
    this.cameraTheta = 0.0   // Initial angle in the XY plane
    this.cameraPhi = Math.PI / 2

    this.initGUI()
  }

  initGUI() {
    const gui = this.gui = new GUI({ width: 350 }) //({autoPlace: false, width: 260, hideable: true})

    // Canvas controls.
    /* (1) Display a scene with default coordinate axes, where each axis 
           is colored (x-axis in red, y-axis in green, z-axis in blue). */
    const canvasFolder = gui.addFolder("Canvas options")
    const axesHelper = canvasFolder.add(this.state, "axesShown") //.listen() //.onChange(this.toggleAxesInScene)
    const bgColor = canvasFolder.addColor(this.state, "backgroundColor").onChange(this.setClearColor.bind(this))

    // Models controls.
    /* (2) Load 3D models in glTF 2.0 format and position them in space 
    (with options for translation, rotation, and scaling). */
    this.modelsFolder = gui.addFolder("Model")
    this.modelsFolder.domElement.children[0].children[0].classList.add("green")
    this.modelSelector = this.modelsFolder.add(this.state, "selectedModel", { ...modelList, ...{ "-----": "" }, ...modelListCORS }).onChange(this.changeModel.bind(this))
    this.modelsFolder.add(this.state, "selectedModel").listen().domElement.children[0].setAttribute("disabled", "disabled") //.onFinishChange(this.changeModel.bind(this))
    //this.modelsFolder.add(this.state, "selectedModel").onFinishChange(this.changeModelWithUrl.bind(this))
    this.modelsFolder.open()

    // Model information controls
    /* (3) Display model properties: number of vertices, number of indices, 
           and the size of the bounding box. */
    this.infoFolder = this.modelsFolder.addFolder("Model information")
    this.infoFolder.add(this.state, "numberOfVertices").listen()
    //this.infoFolder.add(this.state, "numberOfMeshes").listen()
    this.infoFolder.add(this.state, "numberOfIndices").listen()
    this.infoFolder.add(this.state, "boundingBox").listen()
    this.infoFolder.__controllers.forEach((ctrl) => ctrl.domElement.children[0].setAttribute("disabled", "disabled"))
    this.infoFolder.domElement.style.display = "none"

    // Model scenes controls.
    this.sceneFolder = this.modelsFolder.addFolder("Scenes")
    this.sceneFolder.domElement.style.display = "none"

    // Model cameras controls.
    this.cameraFolder = this.modelsFolder.addFolder("Cameras")
    this.cameraFolder.domElement.style.display = "none"

    // Model textures controls.
    /* (9) Assign textures to each object individually, with options for 
           texture coordinate mapping (input file coordinates, planar mapping, 
           cylindrical mapping, spherical mapping), and allow translation, rotation, 
           scaling, and projection direction for UV coordinates. */
    this.modelTextures = this.modelsFolder.addFolder("Model textures controls")
    this.modelTextures.domElement.style.display = "none"


    // User camera controls.
    /* (5) Allow camera position and rotation control using mouse or keyboard input, 
           with the ability to change the camera"s focal point. */

    // Lighting controls.
    /* (6) Place point lights in the scene, with adjustable parameters for color, 
           intensity, and attenuation (constant, linear, quadratic attenuation).
       (7) Define the lighting model (Lambert and Phong) and shading parameters 
           (diffuse and specular color, shininess) for each object. */
    this.lightFolder = gui.addFolder("Lighting")
    this.lightFolder.domElement.children[0].children[0].classList.add("yellow")
    let addLightFolder = this.lightFolder.addFolder("Add a light")
    addLightFolder.add(this.state, "addLightPosition") // position,
    addLightFolder.addColor(this.state, "addLightColor") // color,
    addLightFolder.add(this.state, "addLightIntensity") // intensity
    addLightFolder.add(this.state, "addLightAttenuation", lightAttenuationList) // attenuation (constant, linear, quadratic attenuation)
    const addPointLightAction = addLightFolder.add(this, "addPointLight").name("ADD POINT LIGHT")
    addPointLightAction.__li.classList.add("centered")
    this.lightsListFolder = this.lightFolder.addFolder("List of added lights")
    for (const light of this.state.lightsList) {
      this.lightsListFolder.addColor(light, "color").listen()
    }
    //this.lightFolder.domElement.style.display = "none"

    // Shaders
    /* (8) Implement per-fragment lighting and shading calculations. */

    // Morph target controls.
    //https://github.com/Itee/three-full/blob/7061c7cd93f194285325d163a48676604eca66fd/sources/loaders/GLTFLoader.js#L1241
    this.morphFolder = this.modelsFolder.addFolder("Morphing")
    this.morphFolder.domElement.style.display = "none"

    // Animation controls.
    //https://github.com/Itee/three-full/blob/7061c7cd93f194285325d163a48676604eca66fd/sources/loaders/GLTFLoader.js#L1530
    this.animFolder = this.modelsFolder.addFolder("Model Animations")
    this.playAnimationsButton = this.animFolder.add(this, "playAnimations").name("PLAY")
    this.animFolder.add(this, "stopAnimations").name("STOP")
    this.animFolder.add(this.state, "animationPlaybackSpeed", 1, 10, 1).name("Animation slowness")
    this.animFolder.domElement.style.display = "none"

    // Procedural geo controls
    /* (4) Add procedurally generated objects (plane, cube, sphere, torus). 
       (7) Define the lighting model (Lambert and Phong) and shading parameters 
       (diffuse and specular color, shininess) for each object. */
    this.geometryFolder = gui.addFolder("Procedural geometry")
    this.geometryFolder.domElement.children[0].children[0].classList.add("blue")

    let planeFolder = this.geometryFolder.addFolder("Plane")
    const addPlaneAction = planeFolder.add(this, "addGeoPlane").name("ADD PLANE TO SCENE")
    addPlaneAction.__li.classList.add("centered")

    let cubeFolder = this.geometryFolder.addFolder("Cube")
    const addCubeAction = cubeFolder.add(this, "addGeoCube").name("ADD CUBE TO SCENE")
    addCubeAction.__li.classList.add("centered")

    let sphereFolder = this.geometryFolder.addFolder("Sphere")
    const addSphereAction = sphereFolder.add(this, "addGeoSphere").name("ADD SPHERE TO SCENE")
    addSphereAction.__li.classList.add("centered")

    let torusFolder = this.geometryFolder.addFolder("Torus")
    const addTorusAction = torusFolder.add(this, "addGeoTorus").name("ADD TORUS TO SCENE")
    addTorusAction.__li.classList.add("centered")

    let geomListFolder = this.geometryFolder.addFolder("List of added geometries")
    //this.geometryFolder.domElement.style.display = "none"

    // Global controls.
    /* (10) Provide a global setting to control texture wrapping modes (CLAMP_TO_EDGE, REPEAT, MIRRORED_REPEAT).
       (11) Provide a global setting to control texture filtering modes (NEAREST, LINEAR) and 
       (11.2) mipmapping options:
                  GL_NEAREST - no filtering, no mipmaps
                  GL_LINEAR - filtering, no mipmaps
                  GL_NEAREST_MIPMAP_NEAREST - no filtering, sharp switching between mipmaps
                  GL_NEAREST_MIPMAP_LINEAR - no filtering, smooth transition between mipmaps
                  GL_LINEAR_MIPMAP_NEAREST - filtering, sharp switching between mipmaps
                  GL_LINEAR_MIPMAP_LINEAR - filtering, smooth transition between mipmaps
     
                  So:
                  GL_LINEAR is bilinear
                  GL_LINEAR_MIPMAP_NEAREST is bilinear with mipmaps
                  GL_LINEAR_MIPMAP_LINEAR is trilinear
     
       (12) Allow global enabling and disabling of mipmaps. */
    this.globalFolder = gui.addFolder("Global settings")
    this.globalFolder.domElement.children[0].children[0].classList.add("red")
    this.globalFolder.add(this.state, "rotateModelEnabled").listen()
    this.globalFolder.add(this.state, "lookingAt").listen().onFinishChange(this.changeFocalPoint.bind(this))

    const globalTextureFolder = this.globalFolder.addFolder("Texture options")
    globalTextureFolder.add(this.state, "wrappingModeS", wrappingList).listen().onChange(this.changeWrappingS.bind(this))
    globalTextureFolder.add(this.state, "wrappingModeT", wrappingList).listen().onChange(this.changeWrappingT.bind(this))
    globalTextureFolder.add(this.state, "mipMaps").listen().onChange(this.changeMips.bind(this))
    globalTextureFolder.add(this.state, "minFilterMode", { ...filteringList, ...mipmapsList }).listen().onChange(this.changeFilteringMin.bind(this))
    globalTextureFolder.add(this.state, "magFilterMode", { ...filteringList, ...mipmapsList }).listen().onChange(this.changeFilteringMag.bind(this))
    //this.globalFolder.domElement.style.display = "none"
  }

  updateGUI() {
    // Model info
    const bb = {
      x: (this.glTFBox.max[0] - this.glTFBox.min[0]).toFixed(3),
      y: (this.glTFBox.max[1] - this.glTFBox.min[1]).toFixed(3),
      z: (this.glTFBox.max[2] - this.glTFBox.min[2]).toFixed(3)
    }

    this.state.boundingBox = `x: ${bb.x} | y: ${bb.y} | z: ${bb.z}`
    this.state.numberOfVertices = this.loader.gltf.accessors[this.glTFPosition].count //number of vertices
    //this.state.numberOfMeshes = this.loader.gltf.meshes.length
    this.state.numberOfIndices = this.loader.gltf.accessors[this.glTFIndices].count / 3 //number of triangles
    this.infoFolder.domElement.style.display = ""

    // Scenes
    //for (let ctrl of this.sceneFolder.__controllers) { this.sceneFolder.remove(ctrl) }
    while (this.sceneFolder.__controllers.length > 0) { this.sceneFolder.remove(this.sceneFolder.__controllers[0]) }
    this.sceneFolder.add(this.state, "selectedScene", scenesList).onChange(this.changeScene.bind(this))
    this.sceneFolder.domElement.style.display = ""

    // Cameras
    //for (let ctrl of this.cameraFolder.__controllers) { this.cameraFolder.remove(ctrl) }
    while (this.cameraFolder.__controllers.length > 0) { this.cameraFolder.remove(this.cameraFolder.__controllers[0]) }
    //if (Object.keys(camerasList).length > 0) {
    this.cameraFolder.add(this.state, "selectedCamera", camerasList).onChange(this.changeCamera.bind(this))
    this.cameraFolder.domElement.style.display = ""
    //} else {
    //   this.cameraFolder.domElement.style.display = "none"
    // }

    // Animations¸
    //for (let ctrl of this.animFolder.__controllers) { this.animFolder.remove(ctrl) }
    if (this.animFolder.__controllers.length > 3) {
      let index = this.animFolder.__controllers.length - 1
      while (index > 2) {
        this.animFolder.remove(this.animFolder.__controllers[index])
        index--
      }
    }
    if (this.animationsPlayer.animations.length) {
      for (const animationIndex in this.scene.animations) {
        this.animFolder.add(this.state.animationsList, animationIndex).name(this.scene.animations[animationIndex].name).listen().onChange(this.queueAnimation.bind(this, animationIndex))
      }
      this.animFolder.domElement.style.display = ""
    } else {
      this.animFolder.domElement.style.display = "none"
    }

    // Globals
    //this.state.wrappingModeS = 33071
    //this.state.wrappingModeT = 33071
    //this.state.mipMaps = false
    //this.state.minFilterMode = 9729
    //this.state.magFilterMode = 9729
    //this.globalFolder.domElement.style.display = ""

    // this.morphCtrls.forEach((ctrl) => ctrl.remove())
    // this.morphCtrls.length = 0
    // this.morphFolder.domElement.style.display = "none"



    /*if (morphMeshes.length) {
      this.morphFolder.domElement.style.display = ""
      morphMeshes.forEach((mesh) => {
        if (mesh.morphTargetInfluences.length) {
          const nameCtrl = this.morphFolder.add({name: mesh.name || "Untitled"}, "name")
          this.morphCtrls.push(nameCtrl)
        }
        for (let i = 0; i < mesh.morphTargetInfluences.length; i++) {
          const ctrl = this.morphFolder.add(mesh.morphTargetInfluences, i, 0, 1, 0.01).listen()
          Object.keys(mesh.morphTargetDictionary).forEach((key) => {
            if (key && mesh.morphTargetDictionary[key] === i) ctrl.name(key)
          })
          this.morphCtrls.push(ctrl)
        }
      })
    }*/


    //Lights
    /*for (let lightIndex in this.state.lightsList) {
      let lightFolder = this.lightsListFolder.addFolder(lightIndex) //`${lightIndex}. light`)
      lightFolder.add(this.state.lightsList[lightIndex], "position") // position,
      lightFolder.addColor(this.state.lightsList[lightIndex], "color") // color,
      //lightFolder.add(this.lightsList[lightIndex], "position") // position,
      //lightFolder.addColor(this.lightsList[lightIndex], "color") // color,
      //lightFolder.add(this.lightsList[lightIndex], "intensity") // intensity
      //lightFolder.add(this.lightsList[lightIndex], "attenuation", lightAttenuationList) // attenuation (constant, linear, quadratic attenuation)
      //lightFolder.add(light, "addPointLight").name("ADD POINT LIGHT")
    }*/
  }

  updateDisplay() {

  }

  setClearColor(color) {
    this.renderer.changeClearColor(color)
    this.axes.changeClearColor(color)
  }


  /* LIGHTS */
  addPointLight() {
    console.log(this.state.addLightColor, this.state.addLightPosition, this.state.addLightIntensity, this.state.addLightAttenuation)
  }
  /****************************************************************************************************************/


  /* PROCEDURAL GEOMETRIES */
  addGeoPlane() {
    proceduralModelsList.push(Geo.createPlane(this.gl, 1, [0, 0, 0], [170, 170, 170], "./src/models/1Avocado/glTF/Avocado_baseColor.png"))
  }

  addGeoCube() {
    console.log()
  }

  addGeoSphere() {
    console.log()
  }

  addGeoTorus() {
    console.log()
  }
  /****************************************************************************************************************/


  /* TEXTURES */
  changeWrappingS(val) {
    //this.renderer.wrappingModeS = parseInt(val, 10)
    //this.renderer.prepareScene(this.scene)
    for (let o of this.loader.cache.values()) {
      if (o instanceof Texture) {
        //o.sampler.wrapS = parseInt(val, 10)
        this.renderer.setWrappingModeS(parseInt(val, 10))
      }
    }
  }

  changeWrappingT(val) {
    //this.renderer.wrappingModeT = parseInt(val, 10)
    //this.renderer.prepareScene(this.scene)
    for (let o of this.loader.cache.values()) {
      if (o instanceof Texture) {
        //o.sampler.wrapT = parseInt(val, 10)
        this.renderer.setWrappingModeT(parseInt(val, 10))
      }
    }
  }

  changeFilteringMin(val) {
    //this.renderer.filteringModeMin = parseInt(val, 10)
    //this.renderer.prepareScene(this.scene)
    for (let o of this.loader.cache.values()) {
      if (o instanceof Texture) {
        //o.sampler.min = parseInt(val, 10)
        this.renderer.setFilteringModeMin(parseInt(val, 10))
      }
    }
  }

  changeFilteringMag(val) {
    //this.renderer.filteringModeMag = parseInt(val, 10)
    //this.renderer.prepareScene(this.scene)
    for (let o of this.loader.cache.values()) {
      if (o instanceof Texture) {
        //o.sampler.mag = parseInt(val, 10)
        this.renderer.setFilteringModeMag(parseInt(val, 10))
      }
    }
  }

  changeMips(val) {
    this.renderer.mips = val
    this.renderer.prepareScene(this.scene)
  }
  //****************************************************************************************************************

  async changeModel(id) {
    if (this.modelSelector.domElement.children[0].classList.contains("disabled")) return
    //if (id != "") {
    this.modelSelector.domElement.children[0].setAttribute("disabled", "disabled")
    this.modelSelector.domElement.children[0].blur()
    //this.modelSelector.domElement.children[0].classList.toggle("disabled")
    //this.gui.domElement.classList.toggle("disabled")

    if (this.animationsPlayer.isPlaying) {
      this.stopAnimations()
    }

    model = id
    await this.loadSceneAndCamera()
    //**/!*/!*!/*!/*!/*!/*!/!*/!*/!*/!*/!*/!*/!*!/*!/**!/!*/!*/*!/*!/*!*!/*!/*!/*!/*!/*/!*/!*/!*/!***********
    this.cameraRadius = this.camera.translation[2]  // Initial radius of the camera from the lookAt point

    this.renderer.prepareScene(this.scene)

    this.setTextureStuff(this.scene.nodes)

    if (this.scene.animations) {
      (Object.keys(this.state.animationsList) ?? []).forEach(key => delete this.state.animationsList[key])
      this.animationsPlayer.addAnimations(this.scene.animations)
      for (const animation in this.animationsPlayer.animations) {
        this.state.animationsList[animation] = true
        this.animationsPlayer.toggleAnimationToPlaylist(animation)
      }
    } else {
      this.animationsPlayer.delete()
    }

    this.updateGUI()

    //this.modelSelector.domElement.children[0].classList.toggle("disabled")
    this.modelSelector.domElement.children[0].removeAttribute("disabled")
    this.modelSelector.domElement.children[0].focus()
    //this.gui.domElement.classList.toggle("disabled")
    //} else {
    //reset scene with no gltf model selected
    //}
  }

  setTextureStuff(nodes) {
    //this.scene.nodes[0].mesh.primitives[0].material.baseColorTexture.sampler
    nodes.forEach(node => {
      if (node.mesh) {
        node.mesh.primitives.forEach(primitive => {
          if (primitive?.material?.baseColorTexture) {
            this.state.wrappingModeS = primitive.material.baseColorTexture.sampler.wrapS
            this.state.wrappingModeT = primitive.material.baseColorTexture.sampler.wrapT
            this.state.mipMaps = primitive.material.baseColorTexture.hasMipmaps
            this.state.minFilterMode = primitive.material.baseColorTexture.sampler.min
            this.state.magFilterMode = primitive.material.baseColorTexture.sampler.mag
            return
          }
        })
      }
      if (node.children.length > 0) {
        this.setTextureStuff(node.children)
      }
    })
  }

  playAnimations() {
    if (this.animationsPlayer.isPaused || !this.animationsPlayer.isPlaying) {
      this.animationsPlayer.play()
      this.lastTime = performance.now()
      this.playAnimationsButton.name("PAUSE")
    } else {
      this.animationsPlayer.pause()
      this.playAnimationsButton.name("PLAY")
    }
  }

  stopAnimations() {
    this.animationsPlayer.stop()
    this.playAnimationsButton.name("PLAY")
  }

  queueAnimation(animationIndex) {
    this.animationsPlayer.toggleAnimationToPlaylist(animationIndex)
  }

  async loadSceneAndCamera() {
    if (this.state.selectedModel != "") {
      await this.loader.load(model)
      this.extractPosIndBB(this.loader.defaultScene)
      this.state.selectedScene = this.loader.defaultScene
      await this.loadScenes()
      await this.loadCameras()
    }
  }

  extractPosIndBB(mesh) {
    this.glTFPosition = this.loader.gltf.meshes[mesh].primitives[0].attributes.POSITION
    this.glTFIndices = this.loader.gltf.meshes[mesh].primitives[0].indices ?? 0
    this.glTFBox = {
      "min": this.loader.gltf.accessors[this.glTFPosition].min,
      "max": this.loader.gltf.accessors[this.glTFPosition].max
    }
  }

  async getScenes() {
    scenesList = {}
    let promises = []
    for (let s in this.loader.gltf.scenes) {
      scenesList[`Model scene ${s}`] = s
      promises.push(await this.loader.loadScene(parseInt(s, 10)))
    }
    return promises
  }

  async loadScenes() {
    this.scenes = []
    let promises = await this.getScenes()
    let gltfScenes = await Promise.all(promises)
    for (let s of gltfScenes) { this.scenes.push(s) }
    this.scene = this.scenes[this.loader.defaultScene]
  }

  async getCameras() {
    //camerasList = {}
    let promises = []
    for (let c in this.loader.gltf.cameras) {
      camerasList[`Model camera ${c}`] = c
      promises.push(await this.loader.loadNode("camera", parseInt(c, 10)))
    }
    return promises
  }

  async loadCameras() {
    let viewMatrix = mat4.create()

    if (this.glTFBox) { //glTF model selected and loaded
      const { min, max } = this.glTFBox
      const modelSizeX = max[0] - min[0]
      const modelSizeY = max[1] - min[1]
      const modelSizeZ = max[2] - min[2]
      const maxModelSize = Math.max(modelSizeX, modelSizeY, modelSizeZ)
      this.controls.setZoom(maxModelSize / 10)
      /*this.state.eye = [
        0, //+ (min[0] + max[0]) / 2,
        0, //+ (min[1] + max[1]) / 2,
        -modelSizeZ * 5 //5*min[2]
      ]
      this.state.lookingAt = this.scene.nodes[0].translation
      //mat4.lookAt(matrix, this.state.eye, this.state.lookingAt, [0, 1, 0])
      mat4.lookAt(viewMatrix, this.state.eye, [0,0,0], [0, 1, 0])*/
      //this.state.eye = [0, 0, 2]  // Assuming a positive Z coordinate here

      // Set the look-at point to the center of the GLTF object
      this.state.lookingAt = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2]
      this.state.eye = [...this.state.lookingAt]
      this.state.eye[2] *= 3

      // Calculate the view matrix using the eye and look-at point
      mat4.lookAt(viewMatrix, this.state.eye, this.state.lookingAt, [0, 1, 0])

      const fov = 2 * Math.atan(maxModelSize / Math.abs(this.state.eye[2] * 2))
      const freeCamera = new PerspectiveCamera({
        aspect: this.canvas.clientWidth / this.canvas.clientHeight,
        fov: fov,
        near: 0.001 //maxModelSize/20,
        //far    : maxModelSize*200
      })
      const vpMatrix = mat4.create()
      mat4.multiply(vpMatrix, freeCamera.matrix, viewMatrix)
      let options = {
        "camera": freeCamera,
        "matrix": vpMatrix
      }

      camerasList = {}
      this.cameras = []

      let promises = await this.getCameras()
      let gltfCameras = await Promise.all(promises)
      for (let c of gltfCameras) { this.cameras.push(c) }

      camerasList["Free camera"] = gltfCameras.length
      this.cameras.push(new Node(options))

      this.camera = this.cameras[this.loader.defaultCamera]
      this.freeCamera = this.cameras.length == 1 ? 0 : this.cameras.length - 1
      this.camera.lookingAt = this.state.lookingAt

      // delete this or fix it ?!?!?!?!?!?!?!?!?!*!*?!*?*!?*!?*!*?!*!?*?!?*!?*!*!*?!*?!*?!*!?*!?*!?!*?!*!?*?!*?!*?*!?*!
      this.cameras[this.freeCamera].translation = [...this.state.eye] //this.state.eye[2]
      this.cameras[this.freeCamera].translation[2] = modelSizeZ == 0 ? 1.2 : modelSizeZ * 3 //this.state.eye[2]
      this.cameras[this.freeCamera].updateMatrix()
      //*?!*?!*!?*!?*!?!*!?*!?!*?!!*?!*!?!*?!*!?*!?!*?!*!?*!?!*!?*!?!*!?!*?! wtf ??
    } else {
      //this.state.lookingAt = [0,0,0]
      mat4.lookAt(viewMatrix, [0, 0.5, 5], [0, 0, 0], [0, 1, 0])
      const freeCamera = new PerspectiveCamera()
      const vpMatrix = mat4.create()
      mat4.multiply(vpMatrix, freeCamera.matrix, viewMatrix)
      let options = {
        "camera": freeCamera,
        "matrix": vpMatrix
      }

      camerasList = {}
      this.cameras = []
      this.cameras.push(new Node(options))

      this.freeCamera = 0
      this.camera = this.cameras[0]
      camerasList["Free camera"] = 0
      this.camera.lookingAt = [0, 0, 0]
    }
  }

  changeFocalPoint(val) {
    //mat4.lookAt(this.camera.matrix, this.state.eye, val.split(",").map(Number), [0, 1, 0])
    this.camera.lookingAt = val.split(",").map(Number)
    mat4.lookAt(this.camera.matrix, this.camera.translation, this.camera.lookingAt, [0, 1, 0])
  }

  changeScene(id) {
    this.scene = this.scenes[id]
    const meshID = this.loader.gltf.scenes[id].nodes[0]
    this.extractPosIndBB(meshID)
    this.updateGUI()
    this.renderer.prepareScene(this.scene)
  }

  changeCamera(id) {
    this.camera = this.cameras[id]
  }

  async start() {
    this.loader = new GLTFLoader()
    this.renderer = new Renderer(this.gl)
    await this.loadCameras()
    this.scene = { nodes: [], geoNodes: [] }

    //delete this**********************!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!
    //this.increment = 0.05

  }

  render() {
    if (this.renderer) {

      // Animations
      if (this.animationsPlayer.animations && this.animationsPlayer.isPlaying) {
        const deltaTime = (performance.now() - this.lastTime) / 1000
        this.lastTime = performance.now()
        if (this.state.animationPlaybackSpeed <= this.frameCount) {
          this.animationsPlayer.update(deltaTime)
          this.frameCount = 1
        } else {
          this.frameCount++
        }
        this.animationTimeLogs.textContent = this.animationsPlayer.getCurrentTime().toFixed(3)
      }

      // Skins

      //this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

      if (this.state.rotateModelEnabled) { this.rotateModel(this.scene.nodes, [0, 0.5, 0]) } // over Y

      //if (this.state.rotateModelEnabled) { this.controls.rotateCamera(this.camera, [0,0.5,0]) } //over Y

      //this.lights()
      //this.renderer.prepareScene(this.scene)
      this.scene.geoNodes = proceduralModelsList
      this.renderer.render(this.scene, this.camera, this.lights())

      //if (this.state.axesShown) { this.axes.draw(this.camera) }
    }
  }

  lights() {
    /*const diffuse = this.roomDiffuseColor
    const specular = this.specularColor
    const shine = this.shininess
    const lightsPositions = []
    const lightsColors = []*/
    /*for (let l of this.lightsList) {
      l.position[0] = (Math.random() * 4) - 2
      l.position[1] = (Math.random() * 4) - 2
      l.position[2] = (Math.random() * 4) - 2
    }*/
    //let lightsToRender = []
    //for (let light of this.state.lightsList) {
    //  lightsToRender.push()
    //}
    let lights = this.state.lightsList
    /*for (let l of this.lightsList) { 
      lightsPositions.push(...l.position)
      lightsColors.push(...l.color)
    }*/

    return { lights } //, diffuse, specular, shine }
    //return { lightsPositions, lightsColors, diffuse, specular, shine }
  }

  rotateCamera() {
    //this.controls.rotateCamera(this.camera)

    let lookAtPosition = this.state.lookingAt
    /*let lookAtPosition
    if (this.state.lookingAt.length > 3) {
      lookAtPosition = this.state.lookingAt.split(",").map(Number) //[0, 0, 0]  // Adjust this to your desired lookAt position
    } else {
      lookAtPosition = this.state.lookingAt
    }*/

    this.cameraPhi = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.cameraPhi)) //Math.max(0.1, Math.min(Math.PI - 0.1, this.cameraPhi))
    //lookAtPosition = [0,0,0]
    //this.cameraTheta += 0.01
    //this.cameraPhi += 0.01

    // Calculate the camera position in spherical coordinates
    //const x = lookAtPosition[0] + this.cameraRadius * Math.sin(this.cameraPhi) * Math.cos(this.cameraTheta)
    //const y = lookAtPosition[1] + this.cameraRadius * Math.sin(this.cameraPhi) * Math.sin(this.cameraTheta)
    //const z = lookAtPosition[2] + this.cameraRadius * Math.cos(this.cameraPhi)
    this.camera.translation[0] = lookAtPosition[0] + this.cameraRadius * Math.sin(this.cameraPhi) * Math.cos(this.cameraTheta)
    this.camera.translation[2] = lookAtPosition[2] + this.cameraRadius * Math.sin(this.cameraPhi) * Math.sin(this.cameraTheta)
    this.camera.translation[1] = lookAtPosition[1] + this.cameraRadius * Math.cos(this.cameraPhi)

    /*this.camera.translation[0] = lookAtPosition[0] + this.camera.translation[2] * Math.sin(this.cameraPhi) * Math.cos(this.cameraTheta)
    this.camera.translation[2] = lookAtPosition[2] + this.camera.translation[2] * Math.sin(this.cameraPhi) * Math.sin(this.cameraTheta)
    this.camera.translation[1] = lookAtPosition[1] + this.camera.translation[2] * Math.cos(this.cameraPhi)*/

    // Update the view matrix or set the camera position accordingly
    const viewMatrix = mat4.create()
    mat4.lookAt(viewMatrix, this.camera.translation, lookAtPosition, [0, 1, 0])
    mat4.multiply(this.camera.matrix, viewMatrix, this.camera.camera.matrix)
    //this.camera.translation = new Float32Array([x, y, z])
    //this.camera.updateMatrix()
    this.camera.updateMatrix()
  }

  rotateModel(nodes, r) {
    let rotationQuaternion = quat.create()
    quat.fromEuler(rotationQuaternion, ...r)

    for (let node of nodes) {
      if (node.children) { this.rotateModel(node.children, r) }
      if (node.mesh) {
        quat.multiply(node.rotation, rotationQuaternion, node.rotation)
        quat.normalize(node.rotation, node.rotation)
        node.updateMatrix()
      }
    }
  }

  resize() {
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    const aspectRatio = w / h

    if (this.camera) {
      this.camera.camera.aspect = aspectRatio
      this.camera.camera.updateMatrix()
    }
  }
}