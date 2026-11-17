// Validate approved local art before build. Draft inventory is not finished artwork.
import { readFile, realpath } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { approvedAsset } from '../src/characters/portraits.js';

export async function verifyPortraitInventory(manifest,rights,readAsset) {
  if(manifest.schemaVersion!==1 || rights.schemaVersion!==1 || !manifest.assets || !manifest.portraitSets)throw new Error('Invalid portrait manifest schema.');
  const kinds=new Map();
  for(const [id,set] of Object.entries(manifest.portraitSets)) {
    if(!/^pset\.[a-z0-9_.-]+$/.test(id) || set.expressions?.neutral!==set.neutralAssetId)throw new Error('Invalid portrait set.');
    for(const assetId of Object.values(set.expressions ?? {})) {
      if(!Object.hasOwn(manifest.assets,assetId))throw new Error(`Missing portrait asset ID: ${assetId}`);
      kinds.set(assetId,'portrait');
    }
    if(set.avatarAssetId) {
      if(!Object.hasOwn(manifest.assets,set.avatarAssetId))throw new Error('Missing avatar asset ID.');
      kinds.set(set.avatarAssetId,'avatar');
    }
  }
  let approved=0,draft=0;
  for(const [id,asset] of Object.entries(manifest.assets)) {
    if(!kinds.has(id))throw new Error(`Unreferenced asset: ${id}`);
    if(asset.status==='draft'){draft++;continue;}
    if(!approvedAsset(asset,rights,kinds.get(id)))throw new Error(`Artwork approval/rights incomplete: ${id}`);
    const bytes=await readAsset(asset.path);
    if(bytes.byteLength!==asset.byteLength || createHash('sha256').update(bytes).digest('hex')!==asset.sha256)throw new Error(`Artwork bytes/checksum mismatch: ${id}`);
    // Actual decoding/dimensions are checked again by the browser before display.
    if(asset.path.endsWith('.png') && (bytes.length<24 || bytes.readUInt32BE(0)!==0x89504e47 || bytes.readUInt32BE(16)!==asset.width || bytes.readUInt32BE(20)!==asset.height))throw new Error(`PNG dimensions/header mismatch: ${id}`);
    approved++;
  }
  return {approved,draft};
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const root=resolve(fileURLToPath(new URL('../public/',import.meta.url)));
  const manifest=JSON.parse(await readFile(resolve(root,'assets/portraits/manifest.v1.json'),'utf8'));
  const rights=JSON.parse(await readFile(resolve(root,'assets/portraits/rights.v1.json'),'utf8'));
  const result=await verifyPortraitInventory(manifest,rights,async path=>{
    const actual=await realpath(resolve(root,path));
    if(!actual.startsWith(root+sep))throw new Error('Artwork path escapes public root.');
    return readFile(actual);
  });
  console.log(`Portrait inventory: ${result.approved} approved images, ${result.draft} draft slots. Draft slots use the default silhouette.`);
}
