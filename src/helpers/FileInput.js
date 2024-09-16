export class FileInput {
  constructor(fileInputDom) {
    this.fileInput = fileInputDom
  }

  openFileDialog() {
    this.fileInput.click()
  }

  getFileExtension(fileName) {
    return fileName.split(".").pop().toLowerCase()
  }

  // Function to read file as text (for .gltf)
  async readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(reader.error)
      reader.readAsText(file)
    })
  }

  // Function to read the file as Data URI (for images)
  async readFileAsDataUri(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
  }

  // Function to read file as ArrayBuffer (for .glb)
  async readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(file)
    })
  }

  async loadImage(base64) {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = (error) => reject(error)
      image.src = base64
    })
  }

  async selectFile() {
    return new Promise((resolve, reject) => {
      this.fileInput.onchange = async (event) => {

        const file = event.target.files[0]

        if (file) {
          const fileExtension = this.getFileExtension(file.name)
          let fileData = { file, data: undefined, type: fileExtension }

          try {
            if (fileExtension === "gltf") {
              fileData.data = await this.readFileAsText(file)
            } else if (fileExtension === "glb") {
              fileData.data = await this.readFileAsArrayBuffer(file)
            } else if (["png", "jpg", "jpeg"].includes(fileExtension)) {
              const base64 = await this.readFileAsDataUri(file)
              const image = await this.loadImage(base64)
              await image.decode()
              fileData.data = image
            }
            resolve(fileData)
          } catch (error) {
            reject(error)
          }
        }
      }
    })
  }
}
