import sharp from "sharp";

const gold = "#a38243";
const ink = "#151515";
const logoPath = "public/images/lions-route-logo.jpg";

const vehicles = [
  { input: "minivan-10.webp", output: "minivan-10-professional.webp", left: 194, top: 211, width: 190, height: 52 },
  { input: "minivan-14.webp", output: "minivan-14-professional.webp", left: 118, top: 207, width: 168, height: 48 },
  { input: "suv-trailer.webp", output: "suv-trailer-professional.webp", left: 390, top: 171, width: 128, height: 47 },
  { input: "bus.webp", output: "bus-professional.webp", left: 203, top: 211, width: 220, height: 54 },
];

const extractedLion = await sharp(logoPath)
  .extract({ left: 315, top: 55, width: 420, height: 440 })
  .resize({ width: 44, height: 46, fit: "contain" })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

for (let index = 0; index < extractedLion.data.length; index += 4) {
  const red = extractedLion.data[index];
  const green = extractedLion.data[index + 1];
  const blue = extractedLion.data[index + 2];
  const lightest = Math.min(red, green, blue);
  extractedLion.data[index + 3] = lightest > 245 ? 0 : Math.min(255, (255 - lightest) * 5);
}

const lion = await sharp(extractedLion.data, {
  raw: extractedLion.info,
})
  .png()
  .toBuffer();

function badgeSvg(width, height) {
  const brandSize = width < 180 ? 9 : width < 200 ? 10 : 11;
  const detailSize = width < 180 ? 6.5 : 7.5;
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <text x="50" y="13" fill="${ink}" stroke="#fff" stroke-width="1.8" paint-order="stroke"
        font-family="Arial, sans-serif" font-size="${brandSize}" font-weight="800" letter-spacing=".35">
        LION'S ROUTE
      </text>
      <text x="50" y="24" fill="${gold}" stroke="#fff" stroke-width="1.2" paint-order="stroke"
        font-family="Arial, sans-serif" font-size="${detailSize}" font-weight="800" letter-spacing="1">
        SHUTTLES SA
      </text>
      <path d="M50 ${height - 21} H${width}" stroke="${gold}" stroke-width="2"/>
      <text x="50" y="${height - 10}" fill="${ink}" stroke="#fff" stroke-width="1.2" paint-order="stroke"
        font-family="Arial, sans-serif" font-size="${detailSize}" font-weight="700">
        076 826 9683
      </text>
      <text x="50" y="${height - 1}" fill="${ink}" stroke="#fff" stroke-width="1.2" paint-order="stroke"
        font-family="Arial, sans-serif" font-size="${detailSize}" font-weight="600">
        Mazenoch@gmail.com
      </text>
    </svg>
  `);
}

for (const vehicle of vehicles) {
  const badge = await sharp(badgeSvg(vehicle.width, vehicle.height))
    .composite([{ input: lion, left: 2, top: Math.max(0, Math.floor((vehicle.height - 46) / 2)) }])
    .png()
    .toBuffer();

  await sharp(`public/images/${vehicle.input}`)
    .composite([{ input: badge, left: vehicle.left, top: vehicle.top }])
    .webp({ quality: 92 })
    .toFile(`public/images/${vehicle.output}`);
}

console.log(`Branded ${vehicles.length} fleet images.`);
