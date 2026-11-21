import { test,expect } from '@playwright/test';
import { createHash } from 'node:crypto';
import { deflateSync } from 'node:zlib';
const BASE='/city-builder-survival/';

async function begin(page){
 await page.getByRole('button',{name:'開始遊戲',exact:true}).click();
 await expect(page.locator('.hud-day')).toHaveText(/第 \d+ 天/,{timeout:30000});
}
async function importCheckpoint(page,data){
 await page.getByRole('button',{name:'存檔',exact:true}).click();
 page.once('dialog',dialog=>dialog.accept());
 await page.getByLabel('匯入存檔 JSON',{exact:true}).setInputFiles({name:'checkpoint.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});
 await expect(page.getByRole('button',{name:'開始遊戲',exact:true})).toBeVisible();
 await begin(page);
}

test('persistent named residents, high-water recruitment, v5 import and complete manual slots',async({page})=>{
 test.setTimeout(360000);
 await page.setViewportSize({width:600,height:500});
 await page.goto(`${BASE}?autostart=1&seed=42`);
 await expect(page.locator('.hud-day')).toHaveText('第 1 天',{timeout:30000});
 const initial=await page.evaluate(()=>JSON.parse(localStorage.getItem('cbs-save')));
 expect(initial.version).toBe(6);expect(Object.keys(initial.characters.records)).toHaveLength(4);
 expect(new Set(Object.values(initial.characters.records).map(record=>record.archetypeId)).size).toBe(4);
 for(const [id,record] of Object.entries(initial.characters.records)){
  expect(record.uid).toBe(`${initial.run.id}:${id}`);expect(record.professionId).toBeTruthy();expect(record.personalityIds.length).toBeGreaterThan(0);
 }
 const prior=structuredClone(initial);prior.core.survivors=prior.core.survivors.filter(s=>s.id!==4);delete prior.characters.records['4'];
 await importCheckpoint(page,prior);
 expect(await page.evaluate(()=>window.__game.state.nextSurvivorId)).toBe(5);
 // Exercise the actual dawn recruitment/save path. The separate original smoke test runs a full natural cycle.
 await page.evaluate(()=>{window.__game.state.phase='night';window.__game.state.timeInPhase=60;});
 await expect(page.locator('.hud-day')).toHaveText('第 2 天',{timeout:20000});
 const dawn=await page.evaluate(()=>JSON.parse(localStorage.getItem('cbs-save')));
 expect(dawn.run.id).toBe(initial.run.id);expect(dawn.run.nextSurvivorId).toBe(6);
 expect(dawn.core.survivors.map(s=>s.id)).toEqual([1,2,3,5]);
 expect(dawn.characters.records['4']).toBeUndefined();expect(dawn.characters.records['5'].uid).toBe(`${initial.run.id}:5`);
 expect(dawn.characters.records['5'].archetypeId).toBe('chr_generic');
 const {needs:initialNeeds,...initialIdentity}=initial.characters.records['1'];
 const {needs:dawnNeeds,...dawnIdentity}=dawn.characters.records['1'];
 expect(dawnIdentity).toEqual(initialIdentity);
 expect(dawnNeeds.fatigue).toBe(0);expect(dawnNeeds.health).toBe(100);
 expect(dawnNeeds.morale).toBeGreaterThanOrEqual(initialNeeds.morale);expect(dawnNeeds.morale).toBeLessThanOrEqual(100);
 await page.getByRole('button',{name:'角色資訊',exact:true}).click();
 const panel=page.getByRole('dialog',{name:'倖存者檔案'});
 await panel.locator('[data-survivor-id="5"]').click();
 await expect(panel.locator('.character-name')).toHaveText(dawn.characters.records['5'].nameSnapshot['zh-TW']);
 await expect(panel.locator('.character-profession')).not.toBeEmpty();
 await expect(panel.locator('.character-personality')).not.toBeEmpty();
 await expect(panel.locator('.character-appearance')).toContainText(dawn.characters.records['5'].portraitSetId);
 await expect(panel.locator('.operator-silhouette')).toBeVisible();
 await expect(panel.locator('.character-portrait')).toHaveCount(0);
 await page.screenshot({path:'/tmp/lr-m3-resident.png'});
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'存檔',exact:true}).click();
 await page.getByRole('button',{name:'儲存至槽位 1',exact:true}).click();
 const slot=await page.evaluate(()=>JSON.parse(localStorage.getItem('cbs-slot-1')));
 expect(slot.characters).toEqual(dawn.characters);expect(slot.run).toEqual(dawn.run);
 await page.getByRole('button',{name:'關閉存檔',exact:true}).click();
 const legacy={format:'last-refuge',version:5,checkpoint:'dawn',savedAt:'2026-11-17T00:00:00Z',payload:dawn.core};
 await importCheckpoint(page,legacy);
 const migrated=await page.evaluate(()=>JSON.parse(localStorage.getItem('cbs-save')));
 expect(migrated.version).toBe(6);expect(migrated.core).toEqual(dawn.core);
 expect(await page.evaluate(raw=>Object.keys(localStorage).some(key=>key.startsWith('cbs-backup:') && JSON.parse(localStorage.getItem(key)).pinned && JSON.parse(localStorage.getItem(key)).raw===raw),JSON.stringify(legacy))).toBe(true);
 const snapshot=JSON.stringify(migrated.characters);await page.reload();await begin(page);
 expect(await page.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('cbs-save')).characters))).toBe(snapshot);
});

// Construct an original transparent RGBA pixel in the test, not a third-party art asset.
function transparentPng(){
 const crc32=bytes=>{let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;};
 const chunk=(type,data)=>{const body=Buffer.concat([Buffer.from(type),data]);const length=Buffer.alloc(4);length.writeUInt32BE(data.length);const crc=Buffer.alloc(4);crc.writeUInt32BE(crc32(body));return Buffer.concat([length,body,crc]);};
 const header=Buffer.alloc(13);header.writeUInt32BE(1,0);header.writeUInt32BE(1,4);header[8]=8;header[9]=6;
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(Buffer.from([0,0,0,0,0]))),chunk('IEND',Buffer.alloc(0))]);
}

test('verified transparent PNG loading and checksum/decode failure default portrait',async({page})=>{
 test.setTimeout(180000);
 await page.setViewportSize({width:600,height:600});
 const png=transparentPng();const digest=createHash('sha256').update(png).digest('hex');
 const setIds=['chr_isumi_rin','chr_asagiri_mio','chr_tachibana_yuma','chr_shiraishi_tsumugi','chr_satsuki','chr_ren','chr_generic'].map(id=>`pset.${id}.standard.v001`);
 const asset={path:'assets/portraits/synthetic/neutral_v001.png',status:'approved',sha256:digest,byteLength:png.length,width:1,height:1,licenseRef:'test-only',alt:{en:'Synthetic transparent test pixel','zh-TW':'合成透明測試像素'}};
 const inventory={schemaVersion:1,portraitSets:Object.fromEntries(setIds.map(id=>[id,{neutralAssetId:'test-pixel',expressions:{neutral:'test-pixel',focused:'test-pixel',worried:'test-pixel'}}])),assets:{'test-pixel':asset}};
 const grants={schemaVersion:1,records:{'test-only':{creator:'Synthetic test fixture',status:'approved',licenseId:'Original',evidenceRef:'generated-in-test',reviewedBy:'Automated fixture',reviewedAt:'2026-11-17T00:00:00Z',attributionText:'Original synthetic test pixel',permissions:{display:true,commercial:true,modify:true,webDistribution:true,repositoryRedistribution:true}}}};
 let corrupt=false;
 await page.route('**/assets/portraits/manifest.v1.json',route=>route.fulfill({json:inventory}));
 await page.route('**/assets/portraits/rights.v1.json',route=>route.fulfill({json:grants}));
 await page.route('**/assets/portraits/synthetic/neutral_v001.png',route=>route.fulfill({contentType:'image/png',body:corrupt?Buffer.alloc(png.length):png}));
 await page.goto(`${BASE}?autostart=1&seed=42`);
 await expect(page.locator('.hud-day')).toHaveText('第 1 天',{timeout:30000});
 await page.getByRole('button',{name:'角色資訊',exact:true}).click();
 await expect(page.locator('.portrait-frame')).toHaveAttribute('data-portrait-status','ready');
 await expect(page.locator('.character-portrait')).toBeVisible();
 await expect(page.locator('.character-portrait')).toHaveAttribute('alt','合成透明測試像素');
 await expect(page.locator('.portrait-frame .portrait-credit')).toContainText('Original synthetic test pixel');
 // Reload releases URL/cache state; the same approved metadata must reject tampered bytes.
 corrupt=true;await page.goto(BASE);await begin(page);
 const rejectedImage=page.waitForResponse(response=>response.url().endsWith('/synthetic/neutral_v001.png'));
 await page.getByRole('button',{name:'角色資訊',exact:true}).click();
 await rejectedImage;
 await expect(page.locator('.portrait-frame')).toHaveAttribute('data-portrait-status','fallback');
 await expect(page.locator('.operator-silhouette')).toBeVisible();
 await expect(page.locator('.character-portrait')).toHaveCount(0);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('cbs-save')).version)).toBe(6);
 // A matching digest with undecodable image bytes must also fall back after native decode.
 inventory.assets['test-pixel'].sha256=createHash('sha256').update(Buffer.alloc(png.length)).digest('hex');
 await page.goto(BASE);await begin(page);
 const decodeAttempt=page.waitForResponse(response=>response.url().endsWith('/synthetic/neutral_v001.png'));
 await page.getByRole('button',{name:'角色資訊',exact:true}).click();await decodeAttempt;
 await expect(page.locator('.portrait-frame')).toHaveAttribute('data-portrait-status','fallback');
 await expect(page.locator('.character-portrait')).toHaveCount(0);
});
