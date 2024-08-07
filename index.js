import { App } from "./glTFViewer.js"

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("#mainCanvas")
  const app = new App(canvas)
  const logs = document.querySelector(".Logs")
  app.init(logs)
  let forAllCameras = true

  // Listeners
  document.addEventListener("resize", app.resize)
  document.addEventListener("keydown", (e) => {
    if (app.freeCamera == app.state.selectedCamera || forAllCameras) {
      app.controls.processKeyboardInput(e, app.camera)
    }
  })
  canvas.addEventListener("wheel", e => {
    if (app.freeCamera == app.state.selectedCamera || forAllCameras) {
      app.controls.processScrollWheel(e, app.camera)
    }
  })
  canvas.addEventListener("mousedown", e => {
    if (app.freeCamera == app.state.selectedCamera || forAllCameras) {
      app.controls.onDragStart(e)
    }
  })
  canvas.addEventListener("mousemove", e => {
    if (app.freeCamera == app.state.selectedCamera || forAllCameras) {
      app.controls.onDrag(e, app.camera)
    }
  })
  canvas.addEventListener("mouseup", e => {
    if (app.freeCamera == app.state.selectedCamera || forAllCameras) {
      app.controls.onDragEnd()
    }
  })
  canvas.addEventListener("touchstart", e => {
    if (app.freeCamera == app.state.selectedCamera || forAllCameras) {
      app.controls.onDragStart(e, app.camera)
    }
  })
  canvas.addEventListener("touchmove", e => {
    if (app.freeCamera == app.state.selectedCamera || forAllCameras) {
      app.controls.onDrag(e, app.camera)
    }
  })
  canvas.addEventListener("touchend", e => {
    if (app.freeCamera == app.state.selectedCamera || forAllCameras) {
      app.controls.onDragEnd()
    }
  })
})