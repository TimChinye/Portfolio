import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface FontFileItem {
  file: string;
  originalFile: string;
  style: 'normal' | 'italic';
  isVariable: boolean;
  weight: string;
  weightMin: number;
  weightMax: number;
  format: string;
}

interface FontFamilyManifest {
  family: string;
  isVariable: boolean;
  files: FontFileItem[];
}

interface Manifest {
  generatedAt: string;
  fonts: FontFamilyManifest[];
}

const VALID_FONT_DISPLAYS = new Set(['auto', 'block', 'swap', 'fallback', 'optional']);
const VALID_AXES = new Set(['ital', 'wght']);

function getManifest(): Manifest {
  const manifestPath = path.join(process.cwd(), 'src', 'data', 'fonts-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    return { generatedAt: '', fonts: [] };
  }
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

interface RequestedVariant {
  ital?: 0 | 1;
  wght?: { min: number; max: number };
}

type ParseResult = {
  variants?: RequestedVariant[];
  error?: string;
};

/**
 * Parses Google Fonts v2 axis syntax, e.g.:
 *   "wght@400;700"
 *   "wght@100..900"
 *   "ital,wght@0,400;0,700;1,400"
 * Values may be single static weights ("400") or ranges ("100..900").
 */
function parseAxisSpec(axesPart: string): ParseResult {
  const [axesListStr, valuesPart] = axesPart.split('@');
if (!axesListStr || !valuesPart) {
    return { error: `Malformed axis query '${axesPart}'. Expected format 'axis@value'.` };
  }

  const axes = axesListStr.split(',').map(a => a.trim().toLowerCase()).filter(Boolean);
  if (axes.length === 0) {
    return { error: `No axes provided in '${axesPart}'.` };
  }

  // Validate all requested axes
  for (const axis of axes) {
    if (!VALID_AXES.has(axis)) {
      return { error: `Invalid axis '${axis}'. Supported axes: ${Array.from(VALID_AXES).join(', ')}.` };
    }
  }

  const variantStrings = valuesPart.split(';').map(v => v.trim()).filter(Boolean);
  if (variantStrings.length === 0) {
    return { error: `No axis values supplied after '@' in '${axesPart}'.` };
  }

  const variants: RequestedVariant[] = [];

  for (const variantString of variantStrings) {
    const values = variantString.split(',').map(v => v.trim());
if (values.length !== axes.length) {
      return {
        error: `Invalid variant '${variantString}' for axis spec '${axesListStr}'. Expected ${axes.length} value(s), got ${values.length}.`
      };
    }

    const variant: RequestedVariant = {};

    for (let i = 0; i < axes.length; i++) {
      const axis = axes[i];
      const raw = values[i];
      
      if (axis === 'ital') {
        if (raw === '0') variant.ital = 0;
        else if (raw === '1') variant.ital = 1;
else {
          return { error: `Invalid italic value '${raw}'. Value for 'ital' must be 0 or 1.` };
        }
      } else if (axis === 'wght') {
        const rangeMatch = raw.match(/^(\d+)\.\.(\d+)$/);
        if (rangeMatch) {
          const min = parseInt(rangeMatch[1], 10);
          const max = parseInt(rangeMatch[2], 10);
          if (min > max || min < 1 || max > 1000) {
            return { error: `Invalid weight range '${raw}'.` };
          }
          variant.wght = { min, max };
        } else if (/^\d+$/.test(raw)) {
          const n = parseInt(raw, 10);
if (n < 1 || n > 1000) {
            return { error: `Invalid weight value '${raw}'. Weight must be between 1 and 1000.` };
          }
          variant.wght = { min: n, max: n };
} else {
          return { error: `Invalid weight '${raw}'. Expected a number (e.g. 400) or range (e.g. 300..900).` };
        }
      }
    }

    variants.push(variant);
  }

  return { variants };
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[\s\-_]+/g, '');
}

/**
 * Finds a font family group matching a requested family name.
 * Matches are tried in order: exact, whitespace-insensitive, then prefix
 * (e.g. "Figtree" matches "Figtree Light", "Bomber Friends" matches "BomberFriends").
 */
function findFamilyGroup(manifest: Manifest, requestedName: string): FontFamilyManifest | undefined {
  const target = normalizeName(requestedName);
  return manifest.fonts.find(f => normalizeName(f.family) === target);
}

/** Whether a manifest file satisfies a requested variant (ital + wght axis). */
function fileMatchesVariant(file: FontFileItem, variant: RequestedVariant): boolean {
  // If ital is specified, it must strictly match the file style (0 for normal, 1 for italic)
  if (variant.ital !== undefined && variant.ital !== (file.style === 'italic' ? 1 : 0)) {
    return false;
  }

  if (variant.wght) {
    if (file.isVariable) {
      // Variable fonts serve any axis range they physically support
      if (file.weightMin > variant.wght.max || file.weightMax < variant.wght.min) return false;
    } else {
      // Static fonts: include when their exact weight falls inside the requested range
      if (file.weightMin < variant.wght.min || file.weightMin > variant.wght.max) return false;
    }
  }

  return true;
}

/** Combines multiple requested ranges into a single min/max. */
function mergeWghtRanges(requests: RequestedVariant[]): { min: number; max: number } | null {
  const ranges = requests
    .map(r => r.wght)
    .filter((w): w is { min: number; max: number } => !!w);
  if (ranges.length === 0) return null;
  return {
    min: Math.min(...ranges.map(r => r.min)),
    max: Math.max(...ranges.map(r => r.max)),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const manifest = getManifest();

  const familyParams = searchParams.getAll('family');
  const rawDisplay = searchParams.get('display');
  const textParam = searchParams.get('text'); // Subset string

  // Only assign display if explicitly matching one of the valid CSS font-display keywords
  const display = rawDisplay && VALID_FONT_DISPLAYS.has(rawDisplay.toLowerCase()) 
    ? rawDisplay.toLowerCase() 
    : null;

  const host = request.headers.get('host') || 'fonts.timchinye.com';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const cssRules: string[] = [];
const errors: string[] = [];

  // No query: generate CSS for ALL hosted fonts
  if (familyParams.length === 0) {
    for (const fontGroup of manifest.fonts) {
      for (const file of fontGroup.files) {
        cssRules.push(generateFontFaceRule(fontGroup.family, file, baseUrl, display, null, textParam));
      }
    }
    return respond(cssRules.join('\n\n'), 200);
  }

  for (const familyQuery of familyParams) {
    const [rawName, axesPart] = familyQuery.split(':');
    const targetFamilyName = rawName.trim();

    const matchedGroup = findFamilyGroup(manifest, targetFamilyName);

    if (!matchedGroup) {
      errors.push(`Font family '${targetFamilyName}' is not available.`);
continue;
}

        if (!axesPart) {
      // Default: serve normal weight 400 if available, or all variable/static files
      for (const file of matchedGroup.files) {
        cssRules.push(generateFontFaceRule(matchedGroup.family, file, baseUrl, display, null, textParam));
      }
      continue;
    }

    const parseResult = parseAxisSpec(axesPart);

        if (parseResult.error) {
        errors.push(parseResult.error);
            continue;
    }

const variants = parseResult.variants || [];
    let familyMatchedCount = 0;

    for (const file of matchedGroup.files) {
      const matchingVariants = variants.filter(v => fileMatchesVariant(file, v));
      if (matchingVariants.length === 0) continue;

      familyMatchedCount++;

      if (!file.isVariable) {
        cssRules.push(generateFontFaceRule(matchedGroup.family, file, baseUrl, display, null, textParam));
        continue;
      }

            const merged = mergeWghtRanges(matchingVariants);
      const overriddenWght = merged
        ? {
            min: Math.max(merged.min, file.weightMin),
            max: Math.min(merged.max, file.weightMax),
          }
        : null;
      cssRules.push(generateFontFaceRule(matchedGroup.family, file, baseUrl, display, overriddenWght, textParam));
    }

    if (familyMatchedCount === 0) {
      const availableWeights = matchedGroup.files.map(f => `${f.weight} (${f.style})`).join(', ');
      errors.push(`No matching styles/weights found for '${targetFamilyName}:${axesPart}'. Available: ${availableWeights}`);
    }
  }

  if (errors.length > 0 || cssRules.length === 0) {
    return new NextResponse(`/* Fonts API Error */\n/* ${errors.join('\n * ')} */\n`, {
      status: 400,
      headers: {
        'Content-Type': 'text/css; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  }

  return respond(cssRules.join('\n\n'), 200);
}

function generateFontFaceRule(
  family: string,
  file: FontFileItem,
  baseUrl: string,
  display: string | null,
  overriddenWght: { min: number; max: number } | null,
  textSubset: string | null
): string {
  const fontUrl = `${baseUrl}/tstatic/${file.file}`;

  let fontWeight: string;
  if (overriddenWght) {
    fontWeight = `${overriddenWght.min} ${overriddenWght.max}`;
  } else {
    fontWeight = file.weight;
  }

  const lines: string[] = [
    `  font-family: '${family}';`,
    `  font-style: ${file.style};`,
    `  font-weight: ${fontWeight};`
  ];

  if (display) {
    lines.push(`  font-display: ${display};`);
  }

  if (textSubset) {
    // Generate unicode-range for the requested characters
    const codePoints = Array.from(new Set(textSubset.split(''))).map(
      c => `U+${c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`
    );
    lines.push(`  unicode-range: ${codePoints.join(', ')};`);
  }

  lines.push(`  src: url('${fontUrl}') format('${file.format}');`);

  return `@font-face {\n${lines.join('\n')}\n}`;
}

function respond(body: string, status = 200) {
  return new NextResponse(body, {
    status,
    headers: {
      'Content-Type': 'text/css; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Cache-Control': 'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800',
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}