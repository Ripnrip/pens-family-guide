// Regenerates site/assets/og-image.png (1200x630) from the shared logo
// public/assets/pens-logo.svg + site/assets/pip.svg. Run after swapping in the official logo:
//   NODE_PATH=/path/with/sharp/node_modules node site/_build/make-images.cjs
// Needs the `sharp` package and the Fredoka + Nunito fonts installed for text rendering.
const sharp = require('sharp');
const fs = require('fs'), path = require('path');
const A = path.join(__dirname, '..', 'assets');
const LOGO = path.join(__dirname, '..', '..', 'public', 'assets', 'pens-logo.svg');
const b64 = f => 'data:image/svg+xml;base64,' + fs.readFileSync(f === 'pens-logo.svg' ? LOGO : path.join(A, f)).toString('base64');
const eeg = 'M0 560 H180 L196 560 L208 540 L220 578 L232 560 H420 L436 560 L452 512 L472 606 L490 522 L506 586 L520 560 H760 L776 548 L790 574 L804 560 H1200';
const og = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#F4F6F7"/>
  <rect x="830" y="70" width="320" height="420" rx="48" fill="#E8F4F6"/>
  <path d="${eeg}" fill="none" stroke="#0F6E74" stroke-opacity=".3" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <image x="80" y="72" width="96" height="96" href="${b64('pens-logo.svg')}" xlink:href="${b64('pens-logo.svg')}"/>
  <text x="196" y="118" font-family="Fredoka" font-weight="700" font-size="44" fill="#1D2B36">PENS</text>
  <text x="197" y="154" font-family="Nunito" font-weight="700" font-size="22" fill="#44535E">Pediatric Epilepsy &amp; Neurology Specialists</text>
  <text font-family="Fredoka" font-weight="700" font-size="76" fill="#1D2B36"><tspan x="80" y="290">PENS, now in</tspan><tspan x="80" y="380" fill="#0F6E74">ChatGPT</tspan><tspan fill="#1D2B36" xml:space="preserve"> and </tspan><tspan fill="#0F6E74">Claude</tspan></text>
  <text x="80" y="452" font-family="Nunito" font-weight="700" font-size="27" fill="#44535E">Answers for Tampa Bay families · English y Español</text>
  <rect x="80" y="486" width="148" height="40" rx="20" fill="#E8F4F6" stroke="#0F6E74" stroke-width="2"/>
  <text x="154" y="513" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="20" fill="#0F6E74">Preview</text>
  <image x="845" y="110" width="290" height="319" href="${b64('pip.svg')}" xlink:href="${b64('pip.svg')}"/>
</svg>`;
(async () => {
  await sharp(Buffer.from(og), { density: 72 }).resize(1200, 630).png({ compressionLevel: 9, palette: true }).toFile(path.join(A, 'og-image.png'));
  console.log('ok');
})();
