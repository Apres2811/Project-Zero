const c=document.getElementById('game'),x=c.getContext('2d');
let W,H,px=0,py=0,ang=0,ammo=30,reserve=120,kills=0,round=1,reloading=false;
let keys={}, targets=[];
function resize(){W=c.width=innerWidth*devicePixelRatio;H=c.height=innerHeight*devicePixelRatio;x.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);W=innerWidth;H=innerHeight}
addEventListener('resize',resize);resize();
for(let i=0;i<9;i++)targets.push({x:-900+Math.random()*1800,y:-700+Math.random()*1400,alive:true});

addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=1;if(e.key.toLowerCase()==='r')reload();if(e.key==='1'){}});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=0);
c.addEventListener('mousemove',e=>{if(document.pointerLockElement===c)ang+=e.movementX*.002});
c.addEventListener('click',()=>c.requestPointerLock?.());
document.getElementById('fire').onpointerdown=shoot;
document.getElementById('reload').onpointerdown=reload;

function reload(){
 if(reloading||ammo===30||reserve<=0)return;
 reloading=true;document.getElementById('message').textContent='RELOADING';
 setTimeout(()=>{let n=Math.min(30-ammo,reserve);ammo+=n;reserve-=n;reloading=false;document.getElementById('message').textContent=''},800)
}
function shoot(){
 if(reloading||ammo<=0){if(ammo<=0)reload();return}
 ammo--;
 let best=null,bd=999;
 for(const t of targets)if(t.alive){
   let dx=t.x-px,dy=t.y-py,d=Math.hypot(dx,dy),a=Math.atan2(dy,dx)-ang;
   a=Math.atan2(Math.sin(a),Math.cos(a));
   if(Math.abs(a)<.045 && d<1300 && d<bd){best=t;bd=d}
 }
 if(best){best.alive=false;kills++; if(targets.every(t=>!t.alive))newRound()}
 updateHud();
}
function newRound(){round++;targets.forEach(t=>{t.alive=true;t.x=-900+Math.random()*1800;t.y=-700+Math.random()*1400});}
function updateHud(){document.getElementById('ammo').textContent=`${ammo} / ${reserve}`;document.getElementById('score').textContent=`ROUND ${String(round).padStart(2,'0')} • ${kills} KILLS`}
function move(dt){
 let vx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);
 let vy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
 let l=Math.hypot(vx,vy)||1,sp=(keys.shift?260:180)*dt;
 px+=(vx/l*Math.cos(ang)+vy/l*Math.sin(ang))*sp;
 py+=(vx/l*-Math.sin(ang)+vy/l*Math.cos(ang))*sp;
}
function draw(){
 x.clearRect(0,0,W,H);
 let g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0d1722');g.addColorStop(.55,'#26333b');g.addColorStop(.56,'#171b1d');g.addColorStop(1,'#090b0d');x.fillStyle=g;x.fillRect(0,0,W,H);
 // ground grid
 x.strokeStyle='#ffffff10';x.lineWidth=1;
 for(let i=-10;i<=10;i++){let yy=H*.56+i*i*3;x.beginPath();x.moveTo(0,yy);x.lineTo(W,yy);x.stroke()}
 for(const t of targets)if(t.alive){
   let dx=t.x-px,dy=t.y-py,d=Math.hypot(dx,dy),a=Math.atan2(dy,dx)-ang;a=Math.atan2(Math.sin(a),Math.cos(a));
   if(Math.abs(a)<1.1&&d<1600){
    let sx=W/2+Math.tan(a)*W*.72, size=Math.max(14,900/d*80);
    if(sx>-100&&sx<W+100){x.fillStyle='#d7d7d7';x.fillRect(sx-size/2,H*.53-size,size,size*1.7);x.fillStyle='#b42a32';x.beginPath();x.arc(sx,H*.53-size*.25,size*.34,0,7);x.fill()}
   }
 }
 // weapon silhouette
 x.fillStyle='#111';x.fillRect(W*.43,H*.82,W*.24,H*.18);x.fillStyle='#343a40';x.fillRect(W*.48,H*.76,W*.18,H*.12);
}
let last=performance.now();
function loop(now){let dt=Math.min(.03,(now-last)/1000);last=now;move(dt);draw();updateHud();requestAnimationFrame(loop)}
loop(last);

// Touch sticks
function stick(id,onMove){
 const el=document.getElementById(id), knob=el.querySelector('i');let active=false,sx=0,sy=0;
 el.addEventListener('pointerdown',e=>{active=true;sx=e.clientX;sy=e.clientY;el.setPointerCapture(e.pointerId)});
 el.addEventListener('pointermove',e=>{if(!active)return;let dx=e.clientX-sx,dy=e.clientY-sy,m=Math.min(42,Math.hypot(dx,dy)),a=Math.atan2(dy,dx);dx=Math.cos(a)*m;dy=Math.sin(a)*m;knob.style.transform=`translate(${dx}px,${dy}px)`;onMove(dx/42,dy/42)});
 el.addEventListener('pointerup',()=>{active=false;knob.style.transform='';onMove(0,0)});
}
stick('stickL',(vx,vy)=>{keys.w=vy<-.2;keys.s=vy>.2;keys.a=vx<-.2;keys.d=vx>.2});
stick('stickR',(vx,vy)=>{ang+=vx*.055});
