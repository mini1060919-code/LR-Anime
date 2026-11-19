import {test,expect} from '@playwright/test';
// Keep the CSS viewport and gameplay checks while reducing software WebGL raster load.
test.use({ deviceScaleFactor: 0.5 });
const BASE='/city-builder-survival/';
async function start(page){await page.getByRole('button',{name:'開始遊戲',exact:true}).click();await expect(page.locator('.hud-day')).toBeVisible({timeout:30000});}
async function transfer(page,data){await page.getByRole('button',{name:'存檔',exact:true}).click();page.once('dialog',d=>d.accept());await page.getByLabel('匯入存檔 JSON',{exact:true}).setInputFiles({name:'autonomy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});await start(page);}
for(const width of [1000,390])test(`M5-B rest, reserved manual priority and recovered work at ${width}px`,async({page},testInfo)=>{
 test.setTimeout(process.env.E2E_SLOW_WEBGL?600000:240000);await page.setViewportSize({width,height:900});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`${BASE}?autostart=1&seed=42`);await expect(page.locator('.hud-day')).toHaveText('第 1 天',{timeout:30000});
 const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('cbs-save')));
 save.core.buildings.push({id:2,defId:'farm',x:20,z:20,hp:180,workers:[1],autoAssign:true,extracted:0,efficiency:1,enabled:true,repairing:false,priority:1,level:1});save.core.survivors.find(s=>s.id===1).buildingId=2;
 save.characters.records['1'].needs.fatigue=90;
 for(const id of ['2','3','4'])save.characters.records[id].autonomy.mode='manual';
 await transfer(page,save);
 await expect.poll(()=>page.evaluate(()=>window.__game.state.characters.records['1'].autonomy.resting),{timeout:30000}).toBe(true);
 expect(await page.evaluate(()=>window.__game.state.survivors.find(s=>s.id===1).buildingId)).toBeNull();
 await page.getByRole('button',{name:'角色資訊',exact:true}).click();await expect(page.locator('.autonomy-status')).toHaveText('自主休息：疲勞偏高');
 await expect(page.locator('.character-portrait')).toBeVisible();await expect(page.locator('.skill-row')).toHaveCount(6);await expect(page.locator('.needs-row')).toHaveCount(3);
 await page.getByLabel('工作建築',{exact:true}).selectOption('2');await page.getByRole('button',{name:'指派居民',exact:true}).click();
 await expect(page.locator('.resident-autonomy')).toContainText('已保留手動工作意向：建築 #2');expect(await page.evaluate(()=>window.__game.state.characters.records['1'].autonomy.mode)).toBe('manual');
 expect(await page.evaluate(()=>window.__game.state.survivors.find(s=>s.id===1).buildingId)).toBeNull();
 await page.locator('.resident-autonomy').scrollIntoViewIfNeeded();await page.screenshot({path:testInfo.outputPath(`m5b-rest-${width}.png`)});
 await page.getByRole('button',{name:'關閉檔案',exact:true}).click();
 // A valid saved mid-rest fixture: subsequent recovery and priority displacement use real simulation.
 const mid=structuredClone(save);mid.characters.survival.lastStep=1000;mid.characters.survival.elapsedSeconds=100;
 mid.characters.records['1'].needs.fatigue=35.2;mid.characters.records['1'].autonomy={mode:'manual',targetBuildingId:2,resting:true,reason:'fatigue',cooldownUntil:10};mid.core.survivors.find(s=>s.id===1).buildingId=null;
 for(const id of ['2','3']){mid.characters.records[id].autonomy={mode:'auto',targetBuildingId:null,resting:false,reason:null,cooldownUntil:0};mid.core.survivors.find(s=>String(s.id)===id).buildingId=2;}
 mid.core.buildings.find(b=>b.id===2).workers=[2,3];
 await transfer(page,mid);await page.keyboard.press('3');
 await expect.poll(()=>page.evaluate(()=>window.__game.state.survivors.find(s=>s.id===1).buildingId),{timeout:60000}).toBe(2);
 await page.getByRole('button',{name:'角色資訊',exact:true}).click();await expect(page.locator('.autonomy-status')).toHaveText('手動指定工作');
 const state=await page.evaluate(()=>({a:window.__game.state.characters.records['1'].autonomy,workers:window.__game.state.buildings.find(b=>b.id===2).workers,owners:window.__game.state.buildings.filter(b=>b.workers.includes(1)).length}));
 expect(state.a.resting).toBe(false);expect(state.a.targetBuildingId).toBe(2);expect(state.workers).toHaveLength(2);expect(state.workers).toContain(1);expect(state.owners).toBe(1);
 await page.locator('.resident-autonomy').scrollIntoViewIfNeeded();await page.screenshot({path:testInfo.outputPath(`m5b-work-${width}.png`)});
 await page.getByRole('button',{name:'關閉檔案',exact:true}).click();await page.evaluate(()=>{window.__game.state.phase='night';window.__game.state.timeInPhase=60;});await expect(page.locator('.hud-day')).toHaveText('第 2 天',{timeout:30000});
 const dawn=await page.evaluate(()=>JSON.parse(localStorage.getItem('cbs-save')));expect(dawn.characters.records['1'].autonomy.mode).toBe('manual');expect(dawn.requiredFeatures.at(-1)).toBe('autonomy-v1');
 await page.reload();await start(page);await page.getByRole('button',{name:'角色資訊',exact:true}).click();await expect(page.locator('.autonomy-status')).toHaveText('手動指定工作');expect(await page.evaluate(()=>window.__game.state.characters.records['1'].uid)).toBe(save.characters.records['1'].uid);
 await page.getByRole('button',{name:'交回居民自主安排',exact:true}).click();await expect(page.locator('.autonomy-status')).toHaveText('自主工作中');
 await page.getByLabel('工作建築',{exact:true}).selectOption('');await page.getByRole('button',{name:'指派居民',exact:true}).click();await expect(page.locator('.autonomy-status')).toHaveText('手動待命');
 const before=await page.evaluate(()=>window.__game.state.characters.survival.elapsedSeconds);await page.getByRole('button',{name:'關閉檔案',exact:true}).click();await page.keyboard.press('3');
 await expect.poll(()=>page.evaluate(()=>window.__game.state.characters.survival.elapsedSeconds),{timeout:30000}).toBeGreaterThan(before+3);expect(await page.evaluate(()=>window.__game.state.survivors.find(s=>s.id===1).buildingId)).toBeNull();
 if(width===1000){page.once('dialog',d=>d.accept());await page.getByLabel('語言',{exact:true}).selectOption('en');await page.getByRole('button',{name:'Start game',exact:true}).click();await expect(page.locator('.hud-day')).toBeVisible({timeout:30000});await page.getByRole('button',{name:'Characters',exact:true}).click();await expect(page.locator('.resident-autonomy')).toHaveAttribute('aria-label','Resident autonomy');}
 expect(errors).toEqual([]);
});
