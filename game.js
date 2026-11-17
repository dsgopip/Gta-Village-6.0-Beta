import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { TEXTURES } from './textures-inline.js';
import { V10Engine } from './engine.js';
const $=id=>document.getElementById(id),loading=$('loading');
const scene=new THREE.Scene();scene.background=new THREE.Color(0x9fc3d2);scene.fog=new THREE.Fog(0x9fc3d2,65,230);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,420);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.35));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;document.body.prepend(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xdceeff,0x665b45,1.35));const sun=new THREE.DirectionalLight(0xffe3bd,2.1);sun.position.set(-45,75,35);sun.castShadow=true;sun.shadow.mapSize.set(1536,1536);sun.shadow.camera.left=-100;sun.shadow.camera.right=100;sun.shadow.camera.top=100;sun.shadow.camera.bottom=-100;scene.add(sun);
const loader=new THREE.TextureLoader();function tex(name,repeat=1){const t=loader.load(TEXTURES[name]||'');t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeat,repeat);t.colorSpace=THREE.SRGBColorSpace;return t}

// V7: procedural high-detail vehicle materials (generated locally, no external texture folder).
function proceduralTexture(kind){
 const c=document.createElement('canvas');c.width=512;c.height=512;const x=c.getContext('2d');
 if(kind==='paint'){
  const g=x.createLinearGradient(0,0,512,512);g.addColorStop(0,'#152a39');g.addColorStop(.45,'#42677c');g.addColorStop(.52,'#1e394c');g.addColorStop(1,'#0b1823');x.fillStyle=g;x.fillRect(0,0,512,512);
  for(let i=0;i<9000;i++){const v=150+Math.random()*100;x.fillStyle=`rgba(${v},${v},${v},${Math.random()*.09})`;x.fillRect(Math.random()*512,Math.random()*512,1,1)}
  for(let i=0;i<30;i++){x.strokeStyle='rgba(210,235,255,.12)';x.lineWidth=2;x.beginPath();x.moveTo(0,i*19);x.lineTo(512,i*19+Math.random()*8);x.stroke()}
 }else if(kind==='leather'){
  x.fillStyle='#171d22';x.fillRect(0,0,512,512);for(let y=0;y<512;y+=18){x.strokeStyle='#30383d';x.lineWidth=2;x.beginPath();x.moveTo(0,y);x.lineTo(512,y);x.stroke()}for(let i=0;i<1800;i++){x.fillStyle='rgba(190,200,205,.08)';x.fillRect(Math.random()*512,Math.random()*512,2,2)}
 }else if(kind==='dash'){
  x.fillStyle='#20282d';x.fillRect(0,0,512,512);for(let y=0;y<512;y+=8){x.fillStyle=`rgba(255,255,255,${Math.random()*.025})`;x.fillRect(0,y,512,2)}x.strokeStyle='#65737a';x.lineWidth=5;x.strokeRect(8,8,496,496)
 }else{
  x.fillStyle='#b8c4c8';x.fillRect(0,0,512,512);for(let i=0;i<600;i++){x.fillStyle='rgba(35,45,50,.18)';x.fillRect(Math.random()*512,Math.random()*512,Math.random()*5+1,Math.random()*5+1)}
 }
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t
}
const carPaintTexture=proceduralTexture('paint'),leatherTexture=proceduralTexture('leather'),dashTexture=proceduralTexture('dash');
const mats={grass:new THREE.MeshStandardMaterial({map:tex('grass.png',18),roughness:1}),road:new THREE.MeshStandardMaterial({map:tex('asphalt.png',8),roughness:.95}),cream:new THREE.MeshStandardMaterial({map:tex('plaster_cream.png',2),roughness:.92}),white:new THREE.MeshStandardMaterial({map:tex('plaster_white.png',2),roughness:.92}),roof:new THREE.MeshStandardMaterial({map:tex('roof_tiles.png',2),roughness:.9}),wood:new THREE.MeshStandardMaterial({map:tex('wood.png',2),roughness:.95}),concrete:new THREE.MeshStandardMaterial({map:tex('concrete.png',5),roughness:1}),glass:new THREE.MeshStandardMaterial({color:0x294653,roughness:.22,metalness:.25}),black:new THREE.MeshStandardMaterial({color:0x111619,roughness:.4}),tire:new THREE.MeshStandardMaterial({color:0x101214,roughness:.98}),fur:new THREE.MeshStandardMaterial({color:0x777e85,roughness:.95}),skin:new THREE.MeshStandardMaterial({color:0xc99b79}),shirt:new THREE.MeshStandardMaterial({color:0x36546d}),pants:new THREE.MeshStandardMaterial({color:0x30343a}),fabric:[ 'fabric_blue.png','fabric_red.png','fabric_green.png','fabric_yellow.png','fabric_purple.png','fabric_dark.png'].map(n=>new THREE.MeshStandardMaterial({map:tex(n,2),roughness:1})),skins:['skin_warm.png','skin_light.png','skin_deep.png'].map(n=>new THREE.MeshStandardMaterial({map:tex(n,1),roughness:.95})),hair:['hair_dark.png','hair_brown.png','hair_blond.png'].map(n=>new THREE.MeshStandardMaterial({map:tex(n,1),roughness:1})),brick:new THREE.MeshStandardMaterial({map:tex('brick.png',3),roughness:1}),stone:new THREE.MeshStandardMaterial({map:tex('stone_wall.png',3),roughness:1}),roofBlue:new THREE.MeshStandardMaterial({map:tex('roof_blue.png',2),roughness:.9}),roofRed:new THREE.MeshStandardMaterial({map:tex('roof_red.png',2),roughness:.9}),planks:new THREE.MeshStandardMaterial({map:tex('wood_planks.png',3),roughness:1}),sand:new THREE.MeshStandardMaterial({map:tex('sand.png',8),roughness:1}),sidewalk:new THREE.MeshStandardMaterial({map:tex('sidewalk.png',5),roughness:1})};
const box=(p,x,y,z,sx,sy,sz,m)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o};
const cyl=(p,x,y,z,r,h,m,seg=12)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),m);o.position.set(x,y,z);o.castShadow=true;p.add(o);return o};
const ground=new THREE.Mesh(new THREE.PlaneGeometry(360,360),mats.grass);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
// Larger village: main avenue and two cross streets
function road(x,z,w,l,rot=0){const o=new THREE.Mesh(new THREE.PlaneGeometry(w,l),mats.road);o.rotation.x=-Math.PI/2;o.rotation.z=rot;o.position.set(x,.035,z);o.receiveShadow=true;scene.add(o)}
road(0,0,14,250);road(0,-22,145,9,0);road(0,36,145,9,0);road(-48,4,9,120,0);road(48,4,9,120,0);
function path(x,z,w,l){const q=new THREE.Mesh(new THREE.PlaneGeometry(w,l),mats.sidewalk);q.rotation.x=-Math.PI/2;q.position.set(x,.025,z);q.receiveShadow=true;scene.add(q)}path(-8.4,0,2,250);path(8.4,0,2,250);path(0,-28,145,1.8);path(0,42,145,1.8);
const lineMat=new THREE.MeshStandardMaterial({color:0xd7d1ad});
for(let z=-115;z<120;z+=10)box(scene,0,.06,z,.14,.025,4,lineMat);
function tree(x,z,s=1){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);cyl(g,0,1.1,0,.22,2.2,mats.wood);for(let j=0;j<3;j++){const a=new THREE.Mesh(new THREE.IcosahedronGeometry(1.25-j*.14,1),new THREE.MeshStandardMaterial({color:[0x365c36,0x426d40,0x527846][j],roughness:1}));a.position.y=2.2+j*.62;a.scale.set(s,s*.85,s);a.castShadow=true;g.add(a)}}
function fence(x,z,len,rot=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;scene.add(g);for(let i=0;i<=len;i++){box(g,i*.85,.5,0,.1,1,.1,mats.wood);if(i<len){box(g,i*.425+.21,.3,0,.86,.08,.08,mats.white);box(g,i*.425+.21,.72,0,.86,.08,.08,mats.white)}}}

function signTexture(title,sub,color){
 const c=document.createElement('canvas');c.width=512;c.height=160;const q=c.getContext('2d');q.fillStyle='#'+color.toString(16).padStart(6,'0');q.fillRect(0,0,512,160);q.strokeStyle='#e8eee8';q.lineWidth=8;q.strokeRect(8,8,496,144);q.fillStyle='#fff';q.textAlign='center';q.font='bold 54px Arial';q.fillText(title,256,76);q.font='bold 23px Arial';q.fillText(sub,256,119);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshStandardMaterial({map:t,roughness:.65,metalness:.08})
}
function building(x,z,w,d,wall,kind,label){
 const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
 const civic=kind!=='HOUSE',colors={POLICE:0x244c73,CLINIC:0x398a79,SCHOOL:0xb8893c,SHOP:0x934e36};
 const trim=new THREE.MeshStandardMaterial({color:civic?0xe8e5d9:0xf0e9dc,roughness:.85});
 const facade= civic ? new THREE.MeshStandardMaterial({color:kind==='POLICE'?0xb8c8d2:kind==='CLINIC'?0xd5e5dc:kind==='SCHOOL'?0xe4d2a9:0xe7c7a7,roughness:.9,map:kind==='SCHOOL'?tex('brick.png',2):kind==='POLICE'?tex('stone_wall.png',2):tex('plaster_white.png',2)}) : wall;
 box(g,0,civic?2.25:1.9,0,w,civic?4.5:3.8,d,facade);
 // Civic buildings have a proper base course, broad cornice and flatter institutional roof.
 if(civic){box(g,0,.22,0,w+.25,.44,d+.25,mats.stone);box(g,0,4.55,0,w+.55,.28,d+.55,trim);
   const roof=new THREE.Mesh(new THREE.BoxGeometry(w+.45,.35,d+.45),kind==='SHOP'?mats.roofRed:mats.concrete);roof.position.y=4.83;roof.castShadow=true;g.add(roof);
 }else{box(g,0,3.86,0,w+.4,.18,d+.4,mats.wood);const roofMat=(Math.abs(Math.round(x+z))%3===0)?mats.roofBlue:((Math.abs(Math.round(x-z))%3===0)?mats.roofRed:mats.roof);const roof=new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,d)*.76,2.5,4),roofMat);roof.rotation.y=Math.PI/4;roof.position.y=5.05;roof.scale.set(w/Math.max(w,d),.65,d/Math.max(w,d));roof.castShadow=true;g.add(roof)}
 // Main entrance, glass frontage and vertical frames
 const doorW=civic?1.65:1.25;box(g,0,1.2,d/2+.08,doorW,2.4,.16,mats.wood);
 for(const wx of [-w*.29,w*.29]){box(g,wx,civic?2.45:2.15,d/2+.09,civic?1.65:1.15,civic?1.55:1,.16,mats.glass);box(g,wx,civic?2.45:2.15,d/2+.18,.08,civic?1.6:1.05,.05,trim);box(g,wx,civic?2.45:2.15,d/2+.18,civic?1.7:1.2,.07,.05,trim)}
 if(civic){
  const title={POLICE:['ПОЛИЦИЯ','POLICE · УЧАСТОК'],CLINIC:['МЕДПУНКТ','МЕДИЦИНСКАЯ ПОМОЩЬ'],SCHOOL:['ШКОЛА','ОБРАЗОВАТЕЛЬНЫЙ ЦЕНТР'],SHOP:['МАГАЗИН','ПРОДУКТЫ И ТОВАРЫ']}[kind]||['ОБЪЕКТ',''];
  const sign=new THREE.Mesh(new THREE.BoxGeometry(Math.min(w*.82,9),.9,.18),signTexture(title[0],title[1],colors[kind]));sign.position.set(0,3.65,d/2+.17);g.add(sign);
  // recognizable architectural markers for each public facility
  if(kind==='POLICE'){box(g,0,2.55,d/2+.24,.36,.48,.08,new THREE.MeshStandardMaterial({color:0xf0c84d,metalness:.35}));for(const sx of [-1,1])box(g,sx*(w*.42),2.3,d/2+.12,.22,2.5,.22,trim)}
  if(kind==='CLINIC'){box(g,0,2.5,d/2+.25,.22,1.05,.1,new THREE.MeshStandardMaterial({color:0xeaf8ee}));box(g,0,2.5,d/2+.26,.8,.22,.1,new THREE.MeshStandardMaterial({color:0xeaf8ee}))}
  if(kind==='SCHOOL'){const clock=new THREE.Mesh(new THREE.CircleGeometry(.42,24),new THREE.MeshStandardMaterial({color:0xf7f0d9}));clock.position.set(0,4.1,d/2+.22);g.add(clock);box(g,0,4.1,d/2+.25,.04,.55,.04,mats.black);box(g,.15,4.22,d/2+.25,.32,.04,.04,mats.black)}
  if(kind==='SHOP'){for(let i=0;i<5;i++)box(g,-2+i,2.95,d/2+.28,.95,.38,.12,new THREE.MeshStandardMaterial({color:i%2?0xf3e6ce:0x9e3f35}))}
  // broad concrete steps and two entrance columns
  box(g,0,.12,d/2+1.0,4,.22,1.5,mats.concrete);for(const sx of [-1.8,1.8])cyl(g,sx,1.65,d/2+.28,.16,3.1,trim,12);
 }
 return g
}
const houses=[[-24,-95],[-24,-65],[-24,-35],[-24,5],[-24,65],[-24,95],[24,-90],[24,-55],[24,-20],[24,20],[24,58],[24,95],[-70,-55],[-70,0],[-70,55],[70,-55],[70,0],[70,55]];
houses.forEach((p,i)=>{building(p[0],p[1],7,6,i%2?mats.white:mats.cream,'HOUSE','');fence(p[0]-5,p[1]-5,5);tree(p[0]+7,p[1]+4,.9)});
building(-47,-102,12,10,mats.white,'POLICE','');building(47,-102,12,10,mats.white,'CLINIC','');building(-47,103,17,12,mats.cream,'SCHOOL','');building(47,103,11,9,mats.white,'SHOP','');
const facilities=[
 {name:'Полицейский участок',x:-47,z:-102,d:10},{name:'Медпункт',x:47,z:-102,d:10},
 {name:'Школа',x:-47,z:103,d:12},{name:'Магазин',x:47,z:103,d:9}
];
const interiorGroup=new THREE.Group();scene.add(interiorGroup);interiorGroup.visible=false;
const intWall=new THREE.MeshStandardMaterial({color:0xd8d0bd,roughness:.95});
box(interiorGroup,0,-39.9,0,18,.2,15,mats.concrete);
for(const [x,z,sx,sz] of [[0,-7.5,18,.25],[0,7.5,18,.25],[-9,0,.25,15],[9,0,.25,15]])box(interiorGroup,x,-38.2,z,sx,3.4,sz,intWall);
box(interiorGroup,-3,-38.8,-3,4,.25,1.5,mats.wood);
box(interiorGroup,-3,-39.25,-3,.15,.8,.15,mats.wood);
box(interiorGroup,4,-38.8,-4,1.2,1.8,.5,mats.wood);
for(let i=0;i<3;i++)box(interiorGroup,-5+i*3,-39.1,2,1.4,.18,.7,mats.wood);
const interiorLight=new THREE.PointLight(0xffe4b5,0,32);interiorLight.position.set(0,-35.5,0);interiorGroup.add(interiorLight);
let inside=false,insideFacility=null,previousOutside=new THREE.Vector3();
const obstacles=[...houses.map(q=>({x:q[0],z:q[1],rx:4.5,rz:4})),{x:-47,z:-102,rx:7,rz:6},{x:47,z:-102,rx:7,rz:6},{x:-47,z:103,rx:9,rz:7},{x:47,z:103,rx:6.5,rz:5.5}];

for(let i=0;i<65;i++){let x=(Math.random()-.5)*170,z=(Math.random()-.5)*225;if(Math.abs(x)>9)tree(x,z,.55+Math.random()*.55)}
// V10 character model: higher resolution materials, rounded silhouette and clothing details.
const player=new THREE.Group();scene.add(player);
function fabricTexture(base,accent){const c=document.createElement('canvas');c.width=c.height=1024;const q=c.getContext('2d');q.fillStyle=base;q.fillRect(0,0,1024,1024);for(let y=0;y<1024;y+=4){q.strokeStyle='rgba(255,255,255,.035)';q.beginPath();q.moveTo(0,y);q.lineTo(1024,y);q.stroke()}for(let x=0;x<1024;x+=5){q.strokeStyle='rgba(0,0,0,.045)';q.beginPath();q.moveTo(x,0);q.lineTo(x,1024);q.stroke()}q.strokeStyle=accent;q.lineWidth=7;q.strokeRect(20,20,984,984);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t}
const jacketMat=new THREE.MeshStandardMaterial({map:fabricTexture('#304f67','#6f91a4'),roughness:.94}),trouserMat=new THREE.MeshStandardMaterial({map:fabricTexture('#252d35','#49545d'),roughness:1});
const skinDetailMat=new THREE.MeshStandardMaterial({map:tex('skin_light.png',1),roughness:.88});
const capsule=(p,r,len,mat,x,y,z)=>{const m=new THREE.Mesh(new THREE.CapsuleGeometry(r,len,6,12),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;p.add(m);return m};
const torso=capsule(player,.34,.42,jacketMat,0,1.4,0);torso.scale.set(1,1.05,.72);
const collar=box(player,0,1.73,.015,.42,.12,.3,jacketMat);
const head=new THREE.Mesh(new THREE.SphereGeometry(.245,32,24),skinDetailMat);head.position.y=2.02;head.castShadow=true;player.add(head);
const hairMat=new THREE.MeshStandardMaterial({map:tex('hair_dark.png',1),roughness:.95});const hairCap=new THREE.Mesh(new THREE.SphereGeometry(.252,28,20,0,Math.PI*2,0,Math.PI*.58),hairMat);hairCap.position.set(0,2.09,-.015);hairCap.castShadow=true;player.add(hairCap);
const eyeMat=new THREE.MeshStandardMaterial({color:0x172027,roughness:.55});for(const ex of [-.085,.085]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.026,12,10),eyeMat);eye.position.set(ex,2.02,.226);player.add(eye)}
const playerLegPivots=[],playerArmPivots=[];
for(const side of [-1,1]){
 const legPivot=new THREE.Group();legPivot.position.set(side*.17,.91,0);player.add(legPivot);capsule(legPivot,.115,.38,trouserMat,0,-.29,0);box(legPivot,0,-.62,.055,.25,.15,.34,mats.black);playerLegPivots.push(legPivot);
 const armPivot=new THREE.Group();armPivot.position.set(side*.39,1.68,0);player.add(armPivot);capsule(armPivot,.095,.42,jacketMat,0,-.28,0);const hand=new THREE.Mesh(new THREE.SphereGeometry(.105,16,12),skinDetailMat);hand.position.y=-.59;armPivot.add(hand);playerArmPivots.push(armPivot);
}
// Visible jacket seams, zipper, pockets and shoe trim.
box(player,0,1.42,.252,.025,.58,.018,mats.black);for(const x of [-.19,.19])box(player,x,1.35,.22,.16,.19,.025,mats.black);
player.position.set(0,0,8);
// Detailed grey tabby companion with a hand-painted 1024px fur texture (not pixel art).
function catFurTexture(){
 const c=document.createElement('canvas');c.width=2048;c.height=1024;const q=c.getContext('2d');
 const base=q.createLinearGradient(0,0,0,1024);base.addColorStop(0,'#c1c6c8');base.addColorStop(.28,'#858e94');base.addColorStop(.7,'#626c73');base.addColorStop(1,'#d2d5d5');q.fillStyle=base;q.fillRect(0,0,2048,1024);
 // Fine layered hair strokes create a soft, non-pixelated tabby coat.
 for(let i=0;i<95000;i++){const x=Math.random()*2048,y=Math.random()*1024;const light=Math.random()>.52;
   q.strokeStyle=light?`rgba(235,239,240,${.035+Math.random()*.11})`:`rgba(22,30,36,${.035+Math.random()*.13})`;
   q.lineWidth=.35+Math.random()*1.35;q.beginPath();q.moveTo(x,y);q.quadraticCurveTo(x+(Math.random()-.5)*5,y+4,x+(Math.random()-.5)*8,y+8+Math.random()*10);q.stroke();}
 // Irregular charcoal tabby bands.
 for(let row=0;row<7;row++){const y=90+row*135;q.strokeStyle='rgba(34,43,50,.34)';q.lineWidth=24+Math.random()*25;q.lineCap='round';q.beginPath();q.moveTo(-40,y);q.bezierCurveTo(350,y-90,620,y+95,960,y-12);q.bezierCurveTo(1250,y-90,1660,y+85,2090,y-28);q.stroke();
   q.strokeStyle='rgba(210,216,218,.18)';q.lineWidth=5;q.beginPath();q.moveTo(-20,y-16);q.bezierCurveTo(400,y-105,650,y+70,980,y-26);q.bezierCurveTo(1350,y-100,1690,y+65,2070,y-40);q.stroke();}
 // Warm cream areas and subtle mottling.
 const glow=q.createRadialGradient(1024,700,30,1024,700,700);glow.addColorStop(0,'rgba(228,228,220,.22)');glow.addColorStop(1,'rgba(228,228,220,0)');q.fillStyle=glow;q.fillRect(0,0,2048,1024);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=12;t.wrapS=THREE.RepeatWrapping;t.wrapT=THREE.ClampToEdgeWrapping;return t
}
const catFur=new THREE.MeshStandardMaterial({map:catFurTexture(),roughness:1});const catLight=new THREE.MeshStandardMaterial({color:0xb9c0c4,roughness:1});const catPink=new THREE.MeshStandardMaterial({color:0x9d6c70,roughness:.7});
const cat=new THREE.Group();scene.add(cat);
const catBody=new THREE.Mesh(new THREE.SphereGeometry(.48,40,32),catFur);catBody.scale.set(1.32,.78,.88);catBody.position.y=.48;catBody.castShadow=true;cat.add(catBody);
const catChest=new THREE.Mesh(new THREE.SphereGeometry(.29,28,22),catLight);catChest.scale.set(.8,1,.55);catChest.position.set(0,.43,.34);cat.add(catChest);
const catHead=new THREE.Mesh(new THREE.SphereGeometry(.285,40,32),catFur);catHead.position.set(0,.78,.58);catHead.castShadow=true;cat.add(catHead);
for(const side of [-1,1]){const ear=new THREE.Mesh(new THREE.ConeGeometry(.13,.34,3),catFur);ear.position.set(side*.19,1.04,.55);ear.rotation.z=side*-.16;cat.add(ear);const inner=new THREE.Mesh(new THREE.ConeGeometry(.066,.20,3),catPink);inner.position.set(side*.19,1.045,.61);inner.rotation.z=side*-.16;cat.add(inner);const eye=new THREE.Mesh(new THREE.SphereGeometry(.045,18,14),new THREE.MeshStandardMaterial({color:0xb8c66d,emissive:0x17210a,roughness:.2}));eye.position.set(side*.105,.80,.825);cat.add(eye);const pupil=new THREE.Mesh(new THREE.SphereGeometry(.014,12,10),mats.black);pupil.position.set(side*.105,.80,.865);cat.add(pupil);const whisker=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.31,5),new THREE.MeshStandardMaterial({color:0xd8dcde}));whisker.position.set(side*.25,.70,.81);whisker.rotation.z=side*.9;whisker.rotation.x=Math.PI/2;cat.add(whisker);}
const nose=new THREE.Mesh(new THREE.SphereGeometry(.045,16,12),catPink);nose.scale.set(1,.7,.65);nose.position.set(0,.70,.87);cat.add(nose);
// Soft muzzle pads, mouth line, brows and nose bridge add readable feline facial detail.
const muzzleMat=new THREE.MeshStandardMaterial({color:0xd2d3d0,roughness:1});
for(const side of [-1,1]){const pad=new THREE.Mesh(new THREE.SphereGeometry(.095,24,18),muzzleMat);pad.scale.set(1,.68,.55);pad.position.set(side*.075,.685,.83);cat.add(pad);
 const brow=new THREE.Mesh(new THREE.SphereGeometry(.09,20,12),catFur);brow.scale.set(1,.28,.5);brow.position.set(side*.11,.89,.79);cat.add(brow)}
const mouth=new THREE.Mesh(new THREE.TorusGeometry(.055,.009,6,18,Math.PI),new THREE.MeshStandardMaterial({color:0x55575a}));mouth.position.set(0,.63,.86);mouth.rotation.z=Math.PI;cat.add(mouth);

for(const side of [-1,1])for(const z of [-.18,.38]){const leg=capsule(cat,.075,.22,catFur,side*.29,.20,z);leg.rotation.x=.08;}
for(const side of [-1,1])for(const z of [-.18,.38]){const paw=new THREE.Mesh(new THREE.SphereGeometry(.105,20,14),catFur);paw.scale.set(1,.65,1.2);paw.position.set(side*.29,.105,z+.035);cat.add(paw)}

const tailCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,.42,-.45),new THREE.Vector3(0,.55,-.78),new THREE.Vector3(.05,.82,-1.02),new THREE.Vector3(.16,1.02,-.9)]);const tail=new THREE.Mesh(new THREE.TubeGeometry(tailCurve,32,.082,12,false),catFur);tail.castShadow=true;cat.add(tail);cat.userData.tail=tail;cat.position.set(-2,0,10);
// Car with body damage color changes
const car=new THREE.Group();scene.add(car);car.position.set(4,0,15);const carPaint=new THREE.MeshStandardMaterial({color:0xffffff,map:carPaintTexture,roughness:.24,metalness:.78});box(car,0,.92,0,2.2,.72,4.35,carPaint);box(car,0,1.55,-.28,1.86,.83,2.35,mats.glass);
box(car,0,1.55,-.28,1.86,.83,2.35,mats.glass);
// Detailed exterior: grille, layered lights, side skirts, mirrors, door seams and wheel hubs.
const chrome=new THREE.MeshStandardMaterial({color:0x9eafb6,metalness:.88,roughness:.22}),rubber=new THREE.MeshStandardMaterial({color:0x101519,roughness:.9});
box(car,0,1.0,2.205,1.12,.34,.055,chrome);for(let i=-4;i<=4;i++)box(car,i*.115,1.0,2.24,.035,.29,.025,mats.black);
for(const x of [-.78,.78]){box(car,x,1.19,2.22,.48,.19,.06,new THREE.MeshStandardMaterial({color:0xd9e7e8,emissive:0x52666a,roughness:.2}));box(car,x,1.19,2.255,.12,.12,.025,new THREE.MeshStandardMaterial({color:0xffd58b,emissive:0x5a3510}))}
for(const x of [-1.11,1.11]){box(car,x,.72,0,.12,.3,3.35,rubber);box(car,x,1.65,.1,.28,.16,.42,carPaint)}
for(const z of [-.95,.95]){box(car,-1.115,1.05,z,.025,.72,.025,chrome);box(car,1.115,1.05,z,.025,.72,.025,chrome)}
// Cockpit: textured dashboard, instrument binnacle, steering wheel, console, seats and door cards.
const dashMat=new THREE.MeshStandardMaterial({map:dashTexture,roughness:.88}),seatMat=new THREE.MeshStandardMaterial({map:leatherTexture,roughness:.92});
box(car,0,1.38,.92,1.82,.28,.48,dashMat);
box(car,0,1.48,1.12,.92,.24,.08,mats.black);
for(const x of [-.33,.33]){const gauge=new THREE.Mesh(new THREE.CircleGeometry(.115,24),new THREE.MeshStandardMaterial({color:0x15252d,emissive:0x1a5960}));gauge.position.set(x,1.55,1.17);gauge.rotation.x=-.25;car.add(gauge)}
for(const x of [-.48,.48]){box(car,x,.94,-.72,.72,.48,.86,seatMat);box(car,x,1.43,-1.02,.72,.95,.25,seatMat);box(car,x,1.88,-1.02,.62,.08,.28,chrome)}
const steering=new THREE.Mesh(new THREE.TorusGeometry(.29,.045,10,32),rubber);steering.position.set(-.48,1.57,.76);steering.rotation.y=0;steering.rotation.x=.35;car.add(steering);box(car,-.48,1.57,.76,.08,.08,.08,chrome);
box(car,0,1.02,.1,.38,.2,1.12,dashMat);box(car,0,1.18,.18,.32,.18,.25,chrome);
for(const x of [-.86,.86])box(car,x,1.05,-.25,.18,.62,2.0,seatMat);
box(car,0,1.08,2.18,2.18,.22,.14,mats.black);box(car,0,1.08,-2.18,2.18,.22,.14,mats.black);for(const x of [-.72,.72]){box(car,x,1.05,2.2,.38,.22,.08,new THREE.MeshStandardMaterial({color:0xe6dfc3}));box(car,x,1.05,-2.2,.38,.22,.08,new THREE.MeshStandardMaterial({color:0xa42d27}))}
const wheels=[];for(const x of [-1.12,1.12])for(const z of [-1.4,1.4]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.47,.47,.28,20),mats.tire);w.rotation.z=Math.PI/2;w.position.set(x,.5,z);w.castShadow=true;car.add(w);wheels.push(w)}

// V10 SUV detailing: sculpted wheel-arch trim, roof rails, handles and rear lamps.
const archMat=new THREE.MeshStandardMaterial({color:0x172128,roughness:.82});
for(const x of [-1.12,1.12])for(const z of [-1.4,1.4]){
 const arch=new THREE.Mesh(new THREE.TorusGeometry(.535,.055,9,36),archMat);
 arch.rotation.y=Math.PI/2;arch.position.set(x,.5,z);car.add(arch);
}
for(const x of [-.72,.72]){box(car,x,2.02,-.2,.08,.07,1.75,chrome);box(car,x,2.02,-.2,.15,.055,1.9,mats.black)}
for(const x of [-.83,.83]){box(car,x,1.37,-.85,.24,.07,.035,chrome);box(car,x,1.37,-.85,.12,.035,.045,mats.black)}
for(const x of [-.78,.78]){box(car,x,1.15,-2.21,.42,.22,.055,new THREE.MeshStandardMaterial({color:0x9e2726,emissive:0x3a0808}));}

const bumpers=[box(car,0,.78,2.28,2.12,.18,.18,mats.black),box(car,0,.78,-2.28,2.12,.18,.18,mats.black)];
const smoke=new THREE.Group();car.add(smoke);for(let i=0;i<9;i++){const puff=new THREE.Mesh(new THREE.SphereGeometry(.16+i*.018,8,7),new THREE.MeshStandardMaterial({color:0x777b7d,transparent:true,opacity:.16,roughness:1}));puff.position.set((Math.random()-.5)*.45,1.65+i*.18,-1.15-i*.12);smoke.add(puff)}smoke.visible=false;
const crackMat=new THREE.LineBasicMaterial({color:0x26333a,transparent:true,opacity:.85});const cracks=new THREE.Group();car.add(cracks);for(let i=0;i<5;i++){const pts=[new THREE.Vector3(-.7+i*.28,1.94,-1.45),new THREE.Vector3(-.52+i*.28,1.96,-1.28),new THREE.Vector3(-.6+i*.28,1.97,-1.08)];cracks.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),crackMat))}cracks.visible=false
// NPC residents: individually varied outfits, skin, hair, shoes and accessories.
const npcs=[];const shoeMat=new THREE.MeshStandardMaterial({color:0x24272b,roughness:.95});
for(let i=0;i<28;i++){
 const g=new THREE.Group();scene.add(g);const x=(i%2?1:-1)*(14+Math.random()*55),z=-112+i*8.2;
 const shirtMat=mats.fabric[i%mats.fabric.length],skinMat=mats.skins[(i*7)%mats.skins.length],hairMat=mats.hair[(i*5)%mats.hair.length];
 const torso=box(g,0,1.34,0,.55,.82,.32,shirtMat);torso.material=shirtMat;
 const h=new THREE.Mesh(new THREE.SphereGeometry(.22,16,12),skinMat);h.position.y=1.96;h.castShadow=true;g.add(h);
 // Hair cap and simple hairstyle silhouette
 const hair=new THREE.Mesh(new THREE.SphereGeometry(.225,14,9,0,Math.PI*2,0,Math.PI*.52),hairMat);hair.position.set(0,2.04,-.015);hair.castShadow=true;g.add(hair);
 const legs=[box(g,-.15,.55,0,.2,.66,.21,mats.pants),box(g,.15,.55,0,.2,.66,.21,mats.pants)];
 box(g,-.15,.16,.035,.22,.18,.32,shoeMat);box(g,.15,.16,.035,.22,.18,.32,shoeMat);
 box(g,-.37,1.37,0,.17,.63,.18,shirtMat);box(g,.37,1.37,0,.17,.63,.18,shirtMat);
 // A few residents wear a cap or backpack for stronger silhouettes
 if(i%4===0){const cap=new THREE.Mesh(new THREE.CylinderGeometry(.23,.23,.09,12),new THREE.MeshStandardMaterial({color:[0x35485b,0x8b463b,0x4c6845][i%3]}));cap.position.y=2.2;g.add(cap)}
 if(i%5===0)box(g,0,1.28,-.22,.38,.48,.12,new THREE.MeshStandardMaterial({color:0x8b6546,roughness:1}));
 npcs.push({g,home:new THREE.Vector3(x,0,z),phase:Math.random()*6,legs,knock:0});
}
let time=8,mission=0,toastTimer=0;
function toast(s){$('toast').textContent=s;$('toast').style.opacity=1;toastTimer=2.2}
function setMission(){const a=['Осмотрись в деревне','Найди полицейский участок','Посети медпункт','Доедь до школы'];$('mission').textContent='ЗАДАНИЕ: '+a[mission]}setMission();
$('missionBtn').onclick=()=>{mission=(mission+1)%4;setMission()};
const engine=new V10Engine({scene,camera,renderer,player,car,cat,npcs,obstacles,wheels,playerLegPivots,playerArmPivots,mapCanvas:$('miniMap'),carPaint,bumpers,cracks,smoke,ui:{cameraBtn:$('cameraBtn'),walkControls:$('walkControls'),carControls:$('carControls'),speedPanel:$('speedPanel'),damageWrap:$('damageWrap'),speedValue:$('speedValue'),gear:$('gear'),damageBar:$('damageBar')},toast,MAX_SPEED:200/3.6});
$('actionBtn').onclick=()=>{
 if(inside){inside=false;interiorGroup.visible=false;player.position.copy(previousOutside);cat.position.copy(player.position).add(new THREE.Vector3(-1,0,1));$('actionBtn').textContent='ОСМОТРЕТЬ / ОБЩАТЬСЯ';$('hint').textContent='Исследуй деревню и заходи в здания';toast('Ты вышел: '+insideFacility.name);insideFacility=null;return}
 const f=facilities.find(v=>Math.hypot(player.position.x-v.x,player.position.z-(v.z+v.d/2+2))<9);
 if(f){inside=true;insideFacility=f;previousOutside.copy(player.position);interiorGroup.visible=true;player.position.set(0,-40,4);cat.position.set(-1,-40,5);player.rotation.y=Math.PI;$('actionBtn').textContent='ВЫЙТИ ИЗ ЗДАНИЯ';$('hint').textContent=f.name+' — осмотрись внутри';toast('Ты вошёл: '+f.name);return}
 const n=npcs.find(n=>n.g.position.distanceTo(player.position)<2.7);if(n){n.knock=1.0;n.g.userData.vx=(n.g.position.x-player.position.x)*2.1;n.g.userData.vz=(n.g.position.z-player.position.z)*2.1;toast('Житель отшатнулся');return}toast('Подойди к жителю или общественному зданию');
};
function dayNight(dt){time=(time+dt*.035)%24;const h=Math.floor(time),m=Math.floor((time-h)*60);$('clock').textContent=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');const k=Math.max(0,Math.sin((time-6)/12*Math.PI));sun.intensity=.18+k*2;scene.background.set(0x101a2b).lerp(new THREE.Color(0x9fc3d2),k);scene.fog.color.copy(scene.background);interiorLight.intensity=inside?22:0}
function update(dt){dayNight(dt);engine.update(dt,{inside,insideFacility});if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)$('toast').style.opacity=0}}
// Fixed-step simulation keeps controls and vehicle physics consistent across Android frame rates.
const FIXED=1/60;let accumulator=0,last=performance.now();function frame(now){accumulator=Math.min(accumulator+(now-last)/1000,.1);last=now;let steps=0;while(accumulator>=FIXED&&steps<5){update(FIXED);accumulator-=FIXED;steps++}renderer.render(scene,camera);requestAnimationFrame(frame)}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5))});
setTimeout(()=>{loading.style.display='none';toast('V10: обновлённый движок, управление и физика')},1100);requestAnimationFrame(frame);
