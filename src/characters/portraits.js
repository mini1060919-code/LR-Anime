// Separate from GLTF boot. No external art ships: draft entries always fall back.
import { sha256 } from './hash.js';
const PATH = /^assets\/portraits\/[a-zA-Z0-9_/-]+\.(png|webp|jpe?g)$/;
const PERMISSIONS = ['display','commercial','modify','webDistribution','repositoryRedistribution'];
export function approvedAsset(asset, rights, kind='portrait') {
  const grant = rights?.records?.[asset?.licenseRef];
  return !!(asset?.status==='approved' && PATH.test(asset.path) && !asset.path.includes('//') &&
    /^[a-f0-9]{64}$/.test(asset.sha256) && Number.isSafeInteger(asset.byteLength) && asset.byteLength>0 && asset.byteLength<=(kind==='avatar'?24:350)*1024 &&
    Number.isInteger(asset.width) && asset.width>0 && asset.width<=2048 && Number.isInteger(asset.height) && asset.height>0 && asset.height<=2048 &&
    typeof asset.alt?.en==='string' && asset.alt.en.trim() && typeof asset.alt?.['zh-TW']==='string' && asset.alt['zh-TW'].trim() &&
    grant?.status==='approved' && ['Original','CC0','CC-BY-4.0','MIT'].includes(grant.licenseId) &&
    typeof grant.creator==='string' && grant.creator.trim() && typeof grant.evidenceRef==='string' && grant.evidenceRef.trim() &&
    typeof grant.reviewedBy==='string' && grant.reviewedBy.trim() && Number.isFinite(Date.parse(grant.reviewedAt)) &&
    typeof grant.attributionText==='string' && grant.attributionText.trim() && PERMISSIONS.every(key=>grant.permissions?.[key]===true));
}
export function chooseExpression(survivor) {
  if (survivor.hunger>=75 || survivor.thirst>=75) return 'worried';
  return survivor.buildingId==null ? 'neutral' : 'focused';
}
export function createPortraitManager({ fetcher=(...args)=>fetch(...args), baseUrl=import.meta.env?.BASE_URL ?? '/', cacheLimit=2 }={}) {
  let loaded;
  let disposed=false;
  const cache=new Map();
  const pending=new Map();
  const leases=new Set();
  async function ready() {
    if (!loaded) loaded=Promise.all(['manifest.v1.json','rights.v1.json'].map(async file=>{
      const response=await fetcher(`${baseUrl}assets/portraits/${file}`,{redirect:'error'});
      if(!response.ok) throw new Error('Portrait inventory unavailable.');
      return response.json();
    })).then(([manifest,rights])=>{
      if(manifest.schemaVersion!==1 || rights.schemaVersion!==1 || !manifest.portraitSets || !manifest.assets || !rights.records) throw new Error('Invalid portrait inventory.');
      return {manifest,rights};
    }).catch(error=>{loaded=undefined;throw error;});
    return loaded;
  }
  async function loadAsset(id, manifest, rights, kind) {
    const asset=Object.hasOwn(manifest.assets,id) ? manifest.assets[id] : null;
    if (!approvedAsset(asset,rights,kind) || disposed) return null;
    if(cache.has(id)) { const entry=cache.get(id); cache.delete(id); cache.set(id,entry); return entry; }
    if(pending.has(id)) return pending.get(id);
    const task=(async()=>{
      const response=await fetcher(`${baseUrl}${asset.path}`,{redirect:'error'});
      if(!response.ok) throw new Error('Portrait image unavailable.');
      const mime=response.headers.get('content-type')?.split(';')[0];
      const ext=asset.path.split('.').pop();
      const expected=ext==='png'?'image/png':ext==='webp'?'image/webp':'image/jpeg';
      if(mime!==expected) throw new Error('Portrait MIME mismatch.');
      // Bound streamed input before building a Blob; content-length is only advisory.
      const reader=response.body?.getReader();
      if(!reader) throw new Error('Portrait streaming unavailable.');
      const chunks=[];let length=0;
      try {
        while(true) {
          const {done,value}=await reader.read(); if(done)break;
          length+=value.byteLength;
          if(length>asset.byteLength) throw new Error('Portrait exceeds declared size.');
          chunks.push(value);
        }
      } finally { await reader.cancel().catch(()=>{}); }
      const bytes=new Uint8Array(length);let offset=0;
      for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
      if(length!==asset.byteLength || sha256(bytes)!==asset.sha256) throw new Error('Portrait checksum mismatch.');
      if(disposed)return null;
      const blob=new Blob([bytes],{type:mime});
      const descriptor={assetId:id,width:asset.width,height:asset.height,acquire(){
        if(disposed)throw new Error('Portrait manager disposed.');
        const src=URL.createObjectURL(blob);leases.add(src);
        return {src,release(){if(leases.delete(src))URL.revokeObjectURL(src);}};
      },alt:asset.alt,
        credit:rights.records[asset.licenseRef].attributionText,license:rights.records[asset.licenseRef].licenseId};
      cache.set(id,descriptor);
      while(cache.size>Math.max(1,cacheLimit)) { const oldest=cache.keys().next().value; cache.delete(oldest); }
      return descriptor;
    })();
    pending.set(id,task);
    try{return await task;}finally{pending.delete(id);}
  }
  async function resolve(setId, expression='neutral', kind='portrait') {
    try {
      const {manifest,rights}=await ready();
      const set=Object.hasOwn(manifest.portraitSets,setId)?manifest.portraitSets[setId]:null;
      if(!set)return null;
      const candidates=kind==='avatar'?[set.avatarAssetId]:[set.expressions?.[expression],set.neutralAssetId];
      for(const id of new Set(candidates.filter(id=>typeof id==='string'))) {
        try {const asset=await loadAsset(id,manifest,rights,kind);if(asset)return asset;}catch{/* try neutral, then CSS silhouette */}
      }
    } catch {/* inventory failures must never block game boot or saving */}
    return null;
  }
  function dispose(){disposed=true;for(const src of leases)URL.revokeObjectURL(src);leases.clear();cache.clear();}
  return {resolve,dispose};
}
