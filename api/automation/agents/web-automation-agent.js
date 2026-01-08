/**
 * WebAutomationAgent - Base class for web automation tasks
 * 
 * Uses Puppeteer for browser automation with:
 * - Page navigation and interaction
 * - Screenshot capture
 * - Data extraction
 * - Form filling and clicking
 */

const BaseAgent = require('./base-agent');

class WebAutomationAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      ...config,
      name: config.name || 'WebAutomationAgent',
      role: 'web_automation',
      capabilities: ['navigate', 'click', 'type', 'extract', 'screenshot', ...(config.capabilities || [])]
    });
    
    this.browser = null;
    this.page = null;
    this.headless = config.headless !== false; // Default to headless
    this.timeout = config.timeout || 30000;
  }

  /**
   * Initialize the browser
   */
  async initialize() {
    try {
      // Dynamic import of puppeteer to avoid issues if not installed
      const puppeteer = require('puppeteer');
      
      this.browser = await puppeteer.launch({
        headless: this.headless ? 'new' : false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      this.page = await this.browser.newPage();
      await this.page.setDefaultTimeout(this.timeout);
      
      // Set a realistic viewport
      await this.page.setViewport({ width: 1280, height: 800 });
      
      this.status = 'ready';
      return { success: true, agentId: this.agentId };
    } catch (error) {
      this.status = 'error';
      return { success: false, error: error.message };
    }
  }

  /**
   * Navigate to a URL
   */
  async navigate(url) {
    await this.page.goto(url, { waitUntil: 'networkidle2' });
    this.context.currentUrl = url;
    return { url, title: await this.page.title() };
  }

  /**
   * Click on an element
   */
  async click(selector) {
    await this.page.waitForSelector(selector, { timeout: this.timeout });
    await this.page.click(selector);
    return { clicked: selector };
  }

  /**
   * Type text into an input
   */
  async type(selector, text) {
    await this.page.waitForSelector(selector, { timeout: this.timeout });
    await this.page.type(selector, text);
    return { typed: text, into: selector };
  }

  /**
   * Extract text from elements matching a selector
   */
  async extractText(selector) {
    await this.page.waitForSelector(selector, { timeout: this.timeout });
    const texts = await this.page.$$eval(selector, elements => 
      elements.map(el => el.textContent.trim())
    );
    return texts;
  }

  /**
   * Extract data from the page using a custom extraction function
   */
  async extractData(extractionFn) {
    return await this.page.evaluate(extractionFn);
  }

  /**
   * Take a screenshot
   */
  async screenshot(path) {
    const screenshotPath = path || `screenshot_${Date.now()}.png`;
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    return { path: screenshotPath };
  }

  /**
   * Wait for an element
   */
  async waitFor(selector, options = {}) {
    await this.page.waitForSelector(selector, { timeout: this.timeout, ...options });
    return { found: selector };
  }

  /**
   * Get page content
   */
  async getPageContent() {
    return await this.page.content();
  }

  /**
   * Cleanup browser resources
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
    await super.cleanup();
  }
}

module.exports = WebAutomationAgent;

