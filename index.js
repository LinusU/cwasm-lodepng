/* global WebAssembly */

const fs = require('fs')
const path = require('path')

const ImageData = require('@canvas/image-data')

const code = fs.readFileSync(path.join(__dirname, 'lodepng.wasm'))
const wasmModule = new WebAssembly.Module(code)
const instance = new WebAssembly.Instance(wasmModule)

exports.decode = function (input) {
  const { width, height, data } = decodeWith(input, instance.exports.lodepng_decode32, 4)
  return new ImageData(data, width, height)
}
exports.decode32 = exports.decode

// Note: decode24 returns { width, height, data: Uint8ClampedArray } with 24-bit RGB pixels (no alpha).
// It is not an ImageData instance and cannot be passed directly to Canvas 2D putImageData().
// Use decode / decode32 for HTML Canvas 2D support.
exports.decode24 = function (input) {
  return decodeWith(input, instance.exports.lodepng_decode24, 3)
}

exports.encode = function (input) {
  return encodeWith(input, instance.exports.lodepng_encode32)
}
exports.encode32 = exports.encode

// Note: encode24 expects 24-bit RGB image data without an alpha channel.
// It is not compatible with Canvas 2D ImageData (which has 4 channels). Use encode / encode32 for Canvas 2D.
exports.encode24 = function (input) {
  return encodeWith(input, instance.exports.lodepng_encode24)
}

/**
 * Internal helper to decode PNG data using a specific WASM decode function.
 *
 * @param {Uint8Array|Buffer} input - Encoded PNG data
 * @param {Function} decodeFn - The WASM decode export (lodepng_decode32 or lodepng_decode24)
 * @param {number} bytesPerPixel - Number of color channels (4 for RGBA, 3 for RGB)
 * @returns {{ width: number, height: number, data: Uint8ClampedArray }} Decoded image metadata and pixel buffer
 */
function decodeWith (input, decodeFn, bytesPerPixel) {
  // Allocate memory to hand over the input data to WASM
  const inputPointer = instance.exports.malloc(input.byteLength)
  const targetView = new Uint8Array(instance.exports.memory.buffer, inputPointer, input.byteLength)

  // Copy input data into WASM readable memory
  targetView.set(input)

  // Allocate metadata (outputPointer, width, and height)
  const metadataPointer = instance.exports.malloc(12)

  // Decode input data
  const error = decodeFn(metadataPointer, metadataPointer + 4, metadataPointer + 8, inputPointer, input.byteLength)

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
  const outputSize = (width * height * bytesPerPixel)
  const output = new Uint8ClampedArray(outputSize)

  // Copy decoded data from WASM memory to JS
  output.set(new Uint8Array(instance.exports.memory.buffer, outputPointer, outputSize))

  // Free WASM copy of decoded data
  instance.exports.free(outputPointer)

  return {
    width: width,
    height: height,
    data: output
  }
}

/**
 * Internal helper to encode raw pixel data using a specific WASM encode function.
 *
 * @param {{ width: number, height: number, data: Uint8Array|Buffer|Uint8ClampedArray|ArrayBuffer }} input - Image object
 * @param {Function} encodeFn - The WASM encode export (lodepng_encode32 or lodepng_encode24)
 * @returns {Uint8Array} Encoded PNG bytes
 */
function encodeWith (input, encodeFn) {
  // Allocate memory to hand over the input data to WASM
  const inputPointer = instance.exports.malloc(input.data.byteLength)
  const targetView = new Uint8Array(instance.exports.memory.buffer, inputPointer, input.data.byteLength)

  // Copy input data into WASM readable memory
  targetView.set(input.data)

  // Allocate metadata (outputPointer, outputSize)
  const metadataPointer = instance.exports.malloc(8)

  // Encode input data
  const error = encodeFn(metadataPointer, metadataPointer + 4, inputPointer, input.width, input.height)

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
