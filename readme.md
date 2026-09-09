# LodePNG

PNG decoding/encoding for Node.js, using [LodePNG][LodePNG] compiled to [WebAssembly][WebAssembly].

[LodePNG]: https://lodev.org/lodepng/
[WebAssembly]: https://webassembly.org

## Installation

```sh
npm install --save @cwasm/lodepng
```

## Usage

```js
const fs = require('fs')
const lodepng = require('@cwasm/lodepng')

const source = fs.readFileSync('image.png')
const image = lodepng.decode(source)

console.log(image)
// { width: 128,
//   height: 128,
//   data:
//    Uint8ClampedArray [ ... ] }

const data = lodepng.encode(image)

console.log(data)
// Uint8Array [ 137, 80, 78, 71, ... ]
```

## API

### `decode(source)`

- `source` ([`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), required) - The PNG data
- returns [`ImageData`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) - Decoded width, height and 32-bit RGBA pixel data

Decodes PNG data to 32-bit RGBA ImageData (compatible with Canvas 2D).

### `decode32(source)`

- `source` ([`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), required)
- returns [`ImageData`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData)

### `decode24(source)`

- `source` ([`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), required) - The PNG data
- returns `RGBImageData` - Decoded width, height and 24-bit RGB pixel data

Decodes PNG data to 24-bit RGB (no alpha channel).

Note: Not compatible with HTML Canvas 2D (`ctx.putImageData`), which
strictly requires 32-bit RGBA `ImageData`. Use `decode` / `decode32` for Canvas.

### `encode(source)`

- `source` (`ImageLike`, required) - The image data (compatible with Canvas 2D ImageData)
- returns [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) - Encoded data

Encodes 32-bit RGBA image data to PNG.

### `encode32(source)`

- `source` (`ImageLike`, required)
- returns [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)

### `encode24(source)`

- `source` (`ImageLike`, required) - The 24-bit RGB image data
- returns [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) - Encoded data

Encodes 24-bit RGB image data to PNG.

Note: Not compatible with HTML Canvas 2D `ImageData`, which is 32-bit RGBA.
Use `encode` / `encode32` for Canvas 2D ImageData.
