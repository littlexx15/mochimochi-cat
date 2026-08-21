import { chromium } from "playwright";

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on("console", (msg) => {
  if (msg.type() === "error") console.log("CONSOLE_ERROR", msg.text());
});
page.on("pageerror", (err) => console.log("PAGE_ERROR", err.message));

await page.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await page.fill("#pet-name", "糯米");
await page.click("button[type=submit]");
await page.waitForTimeout(1800);
await page.screenshot({ path: "/workspace/screenshots/room-desktop.png" });

const canvas = page.locator("canvas");
console.log("canvas count", await canvas.count());
console.log("body", (await page.locator("body").innerText()).slice(0, 240));

await page.getByRole("button", { name: "喂食" }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: "/workspace/screenshots/room-feed.png" });

await page.getByRole("button", { name: "玩耍" }).click();
await page.waitForTimeout(900);
await page.screenshot({ path: "/workspace/screenshots/room-play.png" });

await page.getByRole("button", { name: "摸摸" }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: "/workspace/screenshots/room-pet.png" });

const box = await canvas.boundingBox();
if (box) {
  await page.mouse.click(box.x + box.width * 0.25, box.y + box.height * 0.8);
  await page.waitForTimeout(1200);
}
await page.screenshot({ path: "/workspace/screenshots/room-walk.png" });

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
mobile.on("console", (msg) => {
  if (msg.type() === "error") console.log("MOBILE_CONSOLE_ERROR", msg.text());
});
mobile.on("pageerror", (err) => console.log("MOBILE_PAGE_ERROR", err.message));
await mobile.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle" });
await mobile.waitForTimeout(1500);
await mobile.screenshot({ path: "/workspace/screenshots/room-mobile.png" });
const overflow = await mobile.evaluate(
  () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
);
console.log("mobile overflow", overflow);
console.log("mobile text", (await mobile.locator("body").innerText()).slice(0, 200));

await browser.close();
console.log("done");
