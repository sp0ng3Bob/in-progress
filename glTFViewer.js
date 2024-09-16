import { Application } from "./src/engine/Application.js"
import { WebGL } from "./src/engine/WebGL.js"

import { GLTFLoader } from "./src/gltf/GLTFLoader.js"
import { Renderer } from "./src/gltf/Renderer.js"
import { Node } from "./src/gltf/Node.js"
import { Texture } from "./src/gltf/Texture.js"
import { PerspectiveCamera } from "./src/gltf/PerspectiveCamera.js"
import { OrthographicCamera } from "./src/gltf/OrthographicCamera.js"
import { AnimationsPlayer } from "./src/gltf/AnimationsPlayer.js"

import { FileInput } from "./src/helpers/FileInput.js"
import { Axes } from "./src/helpers/Axes.js"
import { Controls } from "./src/helpers/Controls.js"
import { PointLight, getPositionNormalised, getPositionString } from "./src/helpers/PointLight.js"
import * as Geo from "./src/helpers/ProceduralGeometry.js"

import { GUI } from "./src/lib/dat.gui.module.js"

import glMatrix from "glMatrix"

const vec3 = glMatrix.vec3
const mat4 = glMatrix.mat4
const quat = glMatrix.quat

const m = "./src/models/Duck.gltf"
const m0 = "./src/models/0Suzanne/Suzanne.gltf"
const m01 = "./src/models/0.1SparseAcc/SimpleSparseAccessor.gltf"
const m1 = "./src/models/1Avocado/glTF/Avocado.gltf"
const m101 = "./src/models/1Avocado/glTF-Binary/Avocado.glb"
const m2 = "./src/models/2Helmet/FlightHelmet.gltf"
const m3 = "./src/models/3Boombox/BoomBox.gltf"
const m301 = "./src/models/17Corset/Corset.gltf"
const m4 = "./src/models/4PBR/Box With Spaces.gltf"
const m5 = "./src/models/5Animated/AnimatedCube.gltf"
const m6 = "./src/models/6Skins/RiggedSimple.gltf"
const m7 = "./src/models/7Alpha/AlphaBlendModeTest.gltf"
const m8 = "./src/models/8AnimateMorph/AnimatedMorphCube.gltf"
const m9 = "./src/models/9BoxAnimated/BoxAnimated-EMB.gltf"
const m10 = "./src/models/10AnimSkin/SimpleSkin.gltf"
const m11 = "./src/models/11MorphTest/MorphPrimitivesTest.gltf"
const m12 = "./src/models/12UltimateTest/MorphStressTest.gltf"
const m13 = "./src/models/13ColorEnc/TextureEncodingTest.gltf"
const m14 = "./src/models/14AnimTri/AnimatedTriangle.gltf"
const m15 = "./src/models/15AnimInter/InterpolationTest.glb"
const m16 = "./src/models/16FoxMultiAnim/Fox.gltf"
const m99 = "./src/models/99Unicode/Unicode❤♻Test.glb"
const noModel = ""
let model = noModel
const modelList = { "-": noModel, "Duck": m, "Suzanne": m0, "Sparse Accessors": m01, "Avocado": m1, "AvocadoBIN": m101, "Fight Helmet": m2, "BoomBox": m3, "Corset": m301, "Box": m4, "Animated Cube": m5, "Rigged Simple": m6, "Alpha Test": m7, "Morph Cube": m8, "BoxAnimated": m9, "Simple Skin": m10, "Morph Test": m11, "Stress Test": m12, "Color encoding": m13, "Simple rotation anim": m14, "Anim interpolations": m15, "Fox Multi Anim": m16, "Unicode test": m99 }
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
  //"Duck": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Duck/glTF-Embedded/Duck.gltf",
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
const globalLightsList = []
let proceduralModelsList = [] //{}
const mipmapsList = { "NEAREST_MIPMAP_NEAREST": 9984, "NEAREST_MIPMAP_LINEAR": 9986, "LINEAR_MIPMAP_NEAREST": 9985, "LINEAR_MIPMAP_LINEAR": 9987 }
const wrappingList = { "Clamp to edge": 33071, "Mirrored repeat": 33648, "Repeat": 10497 }
const filteringList = { "Linear": 9729, "Nearest": 9728 }
const projectionDirections = { "X": [1, 0, 0], "Y": [0, 1, 0], "Z": [0, 0, 1] }

export class App extends Application {
  async init(logsDOMElement, fileChooser) {
    this.gui = null

    // For uploading textures (and other stuff)
    this.fileChooser = new FileInput(fileChooser)

    this.state = {
      // Canvas
      axesShown: true,
      backgroundColor: [227, 200, 200],
      showLogs: true,
      drawLights: true,

      // Lights
      addAmbientLightColor: [200, 255, 200],
      newLightObject: {
        addLightColor: [255, 255, 180],
        addLightPosition: "0, 5, 0",
        addLightIntensity: 0.5,
        addLightAttenuationConstantFactor: 1.0,
        addLightAttenuationLinearFactor: 0.09,
        addLightAttenuationQuadraticFactor: 0.032,
      },
      deleteLastLightOfType: "Any",
      lightsList: [],

      //Models
      gltfPositioning: false,
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

      //Procedural geometry
      newGeoObject: {
        shape: 0, //"Plane",
        size: 1,
        position: "0, 0, 0",
        rotation: "0, 0, 0, 1",
        color: [127, 127, 255],
        texture: "./src/models/1Avocado/glTF/Avocado_baseColor.png",
        textureBlob: undefined,
        textureMapping: {
          mapping: "UV",
          projectionDirection: [1, 0, 0],
          translateX: 0,
          translateY: 0,
          rotate: 0,
          scaleX: 1,
          scaleY: 1
        },
        shadingModel: {
          selectedShadingModel: "Lambert",
          diffuseColor: [255, 200, 200],
          specularColor: [255, 200, 200],
          shadingShininess: 32
        },
        innerHole: 0.2, //tube"s radius size
        lat: 36,
        lon: 36
      },
      deleteLastGeoOfType: "Any",

      //Globals
      lookingAt: "0, 0, 0",
      enableGlobalSampler: false,
      globalSampler: {
        wrappingModeS: 10497,
        wrappingModeT: 10497,
        minFilterMode: 9728,
        magFilterMode: 9728,
        mipMaps: false
      }
    }

    // Axes helper view
    this.axes = new Axes({
      glContext: this.gl,
      program: this.renderer.programs.axes,
      //mvpMatrix: this.camera.camera.matrix
    })


    this.logs = logsDOMElement

    // glTF animations player
    this.animationsPlayer = new AnimationsPlayer()
    this.frameCount = 1
    this.animationTimeLogs = logsDOMElement.querySelector("#animationTime")
    this.animationTimeLogs.textContent = 0

    // User Controls and logging
    this.controls = new Controls()
    this.controls.updateCamera(this.camera)
    this.controls.setOrbitCenter(this.camera.lookingAt)
    this.freeCamera = 0
    this.cameraPositionLogs = logsDOMElement.querySelector("#cameraPosition")
    this.cameraRotationLogs = logsDOMElement.querySelector("#cameraRotation")

    // Lights
    this.lightsNumberLimit = 8

    this.addPointLight("5,2,0", [255, 120, 120])
    this.addPointLight("2.5,2,4.3301", [100, 255, 100])
    this.addPointLight("−2.5,2,4.3301", [127, 127, 255])
    this.addPointLight("−5,2,0", [200, 120, 200])
    this.addPointLight("−2.5,2,−4.3301", [255, 120, 120])
    this.addPointLight("2.5,2,−4.3301", [100, 255, 100])

    //debuging lights
    this.state.newGeoObject.size = 6
    this.state.newGeoObject.position = "0,0,0"
    this.addGeoPlane()

    //this.initGUI()
    //**/!* /!*!/ * !/*!/*!/*!/!*/!* /!*/! * /!*/! * /!*!/ * !/**!/!*/!*/*!/*!/*!*!/*!/*!/*!/*!/*/ !* /!*/! * /!************?**?*??
    this.cameraTheta = 0.0   // Initial angle in the XY plane
    this.cameraPhi = Math.PI / 2

    this.initGUI()

    this.globalSampler = WebGL.createSampler(this.gl, {
      wrpaS: this.state.globalSampler.wrappingModeS,
      wrapT: this.state.globalSampler.wrappingModeT,
      min: this.state.globalSampler.minFilterMode,
      mag: this.state.globalSampler.magFilterMode
    })
  }

  initGUI() {
    const gui = this.gui = new GUI({ width: 350 }) //({autoPlace: false, width: 260, hideable: true})

    // Canvas controls.
    /* (1) Display a scene with default coordinate axes, where each axis 
           is colored (x-axis in red, y-axis in green, z-axis in blue). */
    const canvasFolder = gui.addFolder("Canvas options")
    const axesHelper = canvasFolder.add(this.state, "axesShown") //.listen() //.onChange(this.toggleAxesInScene)
    const bgColor = canvasFolder.addColor(this.state, "backgroundColor").onChange(this.setClearColor.bind(this))
    const logs = canvasFolder.add(this.state, "showLogs").onChange(this.toggleLogs.bind(this))
    const drawLights = canvasFolder.add(this.state, "drawLights").listen()

    // Models controls.
    /* (2) Load 3D models in glTF 2.0 format and position them in space 
    (with options for translation, rotation, and scaling). */
    this.modelsFolder = gui.addFolder("glTF Model")
    this.modelsFolder.domElement.children[0].children[0].classList.add("green")
    this.modelsFolder.add(this.state, "gltfPositioning").listen()
    this.modelSelector = this.modelsFolder.add(this.state, "selectedModel", { ...modelList, ...{ "-v- Embeded glLTs -v-": "" }, ...modelListCORS }).onChange(this.changeModel.bind(this))
    this.modelsFolder.add(this.state, "selectedModel").listen().onFinishChange(this.changeModel.bind(this)) //.domElement.children[0].setAttribute("disabled", "disabled") //.onFinishChange(this.changeModel.bind(this))
    this.modelsFolder.add(this, "userGltfFile").name("File on computer") //.onChange(this.userGltfFile.bind(this))
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
    //const modelPositioningFolder = this.infoFolder.addFolder("Model positioning")
    //modelPositioningFolder.add(this.scene.nodes[]).listen()
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
    const base = this.modelTextures.addFolder("Base texture")
    //uniform vec4 uBaseColor; + plus texture with file chooser option - TODO
    base.add(this, "userGltfTextureFile").name("File on computer") //.onChange(this.userGltfTextureFile.bind(this))

    //this.modelTextures.addFolder("Normal texture")
    //uniform float uNormalTextureScale;

    //this.modelTextures.addFolder("Emissive texture")
    //uniform vec3 uEmissiveFactor;

    //this.modelTextures.addFolder("Metallic-Roughness texture")
    //uniform float uMetallicFactor;
    //uniform float uRoughnessFactor;

    //this.modelTextures.addFolder("Occlusion texture")
    //uniform float uOcclusionStrength;

    this.modelTextures.domElement.style.display = "none"


    // Lighting controls.
    /* (6) Place point lights in the scene, with adjustable parameters for color, 
           intensity, and attenuation (constant, linear, quadratic attenuation).
       (7) Define the lighting model (Lambert and Phong) and shading parameters 
           (diffuse and specular color, shininess) for each object. */
    this.lightFolder = gui.addFolder("Lighting")
    this.lightFolder.domElement.children[0].children[0].classList.add("yellow")
    this.lightFolder.addColor(this.state, "addAmbientLightColor").name("Ambient color")
    this.addLightFolder = this.lightFolder.addFolder("Add a light")
    const addPointLightAction = this.addLightFolder.add(this, "addPointLight").name("ADD POINT LIGHT")
    this.addLightFolder.add(this.state.newLightObject, "addLightPosition").name("Light position") // position,
    this.addLightFolder.addColor(this.state.newLightObject, "addLightColor").name("Light color") // color,
    this.addLightFolder.add(this.state.newLightObject, "addLightIntensity", 0, 10, 0.1).name("Light intensity") // intensity
    this.addLightFolder.add(this.state.newLightObject, "addLightAttenuationConstantFactor", 0, 2, 0.1).name("Constant atten.") // attenuation (constant, linear, quadratic attenuation)
    this.addLightFolder.add(this.state.newLightObject, "addLightAttenuationLinearFactor", 0, 1, 0.01).name("Linear atten.") // attenuation (constant, linear, quadratic attenuation)
    this.addLightFolder.add(this.state.newLightObject, "addLightAttenuationQuadraticFactor", 0, 1, 0.001).name("Quadratic atten.") // attenuation (constant, linear, quadratic attenuation)

    addPointLightAction.__li.classList.add("centered")

    this.lightsListFolder = this.lightFolder.addFolder("List of added lights")
    this.lightsListFolder.add(this.state, "deleteLastLightOfType", ["Any"]).listen().name("Light type to remove")
    const removeLastLightButton = this.lightsListFolder.add(this, "removeLastLight").name("Remove lastly added light")
    removeLastLightButton.__li.classList.add("centered")
    this.lightsList = this.lightsListFolder.addFolder("Lights")
    this.updateGUIlightsList()
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

    const addGeoFolder = this.geometryFolder.addFolder("Add a model")
    addGeoFolder.add(this.state.newGeoObject, "shape", { "Plane": 0, "Cube": 1, "Sphere": 2, "Torus": 3 }).name("Shape").onChange(this.selectGeoAction.bind(this))
    this.geometryActions = []
    const addPlaneAction = addGeoFolder.add(this, "addGeoPlane").name("ADD PLANE TO SCENE")
    const addCubeAction = addGeoFolder.add(this, "addGeoCube").name("ADD CUBE TO SCENE")
    const addSphereAction = addGeoFolder.add(this, "addGeoSphere").name("ADD SPHERE TO SCENE")
    const addTorusAction = addGeoFolder.add(this, "addGeoTorus").name("ADD TORUS TO SCENE")
    addPlaneAction.__li.classList.add("centered")
    addCubeAction.__li.classList.add("centered")
    addSphereAction.__li.classList.add("centered")
    addTorusAction.__li.classList.add("centered")
    addCubeAction.__li.style.display = "none"
    addSphereAction.__li.style.display = "none"
    addTorusAction.__li.style.display = "none"
    this.geometryActions.push([addPlaneAction, addCubeAction, addSphereAction, addTorusAction])

    const addGeoGeometryFolder = addGeoFolder.addFolder("Geometry")
    const geoSize = addGeoGeometryFolder.add(this.state.newGeoObject, "size", 0.5, 10, 0.1).name("Size").listen()
    const geoInnerHole = addGeoGeometryFolder.add(this.state.newGeoObject, "innerHole", 0.1, 2.5, 0.1).name("Tube radius").listen()
    const geoLatBands = addGeoGeometryFolder.add(this.state.newGeoObject, "lat", 6, 360, 1).name("Lat. bands").listen()
    const geoLonBands = addGeoGeometryFolder.add(this.state.newGeoObject, "lon", 6, 360, 1).name("Lon. bands").listen()
    const geoPosition = addGeoGeometryFolder.add(this.state.newGeoObject, "position").name("Position").listen()
    const geoRotation = addGeoGeometryFolder.add(this.state.newGeoObject, "rotation").name("Rotation").listen()
    const geoColor = addGeoGeometryFolder.addColor(this.state.newGeoObject, "color").name("Base color").listen()

    const addGeoTextureFolder = addGeoFolder.addFolder("Texture")
    const geoTextureFileChooser = addGeoTextureFolder.add(this, "userGeoTextureFile").name("File on computer") //.onChange(this.userGeoTextureFile.bind(this))
    const geoUV = addGeoTextureFolder.add(this.state.newGeoObject, "texture").name("Texture image").listen()
    addGeoTextureFolder.add(this.state.newGeoObject.textureMapping, "mapping", ["UV", "Planar", "Cylindrical", "Spherical"]).listen().onChange(this.mappingChanged.bind(this))
    const pd = addGeoTextureFolder.add(this.state.newGeoObject.textureMapping, "projectionDirection", projectionDirections).listen()
    const tx = addGeoTextureFolder.add(this.state.newGeoObject.textureMapping, "translateX", -1, 1, 0.1)
    const ty = addGeoTextureFolder.add(this.state.newGeoObject.textureMapping, "translateY", -1, 1, 0.1)
    const r = addGeoTextureFolder.add(this.state.newGeoObject.textureMapping, "rotate", 0, Math.PI * 2, 0.01)
    const sx = addGeoTextureFolder.add(this.state.newGeoObject.textureMapping, "scaleX", 0.1, 2)
    const sy = addGeoTextureFolder.add(this.state.newGeoObject.textureMapping, "scaleY", 0.1, 2)

    this.geoshadingModel = addGeoFolder.addFolder("Shading model")
    this.geoshadingModel.add(this.state.newGeoObject.shadingModel, "selectedShadingModel", ["Lambert", "Phong", "Blinn-Phong"]).name("Shading model").listen().onChange(this.toggleShadingModel.bind(this))
    this.geoshadingModel.addColor(this.state.newGeoObject.shadingModel, "diffuseColor").name("Diffuse color").listen()
    this.geoshadingModel.addColor(this.state.newGeoObject.shadingModel, "specularColor").name("Specular color").listen()
    this.geoshadingModel.add(this.state.newGeoObject.shadingModel, "shadingShininess", 0, 300, 1).name("Shininess").listen()

    geoInnerHole.__li.style.display = "none"
    geoLatBands.__li.style.display = "none"
    geoLonBands.__li.style.display = "none"
    /*pd.__li.style.display = "none"
    tx.__li.style.display = "none"
    ty.__li.style.display = "none"
    r.__li.style.display = "none"
    sx.__li.style.display = "none"
    sy.__li.style.display = "none"*/
    this.geoshadingModel.__controllers.at(-2).__li.style.display = "none"
    this.geoshadingModel.__controllers.at(-1).__li.style.display = "none"
    this.geometryActions.push([geoSize, geoPosition, geoRotation, geoColor, geoUV, geoInnerHole, geoLatBands, geoLonBands])
    this.geometryActions.push([pd, tx, ty, r, sx, sy])

    const geomListFolder = this.geometryFolder.addFolder("List of added geometries")
    geomListFolder.add(this.state, "deleteLastGeoOfType", ["Any", "Plane", "Cube", "Sphere", "Torus"]).listen().name("Geo type to remove")
    const removeLastGeoButton = geomListFolder.add(this, "removeLastGeoNode").name("Remove lastly added geo model")
    removeLastGeoButton.__li.classList.add("centered")
    this.geoModelsList = geomListFolder.addFolder("Models")
    this.updateGUIgeoList()

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

    this.globalTextureFolder = this.globalFolder.addFolder("Texture options")
    this.globalTextureFolder.add(this.state, "enableGlobalSampler").listen().onChange(this.toggleGlobalsSampler.bind(this))
    this.globalTextureFolder.add(this.state.globalSampler, "wrappingModeS", wrappingList).listen().onChange(this.changeWrappingS.bind(this))
    this.globalTextureFolder.add(this.state.globalSampler, "wrappingModeT", wrappingList).listen().onChange(this.changeWrappingT.bind(this))
    this.globalTextureFolder.add(this.state.globalSampler, "mipMaps").listen().onChange(this.changeMips.bind(this))
    this.globalTextureFolder.add(this.state.globalSampler, "minFilterMode", { ...filteringList }).listen().onChange(this.changeFilteringMin.bind(this))
    this.globalTextureFolder.add(this.state.globalSampler, "magFilterMode", { ...filteringList }).listen().onChange(this.changeFilteringMag.bind(this))

    Object.keys(this.globalTextureFolder.__controllers).slice(1).forEach(controller => {
      this.globalTextureFolder.__controllers[controller].__li.style.display = "none"
    })
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
    this.cameraFolder.add(this.state, "selectedCamera", camerasList).listen().onChange(this.changeCamera.bind(this))
    this.cameraFolder.domElement.style.display = ""
    //} else {
    //   this.cameraFolder.domElement.style.display = "none"
    // }

    this.modelTextures.domElement.style.display = ""

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

    if (model === "") {
      this.scene.nodes = [] // not really ideal. but it does the trick.
      this.infoFolder.domElement.style.display = "none"
      this.sceneFolder.domElement.style.display = "none"
      this.cameraFolder.domElement.style.display = "none"
      this.animFolder.domElement.style.display = "none"
      this.modelTextures.domElement.style.display = "none"
    }
  }

  updateGUIlightsList() {
    Object.keys(this.lightsList.__folders).forEach((f) => { this.lightsList.removeFolder(this.lightsList.__folders[f]) })
    for (let lightIndex in this.state.lightsList) {
      let lightFolder = this.lightsList.addFolder(lightIndex)
      lightFolder.add(this.state.lightsList[lightIndex], "position").name("Light position").listen().onChange(() => this.updateGeoLights(lightIndex, "position"))
      lightFolder.addColor(this.state.lightsList[lightIndex], "color").name("Light color").listen().onChange(() => this.updateGeoLights(lightIndex, "color"))
      lightFolder.add(this.state.lightsList[lightIndex], "intensity", 0, 10).name("Light intensity").listen()
      lightFolder.add(this.state.lightsList[lightIndex], "constantAttenuation", 0, 2, 0.1).name("Constant atten.").listen()
      lightFolder.add(this.state.lightsList[lightIndex], "linearAttenuation", 0, 1, 0.01).name("Linear atten.").listen()
      lightFolder.add(this.state.lightsList[lightIndex], "quadraticAttenuation", 0, 1, 0.001).name("Quadratic atten.").listen()
    }
  }

  async updateGeoLights(lightIndex, property) {
    if (property === "color") {
      globalLightsList[lightIndex].baseColor = this.state.lightsList[lightIndex][property]
    } else {
      globalLightsList[lightIndex].geometry.position = this.state.lightsList[lightIndex][property]
      await Geo.updateGeoBuffers(this.gl, this.renderer.programs.geo, globalLightsList[lightIndex])
    }
  }

  updateGUIgeoList() {
    Object.keys(this.geoModelsList.__folders).forEach((f) => { this.geoModelsList.removeFolder(this.geoModelsList.__folders[f]) })
    for (let geoIndex in proceduralModelsList) {
      const modelFolder = this.geoModelsList.addFolder(`${geoIndex}: ${proceduralModelsList[geoIndex].type}`)
      const geoGeometryFolder = modelFolder.addFolder("Geometry")
      geoGeometryFolder.add(proceduralModelsList[geoIndex].geometry, "size", 0.5, 10, 0.1).name("Size").listen().onChange((value) => this.updateGeoModelBuffers(geoIndex, { "size": value }))
      if (proceduralModelsList[geoIndex].type === "Torus") {
        geoGeometryFolder.add(proceduralModelsList[geoIndex].geometry, "innerHole", 0.1, 2.5, 0.1).name("Tube radius").listen().onChange((value) => this.updateGeoModelBuffers(geoIndex, { "innerHole": value }))
      }
      if (["Torus", "Sphere"].some(t => proceduralModelsList[geoIndex].type.includes(t))) {
        geoGeometryFolder.add(proceduralModelsList[geoIndex].geometry, "lat", 6, 360, 1).name("Lat. bands").listen().onChange((value) => this.updateGeoModelBuffers(geoIndex, { "lat": value }))
        geoGeometryFolder.add(proceduralModelsList[geoIndex].geometry, "lon", 6, 360, 1).name("Lon. bands").listen().onChange((value) => this.updateGeoModelBuffers(geoIndex, { "lon": value }))
      }
      geoGeometryFolder.add(proceduralModelsList[geoIndex].geometry, "position").name("Position").listen().onChange((value) => this.updateGeoModelBuffers(geoIndex, { "position": value }))
      geoGeometryFolder.add(proceduralModelsList[geoIndex].geometry, "rotation").name("Rotation").listen().onChange((value) => this.updateGeoModelBuffers(geoIndex, { "rotation": value }))
      geoGeometryFolder.addColor(proceduralModelsList[geoIndex], "baseColor").name("Base color").listen()

      const geoTextureFolderTmp = modelFolder.addFolder("Texture")
      geoTextureFolderTmp.add(this, "userGeoTextureSpecificFile").name("File on computer") //.onChange(this.userGeoTextureSpecificFile.bind(this))
      geoTextureFolderTmp.add(proceduralModelsList[geoIndex].texturing, "texture").name("Texture image").onChange((value) => this.updateGeoModelTexture(geoIndex, { "texture": value }))
      const updateTextureMappingsUI = (value) => {
        /*if (value === "UV") {
          geoTextureFolderTmp.__controllers[3].__li.style.display = "none"
          geoTextureFolderTmp.__controllers[4].__li.style.display = "none"
          geoTextureFolderTmp.__controllers[5].__li.style.display = "none"
          geoTextureFolderTmp.__controllers[6].__li.style.display = "none"
          geoTextureFolderTmp.__controllers[7].__li.style.display = "none"
          geoTextureFolderTmp.__controllers[8].__li.style.display = "none"
        } else {
          geoTextureFolderTmp.__controllers[3].__li.style.display = ""
          geoTextureFolderTmp.__controllers[4].__li.style.display = ""
          geoTextureFolderTmp.__controllers[5].__li.style.display = ""
          geoTextureFolderTmp.__controllers[6].__li.style.display = ""
          geoTextureFolderTmp.__controllers[7].__li.style.display = ""
          geoTextureFolderTmp.__controllers[8].__li.style.display = ""
        }*/
        this.updateGeoModelTextureMapping(geoIndex, { "mapping": value })
      }
      geoTextureFolderTmp.add(proceduralModelsList[geoIndex].texturing.textureMappings, "mapping", ["UV", "Planar", "Cylindrical", "Spherical"]).onChange((value) => updateTextureMappingsUI(value))
      geoTextureFolderTmp.add(proceduralModelsList[geoIndex].texturing.textureMappings, "projectionDirection", projectionDirections).onChange((value) => this.updateGeoModelTextureMapping(geoIndex, { "projectionDirection": getPositionNormalised(value) })) //projectionDirections[value] }))
      geoTextureFolderTmp.add(proceduralModelsList[geoIndex].texturing.textureMappings, "translateX", -1, 1, 0.1).onChange((value) => this.updateGeoModelTextureMapping(geoIndex, { "translateX": value }))
      geoTextureFolderTmp.add(proceduralModelsList[geoIndex].texturing.textureMappings, "translateY", -1, 1, 0.1).onChange((value) => this.updateGeoModelTextureMapping(geoIndex, { "translateY": value }))
      geoTextureFolderTmp.add(proceduralModelsList[geoIndex].texturing.textureMappings, "rotate", 0, Math.PI * 2, 0.01).onChange((value) => this.updateGeoModelTextureMapping(geoIndex, { "rotate": value }))
      geoTextureFolderTmp.add(proceduralModelsList[geoIndex].texturing.textureMappings, "scaleX", 0.1, 2).onChange((value) => this.updateGeoModelTextureMapping(geoIndex, { "scaleX": value }))
      geoTextureFolderTmp.add(proceduralModelsList[geoIndex].texturing.textureMappings, "scaleY", 0.1, 2).onChange((value) => this.updateGeoModelTextureMapping(geoIndex, { "scaleY": value }))
      updateTextureMappingsUI(proceduralModelsList[geoIndex].texturing.textureMappings.mapping)

      const geoShadingModel = modelFolder.addFolder("Shading model")
      const updateShadingModelUI = () => {
        if (proceduralModelsList[geoIndex].shadingModel.type === "Lambert") {
          geoShadingModel.__controllers[2].__li.style.display = "none"
          geoShadingModel.__controllers[3].__li.style.display = "none"
        } else {
          geoShadingModel.__controllers[2].__li.style.display = ""
          geoShadingModel.__controllers[3].__li.style.display = ""
        }
      }
      geoShadingModel.add(proceduralModelsList[geoIndex].shadingModel, "type", ["Lambert", "Phong", "Blinn-Phong"]).name("Shading model").listen().onChange(() => updateShadingModelUI())
      geoShadingModel.addColor(proceduralModelsList[geoIndex].shadingModel, "diffuseColor").name("Diffuse color").listen()
      geoShadingModel.addColor(proceduralModelsList[geoIndex].shadingModel, "specularColor").name("Specular color").listen()
      geoShadingModel.add(proceduralModelsList[geoIndex].shadingModel, "shininess", 0, 300, 1).name("Shininess").listen()
      updateShadingModelUI()
    }
  }

  setClearColor(color) {
    this.renderer.changeClearColor(color)
  }

  toggleLogs() {
    this.logs.classList.toggle("hidden")
  }

  /* File chooser functions */
  async userGltfFile() {
    this.fileChooser.openFileDialog()
    await this.fileChooser.selectFile().then((fileData) => {
      this.state.selectedModel = fileData.file.name
      model = fileData.data
      this.loadSceneAndCamera(fileData.type)
    }).catch((error) => {
      console.error('Error loading file:', error)
    })

  }

  async userGltfTextureFile() {
    this.fileChooser.openFileDialog()
    await this.fileChooser.selectFile().then((fileData) => {
      this.renderer.updateBaseColorTexture(fileData)
    }).catch((error) => {
      console.error('Error loading file:', error)
    })
  }

  async userGeoTextureFile() {
    this.fileChooser.openFileDialog()
    await this.fileChooser.selectFile().then((fileData) => {
      this.state.newGeoObject.texture = fileData.file.name
      this.state.newGeoObject.textureBlob = fileData.data
    }).catch((error) => {
      console.error('Error loading file:', error)
    })
  }

  async userGeoTextureSpecificFile() {
    this.fileChooser.openFileDialog()
    await this.fileChooser.selectFile().then((fileData) => {
      for (let geo of proceduralModelsList) {
        geo.texturing.texture = fileData.file.name
        geo.texturing.textureBlob = fileData.data
        Geo.updateGeoTexture(this.gl, geo)
      }
    }).catch((error) => {
      console.error('Error loading file:', error)
    })
  }


  /* LIGHTS */
  async addPointLight(position = undefined, color = undefined, intensity = undefined, constant = undefined, linear = undefined, quadratic = undefined) {
    if (this.state.lightsList.length < this.lightsNumberLimit) {
      const options = {
        position: position || this.state.newLightObject.addLightPosition,
        color: color || this.state.newLightObject.addLightColor,
        intensity: intensity || this.state.newLightObject.addLightIntensity,
        constant: constant || this.state.newLightObject.addLightAttenuationConstantFactor,
        linear: linear || this.state.newLightObject.addLightAttenuationLinearFactor,
        quadratic: quadratic || this.state.newLightObject.addLightAttenuationQuadraticFactor
      }

      const sphereOptions = {
        radius: 0.01,
        position: getPositionNormalised(options.position),
        rotation: [0, 0, 0, 1],
        latBands: 18,
        lonBands: 18,
        texture: "",
        material: {
          color: options.color,
          type: "Lambert",
          diffuseColor: options.color,
          specularColor: undefined,
          shininess: undefined
        }
      }

      this.state.lightsList.push(new PointLight(options))
      globalLightsList.push(await Geo.createSphere(this.gl, this.renderer.programs.gltf, sphereOptions))
      this.updateGUIlightsList()
    }
  }

  toggleShadingModel() {
    if (this.state.newGeoObject.shadingModel.selectedShadingModel === "Lambert") {
      this.geoshadingModel.__controllers.at(-2).__li.style.display = "none"
      this.geoshadingModel.__controllers.at(-1).__li.style.display = "none"
    } else {
      this.geoshadingModel.__controllers.at(-2).__li.style.display = ""
      this.geoshadingModel.__controllers.at(-1).__li.style.display = ""
    }
  }

  removeLastLight() {
    const type = this.state.deleteLastLightOfType

    switch (type) {
      case "Any":
        this.state.lightsList.pop()
        globalLightsList.pop()
        break
      default:
        this.removeLastLightOfType(type)
    }

    this.updateGUIlightsList()
  }

  removeLastLightOfType(type) {
    for (let i = this.state.lightsList.length - 1; i >= 0; i--) {
      if (this.state.lightsList[i].type === type) {
        this.state.lightsList.splice(i, 1)
        globalLightsList.splice(i, 1)
        break
      }
    }
  }
  /****************************************************************************************************************/


  /* glTF MODELS */
  gltfModelPositioning() {
    const dialog = document.querySelector("#transformGltfDialog")
    dialog.showModal()

    dialog.querySelector("#submitTransform").onclick = (event) => {
      event.preventDefault()

      const position = [
        parseFloat(document.querySelector("#positionX").value) || 0,
        parseFloat(document.querySelector("#positionY").value) || 0,
        parseFloat(document.querySelector("#positionZ").value) || 0
      ]

      const rotation = [
        parseFloat(document.querySelector("#rotationX").value) || 0,
        parseFloat(document.querySelector("#rotationY").value) || 0,
        parseFloat(document.querySelector("#rotationZ").value) || 0,
        parseFloat(document.querySelector("#rotationW").value) || 1
      ]

      const scaling = [
        parseFloat(document.querySelector("#scaleX").value) || 1,
        parseFloat(document.querySelector("#scaleY").value) || 1,
        parseFloat(document.querySelector("#scaleZ").value) || 1
      ]

      const trs = [
        quat.fromValues(...rotation),
        vec3.fromValues(...position),
        vec3.fromValues(...scaling)
      ]

      for (const node of this.scene.nodes) {
        this.updateNodeMatrix(node, trs)
      }

      //this.renderer.prepareScene(this.scene)

      dialog.close()
    }
  }

  updateNodeMatrix(node, matrix, parent = null) {
    //node.matrix = mat4.mul(node.matrix, node.matrix, matrix)

    const mvmatrix = mat4.clone(matrix)
    if (parent) {
      mat4.mul(mvmatrix, parent, mvmatrix)
    }

    node.rotation = matrix[0]
    node.translation = matrix[1]
    node.scale = matrix[2]

    node.updateMatrix()

    for (const child of node.children) {
      this.updateNodeMatrix(child, matrix, node.matrix)
    }
  }
  /****************************************************************************************************************/


  /* PROCEDURAL GEOMETRIES */
  selectGeoAction() {
    for (const index in this.geometryActions[0]) {
      if (index != this.state.newGeoObject.shape) {
        this.geometryActions[0][index].__li.style.display = "none"
      }
    }
    this.geometryActions[0][this.state.newGeoObject.shape].__li.style.display = ""

    if (2 == this.state.newGeoObject.shape) { // Sphere
      this.geometryActions[1][0].name("Radius")
      this.geometryActions[1][5].__li.style.display = "none"
      this.geometryActions[1][6].name("Latitude bands")
      this.geometryActions[1][6].__li.style.display = ""
      this.geometryActions[1][7].name("Longitude bands")
      this.geometryActions[1][7].__li.style.display = ""
    } else if (3 == this.state.newGeoObject.shape) { // Torus
      this.geometryActions[1][0].name("Radius")
      this.geometryActions[1][5].__li.style.display = ""
      this.geometryActions[1][6].name("Radial bands")
      this.geometryActions[1][6].__li.style.display = ""
      this.geometryActions[1][7].name("Tubular bands")
      this.geometryActions[1][7].__li.style.display = ""
    } else {
      this.geometryActions[1][0].name("Size")
      this.geometryActions[1][5].__li.style.display = "none"
      this.geometryActions[1][6].__li.style.display = "none"
      this.geometryActions[1][7].__li.style.display = "none"
    }
  }

  async addGeoPlane() {
    const options = {}
    options.size = this.state.newGeoObject.size
    options.position = getPositionNormalised(this.state.newGeoObject.position)
    options.rotation = getPositionNormalised(this.state.newGeoObject.rotation)
    options.material = {}
    options.material.color = this.state.newGeoObject.color
    options.material.type = this.state.newGeoObject.shadingModel.selectedShadingModel
    options.material.diffuseColor = this.state.newGeoObject.shadingModel.diffuseColor
    options.material.specularColor = this.state.newGeoObject.shadingModel.specularColor
    options.material.shininess = this.state.newGeoObject.shadingModel.shadingShininess
    options.texture = this.state.newGeoObject.texture
    options.textureBlob = this.state.newGeoObject.textureBlob
    options.textureMappings = this.state.newGeoObject.textureMapping

    proceduralModelsList.push(await Geo.createPlane(this.gl, this.renderer.programs.geo, options))
    this.updateGUIgeoList()
    this.state.newGeoObject.textureBlob = undefined
  }

  async addGeoCube() {
    const options = {}
    options.size = this.state.newGeoObject.size
    options.position = getPositionNormalised(this.state.newGeoObject.position)
    options.rotation = getPositionNormalised(this.state.newGeoObject.rotation)
    options.material = {}
    options.material.color = this.state.newGeoObject.color
    options.material.type = this.state.newGeoObject.shadingModel.selectedShadingModel
    options.material.diffuseColor = this.state.newGeoObject.shadingModel.diffuseColor
    options.material.specularColor = this.state.newGeoObject.shadingModel.specularColor
    options.material.shininess = this.state.newGeoObject.shadingModel.shadingShininess
    options.texture = this.state.newGeoObject.texture
    options.textureBlob = this.state.newGeoObject.textureBlob
    options.textureMappings = this.state.newGeoObject.textureMapping

    proceduralModelsList.push(await Geo.createCube(this.gl, this.renderer.programs.geo, options))
    this.updateGUIgeoList()
    this.state.newGeoObject.textureBlob = undefined
  }

  async addGeoSphere() {
    const options = {}
    options.radius = this.state.newGeoObject.size
    options.position = getPositionNormalised(this.state.newGeoObject.position)
    options.rotation = getPositionNormalised(this.state.newGeoObject.rotation)
    options.material = {}
    options.material.color = this.state.newGeoObject.color
    options.material.type = this.state.newGeoObject.shadingModel.selectedShadingModel
    options.material.diffuseColor = this.state.newGeoObject.shadingModel.diffuseColor
    options.material.specularColor = this.state.newGeoObject.shadingModel.specularColor
    options.material.shininess = this.state.newGeoObject.shadingModel.shadingShininess
    options.texture = this.state.newGeoObject.texture
    options.textureBlob = this.state.newGeoObject.textureBlob
    options.textureMappings = this.state.newGeoObject.textureMapping
    options.latBands = this.state.newGeoObject.lat
    options.lonBands = this.state.newGeoObject.lon

    proceduralModelsList.push(await Geo.createSphere(this.gl, this.renderer.programs.geo, options))
    this.updateGUIgeoList()
    this.state.newGeoObject.textureBlob = undefined
  }

  async addGeoTorus() {
    const options = {}
    options.radius = this.state.newGeoObject.size
    options.position = getPositionNormalised(this.state.newGeoObject.position)
    options.rotation = getPositionNormalised(this.state.newGeoObject.rotation)
    options.material = {}
    options.material.color = this.state.newGeoObject.color
    options.material.type = this.state.newGeoObject.shadingModel.selectedShadingModel
    options.material.diffuseColor = this.state.newGeoObject.shadingModel.diffuseColor
    options.material.specularColor = this.state.newGeoObject.shadingModel.specularColor
    options.material.shininess = this.state.newGeoObject.shadingModel.shadingShininess
    options.texture = this.state.newGeoObject.texture
    options.textureBlob = this.state.newGeoObject.textureBlob
    options.textureMappings = this.state.newGeoObject.textureMapping
    options.radialSegments = this.state.newGeoObject.lat
    options.tubularSegments = this.state.newGeoObject.lon
    options.holeRadius = this.state.newGeoObject.innerHole

    proceduralModelsList.push(await Geo.createTorus(this.gl, this.renderer.programs.geo, options))
    this.updateGUIgeoList()
    this.state.newGeoObject.textureBlob = undefined
  }

  async updateGeoModelBuffers(geoIndex, newValue) {
    const property = Object.keys(newValue)[0]
    proceduralModelsList[geoIndex].geometry[property] = newValue[property]
    await Geo.updateGeoBuffers(this.gl, this.renderer.programs.geo, proceduralModelsList[geoIndex])
  }

  async updateGeoModelTexture(geoIndex, newValue) {
    const property = Object.keys(newValue)[0]
    proceduralModelsList[geoIndex].texturing[property] = newValue[property]
    await Geo.updateGeoTexture(this.gl, proceduralModelsList[geoIndex])
  }

  async updateGeoModelTextureMapping(geoIndex, newValue) {
    const property = Object.keys(newValue)[0]
    proceduralModelsList[geoIndex].texturing.textureMappings[property] = newValue[property]
    await Geo.updateGeoTextureMapping(this.gl, this.renderer.programs.geo, proceduralModelsList[geoIndex])
  }

  removeLastGeoNode() {
    const type = this.state.deleteLastGeoOfType

    switch (type) {
      case "Any":
        proceduralModelsList.pop()
        break
      default:
        this.removeLatsGeoNodeOfType(type)
    }

    this.updateGUIgeoList()
  }

  removeLatsGeoNodeOfType(type) {
    for (let i = proceduralModelsList.length - 1; i >= 0; i--) {
      if (proceduralModelsList[i].type === type) {
        proceduralModelsList.splice(i, 1)
        break
      }
    }
  }
  /****************************************************************************************************************/


  /* TEXTURES */
  toggleGlobalsSampler(val) {
    //TODO - use global sampler for all textures in the scene, even for gltf model
    if (val) {
      Object.keys(this.globalTextureFolder.__controllers).slice(1).forEach(controller => {
        this.globalTextureFolder.__controllers[controller].__li.style.display = ""
      })
      this.scene.globalSampler = this.globalSampler
    } else {
      Object.keys(this.globalTextureFolder.__controllers).slice(1).forEach(controller => {
        this.globalTextureFolder.__controllers[controller].__li.style.display = "none"
      })
      this.scene.globalSampler = undefined
    }
  }

  mappingChanged(val) {
    /*switch (val) {
      case "Planar":
        this.state.newGeoObject.textureMapping.projectionDirection = [0, 0, 1]
        for (let mappingTransform of this.geometryActions[2]) {
          mappingTransform.__li.style.display = ""
        }
        break
      case "Cylindrical":
      case "Spherical":
        this.state.newGeoObject.textureMapping.projectionDirection = [0, 1, 0]
        for (let mappingTransform of this.geometryActions[2]) {
          mappingTransform.__li.style.display = ""
        }
        break
      default:
      for (let mappingTransform of this.geometryActions[2]) {
        mappingTransform.__li.style.display = "none"
      }
    }*/
  }

  changeWrappingS(val) {
    this.updateGlobalSampler()

    for (let o of this.loader.cache.values()) {
      if (o instanceof Texture) {
        this.renderer.setWrappingModeS(Number(val))
      }
    }
  }

  changeWrappingT(val) {
    this.updateGlobalSampler()

    for (let o of this.loader.cache.values()) {
      if (o instanceof Texture) {
        this.renderer.setWrappingModeT(Number(val))
      }
    }
  }

  changeFilteringMin(val) {
    this.updateGlobalSampler()

    for (let o of this.loader.cache.values()) {
      if (o instanceof Texture) {
        this.renderer.setFilteringModeMin(Number(val))
      }
    }
  }

  changeFilteringMag(val) {
    this.updateGlobalSampler()

    for (let o of this.loader.cache.values()) {
      if (o instanceof Texture) {
        this.renderer.setFilteringModeMag(Number(val))
      }
    }
  }

  changeMips(val) {
    if (val) {
      this.state.globalSampler.minFilterMode = 9984
      this.globalTextureFolder.__controllers
        .find(c => c.property === "minFilterMode")
        .options({ ...mipmapsList })
    } else {
      this.state.globalSampler.minFilterMode = 9728
      this.globalTextureFolder.__controllers
        .find(c => c.property === "minFilterMode")
        .options({ ...filteringList })
    }

    this.updateGlobalSampler()

    this.renderer.setMipMaps(val, { min: this.state.globalSampler.minFilterMode })
    //this.renderer.prepareScene(this.scene)
  }

  updateGlobalSampler() {
    this.globalSampler = WebGL.createSampler(this.gl, {
      wrpaS: this.state.globalSampler.wrappingModeS,
      wrapT: this.state.globalSampler.wrappingModeT,
      min: this.state.globalSampler.minFilterMode,
      mag: this.state.globalSampler.magFilterMode
    })
  }
  //****************************************************************************************************************

  async changeModel(id) {
    if (this.modelSelector.domElement.children[0].classList.contains("disabled")) return

    if (this.animationsPlayer.isPlaying) {
      this.stopAnimations()
    }

    this.modelSelector.domElement.children[0].setAttribute("disabled", "disabled")
    this.modelSelector.domElement.children[0].blur()

    model = id
    await this.loadSceneAndCamera()

    if (this.state.gltfPositioning) {
      this.gltfModelPositioning()
    }

    this.renderer.prepareScene(this.scene)

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

    this.controls.updateCamera(this.camera)

    this.modelSelector.domElement.children[0].removeAttribute("disabled")
    this.modelSelector.domElement.children[0].focus()
  }

  /* glTF ANIMATIONS */
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
  //****************************************************************************************************************

  async loadSceneAndCamera(type = undefined) {
    if (this.state.selectedModel != "") {
      (type ? await this.loader.load(model, type) : await this.loader.load(model))
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
      c = Number(c)
      camerasList[`Model camera ${c}`] = c + 1
      promises.push(await this.loader.loadNode("camera", c))
    }
    return promises
  }

  async loadCameras() {
    let viewMatrix = mat4.create()

    const { min, max } = this.glTFBox
    const modelSizeX = max[0] - min[0]
    const modelSizeY = max[1] - min[1]
    const modelSizeZ = max[2] - min[2]
    const maxModelSize = Math.max(modelSizeX, modelSizeY, modelSizeZ)
    this.controls.setZoom(maxModelSize / 5)

    this.state.lookingAt = vec3.fromValues((min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2)
    this.state.eye = vec3.fromValues(...this.state.lookingAt)
    this.state.eye[2] = modelSizeZ == 0 ? 4 : modelSizeZ * 5

    mat4.lookAt(viewMatrix, this.state.eye, this.state.lookingAt, [0, 1, 0])

    const fov = Math.PI / 3
    const freeCamera = new PerspectiveCamera({
      //aspect: this.canvas.clientWidth / this.canvas.clientHeight,
      fov: fov,
      near: 0.01, //maxModelSize / 10,
      far: 1000
    })
    mat4.invert(viewMatrix, viewMatrix)
    let options = {
      "camera": freeCamera,
      "matrix": viewMatrix
    }

    camerasList = {}
    this.cameras = []
    camerasList["Free camera"] = 0
    this.cameras.push(new Node(options))


    let promises = await this.getCameras()
    let gltfCameras = await Promise.all(promises)
    for (let c of gltfCameras) { this.cameras.push(c) }

    this.freeCamera = 0
    this.state.selectedCamera = this.cameras.length > 1 ? 1 : 0
    this.camera = this.cameras[this.state.selectedCamera]
    this.camera.lookingAt = this.state.lookingAt

    this.cameras[this.freeCamera].translation = vec3.fromValues(...this.state.eye)
    this.cameras[this.freeCamera].updateMatrix()

    this.controls.updateCamera(this.camera)
    this.controls.setOrbitCenter(this.camera.lookingAt)
  }

  setupFreeCamera() {
    const viewMatrix = mat4.create()
    mat4.lookAt(viewMatrix, [0, 2, 5], [0, 0, 0], [0, 1, 0])
    const freeCamera = new PerspectiveCamera({
      fov: Math.PI / 3,
      near: 0.01,
      far: 1000
    })
    mat4.invert(viewMatrix, viewMatrix)
    let options = {
      "camera": freeCamera,
      "matrix": viewMatrix
    }

    camerasList = {}
    this.cameras = []
    this.cameras.push(new Node(options))

    this.freeCamera = 0
    this.camera = this.cameras[0]
    camerasList["Free camera"] = 0
    this.camera.lookingAt = [0, 0, 0]
    if (this?.state) {
      this.state.selectedCamera = 0
    }
  }

  changeFocalPoint(val) {
    //mat4.lookAt(this.camera.matrix, this.state.eye, val.split(",").map(Number), [0, 1, 0])
    this.camera.lookingAt = val.split(",").map(Number)
    //mat4.lookAt(this.camera.matrix, this.camera.translation, this.camera.lookingAt, [0, 1, 0])
    //this.camera.lookAt(this.camera.lookingAt)
    this.controls.setOrbitCenter(this.camera.lookingAt)
  }

  changeScene(id) {
    this.scene = this.scenes[id]
    const meshID = this.loader.gltf.scenes[id].nodes[0]
    this.extractPosIndBB(meshID)
    this.renderer.prepareScene(this.scene)
    this.updateGUI()
  }

  changeCamera(id) {
    id = Number(id)
    this.camera = this.cameras[id - 1 < 0 ? id : id--]
    this.controls.updateCamera(this.camera)
  }

  async start() {
    this.loader = new GLTFLoader()
    this.renderer = new Renderer(this.gl)
    //await this.loadCameras()
    this.setupFreeCamera()
    this.scene = { nodes: [], geoNodes: [], lights: [] }

    //delete this**********************!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!*!
    //this.increment = 0.05

  }

  async render() {
    if (this.renderer) {

      /* Random shiet */
      if (this.state.rotateModelEnabled) {
        //this.rotateGltfModel(this.scene.nodes, [0, 0.5, 0])
        //await this.rotateGeoModels(proceduralModelsList, [0, 0.5, 0])
        this.controls.rotate(undefined, 5, 0)
      } // over Y

      /* glTF Animations */
      if (this.animationsPlayer.animations && this.animationsPlayer.isPlaying) {
        const deltaTime = (performance.now() - this.lastTime) / 1000
        this.lastTime = performance.now()
        if (this.state.animationPlaybackSpeed <= this.frameCount) {
          this.animationsPlayer.update(deltaTime)
          this.frameCount = 1
        } else {
          this.frameCount++
        }
      }

      /* Updating logs */
      const [ctx, cty, ctz] = this.camera.translation
      const [crx, cry, crz] = this.controls.quatToEuler(this.camera.rotation)//.map(angle => angle * (180 / Math.PI))
      this.cameraPositionLogs.textContent = `X: ${ctx.toFixed(3)}, Y: ${cty.toFixed(3)}, Z: ${ctz.toFixed(3)}`
      this.cameraRotationLogs.textContent = `Pitch: ${crx.toFixed(3)}°, Yaw: ${cry.toFixed(3)}°, Roll: ${crz.toFixed(3)}°`
      this.animationTimeLogs.textContent = this.animationsPlayer.getCurrentTime().toFixed(3)


      /* glTF Skinning matrix - TODO */


      this.scene.geoNodes = [...proceduralModelsList]
      this.scene.lights = this.state.drawLights ? [...globalLightsList] : []
      this.renderer.render(this.scene, this.camera, this.lights())

      /* Draw axes */
      if (this.state.axesShown) { this.axes.draw(this.camera) }
    }
  }

  lights() {
    let lights = this.state.lightsList
    return { lights, ambientalColor: this.state.addAmbientLightColor }
  }

  rotateGltfModel(nodes, r) {
    let rotationQuaternion = quat.create()
    quat.fromEuler(rotationQuaternion, ...r)

    for (let node of nodes) {
      if (node.children) { this.rotateGltfModel(node.children, r) }
      if (node.mesh) {
        quat.multiply(node.rotation, rotationQuaternion, node.rotation)
        quat.normalize(node.rotation, node.rotation)
        node.updateMatrix()
      }
    }
  }

  async rotateGeoModels(models, r) {
    let rotationQuaternion = quat.create()
    quat.fromEuler(rotationQuaternion, ...r)

    for (let geo of models) {
      const rotation = quat.create()
      quat.multiply(rotation, rotationQuaternion, getPositionNormalised(geo.geometry.rotation))
      quat.normalize(rotation, rotation)
      geo.geometry.rotation = getPositionString(rotation)
      await Geo.updateGeoBuffers(this.gl, this.renderer.programs.geo, geo)
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