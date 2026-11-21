import {describe,it,expect,vi,afterEach} from 'vitest';
import {sha256} from '../src/characters/hash.js';
import {approvedAsset,createPortraitManager,chooseExpression} from '../src/characters/portraits.js';
import shippedManifest from '../public/assets/portraits/manifest.v1.json';
import rights from '../public/assets/portraits/rights.v1.json';
const manifest=structuredClone(shippedManifest);
for(const asset of Object.values(manifest.assets))asset.status='draft';
// Synthetic test bytes, not shipped character artwork. Native decode is tested in browser.
const bytes=new Uint8Array([137,80,78,71,13,10,26,10,1,2,3,4]);
const approved={status:'approved',path:'assets/portraits/test/neutral.png',sha256:sha256(bytes),byteLength:bytes.length,width:1,height:1,licenseRef:'test',alt:{en:'Synthetic test pixel','zh-TW':'測試像素'}};
const grants={schemaVersion:1,records:{test:{status:'approved',creator:'Test fixture',licenseId:'Original',evidenceRef:'test-only',reviewedBy:'Test fixture',reviewedAt:'2026-11-17T00:00:00Z',attributionText:'Synthetic test fixture',permissions:{display:true,commercial:true,modify:true,webDistribution:true,repositoryRedistribution:true}}}};
function setup({assets={neutral:approved},set={neutralAssetId:'neutral',avatarAssetId:'neutral',expressions:{neutral:'neutral'}},image=()=>new Response(bytes,{headers:{'content-type':'image/png'}})}={}){
 const fetcher=vi.fn(async url=>url.endsWith('manifest.v1.json')?Response.json({schemaVersion:1,portraitSets:{test:set},assets}):url.endsWith('rights.v1.json')?Response.json(grants):image(url));
 return {fetcher,manager:createPortraitManager({fetcher})};
}
afterEach(()=>vi.restoreAllMocks());
describe('portrait inventory and licensing gate',()=>{
 it('ships only draft fixed IDs, no falsely approved portraits or unknown third-party files',()=>{
  expect(Object.keys(manifest.portraitSets)).toHaveLength(7);
  expect(Object.keys(manifest.assets)).toHaveLength(46);
  for(const asset of Object.values(manifest.assets)){expect(asset.status).toBe('draft');expect(approvedAsset(asset,rights)).toBe(false);}
 });
 it('gates on complete approval and validates local web image paths',()=>{
  expect(approvedAsset(approved,grants)).toBe(true);
  for(const change of [{status:'draft'},{path:'https://third-party/image.png'},{path:'assets/portraits/../steal.png'},
   {path:'assets/portraits/unsafe.svg'},{sha256:'bad'},{byteLength:9999999},{width:99999}])expect(approvedAsset({...approved,...change},grants)).toBe(false);
  for(const key of ['commercial','modify','webDistribution','repositoryRedistribution']){
   const clone=structuredClone(grants);clone.records.test.permissions[key]=false;expect(approvedAsset(approved,clone)).toBe(false);
  }
 });
 it('requires evidence, reviewer and attribution, not just an Original label',()=>{
  for(const key of ['evidenceRef','creator','reviewedBy','attributionText']){
   const clone=structuredClone(grants);clone.records.test[key]='';expect(approvedAsset(approved,clone)).toBe(false);
  }
 });
 it('selects expressions from existing survival/work state without mutation',()=>{
  const survivor={hunger:80,thirst:20,buildingId:2};const before={...survivor};
  expect(chooseExpression(survivor)).toBe('worried');expect(survivor).toEqual(before);
  expect(chooseExpression({hunger:0,thirst:0,buildingId:2})).toBe('focused');
  expect(chooseExpression({hunger:0,thirst:0,buildingId:null})).toBe('neutral');
 });
});
describe('lazy verified image loader and fallback',()=>{
 it('performs no fetch at construction and never requests draft images',async()=>{
  const fetcher=vi.fn(async url=>Response.json(url.endsWith('manifest.v1.json')?manifest:rights));
  const manager=createPortraitManager({fetcher});expect(fetcher).not.toHaveBeenCalled();
  expect(await manager.resolve('pset.chr_isumi_rin.standard.v001')).toBeNull();expect(fetcher).toHaveBeenCalledTimes(2);
 });
 it('loads verified PNG, shares requests and reuses bounded cached image blobs',async()=>{
  const {manager,fetcher}=setup();const [a,b]=await Promise.all([manager.resolve('test'),manager.resolve('test')]);
  expect(a).toBe(b);const lease=a.acquire();expect(lease.src).toMatch(/^blob:/);lease.release();expect(fetcher).toHaveBeenCalledTimes(3);
  expect(await manager.resolve('test')).toBe(a);expect(fetcher).toHaveBeenCalledTimes(3);manager.dispose();
 });
 it('uses neutral when a requested expression is absent or fails checksum',async()=>{
  const {manager}=setup({assets:{neutral:approved,bad:{...approved,sha256:'0'.repeat(64)}},set:{neutralAssetId:'neutral',expressions:{worried:'bad'}}});
  expect((await manager.resolve('test','worried')).assetId).toBe('neutral');manager.dispose();
 });
 it.each(['mime','checksum','oversize','short','404'])('falls back safely on %s',async failure=>{
  const {manager}=setup({image:()=>{
   if(failure==='404')return new Response('',{status:404});
   const data=failure==='oversize'?new Uint8Array(100):failure==='short'?bytes.slice(0,2):failure==='checksum'?new Uint8Array(bytes.length):bytes;
   return new Response(data,{headers:{'content-type':failure==='mime'?'text/html':'image/png'}});
  }});
  expect(await manager.resolve('test')).toBeNull();manager.dispose();
 });
 it('does not fetch unknown appearance IDs and does not fall back to a full portrait for a missing avatar',async()=>{
  const {manager,fetcher}=setup({set:{neutralAssetId:'neutral',expressions:{neutral:'neutral'}}});
  expect(await manager.resolve('unknown')).toBeNull();expect(await manager.resolve('test','neutral','avatar')).toBeNull();expect(fetcher).toHaveBeenCalledTimes(2);manager.dispose();
 });
 it('keeps active URL leases valid across cache eviction and releases them on disposal',async()=>{
  const revoke=vi.spyOn(URL,'revokeObjectURL');
  const {manager}=setup({assets:{a:approved,b:approved,c:approved},set:{neutralAssetId:'a',expressions:{neutral:'a',focused:'b',worried:'c'}}});
  const first=await manager.resolve('test');const lease=first.acquire();
  await manager.resolve('test','focused');await manager.resolve('test','worried');
  expect(revoke).not.toHaveBeenCalledWith(lease.src);
  expect(await manager.resolve('test')).not.toBe(first);
  lease.release();lease.release();expect(revoke.mock.calls.filter(([src])=>src===lease.src)).toHaveLength(1);
  const live=first.acquire();manager.dispose();expect(revoke).toHaveBeenCalledWith(live.src);
  expect(()=>first.acquire()).toThrow('disposed');expect(await manager.resolve('test')).toBeNull();
 });
 it('retries failed inventory on a subsequent request without blocking game boot',async()=>{
  let failed=true;const {manager:unused}=setup();unused.dispose();
  const fetcher=vi.fn(async url=>{
   if(failed)throw new Error('offline');
   return url.endsWith('manifest.v1.json')?Response.json({schemaVersion:1,portraitSets:{},assets:{}}):Response.json(grants);
  });
  const manager=createPortraitManager({fetcher});expect(await manager.resolve('test')).toBeNull();failed=false;
  expect(await manager.resolve('test')).toBeNull();expect(fetcher.mock.calls.length).toBeGreaterThan(2);manager.dispose();
 });
});

describe('build-time artwork verification',()=>{
 it('accepts the pending inventory without claiming any finished artwork',async()=>{
  const {verifyPortraitInventory}=await import('../scripts/verify-portraits.mjs');
  const read=vi.fn();expect(await verifyPortraitInventory(manifest,rights,read)).toEqual({approved:0,draft:46});
  expect(read).not.toHaveBeenCalled();
 });
 it('fails build validation for unapproved art and broken ID references',async()=>{
  const {verifyPortraitInventory}=await import('../scripts/verify-portraits.mjs');
  const candidate=structuredClone(manifest);const first=Object.keys(candidate.assets)[0];candidate.assets[first].status='approved';
  await expect(verifyPortraitInventory(candidate,rights,vi.fn())).rejects.toThrow('approval');
  const missing=structuredClone(manifest);delete missing.assets[first];
  await expect(verifyPortraitInventory(missing,rights,vi.fn())).rejects.toThrow('Missing');
 });
 it('fails validation when approved bytes do not match their recorded digest',async()=>{
  const {verifyPortraitInventory}=await import('../scripts/verify-portraits.mjs');
  const candidate={schemaVersion:1,portraitSets:{'pset.test.v001':{neutralAssetId:'a',expressions:{neutral:'a'}}},assets:{a:approved}};
  await expect(verifyPortraitInventory(candidate,grants,async()=>Buffer.alloc(bytes.length))).rejects.toThrow('checksum');
 });
});
