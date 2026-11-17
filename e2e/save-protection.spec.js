import { test, expect } from '@playwright/test';

const BASE = '/city-builder-survival/';
test('v4 migration, three slots, JSON transfers and protected corrupt saves', async ({ page }) => {
  test.setTimeout(360_000);
  await page.setViewportSize({ width: 480, height: 360 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${BASE}?autostart=1&seed=42`);
  await expect(page.locator('.hud-day')).toHaveText('Day 1', { timeout: 30_000 });
  const legacy = await page.evaluate(() => JSON.parse(localStorage.getItem('cbs-save')).payload);
  await page.evaluate(data => localStorage.setItem('cbs-save', JSON.stringify(data)), legacy);
  await page.goto(BASE);
  await page.getByRole('button', { name: 'Start game', exact: true }).click();
  await expect(page.locator('.hud-day')).toHaveText('Day 1', { timeout: 30_000 });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('cbs-save')).version)).toBe(5);
  expect(await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('cbs-backup:'))
    .some(k => JSON.parse(JSON.parse(localStorage.getItem(k)).raw).version === 4))).toBe(true);

  await page.getByRole('button', { name: 'Saves', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Save management' });
  await expect(dialog).toBeVisible();
  for (let i = 1; i <= 3; i++) {
    await page.getByRole('button', { name: `Save slot ${i}`, exact: true }).click();
    await expect(dialog.getByText(`Slot ${i}: Day 1`, { exact: true })).toBeVisible();
  }
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export slot 1', exact: true }).click();
  expect((await download).suggestedFilename()).toBe('last-refuge-slot-1.json');
  page.on('dialog', dialog => dialog.accept());
  await page.getByLabel('Import save JSON').setInputFiles({
    name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{broken'),
  });
  await expect(dialog.getByRole('status')).toContainText('Save protected');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('cbs-save')).version)).toBe(5);
  await page.getByLabel('Import save JSON').setInputFiles({
    name: 'legacy.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(legacy)),
  });
  await page.waitForURL(url => !url.search);
  // Import reloads to the title screen; loading a slot follows the same flow.
  await expect(page.getByRole('button', { name: 'Start game', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Start game', exact: true }).click();
  await expect(page.locator('.hud-day')).toHaveText('Day 1', { timeout: 30_000 });
  await page.getByRole('button', { name: 'Saves', exact: true }).click();
  await page.getByRole('button', { name: 'Load slot 2', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Start game', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Start game', exact: true }).click();
  await expect(page.locator('.hud-day')).toHaveText('Day 1', { timeout: 30_000 });

  const unknown = '{"version":99,"precious":"retain these exact bytes"}';
  await page.evaluate(raw => localStorage.setItem('cbs-save', raw), unknown);
  await page.goto(`${BASE}?autostart=1&seed=42`);
  await expect(page.locator('.save-warning')).toContainText('Autosave stopped', { timeout: 30_000 });
  expect(await page.evaluate(() => localStorage.getItem('cbs-save'))).toBe(unknown);
  await page.getByRole('button', { name: 'Saves', exact: true }).click();
  await expect(page.getByRole('dialog').getByText(/Autosave protected/)).toBeVisible();
  const recovery = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export autosave JSON', exact: true }).click();
  expect((await recovery).suggestedFilename()).toBe('last-refuge-autosave.json');
  await page.getByLabel('Recover a protected autosave by archiving it before this import').check();
  await page.getByLabel('Import save JSON').setInputFiles({
    name: 'recovery.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(legacy)),
  });
  await expect(page.getByRole('button', { name: 'Start game', exact: true })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('cbs-save')).version)).toBe(5);
  expect(await page.evaluate(raw => Object.keys(localStorage).filter(k => k.startsWith('cbs-backup:'))
    .some(k => JSON.parse(localStorage.getItem(k)).raw === raw), unknown)).toBe(true);
  expect(errors).toEqual([]);
});
