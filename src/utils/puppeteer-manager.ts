import puppeteer, { Browser } from "puppeteer-core";
import fs from "fs";

/**
 * Manages a persistent Puppeteer browser instance to reduce launch overhead.
 * Prioritizes Browserless.io via PUPPETEER_WS_ENDPOINT if available.
 */
class PuppeteerManager {
  private static instance: PuppeteerManager;
  private browser: Browser | null = null;
  private initializing: Promise<Browser> | null = null;

  private constructor() {}

  public static getInstance(): PuppeteerManager {
    if (!PuppeteerManager.instance) {
      PuppeteerManager.instance = new PuppeteerManager();
    }
    return PuppeteerManager.instance;
  }

  private async initializeBrowser(): Promise<Browser> {
    const wsEndpoint = process.env.PUPPETEER_WS_ENDPOINT;

    // 1. Prioritize Browserless.io (WebSocket)
    // This bypasses the need for local Chromium/sparticuz during execution
    if (wsEndpoint) {
      console.log("Connecting to Browserless.io...");
      return await puppeteer.connect({
        browserWSEndpoint: wsEndpoint,
      });
    }

    const isLocal = process.env.NODE_ENV === "development";

    // 2. Handle Local Development (Local Chrome)
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

    // 3. Fallback to local Chromium (Vercel Serverless)
    // We use a dynamic import and type casting to avoid build-time errors
    // since this branch is only reached if Browserless is NOT configured.
    try {
      const chromium = (await import("@sparticuz/chromium-min")).default;
      return await puppeteer.launch({
        args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless as any,
      });
    } catch (e) {
      console.error("Failed to launch fallback Chromium:", e);
      throw new Error("Puppeteer launch failed: No Browserless endpoint or local Chromium found.");
    }
  }

  public async getBrowser(): Promise<Browser> {
    if (this.browser && this.browser.isConnected()) {
      return this.browser;
    }

    if (this.initializing) {
      return this.initializing;
    }

    this.initializing = (async () => {
      try {
        if (this.browser) {
          // If we were connected via WS, just disconnect. If it was local, close.
          if (process.env.PUPPETEER_WS_ENDPOINT) {
            await this.browser.disconnect().catch(() => {});
          } else {
            await this.browser.close().catch(() => {});
          }
        }

        this.browser = await this.initializeBrowser();

        this.browser.on('disconnected', () => {
          this.browser = null;
        });

        return this.browser;
      } finally {
        this.initializing = null;
      }
    })();

    return this.initializing;
  }

  public async getWsEndpoint(): Promise<string> {
    const browser = await this.getBrowser();
    return browser.wsEndpoint();
  }
}

// Global persistence for Next.js dev mode
const globalWithPuppeteer = global as typeof globalThis & {
  puppeteerManager?: PuppeteerManager;
};

export const puppeteerManager = globalWithPuppeteer.puppeteerManager || PuppeteerManager.getInstance();

if (process.env.NODE_ENV !== "production") {
  globalWithPuppeteer.puppeteerManager = puppeteerManager;
}
