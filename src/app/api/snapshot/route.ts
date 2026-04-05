import { NextResponse } from "next/server";
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

async function getBrowserInstance() {
  const wsEndpoint = process.env.PUPPETEER_WS_ENDPOINT;

  if (wsEndpoint) {
    console.log("Connecting to Browserless.io...");
    return await puppeteer.connect({ browserWSEndpoint: wsEndpoint });
  }

  const isLocal = process.env.NODE_ENV === "development";
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
    });
  }

  const chromium = (await import("@sparticuz/chromium-min")).default;
  return await puppeteer.launch({
    args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless as any,
  });
}

export async function GET(req: Request) {
  if (!isValidRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let browser: any = null;
  try {
    browser = await getBrowserInstance();
    return NextResponse.json({ status: "warmed up" });
  } catch (error: any) {
    console.error("Warmup API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (browser) {
      if (process.env.PUPPETEER_WS_ENDPOINT) {
        await browser.disconnect().catch(() => {});
      } else {
        await browser.close().catch(() => {});
      }
    }
  }
}

export async function POST(req: Request) {
  if (!isValidRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let browser: any = null;

  try {
    const body = await req.json();
    const tasks = Array.isArray(body.tasks) ? body.tasks : [body];

    if (tasks.length === 0 || !tasks[0].html) {
      return NextResponse.json({ error: "HTML content is required" }, { status: 400 });
    }

    // Connect/Launch a FRESH browser for every request to avoid "Target closed" errors
    // when multiple concurrent requests try to share/disconnect a singleton.
    browser = await getBrowserInstance();

    const snapshots = [];

    // Process tasks sequentially to maintain stability on low-concurrency connections (Browserless.io)
    for (const task of tasks) {
      const { html, width, height, devicePixelRatio = 2 } = task;
      const page = await browser.newPage();
      try {
        const safeWidth = Math.min(Math.max(width || 1280, 100), 3840);
        const safeHeight = Math.min(Math.max(height || 720, 100), 2160);
        const safeScale = Math.min(Math.max(devicePixelRatio || 2, 1), 3);

        await page.setViewport({
          width: safeWidth,
          height: safeHeight,
          deviceScaleFactor: safeScale,
        });

        await page.setJavaScriptEnabled(false);
        await page.setContent(html, { waitUntil: "load" });

        // Delay for layout, font rendering, and asset loading
        await new Promise(r => setTimeout(r, 500));

        // Ensure fonts are fully loaded
        try {
          await page.evaluateHandle('document.fonts.ready');
        } catch (e) {
          console.warn("Fonts ready check failed:", e);
        }

        await page.evaluate(() => {
          const htmlEl = document.documentElement;
          const x = parseInt(htmlEl.getAttribute('data-scroll-x') || '0');
          const y = parseInt(htmlEl.getAttribute('data-scroll-y') || '0');
          window.scrollTo(x, y);
        });

        const buffer = await page.screenshot({ type: "png", fullPage: false });
        snapshots.push(`data:image/png;base64,${Buffer.from(buffer).toString("base64")}`);
      } finally {
        await page.close().catch(() => {});
      }
    }
    return NextResponse.json({ snapshots });

  } catch (error: any) {
    console.error("Snapshot API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (browser) {
      if (process.env.PUPPETEER_WS_ENDPOINT) {
        await browser.disconnect().catch(() => {});
      } else {
        await browser.close().catch(() => {});
      }
    }
  }
}
