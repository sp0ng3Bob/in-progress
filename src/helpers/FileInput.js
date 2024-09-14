export class FileInput {
  constructor(fileInputDom) {
    this.fileInput = fileInputDom
  }

  // Function to trigger the file selection dialog
  openFileDialog() {
    this.fileInput.click()  // Trigger file input dialog
  }

  // Helper function to get the file extension
  getFileExtension(fileName) {
    return fileName.split(".").pop().toLowerCase()
  }

  // Function to read file as text (for .gltf)
  async readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)  // Resolve with file content (text)
      reader.onerror = () => reject(reader.error)   // Reject on error
      reader.readAsText(file)  // Read the file as text
    })
  }

  // Function to read the file as Data URI (for images)
  async readFileAsDataUri(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)  // Resolve with Data URI (base64 string)
      reader.onerror = () => reject(reader.error)   // Reject on error
      reader.readAsDataURL(file)  // Read the file as Data URI (base64 string)
    })
  }

  // Function to read file as ArrayBuffer (for .glb)
  async readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)  // Resolve with ArrayBuffer
      reader.onerror = () => reject(reader.error)   // Reject on error
      reader.readAsArrayBuffer(file)  // Read the file as ArrayBuffer
    })
  }

  async loadImage(base64) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = (error) => reject(error);
      image.src = base64;
    });
  }

  // Function to handle file selection, returning a promise with the file content
  async selectFile() {
    return new Promise((resolve, reject) => {
      // Open the file dialog and return the file content once selected
      this.fileInput.onchange = async (event) => {
        const file = event.target.files[0]  // Get the selected file
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
            resolve(fileData)  // Return the file content
          } catch (error) {
            reject(error)  // Handle file reading error
          }
        }
      }
    })
  }
}
