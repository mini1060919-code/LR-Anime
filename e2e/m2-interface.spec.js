import { test, expect } from '@playwright/test';

const BASE = '/city-builder-survival/';
test('Traditional Chinese interface, read-only character dossier and v4/v5 language compatibility', async ({ page }) => {
  test.setTimeout(360_000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${BASE}?seed=42`);
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-TW');
  await expect(page.getByRole('heading', { name: '最後庇護所', exact: true })).toBeVisible();
  await page.screenshot({ path: '/tmp/lr-m2-title.png' });
  await page.getByRole('button', { name: '開始遊戲', exact: true }).click();
  await expect(page.locator('.hud-day')).toHaveText('第 1 天', { timeout: 30_000 });
  await page.getByTitle('暫停', { exact: true }).click();
  await expect(page.getByTitle('暫停', { exact: true })).toHaveClass(/active/);
  await expect(page.locator('.hud-resource-name')).toHaveText(['食物', '水', '木材', '金屬', '電力', '燃料']);
  await expect(page.locator('.build-tab')).toHaveCount(6);
  await expect(page.locator('.build-tab').first()).toContainText('居住');
  const tent = page.locator('.build-btn').filter({ has: page.locator('.build-btn-name:text-is("帳篷")') });
  await expect(tent).toBeVisible();
  await tent.click();
  await expect(tent).toHaveClass(/active/);
  await page.locator('.build-btn--side').filter({ hasText: '取消' }).click();
  await expect(tent).not.toHaveClass(/active/);
  await page.getByTitle('科技研究', { exact: true }).click();
  const research = page.locator('.research-panel');
  await expect(research).toHaveClass(/open/);
  await expect(research.locator('.research-tech-name')).toHaveText([
    '林業', '電力儲存', '進階太陽能技術', '深層採礦', '生產效率', '醫療技術', '彈道學', '鋼筋混凝土',
  ]);
  await expect(research.getByText('解鎖：植林站', { exact: true })).toBeVisible();
  await research.getByTitle('關閉', { exact: true }).click();
  await page.screenshot({ path: '/tmp/lr-m2-game.png' });

  const before = await page.evaluate(() => ({
    survivors: JSON.stringify(window.__game.state.survivors),
    resources: JSON.stringify(window.__game.state.resources),
    save: localStorage.getItem('cbs-save'),
  }));
  await page.getByRole('button', { name: '角色資訊', exact: true }).click();
  const dossier = page.getByRole('dialog', { name: '倖存者檔案' });
  await expect(dossier).toBeVisible();
  await expect(dossier.locator('.character-roster-button')).toHaveCount(4);
  await expect(dossier.locator('.portrait-frame')).toHaveAttribute('data-portrait-status','ready');
  await expect(dossier.locator('.character-portrait')).toBeVisible();
  await expect(dossier.locator('.character-avatar')).toHaveCount(4);
  await expect(dossier.getByRole('meter')).toHaveCount(2);
  const residentName=await page.evaluate(()=>window.__game.state.characters.records['2'].nameSnapshot['zh-TW']);
  await dossier.locator('[data-survivor-id="2"]').click();
  await expect(dossier.locator('.character-name')).toHaveText(residentName);
  await page.keyboard.press('3'); // Game speed hotkeys must not unpause the modal.
  await expect(page.getByTitle('暫停', { exact: true })).toHaveClass(/active/);
  await page.screenshot({ path: '/tmp/lr-m2-character.png' });
  await page.keyboard.press('Escape');
  await expect(dossier).not.toBeVisible();
  expect(await page.evaluate(() => ({ survivors: JSON.stringify(window.__game.state.survivors),
    resources: JSON.stringify(window.__game.state.resources), save: localStorage.getItem('cbs-save') }))).toEqual(before);

  await page.getByRole('button', { name: '存檔', exact: true }).click();
  const saves = page.getByRole('dialog', { name: '存檔管理' });
  await expect(saves).toBeVisible();
  await saves.getByRole('button', { name: '儲存至槽位 1', exact: true }).click();
  await expect(saves.getByText('存檔槽 1：第 1 天', { exact: true })).toBeVisible();
  await saves.getByRole('button', { name: '關閉存檔', exact: true }).click();
  const legacy = await page.evaluate(() => JSON.parse(localStorage.getItem('cbs-save')).core);
  await page.evaluate(data => localStorage.setItem('cbs-save', JSON.stringify(data)), legacy);
  await page.goto(BASE);
  await page.getByRole('button', { name: '開始遊戲', exact: true }).click();
  await expect(page.locator('.hud-day')).toHaveText('第 1 天', { timeout: 30_000 });
  const migrated = await page.evaluate(() => localStorage.getItem('cbs-save'));
  expect(JSON.parse(migrated)).toMatchObject({ version: 6, core: legacy });

  page.once('dialog', dialog => dialog.dismiss());
  await page.getByLabel('語言', { exact: true }).selectOption('en');
  await expect(page.getByLabel('語言', { exact: true })).toHaveValue('zh-TW');
  page.once('dialog', dialog => dialog.accept());
  await page.getByLabel('語言', { exact: true }).selectOption('en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('button', { name: 'Start game', exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('cbs-save'))).toBe(migrated);
  await page.getByRole('button', { name: 'Start game', exact: true }).click();
  await expect(page.locator('.hud-day')).toHaveText('Day 1', { timeout: 30_000 });
  expect(await page.evaluate(() => localStorage.getItem('cbs-save'))).toBe(migrated);
  expect(errors).toEqual([]);
});

test('compact Traditional Chinese controls and accessible character modal', async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}?autostart=1&seed=42`);
  await expect(page.locator('.hud-day')).toHaveText('第 1 天', { timeout: 30_000 });
  await expect(page.locator('#game')).toBeVisible();
  for (const name of ['角色資訊', '存檔']) {
    const button = page.getByRole('button', { name, exact: true });
    await expect(button).toBeVisible();
    const rect = await button.boundingBox();
    expect(rect.x).toBeGreaterThanOrEqual(0);
    expect(rect.x + rect.width).toBeLessThanOrEqual(390);
  }
  await page.getByRole('button', { name: '角色資訊', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '倖存者檔案' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: '關閉檔案', exact: true })).toBeVisible();
  await page.screenshot({ path: '/tmp/lr-m2-mobile.png' });
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});
