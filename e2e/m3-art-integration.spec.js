import {test, expect} from '@playwright/test';
import {ANIME_CAST, ANIME_EXPRESSIONS} from '../src/characters/anime.js';

const BASE = '/city-builder-survival/';
const VIEWPORTS = [{width:1280,height:900},{width:390,height:844}];

async function openDossier(page, viewport) {
  await page.setViewportSize(viewport);
  await page.goto(`${BASE}?autostart=1&seed=42`);
  await expect(page.locator('.hud-day')).toHaveText('第 1 天', {timeout:30000});
  await page.getByRole('button', {name:'角色資訊', exact:true}).click();
  await expect(page.getByRole('dialog', {name:'倖存者檔案'})).toBeVisible();
  await expect(page.locator('.character-avatar')).toHaveCount(4);
}

function captureGame(page) {
  return page.evaluate(() => ({
    save:localStorage.getItem('cbs-save'),
    res:JSON.stringify(window.__game.state.resources),
    residents:JSON.stringify(window.__game.state.survivors),
  }));
}

for (const viewport of VIEWPORTS) {
  test.describe(`M3 artwork at ${viewport.width}px`, () => {
    for (const [char, set] of Object.entries(ANIME_CAST)) {
      test(`${char}: full PNG and all expressions`, async ({page}) => {
        // Isolate each character so slow software-WebGL rendering does not exhaust
        // a single timeout shared by every character and the fallback scenario.
        test.setTimeout(process.env.E2E_SLOW_WEBGL ? 600000 : 240000);
        const errors=[];
        page.on('pageerror', error => errors.push(error.message));
        await openDossier(page, viewport);
        const before=await captureGame(page);
        const records=await page.evaluate(() => window.__game.state.characters.records);
        const id=Object.keys(records).find(id => records[id].portraitSetId===set);
        expect(id, `missing resident with portrait set ${set}`).toBeTruthy();
        await page.locator(`[data-survivor-id="${id}"]`).click();

        const frame=page.locator('.portrait-frame');
        await expect(frame).toHaveAttribute('data-portrait-status', 'ready', {timeout:60000});
        const full=frame.locator('.character-portrait');
        await expect(full).toHaveAttribute('data-asset-id', `${char}.full.v001`);
        expect(await full.evaluate(img => [img.naturalWidth,img.naturalHeight,getComputedStyle(img).objectFit]))
          .toEqual([1024,1536,'contain']);
        await full.scrollIntoViewIfNeeded();
        const box=await full.boundingBox();
        expect(box).not.toBeNull();
        expect(box.width).toBeLessThanOrEqual(viewport.width);
        await page.screenshot({path:`docs/screenshots/m3-art-${char}-${viewport.width}.png`});

        for (const expression of ANIME_EXPRESSIONS) {
          await test.step(`${char} ${expression}`, async () => {
            await page.locator(`[data-expression="${expression}"]`).click();
            const expressionFrame=page.locator('.character-expression-frame');
            await expect(expressionFrame).toHaveAttribute('data-portrait-status','ready',{timeout:60000});
            const img=expressionFrame.locator('.character-expression-image');
            await expect(img).toHaveAttribute('data-asset-id',`${char}.${expression}.v001`);
            expect(await img.evaluate(image => [image.naturalWidth,image.naturalHeight]))
              .toEqual([512,512]);
          });
        }
        expect(await captureGame(page)).toEqual(before);
        expect(errors).toEqual([]);
      });
    }

    test('missing happy PNG falls back to verified neutral artwork', async ({page}) => {
      test.setTimeout(process.env.E2E_SLOW_WEBGL ? 600000 : 180000);
      const errors=[];
      page.on('pageerror', error => errors.push(error.message));
      await page.setViewportSize(viewport);
      await page.route('**/assets/anime/expressions/*_happy_v1.png',
        route => route.fulfill({status:404,body:''}));
      await page.goto(BASE);
      await page.getByRole('button', {name:'開始遊戲', exact:true}).click();
      await expect(page.locator('.hud-day')).toBeVisible({timeout:30000});
      await page.getByRole('button', {name:'角色資訊', exact:true}).click();
      await page.locator('[data-expression="happy"]').click();
      const frame=page.locator('.character-expression-frame');
      await expect(frame).toHaveAttribute('data-portrait-status','ready',{timeout:60000});
      await expect(frame.locator('.character-expression-image'))
        .toHaveAttribute('data-asset-id',/\.neutral\.v001$/);
      expect(errors).toEqual([]);
    });
  });
}
