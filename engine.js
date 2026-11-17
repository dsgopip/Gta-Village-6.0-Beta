import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

/*
 * VILLAGE LIFE 3D — V10 simulation core
 * Fixed-step friendly controllers, multi-pointer mobile input, spring camera,
 * arcade vehicle dynamics, companion follow AI and tactical minimap.
 */
export class V10Engine {
  constructor({scene,camera,renderer,player,car,cat,npcs,obstacles,wheels,playerLegPivots,playerArmPivots,
    mapCanvas,carPaint,bumpers,cracks,smoke,ui,toast,MAX_SPEED,firstPerson=false,onEnterExit}) {
    Object.assign(this,{scene,camera,renderer,player,car,cat,npcs,obstacles,wheels,playerLegPivots,playerArmPivots,
      mapCanvas,carPaint,bumpers,cracks,smoke,ui,toast,MAX_SPEED,onEnterExit});
    this.input={moveX:0,moveY:0,steer:0,run:false,gas:false,reverse:false};
    this.cameraState={yaw:0,pitch:.16,first:firstPerson,pointers:new Map()};
    this.inCar=false;this.speed=0;this.lateral=0;this.damage=0;this.collisionCooldown=0;
    this.velocity=new THREE.Vector3();this.catVelocity=new THREE.Vector3();this.walkPhase=0;this.catPhase=0;
    this.cameraLook=new THREE.Vector3();this.cameraReady=false;this.mapCtx=mapCanvas.getContext('2d');
    this.landmarks=[
      {x:-47,z:-102,label:'П',name:'Полиция',color:'#65a9ff'},
      {x:47,z:-102,label:'М',name:'Медпункт',color:'#65dfa8'},
      {x:-47,z:103,label:'Ш',name:'Школа',color:'#ffd16a'},
      {x:47,z:103,label:'МГ',name:'Магазин',color:'#ff9878'}
    ];
    this.bindInput();this.bindButtons();
  }
  bindInput(){
    const bindStick=(id,knob,cb)=>{
      const el=document.getElementById(id),dot=document.getElementById(knob);let pid=null;
      const move=e=>{const r=el.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2;
        const max=r.width*.34,d=Math.hypot(dx,dy),k=d>max?max/d:1,x=dx*k,y=dy*k;
        dot.style.transform=`translate(${x}px,${y}px)`;cb(x/max,-y/max)};
      el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();pid=e.pointerId;el.setPointerCapture(pid);move(e)});
      el.addEventListener('pointermove',e=>{if(e.pointerId===pid)move(e)});
      const end=e=>{if(e.pointerId!==pid)return;pid=null;dot.style.transform='';cb(0,0)};
      ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>el.addEventListener(ev,end));
    };
    bindStick('stick','knob',(x,y)=>{this.input.moveX=x;this.input.moveY=y});
    bindStick('steerStick','steerKnob',x=>{this.input.steer=x});
    // Camera drag begins on ANY free screen area. Only actual controls are excluded.
    const blocked=e=>!!e.target?.closest?.('button,.stick,.minimap,#speedPanel,#damageWrap');
    document.addEventListener('pointerdown',e=>{
      if(blocked(e)|| (e.pointerType==='mouse'&&e.button!==0))return;
      this.cameraState.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    },{passive:true});
    document.addEventListener('pointermove',e=>{
      const p=this.cameraState.pointers.get(e.pointerId);if(!p)return;
      const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
      this.cameraState.yaw+=dx*.0062;
      this.cameraState.pitch=THREE.MathUtils.clamp(this.cameraState.pitch+dy*.0048,-.62,.92);
    },{passive:true});
    const end=e=>this.cameraState.pointers.delete(e.pointerId);
    document.addEventListener('pointerup',end);document.addEventListener('pointercancel',end);
  }
  bindButtons(){
    const hold=(id,key)=>{const el=document.getElementById(id);const down=e=>{e.preventDefault();this.input[key]=true},up=()=>this.input[key]=false;
      el.addEventListener('pointerdown',down);['pointerup','pointercancel','pointerleave','lostpointercapture'].forEach(ev=>el.addEventListener(ev,up));};
    hold('runBtn','run');hold('gasBtn','gas');hold('reverseBtn','reverse');
    this.ui.cameraBtn.onclick=()=>this.setFirstPerson(!this.cameraState.first);
    document.getElementById('enterBtn').onclick=()=>this.toggleCar();
    document.getElementById('exitBtn').onclick=()=>this.toggleCar();
  }
  setFirstPerson(v){this.cameraState.first=!!v;this.ui.cameraBtn.textContent='КАМЕРА: '+(v?'1 ЛИЦО':'3 ЛИЦО')}
  toggleCar(){
    if(this.inCar){
      this.inCar=false;this.player.visible=true;
      const side=new THREE.Vector3(1.8,0,0).applyAxisAngle(new THREE.Vector3(0,1,0),this.car.rotation.y);
      this.player.position.copy(this.car.position).add(side);this.player.position.y=0;this.player.rotation.y=this.car.rotation.y;
      this.velocity.set(0,0,0);this.ui.walkControls.classList.remove('hidden');this.ui.carControls.classList.add('hidden');
      this.ui.speedPanel.classList.add('hidden');this.ui.damageWrap.classList.add('hidden');this.toast('Ты вышел из автомобиля');
    }else if(this.player.position.distanceTo(this.car.position)<5){
      this.inCar=true;this.player.visible=false;this.ui.walkControls.classList.add('hidden');this.ui.carControls.classList.remove('hidden');
      this.ui.speedPanel.classList.remove('hidden');this.ui.damageWrap.classList.remove('hidden');this.toast('Ты за рулём');
    }else this.toast('Подойди ближе к машине');
    this.onEnterExit?.(this.inCar);
  }
  update(dt,{inside=false,insideFacility=null}={}){
    this.updateResidents(dt);
    if(!inside){if(this.inCar)this.updateVehicle(dt);else this.updateCharacter(dt)}
    else this.velocity.set(0,0,0);
    this.updateCat(dt,inside);this.updateCamera(dt,{inside});this.drawMap();
  }
  updateCharacter(dt){
    const yaw=this.cameraState.yaw;
    const forward=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
    const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
    // Positive joystick X is screen-right and must move the character screen-right.
    const desired=right.multiplyScalar(this.input.moveX).add(forward.multiplyScalar(this.input.moveY));
    const active=desired.lengthSq()>.018;
    if(active){
      desired.normalize();const targetYaw=Math.atan2(desired.x,desired.z);
      const delta=THREE.MathUtils.euclideanModulo(targetYaw-this.player.rotation.y+Math.PI,Math.PI*2)-Math.PI;
      this.player.rotation.y+=delta*(1-Math.exp(-14*dt));
    }
    const max=this.input.run?7.2:4.25,target=active?desired.multiplyScalar(max):new THREE.Vector3();
    const accel=active?13.5:9.5;this.velocity.lerp(target,1-Math.exp(-accel*dt));
    const old=this.player.position.clone();this.player.position.addScaledVector(this.velocity,dt);
    const hit=this.obstacles.some(o=>Math.abs(this.player.position.x-o.x)<o.rx+.48&&Math.abs(this.player.position.z-o.z)<o.rz+.48);
    if(hit){this.player.position.copy(old);this.velocity.multiplyScalar(.08)}
    this.player.position.x=THREE.MathUtils.clamp(this.player.position.x,-94,94);
    this.player.position.z=THREE.MathUtils.clamp(this.player.position.z,-136,136);
    const stride=Math.min(1,this.velocity.length()/4.1);this.walkPhase+=dt*(this.input.run?12.5:9)*stride;
    this.playerLegPivots.forEach((p,i)=>p.rotation.x=Math.sin(this.walkPhase+i*Math.PI)*.58*stride);
    this.playerArmPivots.forEach((p,i)=>p.rotation.x=-Math.sin(this.walkPhase+i*Math.PI)*.43*stride);
    this.player.position.y=Math.abs(Math.sin(this.walkPhase*2))*.035*stride;
  }
  updateVehicle(dt){
    const old=this.car.position.clone(),speedBefore=Math.abs(this.speed),steer=this.input.steer;
    const throttle=this.input.gas&&!this.input.reverse?1:0,brake=this.input.reverse?1:0;
    if(throttle)this.speed+=21*dt;
    if(brake){if(this.speed>1.2)this.speed=Math.max(0,this.speed-34*dt);else this.speed-=12*dt;}
    if(!throttle&&!brake)this.speed*=Math.exp(-.34*dt);
    const grip=THREE.MathUtils.clamp(1-this.damage/150,.35,1);
    this.speed*=Math.exp(-(.025+(1-grip)*.1)*dt);
    this.speed=THREE.MathUtils.clamp(this.speed,-13,this.MAX_SPEED);
    const sf=THREE.MathUtils.clamp(Math.abs(this.speed)/8,0,1);
    const yawRate=(.22+sf*.78)*steer*sf*(this.speed<0?-1:1)*grip;
    this.car.rotation.y+=yawRate*dt;
    const fwd=new THREE.Vector3(Math.sin(this.car.rotation.y),0,Math.cos(this.car.rotation.y));
    const right=new THREE.Vector3(fwd.z,0,-fwd.x);
    const lateralTarget=steer*Math.abs(this.speed)*.075;
    this.lateral=THREE.MathUtils.damp(this.lateral,lateralTarget,grip>0.7?3.8:2.2,dt);
    this.car.position.addScaledVector(fwd,this.speed*dt);
    this.car.position.addScaledVector(right,this.lateral*dt);
    let hit=Math.abs(this.car.position.x)>88||Math.abs(this.car.position.z)>130;
    if(!hit)hit=this.obstacles.some(o=>Math.abs(this.car.position.x-o.x)<o.rx+1.4&&Math.abs(this.car.position.z-o.z)<o.rz+2.15);
    if(hit){
      this.car.position.copy(old);
      if(this.collisionCooldown<=0&&speedBefore>2){this.damage=Math.min(100,this.damage+Math.max(4,speedBefore*.82));this.collisionCooldown=.7;this.toast('Столкновение — повреждение автомобиля')}
      this.speed=-Math.sign(this.speed||1)*Math.min(speedBefore*.16,5);this.lateral*=-.25;
    }
    this.collisionCooldown=Math.max(0,this.collisionCooldown-dt);
    for(const n of this.npcs){
      if(this.car.position.distanceTo(n.g.position)<2.25&&Math.abs(this.speed)>3){
        this.speed*=.94;n.knock=Math.max(n.knock,.7);
        const away=n.g.position.clone().sub(this.car.position).normalize();
        n.g.userData.vx=away.x*2.6;n.g.userData.vz=away.z*2.6;
      }
    }
    this.wheels.forEach((w,i)=>{w.rotation.x+=this.speed*dt*2.15;if(i<2)w.rotation.y=steer*.25});
    const wear=this.damage/100;
    this.carPaint.color.setRGB(1-wear*.2,1-wear*.18,1-wear*.15);this.carPaint.roughness=.24+wear*.48;
    this.bumpers[0].position.z=2.28+wear*.2;this.bumpers[1].position.z=-2.28-wear*.15;
    this.bumpers[0].rotation.x=-wear*.1;this.bumpers[1].rotation.x=wear*.08;
    this.cracks.visible=this.damage>28;this.smoke.visible=this.damage>58;
    this.ui.speedValue.textContent=Math.round(Math.abs(this.speed)*3.6);
    this.ui.gear.textContent=this.speed<-.4?'R':Math.abs(this.speed)<.4?'N':'D';
    this.ui.damageBar.style.width=(100-this.damage)+'%';
    this.ui.damageBar.style.background=this.damage>65?'#c85c50':this.damage>30?'#d6a34d':'#75c995';
    this.car.position.y=.018*Math.sin(performance.now()*.014)*sf;
  }
  updateResidents(dt){
    for(const n of this.npcs){
      if(n.knock>0){n.knock-=dt;n.g.position.x+=(n.g.userData.vx||0)*dt;n.g.position.z+=(n.g.userData.vz||0)*dt;
        n.g.userData.vx=(n.g.userData.vx||0)*Math.exp(-5*dt);n.g.userData.vz=(n.g.userData.vz||0)*Math.exp(-5*dt);
        n.g.rotation.z=Math.sin((.8-n.knock)*7)*.45;
      }else{
        n.g.rotation.z=THREE.MathUtils.damp(n.g.rotation.z,0,6,dt);n.phase+=dt*.42;
        n.g.position.x=THREE.MathUtils.damp(n.g.position.x,n.home.x+Math.sin(n.phase)*2.6,1.8,dt);
        n.g.position.z=THREE.MathUtils.damp(n.g.position.z,n.home.z+Math.cos(n.phase*.7)*2.3,1.8,dt);
        n.g.rotation.y=Math.sin(n.phase)*.4;
        if(n.legs)n.legs.forEach((leg,i)=>leg.rotation.x=Math.sin(n.phase*3+i*Math.PI)*.22);
      }
    }
  }
  updateCat(dt,inside){
    if(inside)return;
    const target=this.inCar?this.car.position:this.player.position;
    const rot=this.inCar?this.car.rotation.y:this.player.rotation.y;
    const behind=new THREE.Vector3(-Math.sin(rot),0,-Math.cos(rot));
    const desired=target.clone().addScaledVector(behind,1.9).add(new THREE.Vector3(.65,0,0));
    const dist=this.cat.position.distanceTo(desired);
    if(dist>1.05){const dir=desired.sub(this.cat.position).normalize();this.catVelocity.lerp(dir.multiplyScalar(dist>5?5.4:2.9),1-Math.exp(-3.8*dt));this.cat.position.addScaledVector(this.catVelocity,dt)}
    else this.catVelocity.multiplyScalar(Math.exp(-5.5*dt));
    const vel=this.catVelocity.length();this.cat.position.y=.018+Math.abs(Math.sin(performance.now()*.012))*Math.min(.04,vel*.008);
    if(vel>.25)this.cat.rotation.y=Math.atan2(this.catVelocity.x,this.catVelocity.z);
    this.catPhase+=dt*vel*2.5;
    if(this.cat.userData.tail)this.cat.userData.tail.rotation.x=Math.sin(performance.now()*.002)*.12;
  }
  updateCamera(dt,{inside}){
    const target=this.inCar?this.car.position:this.player.position,c=this.cameraState;
    const lookTarget=target.clone().add(new THREE.Vector3(0,this.inCar?1.25:1.42,0));
    let desired,look;
    const dir=new THREE.Vector3(Math.sin(c.yaw)*Math.cos(c.pitch),Math.sin(c.pitch),Math.cos(c.yaw)*Math.cos(c.pitch));
    if(inside){desired=target.clone().add(new THREE.Vector3(Math.sin(c.yaw)*5,3,-Math.cos(c.yaw)*5));look=lookTarget.clone().add(dir.multiplyScalar(5))}
    else if(c.first&&this.inCar){desired=this.car.localToWorld(new THREE.Vector3(0,1.58,.42));const d=dir.clone().applyAxisAngle(new THREE.Vector3(0,1,0),this.car.rotation.y);look=desired.clone().add(d.multiplyScalar(22))}
    else if(c.first){desired=lookTarget.clone().add(new THREE.Vector3(0,.28,0));look=desired.clone().add(dir.multiplyScalar(9))}
    else{
      const dist=this.inCar?9.4:7.4,height=this.inCar?3.9:3.25;
      desired=target.clone().add(new THREE.Vector3(Math.sin(c.yaw)*dist*Math.cos(c.pitch),height+Math.sin(c.pitch)*dist,-Math.cos(c.yaw)*dist*Math.cos(c.pitch)));
      look=lookTarget;
    }
    const smoothing=1-Math.exp(-(c.first&&this.inCar?18:9.5)*dt);
    if(!this.cameraReady){this.camera.position.copy(desired);this.cameraReady=true}else this.camera.position.lerp(desired,smoothing);
    this.camera.lookAt(look);
  }
  drawMap(){
    const ctx=this.mapCtx,w=this.mapCanvas.width,h=this.mapCanvas.height;
    ctx.clearRect(0,0,w,h);ctx.fillStyle='#142b25';ctx.fillRect(0,0,w,h);
    ctx.save();ctx.beginPath();ctx.roundRect(4,4,w-8,h-8,15);ctx.clip();
    const sx=x=>w/2+x*.91,sy=z=>h/2+z*.66;
    ctx.fillStyle='#385b3d';ctx.fillRect(4,4,w-8,h-8);
    // Fields / blocks
    ctx.fillStyle='#54734a';for(let x=-85;x<=85;x+=22)for(let z=-120;z<=120;z+=30)ctx.fillRect(sx(x)-8,sy(z)-8,16,16);
    // Main asphalt network with shoulders and lane markings
    const roads=[
      [[0,-140],[0,140]], [[-100,-22],[100,-22]],[[-100,36],[100,36]],
      [[-47,-125],[-47,125]],[[47,-125],[47,125]],
      [[-85,-102],[-47,-102]],[[47,-102],[85,-102]],[[-80,103],[-47,103]],[[47,103],[80,103]]
    ];
    for(const [[x1,z1],[x2,z2]] of roads){ctx.strokeStyle='#aeb5a8';ctx.lineWidth=15;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(sx(x1),sy(z1));ctx.lineTo(sx(x2),sy(z2));ctx.stroke();
      ctx.strokeStyle='#46504a';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(sx(x1),sy(z1));ctx.lineTo(sx(x2),sy(z2));ctx.stroke()}
    ctx.strokeStyle='#d8cfaa';ctx.lineWidth=1.5;ctx.setLineDash([5,7]);ctx.beginPath();ctx.moveTo(sx(0),sy(-135));ctx.lineTo(sx(0),sy(135));ctx.stroke();ctx.setLineDash([]);
    // Homes and facility plots
    ctx.fillStyle='#b5a47a';for(const [x,z] of [[-24,-95],[-24,-65],[-24,-35],[-24,5],[-24,65],[-24,95],[24,-90],[24,-55],[24,-20],[24,20],[24,58],[24,95],[-70,-55],[-70,0],[-70,55],[70,-55],[70,0],[70,55]])ctx.fillRect(sx(x)-5,sy(z)-4,10,8);
    for(const p of this.landmarks){const x=sx(p.x),y=sy(p.z);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#101b19';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#101b19';ctx.font='bold 11px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.label,x,y)}
    const obj=this.inCar?this.car:this.player,x=sx(obj.position.x),y=sy(obj.position.z);
    ctx.save();ctx.translate(x,y);ctx.rotate(-obj.rotation.y);ctx.fillStyle=this.inCar?'#f5f7f1':'#fff16a';ctx.strokeStyle='#111';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-13);ctx.lineTo(9,9);ctx.lineTo(0,5);ctx.lineTo(-9,9);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
    const catX=sx(this.cat.position.x),catY=sy(this.cat.position.z);ctx.fillStyle='#d5dadd';ctx.beginPath();ctx.arc(catX,catY,3.5,0,Math.PI*2);ctx.fill();
    ctx.restore();ctx.strokeStyle='#dce7dd';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(2,2,w-4,h-4,16);ctx.stroke();
    ctx.fillStyle='rgba(5,14,16,.78)';ctx.fillRect(8,8,78,19);ctx.fillStyle='#fff';ctx.font='bold 11px Arial';ctx.textAlign='left';ctx.fillText('VILLAGE MAP',13,22);
  }
}
