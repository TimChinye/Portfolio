import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import fs from "fs";

export const maxDuration = 60;

function isValidRequest(req: Request) {
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");
  if (!referer || !host) return false;
  try {
    const refererUrl = new URL(referer);
    return refererUrl.host === host;
  } catch {
    return false;
  }
}

async function getBrowserInstance(width: number, height: number, devicePixelRatio: number) {
  const isLocal = process.env.NODE_ENV === "development";

  const safeWidth = Math.min(Math.max(width || 1280, 100), 3840);
  const safeHeight = Math.min(Math.max(height || 720, 100), 2160);
  const safeScale = Math.min(Math.max(devicePixelRatio || 2, 1), 3);

  const viewport = {
    width: safeWidth,
    height: safeHeight,
    deviceScaleFactor: safeScale,
  };

  if (isLocal) {
    const paths = [
      process.env.PUPPETEER_EXECUTABLE_PATH,
      "/usr/bin/google-chrome",
      "/usr/bin/chromium-browser",
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    ];

    const executablePath = paths.find(p => p && fs.existsSync(p)) || "/usr/bin/google-chrome";

    return await puppeteer.launch({
      headless: true,
      executablePath,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      defaultViewport: viewport,
    });
  }

  return await puppeteer.launch({
    args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: {
      ...chromium.defaultViewport,
      ...viewport,
    },
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });
}

export async function POST(req: Request) {
  if (!isValidRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let browser: any = null;
  try {
    const { html, width, height, devicePixelRatio = 2 } = await req.json();

    if (!html) {
      return NextResponse.json({ error: "HTML content is required" }, { status: 400 });
    }

    browser = await getBrowserInstance(width, height, devicePixelRatio);
    const page = await browser.newPage();

    // Security: Disable JS to prevent XSS/SSRF from the client-provided HTML
    await page.setJavaScriptEnabled(false);

    // Wait for full load to ensure fonts and images are rendered
    await page.setContent(html, { waitUntil: "load" });

    // Wait a tiny bit more for layout/font rendering to settle
    await new Promise(r => setTimeout(r, 100));

    // Even with JS disabled, we can still use page.evaluate for our own purposes
    // Note: page.evaluate works even if JS is disabled in the page context!
    await page.evaluate(() => {
      const htmlEl = document.documentElement;
      const x = parseInt(htmlEl.getAttribute('data-scroll-x') || '0');
      const y = parseInt(htmlEl.getAttribute('data-scroll-y') || '0');
      window.scrollTo(x, y);
    });

    const buffer = await page.screenshot({
      type: "png",
      fullPage: false,
    });

    const base64 = `data:image/png;base64,${buffer.toString("base64")}`;
    return NextResponse.json({ snapshot: base64 });

  } catch (error: any) {
    console.error("Snapshot API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
