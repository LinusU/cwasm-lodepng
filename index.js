/* global WebAssembly */

const fs = require('fs')
const path = require('path')

const ImageData = require('@canvas/image-data')

const code = fs.readFileSync(path.join(__dirname, 'lodepng.wasm'))
const wasmModule = new WebAssembly.Module(code)
const instance = new WebAssembly.Instance(wasmModule)

exports.decode = function (input) {
  // Allocate memory to hand over the input data to WASM
  const inputPointer = instance.exports.malloc(input.byteLength)
  const targetView = new Uint8Array(instance.exports.memory.buffer, inputPointer, input.byteLength)

  // Copy input data into WASM readable memory
  targetView.set(input)

  // Allocate metadata (outputPointer, width, and height)
  const metadataPointer = instance.exports.malloc(12)

  // Decode input data
  const error = instance.exports.lodepng_decode32(metadataPointer, metadataPointer + 4, metadataPointer + 8, inputPointer, input.byteLength)

  // Free the input data in WASM land
  instance.exports.free(inputPointer)

  // Guard return value for NULL pointer
  if (error !== 0) {
    instance.exports.free(metadataPointer)
    throw new Error('Failed to decode png image')
  }

  // Read returned metadata
  const metadata = new Uint32Array(instance.exports.memory.buffer, metadataPointer, 3)
  const [outputPointer, width, height] = metadata

  // Free the metadata in WASM land
  instance.exports.free(metadataPointer)

  // Create an empty buffer for the resulting data
  const outputSize = (width * height * 4)
  const output = new Uint8ClampedArray(outputSize)

  // Copy decoded data from WASM memory to JS
  output.set(new Uint8Array(instance.exports.memory.buffer, outputPointer, outputSize))

  // Free WASM copy of decoded data
  instance.exports.free(outputPointer)

  // Return decoded image as raw data
  return new ImageData(output, width, height)
}

exports.encode = function (input) {
  // Allocate memory to hand over the input data to WASM
  const inputPointer = instance.exports.malloc(input.data.byteLength)
  const targetView = new Uint8Array(instance.exports.memory.buffer, inputPointer, input.data.byteLength)

  // Copy input data into WASM readable memory
  targetView.set(input.data)

  // Allocate metadata (outputPointer, outputSize)
  const metadataPointer = instance.exports.malloc(8)

  // Encode input data
  const error = instance.exports.lodepng_encode32(metadataPointer, metadataPointer + 4, inputPointer, input.width, input.height)

  // Free the input data in WASM land
  instance.exports.free(inputPointer)

  // Guard return value for NULL pointer
  if (error !== 0) {
    instance.exports.free(metadataPointer)
    throw new Error('Failed to encode png image')
  }

  // Read returned metadata
  const metadata = new Uint32Array(instance.exports.memory.buffer, metadataPointer, 2)
  const [outputPointer, outputSize] = metadata

  // Free the metadata in WASM land
  instance.exports.free(metadataPointer)

  // Create an empty buffer for the resulting data
  const output = new Uint8Array(outputSize)

  // Copy encoded data from WASM memory to JS
  output.set(new Uint8Array(instance.exports.memory.buffer, outputPointer, outputSize))

  // Free WASM copy of encoded data
  instance.exports.free(outputPointer)

  // Return encoded image as raw data
  return output
}
