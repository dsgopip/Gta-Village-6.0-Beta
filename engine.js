import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// V9 runtime: deterministic fixed-step simulation, isolated input, character/vehicle controllers,
// spring camera, minimap renderer and companion AI.
export class V9Engine {
  constructor({scene,camera,renderer,player,car,cat,npcs,obstacles,wheels,playerLegPivots,playerArmPivots,
    mapCanvas,carPaint,bumpers,cracks,smoke,ui,toast,MAX_SPEED,firstPerson=false,onEnterExit}) {
    Object.assign(this,{scene,camera,renderer,player,car,cat,npcs,obstacles,wheels,playerLegPivots,playerArmPivots,mapCanvas,carPaint,bumpers,cracks,smoke,ui,toast,MAX_SPEED,onEnterExit});
    this.input={moveX:0,moveY:0,steer:0,run:false,gas:false,reverse:false};
    this.cameraState={yaw:0,pitch:.18,first:firstPerson,pointer:null,lastX:0,lastY:0};
    this.inCar=false;this.speed=0;this.lateral=0;this.damage=0;this.collisionCooldown=0;
    this.velocity=new THREE.Vector3();this.walkPhase=0;this.cameraVelocity=new THREE.Vector3();
    this.catVelocity=new THREE.Vector3();this.catPhase=0;this.raycaster=new THREE.Raycaster();
    this.landmarks=[
      {x:-47,z:-102,label:'П',name:'Полиция',color:'#65a9ff'},
      {x:47,z:-102,label:'М',name:'Медпункт',color:'#65dfa8'},
      {x:-47,z:103,label:'Ш',name:'Школа',color:'#ffd16a'},
      {x:47,z:103,label:'МГ',name:'Магазин',color:'#ff9878'}
    ];
    this.bindInput();this.bindButtons();this.mapCtx=mapCanvas.getContext('2d');
  }
  bindInput(){
    const bindStick=(id,knob,cb)=>{const el=document.getElementById(id),dot=document.getElementById(knob);let pid=null;
      const move=e=>{const r=el.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,max=r.width*.34,d=Math.hypot(dx,dy),k=d>max?max/d:1,x=dx*k,y=dy*k;dot.style.transform=`translate(${x}px,${y}px)`;cb(x/max,-y/max)};
      el.addEventListener('pointerdown',e=>{e.preventDefault();pid=e.pointerId;el.setPointerCapture(pid);move(e)});
      el.addEventListener('pointermove',e=>{if(e.pointerId===pid)move(e)});
      const end=e=>{if(e.pointerId!==pid)return;pid=null;dot.style.transform='';cb(0,0)};el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
    };
    bindStick('stick','knob',(x,y)=>{this.input.moveX=x;this.input.moveY=y});
    bindStick('steerStick','steerKnob',x=>this.input.steer=x);
    const excluded=t=>!!(t?.closest?.('button,.stick,input,select'));
    document.addEventListener('pointerdown',e=>{
      if(e.pointerType==='mouse'&&e.button!==0)return;if(excluded(e.target))return;
      this.cameraState.pointer=e.pointerId;this.cameraState.lastX=e.clientX;this.cameraState.lastY=e.clientY;
    });
    document.addEventListener('pointermove',e=>{
      const c=this.cameraState;if(c.pointer!==e.pointerId)return;
      const dx=e.clientX-c.lastX,dy=e.clientY-c.lastY;c.lastX=e.clientX;c.lastY=e.clientY;
      c.yaw-=dx*.0065;c.pitch=THREE.MathUtils.clamp(c.pitch-dy*.0055,-.58,1.08);
    });
    const end=e=>{if(this.cameraState.pointer===e.pointerId)this.cameraState.pointer=null};
    document.addEventListener('pointerup',end);document.addEventListener('pointercancel',end);
  }
  bindButtons(){
    const hold=(id,key)=>{const el=document.getElementById(id);const down=e=>{e.preventDefault();this.input[key]=true},up=()=>this.input[key]=false;el.addEventListener('pointerdown',down);['pointerup','pointercancel','pointerleave'].forEach(ev=>el.addEventListener(ev,up));};
    hold('runBtn','run');hold('gasBtn','gas');hold('reverseBtn','reverse');
    document.getElementById('cameraBtn').onclick=()=>{this.cameraState.first=!this.cameraState.first;this.ui.cameraBtn.textContent='КАМЕРА: '+(this.cameraState.first?'1 ЛИЦО':'3 ЛИЦО')};
    document.getElementById('enterBtn').onclick=()=>this.toggleCar();document.getElementById('exitBtn').onclick=()=>this.toggleCar();
  }
  toggleCar(){
    if(this.inCar){this.inCar=false;this.player.visible=true;const side=new THREE.Vector3(2,0,0).applyAxisAngle(new THREE.Vector3(0,1,0),this.car.rotation.y);this.player.position.copy(this.car.position).add(side);this.velocity.set(0,0,0);this.ui.walkControls.classList.remove('hidden');this.ui.carControls.classList.add('hidden');this.ui.speedPanel.classList.add('hidden');this.ui.damageWrap.classList.add('hidden');this.toast('Ты вышел из автомобиля');}
    else if(this.player.position.distanceTo(this.car.position)<5){this.inCar=true;this.player.visible=false;this.ui.walkControls.classList.add('hidden');this.ui.carControls.classList.remove('hidden');this.ui.speedPanel.classList.remove('hidden');this.ui.damageWrap.classList.remove('hidden');this.toast('Ты за рулём');}
    else this.toast('Подойди ближе к машине');
    this.onEnterExit?.(this.inCar);
  }
  setFirstPerson(v){this.cameraState.first=!!v;this.ui.cameraBtn.textContent='КАМЕРА: '+(v?'1 ЛИЦО':'3 ЛИЦО')}
  update(dt,{inside=false,insideFacility=null}={}){
    this.updateResidents(dt);if(!inside){if(this.inCar)this.updateVehicle(dt);else this.updateCharacter(dt)}else this.velocity.set(0,0,0);
    this.updateCat(dt,inside);this.updateCamera(dt,{inside});this.drawMap();
  }
  updateCharacter(dt){
    const c=this.cameraState,forward=new THREE.Vector3(Math.sin(c.yaw),0,Math.cos(c.yaw)),right=new THREE.Vector3(Math.cos(c.yaw),0,-Math.sin(c.yaw));
    const desired=right.multiplyScalar(this.input.moveX).add(forward.multiplyScalar(this.input.moveY));const active=desired.lengthSq()>.025;
    if(active){desired.normalize();const yaw=Math.atan2(desired.x,desired.z);this.player.rotation.y+=THREE.MathUtils.euclideanModulo(yaw-this.player.rotation.y+Math.PI,Math.PI*2)-Math.PI;}
    const max=this.input.run?6.6:3.9,target=active?desired.multiplyScalar(max):new THREE.Vector3();
    // Acceleration and braking are separate, so releasing the stick no longer causes a sudden stop.
    const rate=active?10.5:7.2;this.velocity.lerp(target,1-Math.exp(-rate*dt));
    const old=this.player.position.clone(),delta=this.velocity.clone().multiplyScalar(dt);this.player.position.add(delta);
    const hit=this.obstacles.some(o=>Math.abs(this.player.position.x-o.x)<o.rx+.35&&Math.abs(this.player.position.z-o.z)<o.rz+.35);
    if(hit){this.player.position.copy(old);this.velocity.multiplyScalar(.12)}
    this.player.position.x=THREE.MathUtils.clamp(this.player.position.x,-94,94);this.player.position.z=THREE.MathUtils.clamp(this.player.position.z,-136,136);
    const stride=Math.min(1,this.velocity.length()/3.8);this.walkPhase+=dt*(this.input.run?11:8)*stride;
    this.playerLegPivots.forEach((p,i)=>p.rotation.x=Math.sin(this.walkPhase+i*Math.PI)*.48*stride);
    this.playerArmPivots.forEach((p,i)=>p.rotation.x=-Math.sin(this.walkPhase+i*Math.PI)*.36*stride);
    this.player.position.y=Math.abs(Math.sin(this.walkPhase*2))*.045*stride;
  }
  updateVehicle(dt){
    const oldPos=this.car.position.clone(),oldSpeed=Math.abs(this.speed),steer=this.input.steer;
    if(this.input.gas&&!this.input.reverse)this.speed+=19*dt;
    else if(this.input.reverse){if(this.speed>1)this.speed=Math.max(0,this.speed-30*dt);else this.speed-=10*dt;}
    else this.speed*=Math.exp(-.42*dt);
    this.speed*=Math.exp(-(this.damage/100)*.035*dt);this.speed=THREE.MathUtils.clamp(this.speed,-12,this.MAX_SPEED);
    const speedFactor=THREE.MathUtils.clamp(Math.abs(this.speed)/9,0,1);
    const yawRate=(.28+speedFactor*.66)*steer*speedFactor*(this.speed<0?-1:1);
    this.car.rotation.y-=yawRate*dt;
    const forward=new THREE.Vector3(Math.sin(this.car.rotation.y),0,Math.cos(this.car.rotation.y));
    const right=new THREE.Vector3(forward.z,0,-forward.x);
    this.lateral+=(-this.lateral*7.5+steer*Math.abs(this.speed)*.1)*dt;this.lateral*=Math.exp(-2.8*dt);
    this.car.position.addScaledVector(forward,this.speed*dt);this.car.position.addScaledVector(right,this.lateral*dt);
    let hit=Math.abs(this.car.position.x)>88||Math.abs(this.car.position.z)>130;
    if(!hit)hit=this.obstacles.some(o=>Math.abs(this.car.position.x-o.x)<o.rx+1.35&&Math.abs(this.car.position.z-o.z)<o.rz+2.1);
    if(hit){this.car.position.copy(oldPos);if(this.collisionCooldown<=0&&oldSpeed>2.5){this.damage=Math.min(100,this.damage+Math.max(3,oldSpeed*.9));this.collisionCooldown=.65;this.toast('Столкновение! Автомобиль повреждён')};this.speed=-Math.sign(this.speed||1)*Math.min(oldSpeed*.2,6);this.lateral*=-.2;}
    this.collisionCooldown=Math.max(0,this.collisionCooldown-dt);
    for(const n of this.npcs){if(this.car.position.distanceTo(n.g.position)<2.25&&Math.abs(this.speed)>3){this.speed*=.9;n.knock=Math.max(n.knock,.7)}}
    this.wheels.forEach((w,i)=>{w.rotation.x+=this.speed*dt*2.1;if(i<2)w.rotation.y=steer*.22});
    const wear=this.damage/100;this.carPaint.color.setRGB(1-wear*.18,1-wear*.16,1-wear*.12);this.carPaint.roughness=.24+wear*.52;this.bumpers[0].position.z=2.28+wear*.22;this.bumpers[1].position.z=-2.28-wear*.16;this.bumpers[0].rotation.x=-wear*.1;this.bumpers[1].rotation.x=wear*.08;this.cracks.visible=this.damage>28;this.smoke.visible=this.damage>58;this.ui.speedValue.textContent=Math.round(Math.abs(this.speed)*3.6);this.ui.gear.textContent=this.speed<-.4?'R':Math.abs(this.speed)<.4?'N':'D';
    this.ui.damageBar.style.width=(100-this.damage)+'%';this.ui.damageBar.style.background=this.damage>65?'#c85c50':this.damage>30?'#d6a34d':'#75c995';
    this.car.position.y=.018*Math.sin(performance.now()*.014)*speedFactor;
  }
  updateResidents(dt){
    for(const n of this.npcs){if(n.knock>0){n.knock-=dt;n.g.position.x+=(n.g.userData.vx||0)*dt;n.g.position.z+=(n.g.userData.vz||0)*dt;n.g.userData.vx=(n.g.userData.vx||0)*Math.exp(-5*dt);n.g.userData.vz=(n.g.userData.vz||0)*Math.exp(-5*dt);n.g.rotation.z=Math.sin((.8-n.knock)*7)*.55;}
      else{n.g.rotation.z=THREE.MathUtils.damp(n.g.rotation.z,0,6,dt);n.phase+=dt*.32;n.g.position.x=THREE.MathUtils.damp(n.g.position.x,n.home.x+Math.sin(n.phase)*2.2,1.6,dt);n.g.position.z=THREE.MathUtils.damp(n.g.position.z,n.home.z+Math.cos(n.phase*.7)*2,1.6,dt);n.g.rotation.y=Math.sin(n.phase)*.4;}}
  }
  updateCat(dt,inside){
    if(inside)return;const target=this.inCar?this.car.position:this.player.position;const behind=new THREE.Vector3(-Math.sin(this.inCar?this.car.rotation.y:this.player.rotation.y),0,-Math.cos(this.inCar?this.car.rotation.y:this.player.rotation.y));
    const desired=target.clone().addScaledVector(behind,1.75).add(new THREE.Vector3(.75,0,0));const dist=this.cat.position.distanceTo(desired);
    if(dist>1.1){const dir=desired.sub(this.cat.position).normalize();this.catVelocity.lerp(dir.multiplyScalar(dist>5?5.2:2.8),1-Math.exp(-3.2*dt));this.cat.position.addScaledVector(this.catVelocity,dt)}else this.catVelocity.multiplyScalar(Math.exp(-5*dt));
    const vel=this.catVelocity.length();this.cat.position.y=.025+Math.abs(Math.sin(performance.now()*.012))*Math.min(.045,vel*.009);if(vel>.25)this.cat.rotation.y=Math.atan2(this.catVelocity.x,this.catVelocity.z);
    this.catPhase+=dt*vel*2.5;
  }
  updateCamera(dt,{inside}){
    const target=this.inCar?this.car.position:this.player.position,c=this.cameraState;
    const lookTarget=target.clone().add(new THREE.Vector3(0,this.inCar?1.2:1.35,0));let desired,look;
    if(inside){desired=target.clone().add(new THREE.Vector3(Math.sin(c.yaw)*5,3,-Math.cos(c.yaw)*5));look=lookTarget.clone().add(new THREE.Vector3(Math.sin(c.yaw),0,Math.cos(c.yaw)).multiplyScalar(4));}
    else if(c.first&&this.inCar){desired=this.car.localToWorld(new THREE.Vector3(0,1.58,.42));const dir=new THREE.Vector3(Math.sin(c.yaw)*Math.cos(c.pitch),Math.sin(c.pitch),Math.cos(c.yaw)*Math.cos(c.pitch)).applyAxisAngle(new THREE.Vector3(0,1,0),this.car.rotation.y);look=desired.clone().add(dir.multiplyScalar(20));}
    else if(c.first){desired=lookTarget.clone().add(new THREE.Vector3(0,.4,0));look=desired.clone().add(new THREE.Vector3(Math.sin(c.yaw)*Math.cos(c.pitch),Math.sin(c.pitch),Math.cos(c.yaw)*Math.cos(c.pitch)).multiplyScalar(8));}
    else{const dist=this.inCar?9.5:8.2,height=this.inCar?4.2:4.4;desired=target.clone().add(new THREE.Vector3(Math.sin(c.yaw)*dist*Math.cos(c.pitch),height+Math.sin(c.pitch)*dist,-Math.cos(c.yaw)*dist*Math.cos(c.pitch)));look=lookTarget;}
    const smoothing=1-Math.exp(-(c.first&&this.inCar?18:8.5)*dt);this.camera.position.lerp(desired,smoothing);this.camera.lookAt(look);
  }
  drawMap(){
    const ctx=this.mapCtx,w=this.mapCanvas.width,h=this.mapCanvas.height;ctx.clearRect(0,0,w,h);
    ctx.fillStyle='#172b27';ctx.fillRect(0,0,w,h);ctx.save();ctx.beginPath();ctx.roundRect(5,5,w-10,h-10,15);ctx.clip();
    // Terrain blocks and paths
    ctx.fillStyle='#354f3b';ctx.fillRect(6,6,w-12,h-12);
    const sx=x=>w/2+x*.88,sy=z=>h/2+z*.66;
    ctx.strokeStyle='#b6b5a0';ctx.lineCap='round';ctx.lineWidth=13;ctx.beginPath();ctx.moveTo(sx(0),sy(-140));ctx.lineTo(sx(0),sy(140));ctx.moveTo(sx(-100),sy(-22));ctx.lineTo(sx(100),sy(-22));ctx.moveTo(sx(-100),sy(36));ctx.lineTo(sx(100),sy(36));ctx.moveTo(sx(-47),sy(-120));ctx.lineTo(sx(-47),sy(120));ctx.moveTo(sx(47),sy(-120));ctx.lineTo(sx(47),sy(120));ctx.stroke();
    ctx.strokeStyle='#e4dfc7';ctx.lineWidth=2;ctx.setLineDash([5,6]);ctx.beginPath();ctx.moveTo(sx(0),sy(-135));ctx.lineTo(sx(0),sy(135));ctx.stroke();ctx.setLineDash([]);
    // Residential plots
    ctx.fillStyle='#8d9a70';for(const x of [-70,-24,24,70])for(const z of [-95,-55,0,55,95]){if(Math.abs(x)===24&&Math.abs(z)===95)continue;ctx.fillRect(sx(x)-4,sy(z)-4,8,8)}
    for(const p of this.landmarks){const x=sx(p.x),y=sy(p.z);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#0b1715';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#101a19';ctx.font='bold 11px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.label,x,y+.5);}
    const obj=this.inCar?this.car:this.player;const x=sx(obj.position.x),y=sy(obj.position.z),angle=obj.rotation.y;
    ctx.save();ctx.translate(x,y);ctx.rotate(-angle);ctx.fillStyle=this.inCar?'#f6f7f3':'#fff16a';ctx.strokeStyle='#111';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(8,9);ctx.lineTo(0,5);ctx.lineTo(-8,9);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
    ctx.restore();ctx.strokeStyle='#dbe5dc';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(3,3,w-6,h-6,16);ctx.stroke();
    ctx.fillStyle='rgba(5,14,16,.75)';ctx.fillRect(8,8,55,18);ctx.fillStyle='#fff';ctx.font='bold 11px Arial';ctx.textAlign='left';ctx.fillText('ДЕРЕВНЯ',13,21);
  }
}
