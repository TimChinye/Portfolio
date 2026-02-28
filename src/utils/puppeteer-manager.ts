import puppeteer, { Browser } from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
import fs from "fs";

/**
 * Manages a persistent Puppeteer browser instance to reduce launch overhead.
 */
class PuppeteerManager {
  private static instance: PuppeteerManager;
  private browser: Browser | null = null;
  private wsEndpoint: string | null = null;
  private initializing: Promise<Browser> | null = null;

  private constructor() {}

  public static getInstance(): PuppeteerManager {
    if (!PuppeteerManager.instance) {
      PuppeteerManager.instance = new PuppeteerManager();
    }
    return PuppeteerManager.instance;
  }

  private async launchBrowser(): Promise<Browser> {
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

    return await puppeteer.launch({
      args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
  }

  public async getBrowser(): Promise<Browser> {
    if (this.browser && this.browser.connected) {
      return this.browser;
    }

    if (this.initializing) {
      return this.initializing;
    }

    this.initializing = (async () => {
      try {
        if (this.browser) {
          await this.browser.close().catch(() => {});
        }
        this.browser = await this.launchBrowser();
        this.wsEndpoint = this.browser.wsEndpoint();

        this.browser.on('disconnected', () => {
          this.browser = null;
          this.wsEndpoint = null;
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
