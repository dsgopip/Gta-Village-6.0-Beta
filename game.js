import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const $=id=>document.getElementById(id),loading=$('loading');
const scene=new THREE.Scene();scene.background=new THREE.Color(0x9fc3d2);scene.fog=new THREE.Fog(0x9fc3d2,65,230);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,420);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;document.body.prepend(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xdceeff,0x665b45,1.35));const sun=new THREE.DirectionalLight(0xffe3bd,2.1);sun.position.set(-45,75,35);sun.castShadow=true;sun.shadow.mapSize.set(1536,1536);sun.shadow.camera.left=-100;sun.shadow.camera.right=100;sun.shadow.camera.top=100;sun.shadow.camera.bottom=-100;scene.add(sun);
const loader=new THREE.TextureLoader();function tex(name,repeat=1){const t=loader.load('./textures/'+name);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeat,repeat);t.colorSpace=THREE.SRGBColorSpace;return t}
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
function building(x,z,w,d,wall,kind,label){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);box(g,0,1.9,0,w,3.8,d,wall);box(g,0,3.86,0,w+.4,.18,d+.4,mats.wood);const roofMat=(Math.abs(Math.round(x+z))%3===0)?mats.roofBlue:((Math.abs(Math.round(x-z))%3===0)?mats.roofRed:mats.roof);const roof=new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,d)*.76,2.5,4),roofMat);roof.rotation.y=Math.PI/4;roof.position.y=5.05;roof.scale.set(w/Math.max(w,d),.65,d/Math.max(w,d));roof.castShadow=true;g.add(roof);box(g,0,1.15,d/2+.07,1.25,2.3,.12,mats.wood);for(const wx of [-w*.28,w*.28]){box(g,wx,2.15,d/2+.08,1.15,1,.12,mats.glass);box(g,wx,2.15,d/2+.15,1.2,.08,.05,mats.white);box(g,wx,2.15,d/2+.15,.08,1.05,.05,mats.white)}
// sign panel above entrance, color-coded by facility
const colors={POLICE:0x244c73,CLINIC:0x4b8b75,SCHOOL:0xb88d45,SHOP:0x8b4d38};box(g,0,3.15,d/2+.12,Math.min(w*.72,5),.48,.15,new THREE.MeshStandardMaterial({color:colors[kind]||0x4c7253}));return g}
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
// Character
const player=new THREE.Group();scene.add(player);box(player,0,1.4,0,.62,.82,.34,mats.shirt);const head=new THREE.Mesh(new THREE.SphereGeometry(.24,16,12),mats.skin);head.position.y=2.02;player.add(head);const legs=[box(player,-.17,.58,0,.22,.68,.23,mats.pants),box(player,.17,.58,0,.22,.68,.23,mats.pants)];box(player,-.4,1.42,0,.18,.65,.18,mats.shirt);box(player,.4,1.42,0,.18,.65,.18,mats.shirt);player.position.set(0,0,8);
// Grey cat follower
const cat=new THREE.Group();scene.add(cat);const body=new THREE.Mesh(new THREE.SphereGeometry(.36,18,14),mats.fur);body.scale.set(1.25,.7,.75);body.position.y=.43;cat.add(body);const ch=new THREE.Mesh(new THREE.SphereGeometry(.23,16,12),mats.fur);ch.position.set(0,.62,.38);cat.add(ch);for(const x of [-.14,.14]){const e=new THREE.Mesh(new THREE.ConeGeometry(.08,.2,8),mats.fur);e.position.set(x,.84,.4);cat.add(e)}for(const x of [-.2,.2])for(const z of [-.15,.15])cyl(cat,x,.19,z,.055,.32,mats.fur,8);cat.position.set(-2,0,10);
// Car with body damage color changes
const car=new THREE.Group();scene.add(car);car.position.set(4,0,15);const carPaint=new THREE.MeshStandardMaterial({color:0x303b47,roughness:.3,metalness:.62});box(car,0,.92,0,2.2,.72,4.35,carPaint);box(car,0,1.55,-.28,1.86,.83,2.35,mats.glass);box(car,0,1.08,2.18,2.18,.22,.14,mats.black);box(car,0,1.08,-2.18,2.18,.22,.14,mats.black);for(const x of [-.72,.72]){box(car,x,1.05,2.2,.38,.22,.08,new THREE.MeshStandardMaterial({color:0xe6dfc3}));box(car,x,1.05,-2.2,.38,.22,.08,new THREE.MeshStandardMaterial({color:0xa42d27}))}
const wheels=[];for(const x of [-1.12,1.12])for(const z of [-1.4,1.4]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.47,.47,.28,20),mats.tire);w.rotation.z=Math.PI/2;w.position.set(x,.5,z);w.castShadow=true;car.add(w);wheels.push(w)}
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
let move={x:0,y:0},steer=0,run=false,gas=false,reverse=false,inCar=false,first=false,speed=0,lateralSpeed=0,damage=0,time=8,mission=0,toastTimer=0,collisionCooldown=0;
const MAX_SPEED=200/3.6;
function toast(s){$('toast').textContent=s;$('toast').style.opacity=1;toastTimer=2.1}
function stick(el,knob,cb){let active=false,pid=null;const moveEv=e=>{const r=el.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,max=r.width*.34,d=Math.hypot(dx,dy),k=d>max?max/d:1;let a=dx*k,b=dy*k;knob.style.transform=`translate(${a}px,${b}px)`;cb(a/max,-b/max)};el.addEventListener('pointerdown',e=>{active=true;pid=e.pointerId;el.setPointerCapture(pid);moveEv(e)});el.addEventListener('pointermove',e=>{if(active&&e.pointerId===pid)moveEv(e)});const end=e=>{if(active&&e.pointerId===pid){active=false;knob.style.transform='';cb(0,0)}};el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end)}
stick($('stick'),$('knob'),(x,y)=>move={x,y});stick($('steerStick'),$('steerKnob'),x=>steer=x);
function hold(id,set){$(id).addEventListener('pointerdown',e=>{e.preventDefault();set(true)});['pointerup','pointercancel','pointerleave'].forEach(ev=>$(id).addEventListener(ev,()=>set(false)))}
hold('runBtn',v=>run=v);hold('gasBtn',v=>gas=v);hold('reverseBtn',v=>reverse=v);
$('cameraBtn').onclick=()=>{first=!first;$('cameraBtn').textContent='КАМЕРА: '+(first?'1 ЛИЦО':'3 ЛИЦО')};
function toggleCar(){if(inCar){inCar=false;player.visible=true;player.position.copy(car.position).add(new THREE.Vector3(2,0,0));$('walkControls').classList.remove('hidden');$('carControls').classList.add('hidden');$('speedPanel').classList.add('hidden');$('damageWrap').classList.add('hidden');toast('Вы вышли из автомобиля')}else if(player.position.distanceTo(car.position)<5){inCar=true;player.visible=false;$('walkControls').classList.add('hidden');$('carControls').classList.remove('hidden');$('speedPanel').classList.remove('hidden');$('damageWrap').classList.remove('hidden');toast('Вы за рулём')}else toast('Подойди ближе к машине')}
$('enterBtn').onclick=toggleCar;$('exitBtn').onclick=toggleCar;
$('actionBtn').onclick=()=>{
 if(inside){inside=false;interiorGroup.visible=false;player.position.copy(previousOutside);cat.position.copy(player.position).add(new THREE.Vector3(-1,0,1));$('actionBtn').textContent='ОСМОТРЕТЬ / ОБЩАТЬСЯ';$('hint').textContent='Исследуй деревню и заходи в здания';toast('Ты вышел: '+insideFacility.name);insideFacility=null;return}
 const f=facilities.find(v=>Math.hypot(player.position.x-v.x,player.position.z-(v.z+v.d/2+2))<9);
 if(f){inside=true;insideFacility=f;previousOutside.copy(player.position);interiorGroup.visible=true;player.position.set(0,-40,4);cat.position.set(-1,-40,5);player.rotation.y=Math.PI;$('actionBtn').textContent='ВЫЙТИ ИЗ ЗДАНИЯ';$('hint').textContent=f.name+' — осмотрись внутри';toast('Ты вошёл: '+f.name);return}
 let n=npcs.find(n=>n.g.position.distanceTo(player.position)<2.7);
 if(n){n.knock=1.4;n.g.userData.vx=(n.g.position.x-player.position.x)*2.4;n.g.userData.vz=(n.g.position.z-player.position.z)*2.4;toast('Житель упал и поднялся');return}
 toast('Подойди к жителю или общественному зданию');
};
$('missionBtn').onclick=()=>{mission=(mission+1)%4;setMission()};function setMission(){const a=['Осмотрись в деревне','Найди полицейский участок','Посети медпункт','Доедь до школы'];$('mission').textContent='ЗАДАНИЕ: '+a[mission]}setMission();
function dayNight(dt){time=(time+dt*.035)%24;const h=Math.floor(time),m=Math.floor((time-h)*60);$('clock').textContent=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');const k=Math.max(0,Math.sin((time-6)/12*Math.PI));sun.intensity=.18+k*2;scene.background.set(0x101a2b).lerp(new THREE.Color(0x9fc3d2),k);scene.fog.color.copy(scene.background);interiorLight.intensity=inside?22:0}
function update(dt){dayNight(dt);
for(const n of npcs){if(n.knock>0){n.knock-=dt;n.g.position.x+=(n.g.userData.vx||0)*dt;n.g.position.z+=(n.g.userData.vz||0)*dt;n.g.userData.vx=(n.g.userData.vx||0)*Math.pow(.08,dt);n.g.userData.vz=(n.g.userData.vz||0)*Math.pow(.08,dt);n.g.rotation.z=Math.sin((1.4-n.knock)*8)*.72;n.g.rotation.x=Math.sin((1.4-n.knock)*5)*.2}else{n.g.rotation.z=THREE.MathUtils.damp(n.g.rotation.z,0,5,dt);n.g.rotation.x=THREE.MathUtils.damp(n.g.rotation.x,0,5,dt);n.phase+=dt*.38;n.g.position.x=THREE.MathUtils.damp(n.g.position.x,n.home.x+Math.sin(n.phase)*2.4,2,dt);n.g.position.z=THREE.MathUtils.damp(n.g.position.z,n.home.z+Math.cos(n.phase*.7)*2.2,2,dt);n.g.rotation.y=Math.sin(n.phase)*.5}}
if(!inCar){ // camera-relative controls, damped acceleration and independent facing
 const yaw=Math.atan2(camera.position.x-player.position.x,camera.position.z-player.position.z);
 const forward=new THREE.Vector3(-Math.sin(yaw),0,Math.cos(yaw));
 const right=new THREE.Vector3(Math.cos(yaw),0,Math.sin(yaw));
 const dir=right.multiplyScalar(move.x).add(forward.multiplyScalar(move.y));
 if(dir.lengthSq()>.02){dir.normalize();const targetYaw=Math.atan2(dir.x,dir.z);player.rotation.y=THREE.MathUtils.dampAngle?THREE.MathUtils.dampAngle(player.rotation.y,targetYaw,12,dt):player.rotation.y+(Math.atan2(Math.sin(targetYaw-player.rotation.y),Math.cos(targetYaw-player.rotation.y)))*Math.min(1,dt*12);const oldPos=player.position.clone();player.position.addScaledVector(dir,(run?7.8:4.6)*dt);
 if(!inside&&obstacles.some(o=>Math.abs(player.position.x-o.x)<o.rx&&Math.abs(player.position.z-o.z)<o.rz))player.position.copy(oldPos)}
 player.position.x=THREE.MathUtils.clamp(player.position.x,-95,95);player.position.z=THREE.MathUtils.clamp(player.position.z,-140,140);
}else{
 // Arcade vehicle dynamics: engine force, drag, lateral grip and speed-sensitive steering.
 const oldPos=car.position.clone(),oldSpeed=Math.abs(speed);
 if(gas&&!reverse)speed+=17.5*dt;
 if(reverse&&!gas){if(speed>1)speed=Math.max(0,speed-27*dt);else speed-=9.5*dt}
 if(!gas&&!reverse)speed*=Math.pow(.982,dt*60);
 speed*=Math.pow(1-(damage/100)*.0018,dt*60);
 speed=THREE.MathUtils.clamp(speed,-11,MAX_SPEED);
 const steerPower=Math.min(1,Math.abs(speed)/7);car.rotation.y-=steer*steerPower*(.55+Math.min(Math.abs(speed)/MAX_SPEED,.8)*.45)*dt*(speed<0?-1:1);
 const fwd=new THREE.Vector3(Math.sin(car.rotation.y),0,Math.cos(car.rotation.y));const right=new THREE.Vector3(fwd.z,0,-fwd.x);
 lateralSpeed+=(-lateralSpeed*5.8+steer*Math.abs(speed)*.16)*dt;lateralSpeed*=Math.pow(.91,dt*60);
 car.position.addScaledVector(fwd,speed*dt);car.position.addScaledVector(right,lateralSpeed*dt);
 // Boundaries and building impacts use a simple impulse response.
 let hit=false;for(const o of obstacles){if(Math.abs(car.position.x-o.x)<o.rx+1.35&&Math.abs(car.position.z-o.z)<o.rz+2.15){hit=true;break}}
 if(Math.abs(car.position.x)>88||Math.abs(car.position.z)>130)hit=true;
 if(hit){car.position.copy(oldPos);const impact=Math.max(0,oldSpeed-Math.abs(speed)*.25);if(collisionCooldown<=0&&impact>2){damage=Math.min(100,damage+Math.max(2,impact*1.15));collisionCooldown=.65;toast('Сильный удар! Кузов повреждён')}speed=-Math.sign(speed||1)*Math.min(oldSpeed*.22,8);lateralSpeed*=-.25}
 collisionCooldown=Math.max(0,collisionCooldown-dt);
 for(const n of npcs){if(car.position.distanceTo(n.g.position)<2.3&&Math.abs(speed)>3){speed*=.88;n.knock=.9}}
 if(Math.abs(car.position.x)>7.5&&Math.abs(speed)>6){speed*=.995;lateralSpeed*=.92}
 // Progressive visual wear: paint dulls, bumpers bend, glass cracks and engine smokes.
 const wear=damage/100;carPaint.color.setRGB(0.19+wear*.20,0.23+wear*.17,0.28+wear*.12);carPaint.roughness=.3+wear*.55;
 bumpers[0].position.z=2.28+wear*.28;bumpers[1].position.z=-2.28-wear*.18;bumpers[0].rotation.x=-wear*.12;bumpers[1].rotation.x=wear*.1;
 cracks.visible=damage>28;smoke.visible=damage>58;
 wheels.forEach((w,i)=>{w.rotation.x+=speed*dt*2.1;if(i<2)w.rotation.y=steer*.24});car.position.y=.025*Math.sin(performance.now()*.018)*Math.min(1,Math.abs(speed)/12);
 $('speedValue').textContent=Math.round(Math.abs(speed)*3.6);$('gear').textContent=speed<-.4?'R':Math.abs(speed)<.4?'N':'D';$('damageBar').style.width=(100-damage)+'%';$('damageBar').style.background=damage>65?'#c85c50':damage>30?'#d6a34d':'#75c995';}
const target=inCar?car.position:player.position;const follow=target.clone().add(new THREE.Vector3(-1.35,0,1.65));if(cat.position.distanceTo(follow)>.7)cat.position.lerp(follow,Math.min(1,dt*3));cat.rotation.y=Math.atan2(target.x-cat.position.x,target.z-cat.position.z);
let desired,look;if(inside){desired=player.position.clone().add(new THREE.Vector3(0,3.2,-6));look=player.position.clone().add(new THREE.Vector3(0,1.1,1))}else if(inCar){desired=car.position.clone().add(new THREE.Vector3(0,first?1.7:4.4,first?-.2:-9).applyAxisAngle(new THREE.Vector3(0,1,0),car.rotation.y));look=car.position.clone().add(new THREE.Vector3(0,1,4).applyAxisAngle(new THREE.Vector3(0,1,0),car.rotation.y))}else if(first){desired=player.position.clone().add(new THREE.Vector3(0,2,0));look=desired.clone().add(new THREE.Vector3(Math.sin(player.rotation.y),0,Math.cos(player.rotation.y)).multiplyScalar(5))}else{desired=player.position.clone().add(new THREE.Vector3(0,4.5,-8).applyAxisAngle(new THREE.Vector3(0,1,0),player.rotation.y));look=player.position.clone().add(new THREE.Vector3(0,1.2,0))}
camera.position.lerp(desired,Math.min(1,dt*6));camera.lookAt(look);
if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)$('toast').style.opacity=0}
}
let last=performance.now();function frame(now){const dt=Math.min((now-last)/1000,.035);last=now;update(dt);renderer.render(scene,camera);requestAnimationFrame(frame)}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5))});
setTimeout(()=>{loading.style.display='none';toast('Версия 5.0: новые текстуры и разнообразные жители!')},1200);requestAnimationFrame(frame);
