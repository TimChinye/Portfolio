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

/**
 * Parses Google Fonts v2 axis syntax, e.g.:
 *   "wght@400;700"
 *   "wght@100..900"
 *   "ital,wght@0,400;0,700;1,400"
 * Values may be single static weights ("400") or ranges ("100..900").
 */
function parseAxisSpec(axesPart: string): RequestedVariant[] | null {
  const [axesList, valuesPart] = axesPart.split('@');
  const axes = axesList
    .split(',')
    .map(a => a.trim())
    .filter(Boolean);
  const variantStrings = (valuesPart ?? '')
    .split(';')
    .map(v => v.trim())
    .filter(Boolean);

  if (axes.length === 0) return null;
  if (!valuesPart || variantStrings.length === 0) return [];

  const variants: RequestedVariant[] = [];

  for (const variantString of variantStrings) {
    const values = variantString.split(',').map(v => v.trim());
    const variant: RequestedVariant = {};

    axes.forEach((axis, i) => {
      const raw = values[i];
      if (raw === undefined || raw === '') return;

      if (axis === 'ital') {
        if (raw === '0') variant.ital = 0;
        else if (raw === '1') variant.ital = 1;
      } else if (axis === 'wght') {
        const rangeMatch = raw.match(/^(\d+)\.\.(\d+)$/);
        if (rangeMatch) {
          variant.wght = { min: parseInt(rangeMatch[1], 10), max: parseInt(rangeMatch[2], 10) };
        } else if (/^\d+$/.test(raw)) {
          const n = parseInt(raw, 10);
          variant.wght = { min: n, max: n };
        }
      }
    });

    variants.push(variant);
  }

  return variants;
}

/**
 * Finds a font family group matching a requested family name.
 * Matches are tried in order: exact, whitespace-insensitive, then prefix
 * (e.g. "Figtree" matches "Figtree Light", "Bomber Friends" matches "BomberFriends").
 */
function findFamilyGroup(manifest: Manifest, requestedName: string): FontFamilyManifest | undefined {
  const normalize = (name: string) => name.toLowerCase().replace(/\s+/g, '');
  const requested = normalize(requestedName);

  const exact = manifest.fonts.find(f => normalize(f.family) === requested);
  if (exact) return exact;

  return manifest.fonts.find(
    f => normalize(f.family).startsWith(requested) || requested.startsWith(normalize(f.family))
  );
}

/** Whether a manifest file satisfies a requested variant (ital + wght axis). */
function fileMatchesVariant(file: FontFileItem, variant: RequestedVariant): boolean {
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
  const display = searchParams.get('display') || 'swap';

  const host = request.headers.get('host') || 'fonts.timchinye.com';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const cssRules: string[] = [];

  // No query: generate CSS for ALL hosted fonts
  if (familyParams.length === 0) {
    for (const fontGroup of manifest.fonts) {
      for (const file of fontGroup.files) {
        cssRules.push(generateFontFaceRule(fontGroup.family, file, baseUrl, display, null));
      }
    }
    return respond(cssRules.join('\n\n'));
  }

  for (const familyQuery of familyParams) {
    const [rawName, axesPart] = familyQuery.split(':');
    const targetFamilyName = rawName.trim();

    const matchedGroup = findFamilyGroup(manifest, targetFamilyName);

    if (!matchedGroup) continue;

    // Simplified request (no axis syntax): serve all instances of the family
    if (!axesPart) {
      for (const file of matchedGroup.files) {
        cssRules.push(generateFontFaceRule(matchedGroup.family, file, baseUrl, display, null));
      }
      continue;
    }

    const variants = parseAxisSpec(axesPart);

    // Unknown/malformed axis syntax: fall back to serving all instances
    if (variants === null) {
      for (const file of matchedGroup.files) {
        cssRules.push(generateFontFaceRule(matchedGroup.family, file, baseUrl, display, null));
      }
      continue;
    }

    // Axis named but no values given (e.g. "family=Poppins:wght@")
    if (variants.length === 0) {
      for (const file of matchedGroup.files) {
        cssRules.push(generateFontFaceRule(matchedGroup.family, file, baseUrl, display, null));
      }
      continue;
    }

    for (const file of matchedGroup.files) {
      const matchingVariants = variants.filter(v => fileMatchesVariant(file, v));
      if (matchingVariants.length === 0) continue;

      // Static files get one @font-face per requested weight (declared at its real weight)
      if (!file.isVariable) {
        for (const variant of matchingVariants) {
          void variant;
          cssRules.push(generateFontFaceRule(matchedGroup.family, file, baseUrl, display, null));
        }
        continue;
      }

      // Variable files: a single face covering the merged requested range
      const merged = mergeWghtRanges(matchingVariants);
      const overriddenWght = merged
        ? {
            min: Math.max(merged.min, file.weightMin),
            max: Math.min(merged.max, file.weightMax),
          }
        : null;
      cssRules.push(generateFontFaceRule(matchedGroup.family, file, baseUrl, display, overriddenWght));
    }
  }

  return respond(cssRules.join('\n\n'));
}

function generateFontFaceRule(
  family: string,
  file: FontFileItem,
  baseUrl: string,
  display: string,
  overriddenWght: { min: number; max: number } | null
): string {
  const fontUrl = `${baseUrl}/hosted-fonts/${file.file}`;

  let fontWeight: string;
  if (overriddenWght) {
    fontWeight = `${overriddenWght.min} ${overriddenWght.max}`;
  } else {
    fontWeight = file.weight;
  }

  return `@font-face {
  font-family: '${family}';
  font-style: ${file.style};
  font-weight: ${fontWeight};
  font-display: ${display};
  src: url('${fontUrl}') format('${file.format}');
}`;
}

function respond(body: string) {
  return new NextResponse(body, {
    status: 200,
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