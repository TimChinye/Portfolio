import { NextResponse } from "next/server";
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

export async function GET() {
  try {
    // Lazy initialize the browser
    await puppeteerManager.getBrowser();
    return NextResponse.json({ status: "warmed up" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isValidRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const tasks = Array.isArray(body.tasks) ? body.tasks : [body];

    if (tasks.length === 0) {
      return NextResponse.json({ error: "No tasks provided" }, { status: 400 });
    }

    // Use the single, persistent browser instance
    const browser = await puppeteerManager.getBrowser();

    const snapshots = await Promise.all(tasks.map(async (task: any) => {
      let page: any = null;
      try {
        const { html, width, height, devicePixelRatio = 2 } = task;

        if (!html) {
          throw new Error("HTML content is required");
        }

        page = await browser.newPage();

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

        return `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
      } finally {
        if (page) {
          await page.close().catch(() => {});
        }
      }
    }));

    // If it was a single task (non-array input), return single snapshot for backward compatibility
    if (!Array.isArray(body.tasks)) {
      return NextResponse.json({ snapshot: snapshots[0] });
    }

    return NextResponse.json({ snapshots });

  } catch (error: any) {
    console.error("Snapshot API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
