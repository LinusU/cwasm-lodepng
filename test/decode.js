/* eslint-env mocha */

'use strict'

const ImageData = require('@canvas/image-data')
const fs = require('fs')
const path = require('path')
const assert = require('assert')

const lodepng = require('../')

function getPixel (img, x, y) {
  return Buffer.from(img.data).readUInt32LE((y * img.width + x) * 4)
}

describe('Decode', () => {
  it('should decode "basn3p01.png"', () => {
    const data = fs.readFileSync(path.join(__dirname, 'basn3p01.png'))
    const img = lodepng.decode(data)

    assert(img instanceof ImageData)
    assert(img.data instanceof Uint8ClampedArray)

    assert.strictEqual(img.width, 32)
    assert.strictEqual(img.height, 32)

    assert.strictEqual(getPixel(img, 18, 10), 0xff22ffee)
    assert.strictEqual(getPixel(img, 14, 26), 0xffff6622)
  })

  it('should decode "clock.png', () => {
    const data = fs.readFileSync(path.join(__dirname, 'clock.png'))
    const img = lodepng.decode(data)

    assert(img instanceof ImageData)
    assert(img.data instanceof Uint8ClampedArray)

    assert.strictEqual(img.width, 320)
    assert.strictEqual(img.height, 320)

    assert.strictEqual(getPixel(img, 57, 57), 0xffa25f32)
    assert.strictEqual(getPixel(img, 225, 103), 0xff0000d4)
  })

  it('should decode24 "clock.png"', () => {
    const data = fs.readFileSync(path.join(__dirname, 'clock.png'))
    const img32 = lodepng.decode(data)
    const img24 = lodepng.decode24(data)

    assert(img24.data instanceof Uint8ClampedArray)
    assert.strictEqual(img24.width, 320)
    assert.strictEqual(img24.height, 320)
    assert.strictEqual(img24.data.length, 320 * 320 * 3)

    // Check RGB values match img32
    for (let i = 0; i < 320 * 320; i++) {
      assert.strictEqual(img24.data[i * 3], img32.data[i * 4])
      assert.strictEqual(img24.data[i * 3 + 1], img32.data[i * 4 + 1])
      assert.strictEqual(img24.data[i * 3 + 2], img32.data[i * 4 + 2])
    }
  })
})
