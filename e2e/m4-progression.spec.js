import {test,expect} from '@playwright/test';
const BASE='/city-builder-survival/';
for(const width of [1000,390])test(`Traditional Chinese skills, validated assignment and dawn persistence at ${width}px`,async({page})=>{
 test.setTimeout(process.env.E2E_SLOW_WEBGL?600000:240000);
 await page.setViewportSize({width,height:900});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`${BASE}?autostart=1&seed=42`);await expect(page.locator('.hud-day')).toHaveText('第 1 天',{timeout:30000});
 // Install a known v6 dawn fixture through the supported JSON UI. No test awards XP.
 const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('cbs-save')));
 save.core.buildings.push({id:2,defId:'farm',x:20,z:20,hp:180,workers:[],autoAssign:false,extracted:0,efficiency:1,enabled:true,repairing:false,priority:1,level:1});
 const farmer=Object.keys(save.characters.records).find(id=>save.characters.records[id].professionId==='medic') ?? '1';
 save.characters.records[farmer].abilityRanks.agriculture=0;save.characters.records[farmer].experience.agriculture=9500;
 await page.getByRole('button',{name:'存檔',exact:true}).click();page.once('dialog',d=>d.accept());
 await page.getByLabel('匯入存檔 JSON',{exact:true}).setInputFiles({name:'m4.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(save))});
 await page.getByRole('button',{name:'開始遊戲',exact:true}).click();await expect(page.locator('.hud-day')).toBeVisible({timeout:30000});
 await page.getByRole('button',{name:'角色資訊',exact:true}).click();await page.locator(`[data-survivor-id="${farmer}"]`).click();
 await expect(page.locator('.skill-row')).toHaveCount(6);await expect(page.locator('.skill-row strong')).toHaveText(['農業','工程','醫療能力','探索採集','防禦','後勤']);
 await expect(page.locator('.character-portrait')).toBeVisible();await expect(page.locator('.character-avatar')).toHaveCount(4);
 await page.getByLabel('工作建築',{exact:true}).selectOption('2');await page.getByRole('button',{name:'指派居民',exact:true}).click();
 await expect(page.locator('.character-assignment')).toContainText('農場');
 expect(await page.evaluate(id=>{const s=window.__game.state;return {id:s.survivors.find(r=>r.id===Number(id)).buildingId,workers:s.buildings.find(b=>b.id===2).workers,auto:s.buildings.find(b=>b.id===2).autoAssign};},farmer)).toEqual({id:2,workers:[Number(farmer)],auto:false});
 await page.getByLabel('啟用有上限的能力加成',{exact:true}).uncheck();
 expect(await page.evaluate(()=>window.__game.state.characters.progression.effectsEnabled)).toBe(false);
 await page.getByRole('button',{name:'關閉檔案',exact:true}).click();
 // Run actual production; no fabricated receipt/XP injection after initial fixture.
 await page.keyboard.press('3');
 await expect.poll(()=>page.evaluate(id=>window.__game.state.characters.records[id].abilityRanks.agriculture,farmer),{timeout:120000}).toBeGreaterThanOrEqual(1);
 await page.getByRole('button',{name:'角色資訊',exact:true}).click();await page.locator(`[data-survivor-id="${farmer}"]`).click();
 const xp=await page.evaluate(id=>window.__game.state.characters.records[id].experience.agriculture,farmer);expect(xp).toBeGreaterThanOrEqual(10000);
 await expect(page.locator('[data-skill="agriculture"]')).toContainText('等級 1');
 await page.locator('.character-portrait').scrollIntoViewIfNeeded();await page.screenshot({path:`docs/screenshots/m4-dossier-${width}.png`});
 await page.locator('.character-growth').scrollIntoViewIfNeeded();await page.screenshot({path:`docs/screenshots/m4-skills-${width}.png`});
 await page.getByRole('button',{name:'關閉檔案',exact:true}).click();
 // Cross the existing dawn path; original smoke separately verifies a natural cycle.
 await page.evaluate(()=>{window.__game.state.phase='night';window.__game.state.timeInPhase=60;});
 await expect(page.locator('.hud-day')).toHaveText('第 2 天',{timeout:30000});
 const dawn=await page.evaluate(()=>JSON.parse(localStorage.getItem('cbs-save')));
 expect(dawn.requiredFeatures).toEqual(['characters-v1','progression-v1']);expect(dawn.characters.records[farmer].experience.agriculture).toBeGreaterThanOrEqual(xp);
 expect(dawn.core.survivors.find(s=>String(s.id)===farmer).buildingId).toBe(2);
 await page.reload();await page.getByRole('button',{name:'開始遊戲',exact:true}).click();await expect(page.locator('.hud-day')).toHaveText('第 2 天',{timeout:30000});
 await page.getByRole('button',{name:'角色資訊',exact:true}).click();await page.locator(`[data-survivor-id="${farmer}"]`).click();
 await expect(page.locator('[data-skill="agriculture"]')).toContainText('等級 1');
 expect(await page.evaluate(id=>window.__game.state.characters.records[id].uid,farmer)).toBe(save.characters.records[farmer].uid);
 await page.getByRole('button',{name:'恢復建築自動派工',exact:true}).click();expect(await page.evaluate(()=>window.__game.state.buildings.find(b=>b.id===2).autoAssign)).toBe(true);
 await page.getByLabel('工作建築',{exact:true}).selectOption('');await page.getByRole('button',{name:'指派居民',exact:true}).click();await expect(page.locator('.character-assignment')).toHaveText('待命中');
 if(width===1000){
  await page.getByRole('button',{name:'關閉檔案',exact:true}).click();page.once('dialog',d=>d.accept());await page.getByLabel('語言',{exact:true}).selectOption('en');
  await page.getByRole('button',{name:'Start game',exact:true}).click();await expect(page.locator('.hud-day')).toHaveText('Day 2',{timeout:30000});
  await page.getByRole('button',{name:'Characters',exact:true}).click();await page.locator(`[data-survivor-id="${farmer}"]`).click();
  await expect(page.locator('.skill-row strong')).toHaveText(['Agriculture','Engineering','Medicine skill','Scavenging','Defense','Logistics']);
 }
 expect(errors).toEqual([]);
});
