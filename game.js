import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const loading=document.getElementById('loading');
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x9cc4d1); scene.fog=new THREE.Fog(0x9cc4d1,42,150);
const camera=new THREE.PerspectiveCamera(68,innerWidth/innerHeight,.1,260);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6)); renderer.setSize(innerWidth,innerHeight); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.05; document.body.prepend(renderer.domElement);
const hemi=new THREE.HemisphereLight(0xd9edff,0x6b624c,1.35);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffe1b3,2.0);sun.position.set(-35,55,20);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-70;sun.shadow.camera.right=70;sun.shadow.camera.top=70;sun.shadow.camera.bottom=-70;scene.add(sun);
const mat=(c,r=.85,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
const grass=mat(0x597c4b),road=mat(0x42494b),roadEdge=mat(0x77766b),wood=mat(0x77533a),roof=mat(0x55443a),wall1=mat(0xd3c5a2),wall2=mat(0xb9c6b0),glass= new THREE.MeshStandardMaterial({color:0x213d4a,roughness:.25,metalness:.25}),black=mat(0x171b1d,.45),tire=mat(0x101214),white=mat(0xe2e0d5),fur=mat(0x777d83),skin=mat(0xd3a17e),shirt=mat(0x314b63),pants=mat(0x272e35);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(240,240),grass);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
function box(parent,x,y,z,sx,sy,sz,material){const o=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function cylinder(parent,x,y,z,rt,rb,h,material,seg=12){const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),material);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o}
function makeHouse(x,z,variant=0){
 const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);const w=variant%2?wall2:wall1;
 box(g,0,1.45,0,7,2.9,5,w);box(g,0,3.25,0,7.5,.28,5.5,wood);
 const roofGeo=new THREE.ConeGeometry(5.2,2.4,4);roofGeo.rotateY(Math.PI/4);const r=new THREE.Mesh(roofGeo,roof);r.position.y=4.45;r.scale.set(1,.65,.72);r.castShadow=true;g.add(r);
 box(g,0,1.05,2.56,1.15,2.1,.12,wood);box(g,-2.05,1.85,2.57,1.05,.85,.13,glass);box(g,2.05,1.85,2.57,1.05,.85,.13,glass);
 box(g,-2.05,1.85,2.66,1.15,.08,.06,white);box(g,-2.05,1.85,2.66,.08,.95,.06,white);box(g,2.05,1.85,2.66,1.15,.08,.06,white);box(g,2.05,1.85,2.66,.08,.95,.06,white);
 // porch
 box(g,0,.18,3.35,3,.25,1.5,wood);for(let i=-1;i<=1;i++)box(g,i*1.25,1.05,3.9,.12,2.1,.12,wood);
 return g;
}
function makeTree(x,z,s=1){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);cylinder(g,0,1.2,0,.23,.3,2.4,wood);for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(1.25-i*.12,1),mat(i===0?0x355d36:0x426c3d));m.position.set((i%2-.5)*.45,2.4+i*.65,0);m.scale.set(s,s*.85,s);m.castShadow=true;g.add(m)}}
function makeFence(x,z,len,rot=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;scene.add(g);for(let i=0;i<=len;i++){box(g,i*.8,.55,0,.1,1.1,.1,white);if(i<len){box(g,i*.4+.2,.35,0,.82,.09,.09,wood);box(g,i*.4+.2,.78,0,.82,.09,.09,wood)}}}
 // road village loop and side lane
box(scene,0,.025,0,13,.05,125,road);box(scene,-8,.02,0,1,.04,125,roadEdge);box(scene,8,.02,0,1,.04,125,roadEdge);
for(let z=-55;z<=55;z+=18){makeHouse(-19,z,Math.abs(z/18)%2);makeHouse(19,z+7,1);makeTree(-29,z+5,.9);makeTree(29,z-4,1.1);makeFence(-25,z-5,6);makeFence(22,z+12,5,Math.PI/2)}
for(let z=-55;z<=55;z+=5){box(scene,-.8,.055,z, .12,.04,.12,mat(0xd5d0a2))}
for(let i=0;i<35;i++){const x=(Math.random()-.5)*75,z=(Math.random()-.5)*115;if(Math.abs(x)>10)makeTree(x,z,.55+Math.random()*.5)}
// sign and bus stop
box(scene,-9,1,-10,2,.08,.08,wood);box(scene,-9,1.4,-10,.08,.8,.08,wood);box(scene,-9,1.7,-10,2.2,.5,.12,mat(0x356a50));
const signText=()=>{};
// vehicle
const car=new THREE.Group();scene.add(car);car.position.set(4,0,12);car.rotation.y=Math.PI;
const carBody=mat(0x303943,.32,.65), trim=mat(0x111518,.35,.5), lamp=mat(0xe7e3c6,.25,.2);
const chassis=box(car,0,.95,0,2.2,.75,4.3,carBody);box(car,0,1.55,-.25,1.85,.85,2.25,glass);box(car,0,1.12,2.18,2.18,.25,.15,trim);box(car,0,1.12,-2.18,2.18,.25,.15,trim);
for(const x of [-1.13,1.13])for(const z of [-1.35,1.35]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.48,.48,.28,18),tire);wheel.rotation.z=Math.PI/2;wheel.position.set(x,.52,z);wheel.castShadow=true;car.add(wheel)}
for(const x of [-.72,.72]){box(car,x,1.08,2.19,.38,.25,.08,lamp);box(car,x,1.08,-2.19,.38,.25,.08,mat(0x9d3028))}
const roofbox=box(car,0,2.02,-.25,1.8,.08,2.1,carBody);
const carWheels=car.children.filter(o=>o.geometry?.type==='CylinderGeometry');
const player=new THREE.Group();scene.add(player);
const torso=box(player,0,1.45,0,.62,.85,.35,shirt),head=new THREE.Mesh(new THREE.SphereGeometry(.25,14,12),skin);head.position.y=2.08;head.castShadow=true;player.add(head);
const legL=box(player,-.18,.62,0,.22,.72,.25,pants),legR=box(player,.18,.62,0,.22,.72,.25,pants);
const armL=box(player,-.43,1.48,0,.2,.7,.2,shirt),armR=box(player,.43,1.48,0,.2,.7,.2,shirt);
player.position.set(0,0,5);
const cat=new THREE.Group();scene.add(cat);
const catBody=new THREE.Mesh(new THREE.SphereGeometry(.38,16,12),fur);catBody.scale.set(1.3,.72,.75);catBody.position.y=.48;cat.add(catBody);
const catHead=new THREE.Mesh(new THREE.SphereGeometry(.25,16,12),fur);catHead.position.set(0,.65,.4);cat.add(catHead);
for(const x of [-.15,.15]){const ear=new THREE.Mesh(new THREE.ConeGeometry(.09,.22,8),fur);ear.position.set(x,.9,.4);cat.add(ear)}
for(const x of [-.23,.23])for(const z of [-.18,.18]){const leg= new THREE.Mesh(new THREE.CylinderGeometry(.06,.07,.35,8),fur);leg.position.set(x,.22,z);cat.add(leg)}
const tail=new THREE.Mesh(new THREE.CylinderGeometry(.045,.07,.65,8),fur);tail.position.set(0,.55,-.55);tail.rotation.x=-.9;cat.add(tail);
const npcList=[];
function makeNPC(x,z,i){const g=new THREE.Group();scene.add(g);g.position.set(x,0,z);const colors=[0x8b5b43,0x526d7b,0x6b7250,0x8a6b85];const top=box(g,0,1.4,0,.55,.8,.32,mat(colors[i%4]));const h=new THREE.Mesh(new THREE.SphereGeometry(.22,12,10),skin);h.position.y=2;g.add(h);const a=box(g,-.36,1.4,0,.16,.65,.16,mat(colors[i%4]));const b=box(g,.36,1.4,0,.16,.65,.16,mat(colors[i%4]));const l=box(g,-.15,.55,0,.2,.65,.2,pants),r=box(g,.15,.55,0,.2,.65,.2,pants);npcList.push({g,home:new THREE.Vector3(x,0,z),phase:Math.random()*6,down:0,parts:[top,h,a,b,l,r],legs:[l,r]})}
for(let i=0;i<12;i++)makeNPC((i%2?1:-1)*(11+Math.random()*8),-45+i*8,i);
const keys={};let walking={x:0,y:0},steering=0,gas=false,reverse=false,running=false,inCar=false,firstPerson=false,toastTimer=0,damage=0,speed=0,mission=0,day=8;
function toast(t){const el=document.getElementById('toast');el.textContent=t;el.style.opacity=1;toastTimer=2.2}
function bindStick(el,knob,cb){let active=false,id=null;function move(e){const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const max=r.width*.34,d=Math.hypot(dx,dy);if(d>max){dx*=max/d;dy*=max/d}knob.style.transform=`translate(${dx}px,${dy}px)`;cb(dx/max,-dy/max)}el.addEventListener('pointerdown',e=>{active=true;id=e.pointerId;el.setPointerCapture(id);move(e)});el.addEventListener('pointermove',e=>{if(active&&e.pointerId===id)move(e)});const end=e=>{if(active&&e.pointerId===id){active=false;knob.style.transform='';cb(0,0)}};el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end)}
bindStick(document.getElementById('stick'),document.getElementById('knob'),(x,y)=>walking={x,y});
bindStick(document.getElementById('steerStick'),document.getElementById('steerKnob'),(x,y)=>steering=x);
document.getElementById('runBtn').addEventListener('pointerdown',()=>running=true);['pointerup','pointercancel','pointerleave'].forEach(ev=>document.getElementById('runBtn').addEventListener(ev,()=>running=false));
document.getElementById('gasBtn').addEventListener('pointerdown',()=>gas=true);['pointerup','pointercancel','pointerleave'].forEach(ev=>document.getElementById('gasBtn').addEventListener(ev,()=>gas=false));
document.getElementById('reverseBtn').addEventListener('pointerdown',()=>reverse=true);['pointerup','pointercancel','pointerleave'].forEach(ev=>document.getElementById('reverseBtn').addEventListener(ev,()=>reverse=false));
document.getElementById('cameraBtn').onclick=()=>{firstPerson=!firstPerson;document.getElementById('cameraBtn').textContent='КАМЕРА: '+(firstPerson?'1 ЛИЦО':'3 ЛИЦО')};
function enter(){if(inCar){inCar=false;player.visible=true;player.position.copy(car.position).add(new THREE.Vector3(2,0,0));document.getElementById('walkControls').classList.remove('hidden');document.getElementById('carControls').classList.add('hidden');document.getElementById('damageWrap').classList.add('hidden');toast('Вы вышли из автомобиля');return}
if(player.position.distanceTo(car.position)<5){inCar=true;player.visible=false;document.getElementById('walkControls').classList.add('hidden');document.getElementById('carControls').classList.remove('hidden');document.getElementById('damageWrap').classList.remove('hidden');toast('Вы сели в автомобиль')}else toast('Подойди ближе к автомобилю')}
document.getElementById('enterBtn').onclick=enter;document.getElementById('exitBtn').onclick=enter;
document.getElementById('actionBtn').onclick=()=>{let n=npcList.find(n=>n.g.position.distanceTo(player.position)<2.5);if(!n){toast('Рядом никого нет');return}n.down=1.2;toast('Житель отшатнулся!')};
document.getElementById('missionBtn').onclick=()=>{mission=(mission+1)%3;setMission()};
function setMission(){const arr=['Осмотрись в деревне','Подойди к машине и прокатись','Доедь до площади у деревенского знака'];document.getElementById('mission').textContent='ЗАДАНИЕ: '+arr[mission]}
setMission();
function updateNPC(dt,t){for(const n of npcList){if(n.down>0){n.down-=dt;n.g.rotation.z=Math.sin((1.2-n.down)*12)*.55;continue}else n.g.rotation.z=THREE.MathUtils.damp(n.g.rotation.z,0,5,dt);n.phase+=dt*.45;n.g.position.x=n.home.x+Math.sin(n.phase)*1.8;n.g.position.z=n.home.z+Math.cos(n.phase*.7)*1.6;n.g.rotation.y=Math.sin(n.phase)*.5;}}
function updateDay(dt){day=(day+dt*.045)%24;const h=Math.floor(day),m=Math.floor((day-h)*60);document.getElementById('clock').textContent=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');const sunH=Math.max(0,Math.sin((day-6)/12*Math.PI));sun.intensity=.15+sunH*2.0;hemi.intensity=.35+sunH*1.1;const night=1-sunH;const sky=new THREE.Color(0x9cc4d1).lerp(new THREE.Color(0x111a2b),night*.85);scene.background=sky;scene.fog.color.copy(sky)}
function update(dt,t){updateDay(dt);updateNPC(dt,t);
 if(!inCar){const v=new THREE.Vector3(walking.x,0,-walking.y);if(v.length()>.08){v.normalize();const ang=Math.atan2(v.x,v.z);player.rotation.y=THREE.MathUtils.damp(player.rotation.y,ang,10,dt);const step=(running?6.5:3.1)*dt;player.position.add(v.multiplyScalar(step));player.position.x=THREE.MathUtils.clamp(player.position.x,-8.5,8.5);player.position.z=THREE.MathUtils.clamp(player.position.z,-60,60)}}
 else{const accel=(gas?8:0)-(reverse?5:0);speed+=accel*dt;speed*=Math.pow(.975,dt*60);speed=THREE.MathUtils.clamp(speed,-5,13);car.rotation.y-=steering*speed*.018*dt*10;const forward=new THREE.Vector3(Math.sin(car.rotation.y),0,Math.cos(car.rotation.y));car.position.add(forward.multiplyScalar(speed*dt));car.position.x=THREE.MathUtils.clamp(car.position.x,-55,55);car.position.z=THREE.MathUtils.clamp(car.position.z,-65,65);
 // collision with trees/houses/NPC, simple impact damage
 for(const n of npcList){if(car.position.distanceTo(n.g.position)<2.1&&Math.abs(speed)>2){damage=Math.min(100,damage+dt*13);speed*=.78;n.down=1.2}}
 if(Math.abs(car.position.x)>8.5&&Math.abs(speed)>4){damage=Math.min(100,damage+dt*5);speed*=.985}
 document.getElementById('damageBar').style.width=(100-damage)+'%';document.getElementById('damageBar').style.background=damage>65?'#c85c50':'#75c995';
 }
 // cat follows player or car
 const target=inCar?car.position:player.position;const desired=target.clone().add(new THREE.Vector3(-1.4,0,1.5));const d=cat.position.distanceTo(desired);if(d>.7){cat.position.lerp(desired,Math.min(1,dt*2.7));cat.rotation.y=Math.atan2(target.x-cat.position.x,target.z-cat.position.z)}
 // camera
 let targetPos,look;
 if(inCar){targetPos=car.position.clone().add(new THREE.Vector3(0,firstPerson?1.7:4.2,firstPerson?-.25:-8).applyAxisAngle(new THREE.Vector3(0,1,0),car.rotation.y));look=car.position.clone().add(new THREE.Vector3(0,1,3).applyAxisAngle(new THREE.Vector3(0,1,0),car.rotation.y))}
 else if(firstPerson){targetPos=player.position.clone().add(new THREE.Vector3(0,2.05,0));look=targetPos.clone().add(new THREE.Vector3(Math.sin(player.rotation.y),0,Math.cos(player.rotation.y)).multiplyScalar(5))}
 else{targetPos=player.position.clone().add(new THREE.Vector3(0,4.2,-7).applyAxisAngle(new THREE.Vector3(0,1,0),player.rotation.y));look=player.position.clone().add(new THREE.Vector3(0,1.2,0))}
 camera.position.lerp(targetPos,Math.min(1,dt*5));camera.lookAt(look);
 // missions auto
 if(mission===1&&inCar){mission=2;setMission();toast('Отлично! Теперь прокатись по деревне')}
 if(mission===2&&car.position.distanceTo(new THREE.Vector3(0,0,-10))<8){mission=0;setMission();toast('Задание выполнено!')}
}
let last=performance.now();function loop(now){const dt=Math.min((now-last)/1000,.04);last=now;update(dt,now/1000);renderer.render(scene,camera);requestAnimationFrame(loop)}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.6))});
setTimeout(()=>{loading.style.display='none';toast('Добро пожаловать! Найди автомобиль у дороги')},900);requestAnimationFrame(loop);
