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
- returns [`ImageData`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) - Decoded width, height and pixel data

### `encode(source)`

- `source` (`ImageLike`, required) - The image data
- returns [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) - Encoded data
