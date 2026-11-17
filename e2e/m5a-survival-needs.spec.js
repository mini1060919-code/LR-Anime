import {test,expect} from '@playwright/test';
const BASE='/city-builder-survival/';
async function start(page){await page.getByRole('button',{name:'開始遊戲',exact:true}).click();await expect(page.locator('.hud-day')).toBeVisible({timeout:30000});}
async function transfer(page,data){await page.getByRole('button',{name:'存檔',exact:true}).click();page.once('dialog',d=>d.accept());await page.getByLabel('匯入存檔 JSON',{exact:true}).setInputFiles({name:'needs.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});await start(page);}
for(const width of [1000,390])test(`M5-A needs, real duty and rest, saved growth at ${width}px`,async({page})=>{
 test.setTimeout(process.env.E2E_SLOW_WEBGL?600000:240000);await page.setViewportSize({width,height:900});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`${BASE}?autostart=1&seed=42`);await expect(page.locator('.hud-day')).toHaveText('第 1 天',{timeout:30000});
 let save=await page.evaluate(()=>JSON.parse(localStorage.getItem('cbs-save')));
 if(width===1000){
  const old=structuredClone(save);old.requiredFeatures.pop();delete old.characters.survival;for(const r of Object.values(old.characters.records))delete r.needs;
  await transfer(page,old);save=await page.evaluate(()=>JSON.parse(localStorage.getItem('cbs-save')));
  expect(save.characters.records['1'].needs).toEqual({fatigue:0,health:100,morale:70});expect(save.characters.records['1'].uid).toBe(old.characters.records['1'].uid);
  expect(save.characters.records['1'].experience).toEqual(old.characters.records['1'].experience);
  expect(await page.evaluate(raw=>Object.keys(localStorage).some(k=>k.startsWith('cbs-backup:')&&JSON.parse(localStorage.getItem(k)).pinned&&JSON.parse(localStorage.getItem(k)).raw===raw),JSON.stringify(old))).toBe(true);
 }
 save.core.buildings.push({id:2,defId:'farm',x:20,z:20,hp:180,workers:[],autoAssign:false,extracted:0,efficiency:1,enabled:true,repairing:false,priority:1,level:1});
 save.characters.records['1'].needs={fatigue:80,health:50,morale:20};save.characters.records['2'].needs={fatigue:50,health:100,morale:70};
 await transfer(page,save);await page.getByRole('button',{name:'角色資訊',exact:true}).click();
 await expect(page.locator('.needs-row')).toHaveCount(3);await expect(page.locator('.needs-row strong')).toHaveText(['疲勞','健康','士氣']);
 await expect(page.locator('[data-need="fatigue"]')).toContainText('精疲力竭');await expect(page.locator('[data-need="health"]')).toContainText('欠佳');await expect(page.locator('[data-need="morale"]')).toContainText('低落');
 await expect(page.locator('.skill-row')).toHaveCount(6);await expect(page.locator('.character-portrait')).toBeVisible();await expect(page.locator('.character-avatar')).toHaveCount(4);
 await page.getByLabel('工作建築',{exact:true}).selectOption('2');await page.getByRole('button',{name:'指派居民',exact:true}).click();
 const before=await page.evaluate(()=>({worker:window.__game.state.characters.records['1'].needs.fatigue,idle:window.__game.state.characters.records['2'].needs.fatigue,step:window.__game.state.characters.survival.lastStep}));
 await page.getByRole('button',{name:'關閉檔案',exact:true}).click();await page.keyboard.press('3');
 await expect.poll(()=>page.evaluate(()=>window.__game.state.characters.survival.lastStep),{timeout:30000}).toBeGreaterThan(before.step+10);
 await page.getByRole('button',{name:'角色資訊',exact:true}).click();
 const worked=await page.evaluate(()=>({worker:window.__game.state.characters.records['1'].needs.fatigue,idle:window.__game.state.characters.records['2'].needs.fatigue}));
 expect(worked.worker).toBeGreaterThan(before.worker);expect(worked.idle).toBeLessThan(before.idle);
 await page.locator('.resident-needs').scrollIntoViewIfNeeded();await page.screenshot({path:`docs/screenshots/m5a-needs-${width}.png`});
 await page.getByLabel('套用生存需求效率',{exact:true}).uncheck();await expect(page.locator('.needs-efficiency')).toContainText('100.0%');
 await page.getByRole('button',{name:'關閉檔案',exact:true}).click();await page.evaluate(()=>{window.__game.state.phase='night';window.__game.state.timeInPhase=60;});
 await expect(page.locator('.hud-day')).toHaveText('第 2 天',{timeout:30000});const dawn=await page.evaluate(()=>JSON.parse(localStorage.getItem('cbs-save')));
 expect(dawn.characters.survival.effectsEnabled).toBe(false);expect(dawn.characters.survival.lastStep).toBeGreaterThan(before.step);expect(dawn.characters.records['1'].needs.fatigue).toBeGreaterThan(before.worker);
 await page.reload();await start(page);await page.getByRole('button',{name:'角色資訊',exact:true}).click();
 expect(await page.evaluate(()=>window.__game.state.characters.records['1'].uid)).toBe(save.characters.records['1'].uid);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('cbs-save')).characters.records['1'].needs)).toEqual(dawn.characters.records['1'].needs);
 expect(await page.evaluate(()=>window.__game.state.characters.survival.lastStep)).toBeGreaterThanOrEqual(dawn.characters.survival.lastStep);
 await expect(page.locator('.needs-efficiency')).toContainText('100.0%');await expect(page.locator('.character-assignment')).toContainText('農場');
 await page.getByLabel('工作建築',{exact:true}).selectOption('');await page.getByRole('button',{name:'指派居民',exact:true}).click();const fatigue=await page.evaluate(()=>window.__game.state.characters.records['1'].needs.fatigue);
 await page.getByRole('button',{name:'關閉檔案',exact:true}).click();await expect.poll(()=>page.evaluate(()=>window.__game.state.characters.records['1'].needs.fatigue),{timeout:30000}).toBeLessThan(fatigue);
 if(width===1000){page.once('dialog',d=>d.accept());await page.getByLabel('語言',{exact:true}).selectOption('en');await page.getByRole('button',{name:'Start game',exact:true}).click();await expect(page.locator('.hud-day')).toBeVisible({timeout:30000});await page.getByRole('button',{name:'Characters',exact:true}).click();await expect(page.locator('.needs-row strong')).toHaveText(['Fatigue','Health','Morale']);}
 expect(errors).toEqual([]);
});
