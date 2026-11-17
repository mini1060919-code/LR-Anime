// Original character concepts; no licensed third-party artwork is included.
export const SKILLS = ['agriculture','engineering','medicine','scavenging','defense','logistics'];
export const PROFESSIONS = ['generalist','farmer','mechanic','medic','scout','guard','researcher','logistician'];
export const PERSONALITIES = ['steadfast','empathetic','pragmatic','curious','reserved','optimistic','patient','cautious'];
export const ARCHETYPES = [
  { id:'chr_isumi_rin', names:{'zh-TW':'伊澄凜',en:'Rin Isumi'}, profession:'mechanic', traits:['pragmatic','steadfast'], background:{'zh-TW':'曾維護災區供電設備，希望讓聚落的第一盞燈持續亮著。',en:'Maintained disaster-zone power systems; determined to keep the settlement lights on.'} },
  { legacy:true, id:'chr_asagiri_mio', names:{'zh-TW':'朝霧澪',en:'Mio Asagiri'}, profession:'medic', traits:['empathetic','steadfast'], background:{'zh-TW':'曾是撤離站醫護，保存急救手冊並協助新到居民。',en:'An evacuation-station medic who preserves first-aid manuals and welcomes newcomers.'} },
  { id:'chr_tachibana_yuma', names:{'zh-TW':'橘悠真',en:'Yuma Tachibana'}, profession:'scout', traits:['cautious','curious'], background:{'zh-TW':'熟悉廢棄交通線，整理資源與安全路線。',en:'Knows abandoned transit lines and charts resources and safer routes.'} },
  { legacy:true, id:'chr_shiraishi_tsumugi', names:{'zh-TW':'白石紬',en:'Tsumugi Shiraishi'}, profession:'farmer', traits:['optimistic','patient'], background:{'zh-TW':'曾照顧社區菜園，從留存種子重建糧食來源。',en:'A former community gardener rebuilding the food supply from saved seeds.'} },
];

ARCHETYPES.push(
  {introducedIn:2,id:'chr_satsuki',names:{'zh-TW':'紗月',en:'Satsuki'},profession:'medic',traits:['empathetic','steadfast'],background:{'zh-TW':'在避難聚落協助照護同伴。',en:'Helps care for companions in the refuge.'}},
  {introducedIn:2,id:'chr_ren',names:{'zh-TW':'蓮',en:'Ren'},profession:'guard',traits:['cautious','patient'],background:{'zh-TW':'與同伴守望聚落的日與夜。',en:'Keeps watch over the settlement alongside companions.'}}
);
