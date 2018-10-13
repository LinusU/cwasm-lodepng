# LodePNG

PNG decoding for Node.js, using [LodePNG][LodePNG] compiled to [WebAssembly][WebAssembly].

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
```

## API

### `decode(source: Uint8Array): ImageData`

Decodes raw PNG data into an [`ImageData`][ImageData] object.

[ImageData]: https://developer.mozilla.org/en-US/docs/Web/API/ImageData
[LodePNG]: https://lodev.org/lodepng/
[WebAssembly]: https://webassembly.org
