/* eslint-env mocha */

'use strict'

const assert = require('assert')
const sizeOf = require('image-size')

const lodepng = require('../')

function testEncode (src) {
  const img = {
    data: src,
    width: 1,
    height: 2
  }

  const data = Buffer.from(lodepng.encode(img))
  const size = sizeOf(data)

  assert.strictEqual(size.width, img.width)
  assert.strictEqual(size.height, img.height)

  assert.strictEqual(data.readUInt32LE(0), 0x474e5089)
  assert.strictEqual(data.readUInt32LE(4), 0x0a1a0a0d)
}

describe('Encode', function () {
  it('should encode from a Buffer', () => {
    const src = Buffer.allocUnsafe(8)

    src.writeUInt32LE(0xff22ffee, 0)
    src.writeUInt32LE(0xffff6622, 4)

    testEncode(src)
  })

  it('should encode from a Uint8ClampedArray', () => {
    const src = new Uint8ClampedArray(8)

    src[0] = 0xff
    src[1] = 0x22
    src[2] = 0xff
    src[3] = 0xee
    src[4] = 0xff
    src[5] = 0xff
    src[6] = 0x66
    src[7] = 0x22

    testEncode(src)
  })

  it('should encode from a Uint8Array', () => {
    const src = new Uint8Array(8)

    src[0] = 0xff
    src[1] = 0x22
    src[2] = 0xff
    src[3] = 0xee
    src[4] = 0xff
    src[5] = 0xff
    src[6] = 0x66
    src[7] = 0x22

    testEncode(src)
  })

  it('should encode from a Int8Array', () => {
    const src = new Int8Array(8)

    src[0] = 0xff
    src[1] = 0x22
    src[2] = 0xff
    src[3] = 0xee
    src[4] = 0xff
    src[5] = 0xff
    src[6] = 0x66
    src[7] = 0x22

    testEncode(src)
  })

  it('should encode from a ArrayBuffer', () => {
    const src = new ArrayBuffer(8)
    const view = new Uint8Array(src)

    view[0] = 0xff
    view[1] = 0x22
    view[2] = 0xff
    view[3] = 0xee
    view[4] = 0xff
    view[5] = 0xff
    view[6] = 0x66
    view[7] = 0x22

    testEncode(src)
  })

  it('should give error on incorrect length', () => {
    const src = Buffer.allocUnsafe(8)

    src.writeUInt32LE(0xff22ffee, 0)
    src.writeUInt32LE(0xffff6622, 4)

    const img = {
      data: src,
      width: 12,
      height: 12
    }

    return assert.throws(() => lodepng.encode(img))
  })
})
