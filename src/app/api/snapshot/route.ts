import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import { puppeteerManager } from "@/utils/puppeteer-manager";

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

export async function GET(req: Request) {
  if (!isValidRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let browser: any = null;
  try {
    // Warm up by ensuring we can get a browser instance
    browser = await puppeteerManager.getBrowser();

    // If using Browserless, disconnect to free the slot after verification
    if (process.env.PUPPETEER_WS_ENDPOINT && browser.connected) {
      await browser.disconnect();
    }

    return NextResponse.json({ status: "warmed up" });
  } catch (error: any) {
    console.error("Warmup API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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

    // Use the manager to get the browser (it handles launch/connect singleton)
    browser = await puppeteerManager.getBrowser();

    // Process tasks in parallel to ensure snapshots are "taken at the same time"
    // as per user requirement, while using the same browser connection.
    const snapshotPromises = tasks.map(async (task: any) => {
      const { html, width, height, devicePixelRatio = 2 } = task;
      const page = await browser.newPage();
      try {
        // Set viewport correctly for this specific snapshot
        const safeWidth = Math.min(Math.max(width || 1280, 100), 3840);
        const safeHeight = Math.min(Math.max(height || 720, 100), 2160);
        const safeScale = Math.min(Math.max(devicePixelRatio || 2, 1), 3);

        await page.setViewport({
          width: safeWidth,
          height: safeHeight,
          deviceScaleFactor: safeScale,
        });

        // Performance: Disable JS
        await page.setJavaScriptEnabled(false);

        // Wait for full load
        await page.setContent(html, { waitUntil: "load" });

        // Tiny delay for layout/font rendering
        await new Promise(r => setTimeout(r, 100));

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

        // Correct base64 encoding for Puppeteer snapshots (Uint8Array)
        return `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
      } finally {
        await page.close().catch(() => {});
      }
    });

    const snapshots = await Promise.all(snapshotPromises);
    return NextResponse.json({ snapshots });

  } catch (error: any) {
    console.error("Snapshot API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (browser && process.env.PUPPETEER_WS_ENDPOINT) {
      // Disconnect from Browserless to free the slot for other users
      await browser.disconnect().catch(() => {});
    }
  }
}
