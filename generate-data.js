// GridSense demo dataset generator. Run: node generate-data.js
// Writes data.json (fictional data, seeded so the output is repeatable).
'use strict';
const fs=require('fs');


/* =====================================================================
   DATA: ~3,600 fictional hourly readings (5 locations x 30 days x 24 h)
   plus 24 months of history. Everything is seeded, so it is repeatable.
   ===================================================================== */
const M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DAYS=30;
const date=d=>new Date(2026,8,1+d);
const dayLbl=d=>{const t=date(d);return t.getDate()+' '+M[t.getMonth()]};
const hr=h=>{h=((h%24)+24)%24;return (h%12===0?12:h%12)+':00 '+(h<12?'AM':'PM')};
const hrRange=(h,n)=>hr(h)+'–'+hr(h+n);
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const rand=rng(20260902);
const gauss=()=>(rand()+rand()+rand()-1.5)/0.5;
const sum=a=>a.reduce((x,y)=>x+y,0);

const B=[
{name:'Head Office',short:'Head Office',kwh:28600,eff:91,area:6500,color:'#C2547A',we:.38,
 prof:[.28,.27,.27,.27,.28,.30,.40,.62,.90,1.05,1.10,1.10,1.00,1.08,1.14,1.15,1.05,.90,.60,.45,.38,.34,.31,.29],
 eq:{hvac:.42,chill:.08,light:.25,server:.10,pump:.03,other:.12}},
{name:'Manufacturing Plant',short:'Manufacturing',kwh:82400,eff:78,area:18000,color:'#0B7A82',we:.55,
 prof:[.62,.60,.58,.58,.60,.66,.80,.95,1.02,1.05,1.06,1.05,1.00,1.05,1.14,1.16,1.12,1.00,.90,.86,.80,.74,.68,.64],
 eq:{prod:.58,comp:.10,pump:.07,hvac:.10,chill:.05,light:.06,server:.02,other:.02}},
{name:'Warehouse',short:'Warehouse',kwh:14100,eff:86,area:12000,color:'#7A8F3A',we:.45,
 prof:[.30,.30,.30,.30,.32,.40,.70,.95,1.10,1.10,1.05,1.00,.90,1.00,1.05,1.00,.95,.80,.50,.40,.35,.32,.30,.30],
 eq:{light:.30,hvac:.15,comp:.10,pump:.05,prod:.15,other:.25}},
{name:'Data Center',short:'Data Center',kwh:51200,eff:84,area:4000,color:'#3D4FA1',we:.95,
 prof:[.88,.87,.86,.86,.86,.88,.92,.96,1.00,1.03,1.05,1.06,1.06,1.07,1.08,1.08,1.06,1.04,1.00,.97,.95,.92,.90,.89],
 eq:{server:.60,hvac:.20,chill:.12,light:.02,pump:.02,other:.04}},
{name:'Branch Office',short:'Branch Office',kwh:8320,eff:89,area:1800,color:'#8A6F5A',we:.30,
 prof:[.20,.20,.20,.20,.20,.25,.40,.70,1.00,1.10,1.10,1.05,1.00,1.08,1.10,1.08,1.00,.80,.40,.28,.24,.22,.21,.20],
 eq:{hvac:.45,light:.30,server:.10,other:.15}}
];
const EQ=[
 {k:'hvac',n:'HVAC',c:'#0B7A82'},{k:'prod',n:'Production machinery',c:'#C2547A'},{k:'server',n:'Servers',c:'#3D4FA1'},
 {k:'chill',n:'Chillers',c:'#4C93C9'},{k:'light',n:'Lighting',c:'#E0A21B'},{k:'comp',n:'Compressors',c:'#7A8F3A'},
 {k:'pump',n:'Pumps',c:'#5DA39B'},{k:'other',n:'Other',c:'#98A6AC'}];
const EQN=Object.fromEntries(EQ.map(e=>[e.k,e.n]));
const EQC=Object.fromEntries(EQ.map(e=>[e.k,e.c]));
const SPIKES=[{b:1,d:8,h:2,f:2.0},{b:3,d:16,h:3,f:1.8},{b:1,d:22,h:1,f:1.9}];

const dayF=Array.from({length:DAYS},()=>1+0.03*gauss());
const R=[];
B.forEach((b,bi)=>{
 const raw=[];
 for(let d=0;d<DAYS;d++){const dow=date(d).getDay(),we=dow===0||dow===6;
  for(let h=0;h<24;h++){
   let v=b.prof[h]*(we?b.we:1)*dayF[d]*(1+0.035*gauss());
   const sp=SPIKES.find(s=>s.b===bi&&s.d===d&&s.h===h); if(sp)v*=sp.f;
   raw.push({d,h,b:bi,dow,we,v});
  }}
 const s=sum(raw.map(r=>r.v));
 raw.forEach(r=>{r.kwh=r.v*b.kwh/s;R.push(r)});
});
const RI=Array.from({length:DAYS},()=>Array.from({length:24},()=>Array(5)));
R.forEach(r=>{RI[r.d][r.h][r.b]=r});
const TOT=RI.map(day=>day.map(hs=>sum(hs.map(r=>r.kwh))));   // site kWh per hour (= average kW)
const DAYT=TOT.map(sum);
const TOTAL=sum(DAYT);
const BT=B.map((_,i)=>sum(R.filter(r=>r.b===i).map(r=>r.kwh)));

// Baselines for anomaly detection: median and MAD per location, hour of day and weekday/weekend
const med=a=>{const s=[...a].sort((x,y)=>x-y),n=s.length,m=n>>1;return n%2?s[m]:(s[m-1]+s[m])/2};
const grp={};
R.forEach(r=>{(grp[r.b+'|'+(r.we?1:0)+'|'+r.h]=grp[r.b+'|'+(r.we?1:0)+'|'+r.h]||[]).push(r)});
Object.values(grp).forEach(g=>{
 const vs=g.map(r=>r.kwh),m=med(vs),mad=med(vs.map(v=>Math.abs(v-m))),sg=Math.max(1.4826*mad,0.02*m);
 g.forEach(r=>{r.base=m;r.sg=sg;r.z=(r.kwh-m)/sg;r.lo=m-2.5*sg;r.hi=m+2.5*sg});
});

// Equipment split (estimated): each location's fixed mix, nudged by time of day
const eqCache={};
function EQF(b,h){
 const key=b*100+h;if(eqCache[key])return eqCache[key];
 const w={};let s=0;
 EQ.forEach(e=>{let x=B[b].eq[e.k]||0;
  if(e.k==='hvac'||e.k==='chill')x*=0.75+0.6*Math.exp(-((h-15)**2)/18);
  if(e.k==='light')x*=(h<6||h>=22)?0.7:1.05;
  w[e.k]=x;s+=x});
 EQ.forEach(e=>w[e.k]/=s);
 return eqCache[key]=w;
}
const EQT={},EQDAY={},EQHR={},EQB={};
EQ.forEach(e=>{EQT[e.k]=0;EQDAY[e.k]=Array(DAYS).fill(0);EQHR[e.k]=Array(24).fill(0);EQB[e.k]=Array(5).fill(0)});
R.forEach(r=>{const f=EQF(r.b,r.h);EQ.forEach(e=>{const v=r.kwh*f[e.k];EQT[e.k]+=v;EQDAY[e.k][r.d]+=v;EQHR[e.k][r.h]+=v/DAYS;EQB[e.k][r.b]+=v})});

// Monthly history, Oct 2024 to Sep 2026
const MONTHLY=[158,149,143,141,139,147,158,166,169,171,168,163,157,151,146,144,142,150,159,163,161.2,166,170.32,0].map(v=>v*1000);
MONTHLY[23]=TOTAL; MONTHLY[22]=170320;
const mLabel=i=>{const m=(9+i)%12,y=2024+Math.floor((9+i)/12);return M[m]+' '+String(y).slice(2)};
const SOLSH=[.31,.27,.25,.26,.30,.36,.40,.41,.31,.27,.293,0]; // last 12 months, Oct 2025 to Sep 2026
const EF=0.769; // kg CO2 per grid kWh, illustrative
const EFF=sum(B.map((b,i)=>b.eff*BT[i]))/TOTAL, EFF0=EFF-1.2;

// Solar: 72,400 kWh over the month, shaped by a daily sun curve and cloudy days
const sf=Array.from({length:DAYS},()=>0.5+0.5*Math.pow(rand(),0.6));
const SOL=Array.from({length:DAYS},(_,d)=>Array.from({length:24},(_,h)=>(h>=6&&h<18)?sf[d]*Math.pow(Math.sin(Math.PI*(h+0.5-6)/12),1.3):0));
{const s=sum(SOL.map(sum));SOL.forEach(day=>day.forEach((v,h)=>day[h]=v*72400/s))}
const SOLDAY=SOL.map(sum),SOLTOT=sum(SOLDAY);
SOLSH[11]=SOLTOT/TOTAL;
const EXC=SOL.map((day,d)=>day.map((v,h)=>Math.max(0,v-TOT[d][h])));
const EXCDAY=EXC.map(sum),EXCTOT=sum(EXCDAY);
const GRIDNET=TOTAL-SOLTOT;
const co2=kwh=>kwh*EF/1000;

// Peak and profile helpers
const WD=Array(24).fill(0),WE=Array(24).fill(0);
{let nd=0,ne=0;for(let d=0;d<DAYS;d++){const w=date(d).getDay();const we=w===0||w===6;we?ne++:nd++;for(let h=0;h<24;h++)(we?WE:WD)[h]+=TOT[d][h]}
 for(let h=0;h<24;h++){WD[h]/=nd;WE[h]/=ne}}
let MAXH={v:0,d:0,h:0};
for(let d=0;d<DAYS;d++)for(let h=0;h<24;h++)if(TOT[d][h]>MAXH.v)MAXH={v:TOT[d][h],d,h};
function peakWin(n){let best=-1,bh=0;for(let h=0;h<=24-n;h++){const s=sum(WD.slice(h,h+n));if(s>best){best=s;bh=h}}return bh}
const OPH=B.map((_,i)=>{const m=BT[i]/(DAYS*24);return R.filter(r=>r.b===i&&r.kwh>0.7*m).length});
const NIGHT_SHARE=sum(R.filter(r=>r.h<6).map(r=>r.kwh))/TOTAL;

// State
const S={rate:8,k:4,up:.25,pw:2,sel:{b:null,e:null,a:null},fc:'base',
 c:{g:'daily',range:30,b:'all',eq:'all',tb:'all'}};
const events=()=>R.filter(r=>r.z>S.k&&r.kwh>(1+S.up)*r.base).sort((a,b)=>a.d-b.d||a.h-b.h);
const ek=r=>r.d+'-'+r.h+'-'+r.b;

// Forecast: weekday pattern from this month, scaled by damped recent month-on-month growth
const SC={base:{n:'Baseline',m:1},eff:{n:'Efficiency drive (−6%)',m:.94},heat:{n:'Hot month (+5%)',m:1.05}};
function forecast(sc){
 const byDow=Array.from({length:7},()=>[]);DAYT.forEach((v,d)=>byDow[date(d).getDay()].push(v));
 const mean=byDow.map(a=>sum(a)/a.length);
 const res=DAYT.map((v,d)=>v-mean[date(d).getDay()]);
 const sd=Math.sqrt(sum(res.map(x=>x*x))/(res.length-1));
 const g=([21,22,23].map(i=>MONTHLY[i]/MONTHLY[i-1]-1).reduce((a,b)=>a+b,0)/3)*0.9;
 const days=Array.from({length:30},(_,i)=>{const t=new Date(2026,9,1+i);
  const p=mean[t.getDay()]*(1+g)*SC[sc].m,w=1.64*sd*Math.sqrt(1+i/15);
  return{t,p,lo:p-w,hi:p+w}});
 const total=sum(days.map(x=>x.p));
 return{days,total,g,growth:total/TOTAL-1,sd};
}

/* =====================================================================
   UI
   ===================================================================== */

const ids=['head-office','manufacturing-plant','warehouse','data-center','branch-office'];
const colors=['#C2547A','#0B7A82','#7A8F3A','#5B73D6','#8A6F5A'];
const pad=n=>String(n).padStart(2,'0');
const ts=(d,h)=>{const t=date(d);return t.getFullYear()+'-'+pad(t.getMonth()+1)+'-'+pad(t.getDate())+'T'+pad(h)+':00'};
const r3=x=>Math.round(x*1000)/1000;
const monthKey=i=>{const m=(9+i)%12,y=2024+Math.floor((9+i)/12);return y+'-'+pad(m+1)};
const out={
 meta:{name:'GridSense demo dataset',period:'2026-09',notice:'Fictional data generated for a Setron Labs demo.',
  emission_factor_kg_per_kwh:EF,tariff_per_kwh:8,solar_capacity_kw:480},
 locations:B.map((b,i)=>({id:ids[i],name:b.name,short:b.short,area_m2:b.area,efficiency:b.eff,color:colors[i],equipment:b.eq})),
 readings:[],solar:[],
 history:MONTHLY.map((v,i)=>{const o={month:monthKey(i),kwh:Math.round(v)};if(i>=12)o.solar_share=Math.round(SOLSH[i-12]*10000)/10000;return o})
};
for(let d=0;d<DAYS;d++)for(let h=0;h<24;h++){
 for(let b=0;b<5;b++)out.readings.push({t:ts(d,h),loc:ids[b],kwh:r3(RI[d][h][b].kwh)});
 out.solar.push({t:ts(d,h),kwh:r3(SOL[d][h])});
}
fs.writeFileSync(__dirname+'/data.json',JSON.stringify(out));
// data.js carries the same JSON for opening index.html straight from disk, where fetch() is blocked
fs.writeFileSync(__dirname+'/data.js','window.GRIDSENSE_DATA='+JSON.stringify(out)+';');
console.log('data.json written:',out.readings.length,'readings,',out.solar.length,'solar hours');
