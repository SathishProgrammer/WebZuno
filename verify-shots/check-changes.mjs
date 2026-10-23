import { chromium } from "playwright";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const out = dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const errors = [];

for (const [name, vp] of [["desktop", { width: 1280, height: 860 }], ["mobile", { width: 390, height: 844 }]]) {
  const page = await browser.newPage({ viewport: vp });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:8765/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.evaluate(() => document.querySelector("#transform").scrollIntoView());
  await page.waitForTimeout(900);
  await page.locator(".browser").screenshot({ path: join(out, `before-${name}.png`) });

  if (name === "desktop") {
    await page.locator('.footer-legal [data-open-legal="terms"]').click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(out, "terms-modal.png") });
    await page.mouse.move(640, 500);
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(400);
    console.log("terms scrollTop after wheel:", await page.locator(".legal-scroll").evaluate((el) => el.scrollTop));
    await page.locator(".legal-inline").click();
    await page.waitForTimeout(200);
    console.log("privacy visible after inline link:", await page.locator("#legal-privacy").isVisible());
    await page.keyboard.press("Escape");

    await page.evaluate(() => document.querySelector("#cta").scrollIntoView());
    await page.waitForTimeout(600);
    const styles = await page.locator(".quick-form select option").first().evaluate((o) => {
      const cs = getComputedStyle(o);
      return { bg: cs.backgroundColor, color: cs.color, scheme: getComputedStyle(document.documentElement).colorScheme };
    });
    console.log("option styles (dark):", JSON.stringify(styles));
  }
}
console.log("page errors:", errors.length ? errors.join(" | ") : "none");
await browser.close();
