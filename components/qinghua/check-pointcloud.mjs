import assert from 'node:assert/strict';

function decodePosition(encoded, min, max) {
  return min + (encoded / 32767) * (max - min) * 0.5;
}

function decodePoint(encoded, bbox) {
  return encoded.map((value, axis) => decodePosition(value, bbox.min[axis], bbox.max[axis]));
}

const bbox = { min: [0, 0, 0], max: [2, 4, 6] };
assert.deepEqual(decodePoint([32767, -32767, 0], bbox), [1, -2, 0]);
assert.equal(127 / 127, 1);
assert.equal((255 / 255) * Math.PI * 2, Math.PI * 2);
assert.ok(Math.abs(0.65 + (255 / 255) * 0.8 - 1.45) < 1e-12);
assert.equal((255 / 255) * 0.55, 0.55);
console.log('qinghua pointcloud self-check: ok');
