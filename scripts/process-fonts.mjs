import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import wawoff2 from 'wawoff2';

const require = createRequire(import.meta.url);
const fontkit = require('fontkit');

const SOURCE_DIR = path.join(process.cwd(), 'public-fonts');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'tstatic');
const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const MANIFEST_FILE = path.join(DATA_DIR, 'fonts-manifest.json');

if (!fs.existsSync(SOURCE_DIR)) {
  fs.mkdirSync(SOURCE_DIR, { recursive: true });
}
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Clean filename for URL safety
function sanitizeFilename(name) {
  return name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_.]/g, '');
}

async function processAllFonts() {
  console.log('Processing custom fonts from /public-fonts ...');

  const files = fs.readdirSync(SOURCE_DIR).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.ttf', '.otf', '.woff', '.woff2'].includes(ext);
  });

  if (files.length === 0) {
    console.log('No font files found in /public-fonts. Manifest initialized empty.');
    fs.writeFileSync(MANIFEST_FILE, JSON.stringify({ fonts: [] }, null, 2));
    return;
  }

  const fontsMap = new Map();
  const seenOutputFiles = new Set();

  for (const file of files) {
    const filePath = path.join(SOURCE_DIR, file);
    const ext = path.extname(file).toLowerCase();
    const baseName = path.basename(file, ext);
    const buffer = fs.readFileSync(filePath);

    let font;
    try {
      font = fontkit.openSync(filePath);
    } catch (err) {
      console.warn(`Could not read metadata for ${file}, skipping.`, err.message);
      continue;
    }

    const familyName = font.familyName || baseName.split('-')[0].trim();
    const style = (font.italic || font.subfamilyName?.toLowerCase().includes('italic') || file.toLowerCase().includes('italic')) ? 'italic' : 'normal';
    
    // Variable font detection
    const isVariable = !!(font.variationAxes && Object.keys(font.variationAxes).length > 0) || file.toLowerCase().includes('variable');
    
    let weightMin = 400;
    let weightMax = 400;

    if (isVariable && font.variationAxes?.wght) {
      weightMin = font.variationAxes.wght.min;
      weightMax = font.variationAxes.wght.max;
    } else {
      const parsedWeight = font['OS/2']?.usWeightClass || 400;
      weightMin = parsedWeight;
      weightMax = parsedWeight;
    }

    // Convert TTF/OTF to WOFF2 if not already WOFF2
    let woff2Buffer;
    const outputFilename = `${sanitizeFilename(baseName)}.woff2`;
    const outputPath = path.join(OUTPUT_DIR, outputFilename);

    if (seenOutputFiles.has(outputFilename)) {
      console.log(`Skipping ${file}: output ${outputFilename} already produced by another file.`);
      continue;
    }
    seenOutputFiles.add(outputFilename);

    if (ext === '.woff2') {
      woff2Buffer = buffer;
    } else {
      try {
        woff2Buffer = await wawoff2.compress(buffer);
      } catch (err) {
        console.warn(`Could not compress ${file} to woff2. Copying raw file.`);
        fs.copyFileSync(filePath, path.join(OUTPUT_DIR, sanitizeFilename(file)));
      }
    }

    if (woff2Buffer) {
      fs.writeFileSync(outputPath, woff2Buffer);
    }

    const fontItem = {
      file: outputFilename,
      originalFile: file,
      style,
      isVariable,
      weight: isVariable ? `${weightMin} ${weightMax}` : `${weightMin}`,
      weightMin,
      weightMax,
      format: 'woff2',
      postscriptName: font.postscriptName || baseName
    };

    if (!fontsMap.has(familyName)) {
      fontsMap.set(familyName, {
        family: familyName,
        isVariable: false,
        files: []
      });
    }

    const group = fontsMap.get(familyName);
    if (isVariable) group.isVariable = true;
    group.files.push(fontItem);
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    fonts: Array.from(fontsMap.values())
  };

  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
  console.log(`Successfully processed ${files.length} fonts into /public/tstatic/`);
}

processAllFonts();