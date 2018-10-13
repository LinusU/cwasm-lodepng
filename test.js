/* eslint-env mocha */

const fs = require('fs')
const path = require('path')
const assert = require('assert')

const lodepng = require('./')

function getPixel (img, x, y) {
  return Buffer.from(img.data).readUInt32LE((y * img.width + x) * 4)
}

describe('Decode', () => {
  it('should decode basn3p01', () => {
    const data = fs.readFileSync(path.join(__dirname, 'fixtures/basn3p01.png'))
    const img = lodepng.decode(data)

    assert.equal(img.width, 32)
    assert.equal(img.height, 32)

    assert.equal(getPixel(img, 18, 10), 0xff22ffee)
    assert.equal(getPixel(img, 14, 26), 0xffff6622)
  })
})
