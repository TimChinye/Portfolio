import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const manifestPath = path.join(process.cwd(), 'src', 'data', 'fonts-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    return NextResponse.json({ fonts: [] });
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  return NextResponse.json(manifest, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}