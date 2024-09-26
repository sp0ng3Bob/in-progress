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
    this.doubleTapZoomFactor = 1.5
    this.onTouchDevice = window.matchMedia("(pointer: coarse)").matches

    this.orbitCenter = vec3.create()

    this.camera = undefined
  }

  updateCamera(camera) {
    this.camera = camera
    this.updateOrbitCenter(camera.lookingAt)
  }

  updateOrbitCenter(center) {
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
    vec3.subtract(direction, this.camera.lookingAt, this.camera.translation)

    // Normalize the direction vector
    vec3.normalize(direction, direction)
    return direction
  }

  /*zoomOut() {
    const zoomSpeed = 0.1
    const direction = this.calculateCameraDirection()

    const sign = this.camera.translation[2] < 0 ? -1 : 1
    this.camera.translation[0] += direction[0] * zoomSpeed * this.zoomFactor * sign
    this.camera.translation[1] += direction[1] * zoomSpeed * this.zoomFactor * sign
    this.camera.translation[2] += direction[2] * zoomSpeed * this.zoomFactor * sign

    this.camera.updateMatrix()
  }*/

  onDragStart(e) {
    if (this.onTouchDevice && e?.touches?.length !== 1) return

    const currentTime = new Date().getTime()
    const tapGap = currentTime - this.lastTapTime

    /*if (tapGap > 0 && tapGap < 300) {
      this.zoomOut()
      return //???
    }*/

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
    this.zoomFactor = Math.PI / 180 * zoom
  }

  processScrollWheel(e) {
    e.preventDefault()
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

        /*if (Math.abs(this.camera.translation[2] + pinchDelta * zoomSpeed * this.zoomFactor) > 0.01) {
          this.camera.translation[2] += pinchDelta * zoomSpeed * this.zoomFactor
          this.camera.updateMatrix()
        }*/

        this.lastPinchDistance = distance
      } else {
        this.initialPinchDistance = distance
        this.lastPinchDistance = distance
      }
    } else {
      const direction = this.calculateCameraDirection()
      const signX = this.camera.translation[0] < 0 ? -1 : 1
      const signY = this.camera.translation[1] < 0 ? -1 : 1
      const signZ = this.camera.translation[2] < 0 ? -1 : 1
      const deltaY = zoomSpeed * this.zoomFactor * e.wheelDeltaY

      this.camera.translation[0] += direction[0] * deltaY //* signX
      this.camera.translation[1] += direction[1] * deltaY //* signY
      this.camera.translation[2] += direction[2] * deltaY //* signZ

      this.camera.updateMatrix()
    }

  }

  /* KEYBOARD INPUTS */
  processKeyboardInput(e) {
    switch (e.code) {
      case "KeyA":
        //this.pan(undefined, 0, (e.shiftKey ? 10 : 1) * this.zoomFactor)
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
        this.rotate(undefined, (e.shiftKey ? 10 : 1) * -this.zoomFactor, 0)
        break
      case "ArrowDown": //Rotate camera down
        this.rotate(undefined, (e.shiftKey ? 10 : 1) * this.zoomFactor, 0)
        break
      case "ArrowLeft": //Rotate camera left
        this.rotate(undefined, 0, (e.shiftKey ? 10 : 1) * -this.zoomFactor)
        break
      case "ArrowRight": //Rotate camera right
        this.rotate(undefined, 0, (e.shiftKey ? 10 : 1) * this.zoomFactor)
        break
      default:
        return
    }
    this.camera.updateMatrix()
  }

  /* UTILS */
  rotate(e, deltaX, deltaY) {
    if (!this.camera) return

    const rotationSpeed = (e?.shiftKey ? 3 : 1) * this.zoomFactor * (Math.PI / 180)
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

    const panSpeed = (e?.shiftKey ? 2 : 0.5) * this.zoomFactor
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
  }
}