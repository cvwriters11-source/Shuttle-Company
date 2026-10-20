import sharp from "sharp";

const gold = "#a38243";
const ink = "#151515";
const logoPath = "public/images/lions-route-logo.jpg";

async function transparentLion(width, height, opacity = 1) {
  const extracted = await sharp(logoPath)
    .extract({ left: 315, top: 55, width: 420, height: 440 })
    .resize({ width, height, fit: "contain" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let index = 0; index < extracted.data.length; index += 4) {
    const red = extracted.data[index];
    const green = extracted.data[index + 1];
    const blue = extracted.data[index + 2];
    const lightest = Math.min(red, green, blue);
    const alpha = lightest > 245 ? 0 : Math.min(255, (255 - lightest) * 5);
    extracted.data[index + 3] = Math.round(alpha * opacity);
  }

  return sharp(extracted.data, { raw: extracted.info }).png().toBuffer();
}

const tabletLion = await transparentLion(38, 40);
const tabletSign = await sharp(
  Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="136" height="96">
      <rect width="136" height="96" fill="#fff"/>
      <text x="44" y="14" fill="${ink}" font-family="Arial, sans-serif" font-size="7.5" font-weight="800">
        LION'S ROUTE
      </text>
      <text x="44" y="25" fill="${gold}" font-family="Arial, sans-serif" font-size="6.5" font-weight="800" letter-spacing=".7">
        SHUTTLES SA
      </text>
      <path d="M7 44 H129" stroke="${gold}" stroke-width="2"/>
      <text x="68" y="61" text-anchor="middle" fill="${ink}" font-family="Arial, sans-serif" font-size="11" font-weight="700">
        WELCOMES
      </text>
      <text x="68" y="79" text-anchor="middle" fill="${ink}" font-family="Arial, sans-serif" font-size="14" font-weight="800">
        MR PATEL
      </text>
      <text x="68" y="91" text-anchor="middle" fill="${gold}" font-family="Arial, sans-serif" font-size="5.5" font-weight="700">
        PREMIUM • PRIVATE • BESPOKE
      </text>
    </svg>
  `),
)
  .composite([{ input: tabletLion, left: 4, top: 2 }])
  .png()
  .toBuffer();

await sharp("public/images/meet-greet.webp")
  .composite([{ input: tabletSign, left: 641, top: 355 }])
  .webp({ quality: 94 })
  .toFile("public/images/meet-greet-lions-route.webp");

await sharp("public/images/meet-bg.webp")
  .tint(gold)
  .webp({ quality: 90 })
  .toFile("public/images/meet-bg-gold.webp");

const footerLion = await transparentLion(340, 340, 0.34);
await sharp({
  create: { width: 1024, height: 350, channels: 4, background: "#050505" },
})
  .composite([{ input: footerLion, left: 680, top: 5 }])
  .webp({ quality: 90 })
  .toFile("public/images/footer-brand-bg.webp");

console.log("Created branded meet-and-greet and footer assets.");
