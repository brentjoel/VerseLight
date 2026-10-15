// Uses Next.js's existing Sharp installation; adds no dependency.
import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const source = await readFile(new URL('../app/icon.svg', import.meta.url));
await mkdir(new URL('../public/', import.meta.url), { recursive: true });
for (const [size, path] of [[180, '../app/apple-icon.png'], [192, '../public/icon-192.png'], [512, '../public/icon-512.png']]) {
  await writeFile(new URL(path, import.meta.url), await sharp(source).resize(size, size).png().toBuffer());
}
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(size => sharp(source).resize(size, size).png().toBuffer()));
const header = Buffer.alloc(6 + images.length * 16);
header.writeUInt16LE(1, 2); header.writeUInt16LE(images.length, 4);
let offset = header.length;
images.forEach((png, index) => {
  const entry = 6 + index * 16;
  header[entry] = sizes[index]; header[entry + 1] = sizes[index];
  header.writeUInt16LE(1, entry + 4); header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(png.length, entry + 8); header.writeUInt32LE(offset, entry + 12);
  offset += png.length;
});
await writeFile(new URL('../app/favicon.ico', import.meta.url), Buffer.concat([header, ...images]));
