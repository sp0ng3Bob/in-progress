import glMatrix from "glMatrix"

const vec3 = glMatrix.vec3
const mat4 = glMatrix.mat4
const quat = glMatrix.quat

export class Controls {

  constructor() {
    this.zoomFactor = Math.PI / 100
    this.isDragging = false
    this.startPosition = { x: 0, y: 0 }
    this.onTouchDevice = window.matchMedia("(pointer: coarse)").matches
    this.rotationQuat = quat.create() // Initialize a quaternion for rotation

    this.phi = Math.PI / 2 //0 to Math.PI -- colatitude: 0 = north -> PI = south
    this.theta = Math.PI //to 2*Math.PI -- longitude: around the equator
    this.phiIncrement = 0 //.01
    this.thetaIncrement = 0.5 //1
  }

  onDragStart(e) {
    if (this.onTouchDevice && e.touches.length !== 1) return

    this.isDragging = true
    const x = this.onTouchDevice ? e.touches[0].clientX : e.clientX
    const y = this.onTouchDevice ? e.touches[0].clientY : e.clientY
    this.startPosition = { x, y }

    // Reset the rotation quaternion when dragging starts
    quat.identity(this.rotationQuat)
  }

  onDrag(e, camera) {
    if (this.onTouchDevice && e.touches.length !== 1) return

    if (this.isDragging) {
      const dx = (this.onTouchDevice ? e.touches[0].clientX : e.clientX) - this.startPosition.x
      const dy = (this.onTouchDevice ? e.touches[0].clientY : e.clientY) - this.startPosition.y

      const x = this.onTouchDevice ? e.touches[0].clientX : e.clientX
      const y = this.onTouchDevice ? e.touches[0].clientY : e.clientY

      // Compute a rotation quaternion based on mouse movement
      quat.rotateY(this.rotationQuat, this.rotationQuat, -dy * this.zoomFactor * 0.01)
      quat.rotateX(this.rotationQuat, this.rotationQuat, -dx * this.zoomFactor * 0.01)

      // Apply the rotation to the camera's quaternion
      quat.multiply(camera.rotation, this.rotationQuat, camera.rotation)
      quat.normalize(camera.rotation, camera.rotation)

      // Update camera matrix
      camera.updateMatrix()

      this.startPosition = { x, y }
    }
  }

  onDragEnd() {
    this.isDragging = false
  }

  setZoom(zoom) {
    this.zoomFactor = zoom
  }

  processScrollWheel(e, camera) {
    //e.preventDefault()
    //console.log()
    let zoomSpeed = 0.01
    if (e.shiftKey) { zoomSpeed = 0.1 }
    if (camera.translation[2] + e.deltaY * zoomSpeed * this.zoomFactor > 0.03) {
      camera.translation[2] += e.deltaY * zoomSpeed * this.zoomFactor //e.deltaY * this.zoomFactor
      camera.updateMatrix()
    }
  }

  /* KEYBOARD INPUTS */
  processKeyboardInput(e, camera) {
    switch (e.code) {
      //Move camera
      case "KeyA": //left
        camera.translation[0] -= (e.shiftKey ? 10 : 1) * 0.01
        break
      case "KeyD": //right
        camera.translation[0] += (e.shiftKey ? 10 : 1) * 0.01
        break
      case "KeyS": //down
        camera.translation[1] += (e.shiftKey ? 10 : 1) * 0.01
        break
      case "KeyW": //up
        camera.translation[1] -= (e.shiftKey ? 10 : 1) * 0.01
        break

      //Orbital rotation
      case "ArrowUp": //Rotate camera up
        this.rotateCameraAroundModel(camera, (e.shiftKey ? 10 : 1) * -0.01, 0)
        break
      case "ArrowDown": //Rotate camera down
        this.rotateCameraAroundModel(camera, (e.shiftKey ? 10 : 1) * 0.01, 0)
        break
      case "ArrowLeft": //Rotate camera left
        this.rotateCameraAroundModel(camera, 0, (e.shiftKey ? 10 : 1) * -0.01)
        break
      case "ArrowRight": //Rotate camera right
        this.rotateCameraAroundModel(camera, 0, (e.shiftKey ? 10 : 1) * 0.01)
        break
      default:
        return
    }
    camera.updateMatrix()
  }

  rotateCameraAroundModel(camera, theta, phi) { //theta == X, phi == Y
    // Calculate the rotation quaternions based on deltaTheta and deltaPhi
    const rotationQuatX = quat.create()
    const rotationQuatY = quat.create()
    quat.rotateX(rotationQuatX, rotationQuatX, theta)
    quat.rotateY(rotationQuatY, rotationQuatY, phi)
    const combinedRotation = quat.create()
    quat.mul(combinedRotation, rotationQuatY, rotationQuatX)

    // Apply the rotation quaternion to the camera's orientation
    quat.mul(camera.rotation, camera.rotation, combinedRotation)

    // Update camera position based on the new orientation
    const distanceFromTarget = vec3.distance(camera.translation, camera.lookingAt)
    const rotatedOffset = vec3.transformQuat(vec3.create(), [0, 0, -distanceFromTarget], combinedRotation)
    vec3.add(camera.translation, camera.lookingAt, rotatedOffset)

    // Update the view-projection matrix
    mat4.lookAt(camera.matrix, camera.translation, camera.lookingAt, [0, 1, 0])
    mat4.multiply(camera.matrix, camera.matrix, camera.camera.matrix)
    // Update camera position and look-at
    //camera.translation = new Float32Array(...cameraPosition)
    //camera.translation = [...cameraPosition]
    //quat.add(camera.rotation, camera.rotation, rotationQuat)
  }

  /* UTILS */
  rotateCamera(camera, translate) { //more like move camera
    /*let rotationQuaternion = quat.create()
    quat.fromEuler(rotationQuaternion, 0, 0.3, 0) 
    quat.multiply(camera.rotation, rotationQuaternion, camera.rotation)
    camera.updateMatrix()*/

    this.phi = (this.phi + this.phiIncrement) % Math.PI
    this.theta = (this.theta + this.thetaIncrement) % Math.PI * 2

    //const newX = camera.lookingAt[0] + camera.translation[0] * Math.sin(this.phi) * Math.cos(this.theta)
    //const newY = camera.lookingAt[1] + camera.translation[1] * Math.sin(this.phi) * Math.sin(this.theta)
    //const newZ = camera.lookingAt[2] + camera.translation[2] * Math.cos(this.phi)
    const newX = 0 + 0.1 * Math.sin(this.phi) * Math.cos(this.theta)
    const newY = 0 + 0.1 * Math.sin(this.phi) * Math.sin(this.theta)
    const newZ = 0 + 0.2 * Math.cos(this.phi)

    //camera.translation = new Float32Array([newX,newY,newZ])
    camera.translation[0] = newX
    camera.translation[1] = newY
    camera.translation[2] = newZ //* 10

    console.log(camera.translation, this.phi, this.theta)

    const eye = camera.translation
    //eye[2] *= 3
    //rotate cameras' eye to the looking point
    const vm = mat4.create()
    mat4.lookAt(vm, eye, camera.lookingAt, [0, 1, 0])
    //camera.matrix = vm 
    //camera.camera.matrix = vm
    let rotationMatrix = mat4.create()
    mat4.invert(rotationMatrix, vm)
    mat4.transpose(rotationMatrix, rotationMatrix)

    // Convert the rotation matrix to a quaternion
    let quaternion = quat.create()
    quat.fromMat3(quaternion, rotationMatrix)
    //quat.fromMat3(quaternion, vm)
    camera.rotation = quaternion

    camera.updateMatrix()
  }
}