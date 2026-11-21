import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch();
try {
  for (const width of [1000, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 844 }, hasTouch: width === 390 });
    const page = await context.newPage();
    await page.goto(process.env.UX01_URL ?? 'http://127.0.0.1:8397/');
    const mode = key => page.locator(`[data-mode="${key}"]`);
    assert.equal(await mode('compact').getAttribute('aria-pressed'), 'true');
    await mode('full').focus();
    await page.keyboard.press('Enter');
    assert.equal(await mode('full').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('#cost').textContent(), '木材 10');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    if (width === 390) await page.locator('#select').tap();
    else await page.locator('#select').click();
    await mode('collapsed').click();
    assert.equal(await page.locator('#content').isVisible(), false);
    assert.equal(await page.locator('#cancel').isVisible(), true);
    await page.locator('#locale').click();
    assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    assert.equal(await page.locator('#intent').textContent(), 'Placing tent');
    assert.equal(await page.locator('#map').textContent(), 'Base map · 0');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#intent').textContent(), '');
    assert.equal(await mode('collapsed').evaluate(button => button === document.activeElement), true);
    await page.mouse.click(20, 100);
    assert.equal(await page.locator('#map').textContent(), 'Base map · 1');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.ok((await page.locator('#panel').boundingBox()).height <= 844 * .4 + 1);
    await mode('full').click();
    assert.equal(await page.locator('#cost').textContent(), '10 wood');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await mode('collapsed').click();
    await page.reload();
    assert.equal(await mode('collapsed').getAttribute('aria-pressed'), 'true');
    await context.close();
    console.log(`UX-01 prototype ${width}px passed`);
  }
  const short = await browser.newPage({ viewport: { width: 390, height: 320 }, hasTouch: true });
  await short.goto(process.env.UX01_URL ?? 'http://127.0.0.1:8397/');
  await short.locator('#select').tap();
  const header = short.locator('.row');
  const cancel = short.locator('#cancel');
  for (const language of ['zh-TW', 'en']) {
    assert.equal(await short.locator('html').getAttribute('lang'), language);
    const before = await header.boundingBox();
    const scrollTop = await short.locator('#content').evaluate(content => {
      content.scrollTop = content.scrollHeight;
      return content.scrollTop;
    });
    assert.ok(scrollTop > 0, `Expected scrollable content in ${language}`);
    assert.deepEqual(await header.boundingBox(), before);
    assert.equal(await cancel.evaluate(button => {
      const { x, y, width, height } = button.getBoundingClientRect();
      return document.elementFromPoint(x + width / 2, y + height / 2) === button;
    }), true);
    await short.locator('#locale').tap();
  }
  await cancel.tap();
  assert.equal(await short.locator('#intent').textContent(), '');
  assert.equal(await short.locator('#map').textContent(), '基地地圖 · 0');
  console.log('UX-01 prototype 390x320 sticky controls passed');
} finally {
  await browser.close();
}
