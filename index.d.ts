import ImageData = require('@canvas/image-data')

interface ImageLike {
  width: number
  height: number
  data: Buffer | Int8Array | Uint8Array | Uint8ClampedArray
}

/**
 * 24-bit RGB image data without an alpha channel.
 *
 * Note: Not directly compatible with HTML Canvas 2D (`ctx.putImageData`), which
 * strictly requires 32-bit RGBA `ImageData`. Use `decode` / `decode32` for Canvas.
 */
interface RGBImageData {
  width: number
  height: number
  data: Uint8ClampedArray
}

/**
 * Decodes PNG data to 32-bit RGBA ImageData (compatible with Canvas 2D).
 *
 * @param source - The PNG data
 * @returns Decoded width, height and 32-bit RGBA pixel data
 */
export function decode (source: Uint8Array): ImageData
export function decode32 (source: Uint8Array): ImageData

/**
 * Decodes PNG data to 24-bit RGB (no alpha channel).
 *
 * Note: Not compatible with HTML Canvas 2D (`ctx.putImageData`), which
 * strictly requires 32-bit RGBA `ImageData`. Use `decode` / `decode32` for Canvas.
 *
 * @param source - The PNG data
 * @returns Decoded width, height and 24-bit RGB pixel data
 */
export function decode24 (source: Uint8Array): RGBImageData

/**
 * Encodes 32-bit RGBA image data to PNG.
 *
 * @param source - The image data (compatible with Canvas 2D ImageData)
 * @returns Encoded data
 */
export function encode (source: ImageLike): Uint8Array
export function encode32 (source: ImageLike): Uint8Array

/**
 * Encodes 24-bit RGB image data to PNG.
 *
 * Note: Not compatible with HTML Canvas 2D `ImageData`, which is 32-bit RGBA.
 * Use `encode` / `encode32` for Canvas 2D ImageData.
 *
 * @param source - The 24-bit RGB image data
 * @returns Encoded data
 */
export function encode24 (source: ImageLike): Uint8Array


