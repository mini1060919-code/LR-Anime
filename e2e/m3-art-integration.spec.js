import {test,expect} from '@playwright/test';
import {ANIME_CAST,ANIME_EXPRESSIONS} from '../src/characters/anime.js';
const BASE='/city-builder-survival/';
for(const viewport of [{width:1280,height:900},{width:390,height:844}]){
 test(`supplied four-character PNGs, all expressions and fallback at ${viewport.width}px`,async({page})=>{
  test.setTimeout(process.env.E2E_SLOW_WEBGL?600000:360000);await page.setViewportSize(viewport);
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`${BASE}?autostart=1&seed=42`);
  await expect(page.locator('.hud-day')).toHaveText('第 1 天',{timeout:30000});
  await page.getByRole('button',{name:'角色資訊',exact:true}).click();
  const before=await page.evaluate(()=>({save:localStorage.getItem('cbs-save'),res:JSON.stringify(window.__game.state.resources),residents:JSON.stringify(window.__game.state.survivors)}));
  const records=await page.evaluate(()=>window.__game.state.characters.records);
  await expect(page.locator('.character-avatar')).toHaveCount(4);
  for(const [char,set] of Object.entries(ANIME_CAST)){
   const id=Object.keys(records).find(id=>records[id].portraitSetId===set);expect(id).toBeTruthy();
   await page.locator(`[data-survivor-id="${id}"]`).click();
   const full=page.locator('.character-portrait');
   await expect(full).toHaveAttribute('data-asset-id',`${char}.full.v001`);
   await expect(page.locator('.portrait-frame')).toHaveAttribute('data-portrait-status','ready');
   expect(await full.evaluate(img=>[img.naturalWidth,img.naturalHeight,getComputedStyle(img).objectFit])).toEqual([1024,1536,'contain']);
   await full.scrollIntoViewIfNeeded();
   const box=await full.boundingBox();expect(box.width).toBeLessThanOrEqual(viewport.width);
   await page.screenshot({path:`docs/screenshots/m3-art-${char}-${viewport.width}.png`});
   for(const expression of ANIME_EXPRESSIONS){
    await page.locator(`[data-expression="${expression}"]`).click();
    await expect(page.locator('.character-expression-frame')).toHaveAttribute('data-portrait-status','ready');
    await expect(page.locator('.character-expression-image')).toHaveAttribute('data-asset-id',`${char}.${expression}.v001`);
    expect(await page.locator('.character-expression-image').evaluate(img=>[img.naturalWidth,img.naturalHeight])).toEqual([512,512]);
   }
  }
  expect(await page.evaluate(()=>({save:localStorage.getItem('cbs-save'),res:JSON.stringify(window.__game.state.resources),residents:JSON.stringify(window.__game.state.survivors)}))).toEqual(before);
  // Fresh loader: a missing happy image must use the real neutral PNG.
  await page.route('**/assets/anime/expressions/*_happy_v1.png',route=>route.fulfill({status:404,body:''}));
  await page.goto(BASE);await page.getByRole('button',{name:'開始遊戲',exact:true}).click();
  await expect(page.locator('.hud-day')).toBeVisible({timeout:30000});await page.getByRole('button',{name:'角色資訊',exact:true}).click();
  await page.locator('[data-expression="happy"]').click();
  await expect(page.locator('.character-expression-frame')).toHaveAttribute('data-portrait-status','ready');
  await expect(page.locator('.character-expression-image')).toHaveAttribute('data-asset-id',/\.neutral\.v001$/);
  expect(errors).toEqual([]);
 });
}
