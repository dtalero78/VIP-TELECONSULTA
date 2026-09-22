// Derivación técnica del logo autorizado, sin redibujar la marca.
import sharp from "sharp";
import { writeFile, copyFile } from "node:fs/promises";
const sizes = [32, 180, 192];
for (const size of sizes) {
  const logo = await sharp("public/logo.png")
    .trim()
    .resize({
      width: Math.round(size * 0.88),
      height: Math.round(size * 0.88),
      fit: "inside",
    })
    .png()
    .toBuffer();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: logo, gravity: "centre" }])
    .png()
    .toFile(`public/vip-icon-${size}.png`);
}
const png = await sharp("public/vip-icon-32.png").png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header[6] = 32;
header[7] = 32;
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(png.length, 14);
header.writeUInt32LE(22, 18);
await writeFile("public/favicon.ico", Buffer.concat([header, png]));
// La convención de Next también genera un enlace automático: debe mostrar la misma marca.
await copyFile("public/favicon.ico", "src/app/favicon.ico");
await writeFile("public/favicon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><image width="192" height="192" href="data:image/png;base64,${(await sharp("public/vip-icon-192.png").png().toBuffer()).toString("base64")}" /></svg>`);
