interface ImageData {
  width: number
  height: number
  data: Uint8ClampedArray
}

export function decode (source: Uint8Array): ImageData
