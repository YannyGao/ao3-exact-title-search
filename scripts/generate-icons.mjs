import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

const crc32 = (buffer) => {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const name = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
};

const insideRoundedRect = (x, y, size, radius) => {
  const dx = Math.max(radius - x, 0, x - (size - radius - 1));
  const dy = Math.max(radius - y, 0, y - (size - radius - 1));
  return dx * dx + dy * dy <= radius * radius;
};

const createIcon = (size) => {
  const pixels = Buffer.alloc((size * 4 + 1) * size);
  const radius = size * .2;
  const scale = size / 512;

  for (let y = 0; y < size; y += 1) {
    const row = y * (size * 4 + 1);
    pixels[row] = 0;
    for (let x = 0; x < size; x += 1) {
      const offset = row + 1 + x * 4;
      const background = insideRoundedRect(x, y, size, radius);
      const inE = x >= 126 * scale && x <= 386 * scale && (
        (y >= 150 * scale && y <= 204 * scale) ||
        (y >= 280 * scale && y <= 332 * scale) ||
        (y >= 408 * scale && y <= 462 * scale) ||
        (x <= 180 * scale && y >= 150 * scale && y <= 462 * scale)
      );
      const accent = x >= 334 * scale && x <= 392 * scale && y >= 92 * scale && y <= 150 * scale;
      const color = inE ? [255, 255, 255, 255]
        : accent ? [231, 185, 174, 255]
        : background ? [123, 23, 18, 255]
        : [0, 0, 0, 0];
      pixels.set(color, offset);
    }
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(pixels)),
    chunk('IEND', Buffer.alloc(0))
  ]);
};

for (const size of [16, 48, 128, 512]) {
  writeFileSync(new URL(`../extension/assets/icon-${size}.png`, import.meta.url), createIcon(size));
}
