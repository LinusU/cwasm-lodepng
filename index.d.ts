import ImageData = require('@canvas/image-data')

interface ImageLike {
  width: number
  height: number
  data: Buffer | Int8Array | Uint8Array | Uint8ClampedArray
}

/**
 * @param source - The PNG data
 * @returns Decoded width, height and pixel data
 */
export function decode (source: Uint8Array): ImageData

/**
 * @param source - The image data
 * @returns Encoded data
 */
export function encode (source: ImageLike): Uint8Array
