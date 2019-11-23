/* eslint-env mocha */

const fs = require('fs')
const path = require('path')
const assert = require('assert')

const ImageData = require('@canvas/image-data')

const lodepng = require('./')

function getPixel (img, x, y) {
  return Buffer.from(img.data).readUInt32LE((y * img.width + x) * 4).toString(16)
}

describe('Decode', () => {
  it('should decode "basn3p01.png"', () => {
    const data = fs.readFileSync(path.join(__dirname, 'fixtures/basn3p01.png'))
    const img = lodepng.decode(data)

    assert(img instanceof ImageData)

    assert.strictEqual(img.width, 32)
    assert.strictEqual(img.height, 32)

    assert.strictEqual(getPixel(img, 18, 10), 'ff22ffee')
    assert.strictEqual(getPixel(img, 14, 26), 'ffff6622')
  })

  it('should decode "clock.png', () => {
    const data = fs.readFileSync(path.join(__dirname, 'fixtures/clock.png'))
    const img = lodepng.decode(data)

    assert(img instanceof ImageData)

    assert.strictEqual(img.width, 320)
    assert.strictEqual(img.height, 320)

    assert.strictEqual(getPixel(img, 57, 57), 'ffa25f32')
    assert.strictEqual(getPixel(img, 225, 103), 'ff0000d4')
  })
})
