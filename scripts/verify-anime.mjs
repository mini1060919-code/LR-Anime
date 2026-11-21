// Source pack integrity; sheets are preserved but never downloaded by the UI.
import {readFile, readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {ANIME_CAST,ANIME_EXPRESSIONS} from '../src/characters/anime.js';
const root=new URL('../public/assets/anime/',import.meta.url);
const source=JSON.parse(await readFile(new URL('manifest.json',root),'utf8'));
const runtime=JSON.parse(await readFile(new URL('../public/assets/portraits/manifest.v1.json',import.meta.url),'utf8'));
const inspection=JSON.parse(await readFile(new URL('../docs/M3-ART-INSPECTION.json',import.meta.url),'utf8'));
if(source.schemaVersion!==1 || Object.keys(source.characters).sort().join()!==Object.keys(ANIME_CAST).sort().join())throw new Error('Anime source cast mismatch');
for(const [id,setId] of Object.entries(ANIME_CAST)){
 const char=source.characters[id],set=runtime.portraitSets[setId];
 if(set.sourceCharacterId!==id)throw new Error('Anime character mapping mismatch');
 for(const [key,path] of Object.entries({full:char.full,avatar:char.avatar,...char.expressions})){
  if(!/^(portraits|avatars|expressions)\/[a-z0-9_]+\.png$/.test(path))throw new Error('Unsafe anime source path');
  const aid=key==='full'?set.fullAssetId:key==='avatar'?set.avatarAssetId:set.expressions[key];
  if(runtime.assets[aid]?.path!==`assets/anime/${path}`)throw new Error('Anime source/runtime mismatch');
 }
 if(Object.keys(char.expressions).sort().join()!==[...ANIME_EXPRESSIONS].sort().join())throw new Error('Anime expression mismatch');
}
const paths=[];
for(const folder of ['portraits','avatars','expressions','sheets'])for(const file of await readdir(new URL(folder+'/',root)))paths.push(`public/assets/anime/${folder}/${file}`);
if(paths.length!==32 || inspection.length!==32 || paths.some(path=>!inspection.some(row=>row.path===path)))throw new Error('Anime inventory mismatch');
for(const row of inspection){
 const path=row.path.replace('public/assets/anime/','');
 if(!/^(portraits|avatars|expressions|sheets)\/[a-z0-9_]+\.png$/.test(path))throw new Error('Unsafe inspection path');
 const bytes=await readFile(new URL(path,root));
 if(bytes.length!==row.bytes || createHash('sha256').update(bytes).digest('hex')!==row.sha256 || bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a' || bytes.readUInt32BE(16)!==row.size[0] || bytes.readUInt32BE(20)!==row.size[1] || bytes[25]!==6)throw new Error(`Anime PNG invalid: ${path}`);
}
console.log('Anime source pack: 32 exact RGBA PNGs verified; 4 stable cast mappings and 20 expressions.');
