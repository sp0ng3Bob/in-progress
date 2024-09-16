import glMatrix from "glMatrix"

const vec3 = glMatrix.vec3
const mat4 = glMatrix.mat4
const quat = glMatrix.quat

export class Controls {

  constructor() {
    this.zoomFactor = Math.PI / 180
    this.isDragging = false
    this.startPosition = { x: 0, y: 0 }

    //mobile shiet
    this.initialPinchDistance = null
    this.lastPinchDistance = null
    this.lastTapTime = 0
    this.doubleTapZoomOutFactor = 1.5
    this.onTouchDevice = window.matchMedia("(pointer: coarse)").matches

    this.rotationQuat = quat.create() // Initialize a quaternion for cameras rotation
    this.positionVec = vec3.create()
    this.orbitCenter = vec3.create()

    this.phi = Math.PI / 2 //0 to Math.PI -- colatitude: 0 = north -> PI = south
    this.theta = Math.PI //to 2*Math.PI -- longitude: around the equator
    this.phiIncrement = 0 //.01
    this.thetaIncrement = 0.5 //1

    this.camera = undefined
  }

  updateCamera(camera) {
    this.camera = camera
  }

  setOrbitCenter(center) {
    vec3.copy(this.orbitCenter, center)
  }

  calculateCameraDirection() {
    // Calculate the direction vector
    /*const directionVector = {
      x: this.orbitCenter[0] - this.camera.translation[0],
      y: this.orbitCenter[1] - this.camera.translation[1],
      z: this.orbitCenter[2] - this.camera.translation[2]
    }

    // Calculate the magnitude of the direction vector
    const magnitude = Math.sqrt(
      directionVector.x * directionVector.x +
      directionVector.y * directionVector.y +
      directionVector.z * directionVector.z
    )

    // Normalize the direction vector
    return {
      x: directionVector.x / magnitude,
      y: directionVector.y / magnitude,
      z: directionVector.z / magnitude
    }*/

    // Calculate the direction vector
    const direction = vec3.create()
    vec3.subtract(direction, this.orbitCenter, this.camera.translation)

    // Normalize the direction vector
    vec3.normalize(direction, direction)
    return direction
  }

  zoomOut() {
    const zoomSpeed = 0.1 // Adjust the zoom speed as needed
    const direction = this.calculateCameraDirection()

    const sign = this.camera.translation[2] < 0 ? -1 : 1
    this.camera.translation[0] += direction[0] * zoomSpeed * this.zoomFactor * sign
    this.camera.translation[1] += direction[1] * zoomSpeed * this.zoomFactor * sign
    this.camera.translation[2] += direction[2] * zoomSpeed * this.zoomFactor * sign

    this.camera.updateMatrix()
  }

  onDragStart(e) {
    if (this.onTouchDevice && e?.touches?.length !== 1) return

    const currentTime = new Date().getTime()
    const tapGap = currentTime - this.lastTapTime

    if (tapGap > 0 && tapGap < 300) {
      this.zoomOut()
      return //???
    }

    this.lastTapTime = currentTime

    if (e.button === 0) { // Left click
      this.isDragging = true
    } else if (e.button === 2) { // Right click
      this.isRightDragging = true
      e.preventDefault()
    }

    const x = this.onTouchDevice ? e.touches[0].clientX : e.clientX
    const y = this.onTouchDevice ? e.touches[0].clientY : e.clientY
    this.startPosition = { x, y }

    // Reset the rotation quaternion when dragging starts
    quat.identity(this.rotationQuat)
  }

  onDrag(e) {
    if (this.onTouchDevice && e?.touches?.length !== 1) {
      //e.preventDefault()
      this.processScrollWheel(e)
    } else {
      const dx = (this.onTouchDevice ? e.touches[0].clientX : e.clientX) - this.startPosition.x
      const dy = (this.onTouchDevice ? e.touches[0].clientY : e.clientY) - this.startPosition.y

      if (this.isDragging) {
        this.rotate(e, dx, dy)
      } else if (this.isRightDragging) {
        this.pan(e, -dx, -dy)
      }

      const x = this.onTouchDevice ? e.touches[0].clientX : e.clientX
      const y = this.onTouchDevice ? e.touches[0].clientY : e.clientY
      this.startPosition = { x, y }
    }
  }

  onDragEnd() {
    this.isDragging = false
    this.isRightDragging = false
    this.initialPinchDistance = null
    this.lastPinchDistance = null
  }

  setZoom(zoom) {
    //this.zoomFactor = Math.PI / 180 * zoom
  }

  //processZoomOnMobile(e)

  processScrollWheel(e) {
    let zoomSpeed = 0.01
    if (e.shiftKey) { zoomSpeed = 0.1 }

    if (this.onTouchDevice && e?.touches?.length === 2) {
      // Process touch pinch
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]

      const dx = touch2.clientX - touch1.clientX
      const dy = touch2.clientY - touch1.clientY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (this.initialPinchDistance) {
        const pinchDelta = distance - this.lastPinchDistance

        if (Math.abs(this.camera.translation[2] + pinchDelta * zoomSpeed * this.zoomFactor) > 0.01) {
          this.camera.translation[2] += pinchDelta * zoomSpeed * this.zoomFactor
          this.camera.updateMatrix()
        }

        this.lastPinchDistance = distance
      } else {
        this.initialPinchDistance = distance
        this.lastPinchDistance = distance
      }
    } else {
      const direction = this.calculateCameraDirection()

      const sign = this.camera.translation[2] < 0 ? -1 : 1
      this.camera.translation[0] += direction[0] * zoomSpeed * this.zoomFactor * e.deltaY * sign
      this.camera.translation[1] += direction[1] * zoomSpeed * this.zoomFactor * e.deltaY * sign
      this.camera.translation[2] += direction[2] * zoomSpeed * this.zoomFactor * e.deltaY * sign

      this.camera.updateMatrix()
    }

  }

  /* KEYBOARD INPUTS */
  processKeyboardInput(e) {
    switch (e.code) {
      case "KeyA":
        this.camera.translation[0] += (e.shiftKey ? 10 : 1) * this.zoomFactor
        break
      case "KeyD":
        this.camera.translation[0] -= (e.shiftKey ? 10 : 1) * this.zoomFactor
        break
      case "KeyS":
        this.camera.translation[1] -= (e.shiftKey ? 10 : 1) * this.zoomFactor
        break
      case "KeyW":
        this.camera.translation[1] += (e.shiftKey ? 10 : 1) * this.zoomFactor
        break

      //Orbital rotation
      case "ArrowUp": //Rotate camera up
        this.rotateCameraAroundModel((e.shiftKey ? 10 : 1) * -this.zoomFactor, 0)
        break
      case "ArrowDown": //Rotate camera down
        this.rotateCameraAroundModel((e.shiftKey ? 10 : 1) * this.zoomFactor, 0)
        break
      case "ArrowLeft": //Rotate camera left
        this.rotateCameraAroundModel(0, (e.shiftKey ? 10 : 1) * -this.zoomFactor)
        break
      case "ArrowRight": //Rotate camera right
        this.rotateCameraAroundModel(0, (e.shiftKey ? 10 : 1) * this.zoomFactor)
        break
      default:
        return
    }
    this.camera.updateMatrix()
  }

  rotateCameraAroundModel(theta, phi) { //theta == X, phi == Y
    if (!this.camera) return

    const rotationQuatX = quat.create()
    const rotationQuatY = quat.create()
    quat.rotateX(rotationQuatX, rotationQuatX, theta)
    quat.rotateY(rotationQuatY, rotationQuatY, phi)
    const combinedRotation = quat.create()
    quat.mul(combinedRotation, rotationQuatY, rotationQuatX)

    // Calculate the new camera position
    const cameraPosition = vec3.subtract(vec3.create(), this.camera.translation, this.orbitCenter)
    vec3.transformQuat(cameraPosition, cameraPosition, combinedRotation)
    vec3.add(this.camera.translation, this.orbitCenter, cameraPosition)

    // Update camera rotation
    quat.mul(this.camera.rotation, combinedRotation, this.camera.rotation)

    this.camera.updateMatrix()
  }

  /* UTILS */
  rotateCamera(translate) { //more like move camera
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
    this.camera.translation[0] = newX
    this.camera.translation[1] = newY
    this.camera.translation[2] = newZ //* 10

    console.log(this.camera.translation, this.phi, this.theta)

    const eye = this.camera.translation
    //eye[2] *= 3
    //rotate cameras' eye to the looking point
    const vm = mat4.create()
    mat4.lookAt(vm, eye, this.camera.lookingAt, [0, 1, 0])
    //camera.matrix = vm 
    //camera.camera.matrix = vm
    let rotationMatrix = mat4.create()
    mat4.invert(rotationMatrix, vm)
    mat4.transpose(rotationMatrix, rotationMatrix)

    // Convert the rotation matrix to a quaternion
    let quaternion = quat.create()
    quat.fromMat3(quaternion, rotationMatrix)
    //quat.fromMat3(quaternion, vm)
    this.camera.rotation = quaternion

    this.camera.updateMatrix()
  }

  rotate(e, deltaX, deltaY) {
    if (!this.camera) return

    const rotationSpeed = (Math.PI / 180) * (e?.shiftKey ? 3 : 1) * this.zoomFactor
    const rotationQuat = quat.create()
    quat.rotateX(rotationQuat, rotationQuat, deltaY * rotationSpeed) // IS THIS RIGHT, OR AM I MISSING SOMETHING?
    quat.invert(rotationQuat, rotationQuat)
    quat.rotateY(rotationQuat, rotationQuat, -deltaX * rotationSpeed)

    // Rotate around the orbit center
    const cameraPosition = vec3.sub(vec3.create(), this.camera.translation, this.orbitCenter)
    vec3.transformQuat(cameraPosition, cameraPosition, rotationQuat)
    vec3.add(this.camera.translation, this.orbitCenter, cameraPosition)

    // Update camera rotation
    quat.mul(this.camera.rotation, rotationQuat, this.camera.rotation)

    // Update look-at point
    vec3.subtract(cameraPosition, this.orbitCenter, this.camera.translation)
    vec3.normalize(cameraPosition, cameraPosition)
    vec3.scaleAndAdd(this.camera.lookingAt, this.camera.translation, cameraPosition, vec3.length(cameraPosition))

    this.camera.updateMatrix()
  }

  pan(e, deltaX, deltaY) {
    if (!this.camera) return

    const panSpeed = (e.shiftKey ? 2 : 0.5) * this.zoomFactor
    const right = vec3.create()
    const up = vec3.create()

    // Calculate right and up vectors based on camera orientation
    vec3.transformQuat(right, [1, 0, 0], this.camera.rotation)
    vec3.transformQuat(up, [0, 1, 0], this.camera.rotation)

    // Move both camera and orbit center
    vec3.scaleAndAdd(this.camera.translation, this.camera.translation, right, -deltaX * panSpeed)
    vec3.scaleAndAdd(this.camera.translation, this.camera.translation, up, deltaY * panSpeed)
    vec3.scaleAndAdd(this.orbitCenter, this.orbitCenter, right, -deltaX * panSpeed)
    vec3.scaleAndAdd(this.orbitCenter, this.orbitCenter, up, deltaY * panSpeed)

    this.camera.updateMatrix()
  }

  quatToEuler(quat) { //https://stackoverflow.com/questions/15955358/javascript-gl-matrix-lib-how-to-get-euler-angles-from-quat-and-quat-from-angles
    const w = quat[3]
    const x = quat[0]
    const y = quat[1]
    const z = quat[2]

    const ysqr = y * y

    // roll (x-axis rotation)
    const t0 = 2.0 * (w * x + y * z)
    const t1 = 1.0 - 2.0 * (x * x + ysqr)
    const roll = Math.atan2(t0, t1)

    // pitch (y-axis rotation)
    let t2 = 2.0 * (w * y - z * x)
    t2 = t2 > 1.0 ? 1.0 : t2
    t2 = t2 < -1.0 ? -1.0 : t2
    const pitch = Math.asin(t2)

    // yaw (z-axis rotation)
    const t3 = 2.0 * (w * z + x * y)
    const t4 = 1.0 - 2.0 * (ysqr + z * z)
    const yaw = Math.atan2(t3, t4)

    const euler = [roll, pitch, yaw]

    // Convert to degrees
    return euler.map(angle => angle * (180 / Math.PI))
    /*const w = quat[3]
    const x = quat[0]
    const y = quat[1]
    const z = quat[2]

    const wx = w * x,
      wy = w * y,
      wz = w * z
    const xx = x * x,
      xy = x * y,
      xz = x * z
    const yy = y * y,
      yz = y * z,
      zz = z * z

    const xyz = [
      -Math.atan2(2 * (yz - wx), 1 - 2 * (xx + yy)),
      Math.asin(2 * (xz + wy)),
      -Math.atan2(2 * (xy - wz), 1 - 2 * (yy + zz)),
    ]
    return xyz.map((x) => (x * 180) / Math.PI)*/
  }
}