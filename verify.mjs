import { chromium } from "playwright";
import { mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const base = "http://127.0.0.1:8765";
const out = join(dirname(fileURLToPath(import.meta.url)), "verify-shots");
await mkdir(out, { recursive: true });

const browser = await chromium.launch();
const findings = [];

async function shot(page, name) {
  await page.screenshot({ path: join(out, `${name}.png`), fullPage: false });
}

const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await desktop.goto(base, { waitUntil: "networkidle" });
await desktop.waitForTimeout(1900);
const loaderGone = await desktop.locator("#loader.is-done").count();
findings.push(`loader done: ${loaderGone > 0}`);
await shot(desktop, "desktop-hero");

const title = await desktop.locator("h1").innerText();
findings.push(`hero title: ${title.replace(/\s+/g, " ")}`);

await desktop.click('a[data-scroll="#work"]');
await desktop.waitForTimeout(900);
await shot(desktop, "desktop-work");

await desktop.getByRole("button", { name: "Start a Project" }).first().click();
await desktop.waitForTimeout(400);
const dialog = desktop.getByRole("dialog");
findings.push(`contact dialog visible: ${await dialog.isVisible()}`);
await shot(desktop, "desktop-contact");
await desktop.keyboard.press("Escape");
await desktop.waitForTimeout(250);

await desktop.evaluate(() => window.scrollTo(0, document.querySelector("#industries").offsetTop));
await desktop.waitForTimeout(500);
await desktop.getByRole("button", { name: "Fitness" }).hover();
await desktop.waitForTimeout(400);
const caption = await desktop.locator("#industry-caption").innerText();
findings.push(`industry caption after Fitness: ${caption}`);
await shot(desktop, "desktop-industries");

await desktop.evaluate(() => window.scrollTo(0, document.querySelector("#pricing").offsetTop));
await desktop.waitForTimeout(400);
await shot(desktop, "desktop-pricing");

await desktop.evaluate(() => window.scrollTo(0, document.querySelector("#cta").offsetTop));
await desktop.waitForTimeout(400);
await shot(desktop, "desktop-finale");

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await mobile.goto(base, { waitUntil: "networkidle" });
await mobile.waitForTimeout(800);
await shot(mobile, "mobile-hero");
await mobile.getByRole("button", { name: "Open menu" }).click();
await mobile.waitForTimeout(500);
const menuOpen = await mobile.locator(".mobile-menu.is-open").count();
findings.push(`mobile menu open: ${menuOpen > 0}`);
await shot(mobile, "mobile-menu");
await mobile.getByRole("link", { name: "Pricing" }).click();
await mobile.waitForTimeout(800);
await shot(mobile, "mobile-pricing");

const tablet = await browser.newPage({ viewport: { width: 768, height: 1024 } });
await tablet.goto(base, { waitUntil: "networkidle" });
await tablet.waitForTimeout(800);
await shot(tablet, "tablet-hero");

const errors = [];
desktop.on("pageerror", (err) => errors.push(err.message));
await desktop.reload({ waitUntil: "networkidle" });
await desktop.waitForTimeout(500);
findings.push(`page errors: ${errors.length ? errors.join(" | ") : "none"}`);

console.log(findings.join("\n"));
await browser.close();
