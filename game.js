import * as THREE from 'three';

const canvas=document.querySelector('#scene');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.12;

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x9dbdce);
scene.fog=new THREE.FogExp2(0x9dbdce,.0027);
const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,900);
camera.position.set(9,7,32);
scene.add(new THREE.HemisphereLight(0xd9efff,0x625744,2.0));
const sun=new THREE.DirectionalLight(0xffe2b8,3.1);
sun.position.set(-45,65,28);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-90,right:90,top:90,bottom:-90,near:1,far:220});
sun.shadow.bias=-.00015;scene.add(sun);

const mat=(color,roughness=.78,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const M={
 grass:mat(0x657d58),soil:mat(0x625b4b),ballast:mat(0x62615c),sleeper:mat(0x453d34),
 rail:mat(0x8a9297,.24,.9),steel:mat(0x303b42,.35,.8),red:mat(0xb62620,.48,.25),
 cream:mat(0xe8dfc9,.58,.12),yellow:mat(0xf5c54f,.4,.2),dark:mat(0x17232b,.48,.55),
 glass:new THREE.MeshPhysicalMaterial({color:0x17394a,roughness:.12,metalness:.28,transparent:true,opacity:.88}),
 rubber:mat(0x17191b,.86),white:mat(0xe8e8dc),green:mat(0x176c45),concrete:mat(0xaaa99f)
};
function box(p,w,h,d,m,x,y,z){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o}
function cyl(p,r1,r2,len,m,x,y,z,rx=0,ry=0,rz=0,seg=20){const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,len,seg),m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.castShadow=true;p.add(o);return o}
function line(p,a,b,r,m){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A);const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),8),m);o.position.copy(A.add(B).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());o.castShadow=true;p.add(o);return o}
const ground=new THREE.Mesh(new THREE.PlaneGeometry(900,900),M.grass);ground.rotation.x=-Math.PI/2;ground.position.y=-.32;ground.receiveShadow=true;scene.add(ground);

// Detailed double-track railway yard
function buildTrack(x,zStart,zEnd){
 const len=zStart-zEnd,mid=(zStart+zEnd)/2;
 box(scene,4.7,.32,len,M.ballast,x,.02,mid);
 for(let z=zStart;z>zEnd;z-=.68){
  const s=box(scene,3.15,.16,.27,M.sleeper,x,.22,z);
  s.rotation.y=(Math.sin(z*2)*.012);
 }
 for(const dx of [-.78,.78]){
  box(scene,.14,.23,len,M.rail,x+dx,.40,mid);
  box(scene,.23,.035,len,M.steel,x+dx,.51,mid);
 }
}
buildTrack(0,220,-900);buildTrack(7,220,-900);
// Indian Railways overhead electrification: masts, cantilevers and contact wires
for(let z=185;z>-850;z-=32){
 for(const x of [-4.4,11.4]){
  cyl(scene,.12,.12,8.8,M.steel,x,4.4,z,0,0,0,12);
  line(scene,[x,7.8,z],[x+(x<0?2.1:-2.1),7.8,z],.055,M.steel);
  line(scene,[x+(x<0?2.1:-2.1),7.8,z],[0,6.5,z],.035,M.yellow);
 }
}
line(scene,[-2.3,6.5,185],[-2.3,6.5,-870],.035,M.steel);
line(scene,[2.3,6.5,185],[2.3,6.5,-870],.035,M.steel);
for(let z=200;z>-500;z-=35){
 for(let side of [-1,1]){
  const x=side*(10+Math.random()*24);
  // low bushes
  const bush=new THREE.Mesh(new THREE.SphereGeometry(.7+Math.random()*.8,9,7),mat(0x365a3b));
  bush.position.set(x,.5,z-Math.random()*18);bush.scale.y=.7;bush.castShadow=true;scene.add(bush);
 }
}
function tree(x,z,s=1){
 const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
 cyl(g,.18*s,.25*s,2.1*s,mat(0x684b32),0,1.05*s,0);
 for(let i=0;i<5;i++){const crown=new THREE.Mesh(new THREE.SphereGeometry((1.05-i*.1)*s,12,10),mat(i%2?0x315d3c:0x477344));crown.position.set(Math.sin(i*3)*.2*s,(2+i*.43)*s,Math.cos(i*2)*.2*s);crown.castShadow=true;g.add(crown)}
}
for(let i=0;i<60;i++)tree((Math.random()<.5?-1:1)*(18+Math.random()*60),180-Math.random()*650,.7+Math.random()*.9);

// Platform with tactile edge, canopy, columns and station sign
box(scene,5.8,.42,78,M.concrete,-4,.08,-48);
box(scene,5.8,.12,78,mat(0xd8c9a5),-4,.35,-48);
box(scene,.18,.13,78,M.yellow,-6.72,.45,-48);
box(scene,5.6,.2,78,mat(0x7a7770),-4,4.65,-48);
for(const z of [-14,-29,-44,-59,-74,-89]){
 cyl(scene,.12,.12,4.2,M.white,-6.2,2.35,z,0,0,0,12);
}
for(let z=-15;z>-90;z-=15)box(scene,5.5,.16,.2,M.dark,-4,2.6,z);
const sign=box(scene,4,.9,.16,M.green,-4,4.05,-12);
box(scene,3.8,.08,.05,M.yellow,-4,3.72,-11.9);
function textBoard(text,x,y,z){
 const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');
 ctx.fillStyle='#155b3e';ctx.fillRect(0,0,512,128);ctx.strokeStyle='#f5d36b';ctx.lineWidth=8;ctx.strokeRect(5,5,502,118);
 ctx.fillStyle='#fff4d5';ctx.font='bold 58px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,64);
 const tex=new THREE.CanvasTexture(c);const m=new THREE.Mesh(new THREE.PlaneGeometry(4.2,1.05),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));
 m.position.set(x,y,z);scene.add(m);
}
textBoard('CHENNAI CENTRAL',-4,4.08,-11.88);
for(let i=0;i<12;i++){
 const z=-105-i*11;const w=4+Math.random()*5,h=5+Math.random()*12;
 const b=box(scene,w,h,5,mat([0xb7a58f,0xc2b9a7,0x9d9a8c][i%3]),-38-Math.random()*25,h/2,z);
 for(let yy=1.5;yy<h-1;yy+=2.1)for(let xx=-w/2+.8;xx<w/2-.4;xx+=1.5)box(b,.48,.72,.06,M.glass,xx,yy,2.54);
}
// Signal gantry and signal aspects
const signalLamps=[];
function signal(x,z){
 const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
 cyl(g,.09,.09,6,M.steel,0,3,0);
 box(g,.85,1.8,.42,M.dark,0,5.25,0);
 for(let i=0;i<3;i++){const lamp=new THREE.Mesh(new THREE.SphereGeometry(.19,16,12),mat(i===0?0x23b85b:i===1?0xe9bd36:0xc72d28,.25));lamp.position.set(0,5.78-i*.53,.24);g.add(lamp);if(i===0)signalLamps.push(lamp)}
 box(g,1.1,.1,.6,M.yellow,0,6.2,0);
}
signal(3,-42);signal(3,-112);signal(10,-165);

// Detailed WAP-7-inspired electric locomotive, built as a visual game model
const wheelMeshes=[],pantographGroups=[],cabDoors=[],headlampLights=[];
const engineCatalog={
 WAP7:{name:'WAP-7',type:'Electric passenger',service:'Express / Mail',maxSpeed:140,accel:.72,tractiveEffort:275,power:'6,350 kW',mass:123,body:0xf0eadc,stripe:0xb62b26,electric:true,horn:[370,465],idle:48},
 WAP5:{name:'WAP-5',type:'Electric passenger',service:'High-speed express',maxSpeed:160,accel:.88,tractiveEffort:220,power:'5,400 kW',mass:100,body:0xe8e4d6,stripe:0x245b8d,electric:true,horn:[392,494],idle:58},
 WAG9:{name:'WAG-9',type:'Electric freight',service:'Heavy freight',maxSpeed:100,accel:.48,tractiveEffort:300,power:'6,120 kW',mass:123,body:0xd9d6c7,stripe:0x286b4a,electric:true,horn:[330,415],idle:42},
 WAG12:{name:'WAG-12',type:'Electric freight',service:'Ultra-heavy freight',maxSpeed:120,accel:.58,tractiveEffort:500,power:'12,000 kW',mass:240,body:0xe2ded0,stripe:0x1e6547,electric:true,horn:[294,370],idle:40},
 WDP4:{name:'WDP-4',type:'Diesel passenger',service:'Passenger express',maxSpeed:120,accel:.56,tractiveEffort:260,power:'4,000 hp',mass:120,body:0x183f73,stripe:0xf0c33e,electric:false,horn:[349,440],idle:34},
 WDM2:{name:'WDM-2',type:'Diesel mixed traffic',service:'Classic mixed traffic',maxSpeed:100,accel:.42,tractiveEffort:220,power:'2,600 hp',mass:112,body:0x1b6a45,stripe:0xf0c33e,electric:false,horn:[311,392],idle:29},
 WDM3A:{name:'WDM-3A',type:'Diesel mixed traffic',service:'Mixed traffic',maxSpeed:120,accel:.49,tractiveEffort:240,power:'3,100 hp',mass:112,body:0x245d9a,stripe:0xf0c33e,electric:false,horn:[330,415],idle:32}
};
let selectedEngine='WAP7',engineSpec=engineCatalog[selectedEngine];
function makeBogie(parent,z){
 const b=new THREE.Group();b.position.z=z;parent.add(b);
 box(b,2.65,.34,2.5,M.steel,0,.68,0);
 for(const wz of [-.82,0,.82]){
  for(const side of [-1,1]){
   const w=cyl(b,.53,.53,.24,M.rubber,side*1.48,.58,wz,0,0,Math.PI/2,28);
   const hub=cyl(b,.25,.25,.255,M.rail,side*1.48,.58,wz,0,0,Math.PI/2,20);
   const cap=cyl(b,.12,.12,.27,M.yellow,side*1.48,.58,wz,0,0,Math.PI/2,16);
   wheelMeshes.push(w,hub,cap);
  }
 }
 for(const x of [-1.35,1.35])line(b,[x,.85,-.95],[x,.85,.95],.07,M.yellow);
 return b;
}
function makeLoco(spec=engineSpec){
 const g=new THREE.Group();
 const bodyMat=mat(spec.body,.58,.12),stripeMat=mat(spec.stripe,.42,.2);
 const shell=new THREE.Shape();
 shell.moveTo(-1.42,-.68);shell.lineTo(1.42,-.68);shell.quadraticCurveTo(1.57,-.68,1.57,-.52);shell.lineTo(1.57,.52);shell.quadraticCurveTo(1.57,.68,1.42,.68);shell.lineTo(-1.42,.68);shell.quadraticCurveTo(-1.57,.68,-1.57,.52);shell.lineTo(-1.57,-.52);shell.quadraticCurveTo(-1.57,-.68,-1.42,-.68);
 const shellGeo=new THREE.ExtrudeGeometry(shell,{depth:8.9,steps:1,bevelEnabled:true,bevelSegments:3,bevelSize:.075,bevelThickness:.07,curveSegments:8});
 const shellMesh=new THREE.Mesh(shellGeo,bodyMat);shellMesh.position.set(0,1.72,-4.6);shellMesh.castShadow=true;shellMesh.receiveShadow=true;g.add(shellMesh);
 box(g,3.2,.2,9.5,M.dark,0,1.02,-.15);box(g,3.16,.18,9.5,stripeMat,0,1.22,-.15);
 for(const end of [-1,1]){
  // Sloped locomotive cab nose: tapered lower pilot and angled windscreen face.
  const verts=[
   -1.48,1.02,end*3.55, 1.48,1.02,end*3.55, 1.48,2.62,end*3.55, -1.48,2.62,end*3.55,
   -1.40,1.02,end*4.82, 1.40,1.02,end*4.82, 1.22,2.62,end*4.43, -1.22,2.62,end*4.43
  ];
  const faces=[0,1,2,0,2,3,4,6,5,4,7,6,0,4,5,0,5,1,1,5,6,1,6,2,2,6,7,2,7,3,3,7,4,3,4,0];
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(faces);geo.computeVertexNormals();
  const nose=new THREE.Mesh(geo,bodyMat);nose.castShadow=true;nose.receiveShadow=true;g.add(nose);
  // Twin angled windscreens, rubber surrounds, wipers and cab destination panel.
  for(const x of [-.57,.57]){
   const frame=box(g,.98,.80,.045,M.dark,x,2.78,end*4.46);frame.rotation.x=end*.27;
   const glassPane=box(g,.86,.68,.055,M.glass,x,2.78,end*4.49);glassPane.rotation.x=end*.27;
   const wiper=line(g,[x-.28,2.52,end*4.52],[x+.28,2.58,end*4.52],.022,M.dark);
  }
  box(g,1.12,.22,.08,M.dark,0,2.08,end*4.87);
  box(g,.78,.12,.10,stripeMat,0,2.08,end*4.93);
  // Low pilot panel, buffers, central coupler and marker lamps.
  box(g,2.55,.30,.16,M.dark,0,1.02,end*4.91);
  for(const x of [-1.05,1.05]){
   cyl(g,.19,.19,.24,M.steel,x,1.46,end*4.9,Math.PI/2,0,0,28);
   cyl(g,.13,.13,.26,M.steel_light,x,1.46,end*5.02,Math.PI/2,0,0,28);
   cyl(g,.105,.105,.10,M.white,x,2.04,end*4.91,Math.PI/2,0,0,24);
   cyl(g,.065,.065,.11,M.yellow,x,2.04,end*4.98,Math.PI/2,0,0,20);
  }
  cyl(g,.12,.12,.42,M.dark,0,1.25,end*5.03,Math.PI/2,0,0,20);
  box(g,.34,.22,.22,M.steel,0,.88,end*4.98);
  for(const x of [-1.28,1.28])box(g,.12,.38,.12,M.dark,x,2.05,end*4.45);
 }
 g.userData.cabDoors=[];
 for(const side of [-1,1]){
  for(let z=-3.55;z<=3.35;z+=1.02){box(g,.055,.72,.78,M.glass,side*1.61,2.15,z);box(g,.07,.055,.84,M.dark,side*1.64,2.15,z)}
  box(g,.055,.13,7.2,stripeMat,side*1.63,1.38,0);box(g,.06,.11,7.2,M.dark,side*1.64,1.23,0);
  const door=new THREE.Group();door.position.set(side*1.60,1.98,-3.35);g.add(door);box(door,.065,1.28,.76,bodyMat,side*.025,0,.36);box(door,.075,.48,.48,M.glass,side*.055,.27,.36);box(door,.09,.07,.08,M.steel,side*.07,-.08,.63);g.userData.cabDoors.push({mesh:door,side,open:false});
 }
 box(g,2.3,.24,6.2,M.steel,0,3.0,-.15);
 if(spec.electric){g.userData.pantographs=[];for(const z of [-2.2,2.0]){box(g,1.25,.28,1.15,mat(0x9ba5a8),0,3.26,z);for(const x of [-.7,.7])cyl(g,.1,.13,.34,M.white,x,3.43,z);const p=new THREE.Group();p.position.set(0,3.62,z);g.add(p);line(p,[-.72,0,-.35],[0,.95,0],.05,M.steel);line(p,[0,.95,0],[.72,0,.35],.05,M.steel);line(p,[-.72,0,-.35],[.72,0,.35],.045,M.steel);line(p,[-.82,.98,-.4],[.82,.98,.4],.045,M.yellow);const top=new THREE.Group();top.position.set(0,.95,0);p.add(top);line(top,[-.82,0,-.4],[0,.28,0],.045,M.yellow);line(top,[0,.28,0],[.82,0,.4],.045,M.yellow);line(top,[-.9,.3,-.44],[.9,.3,.44],.05,M.yellow);p.userData.baseY=0;g.userData.pantographs.push(p)}}else{for(const z of [-3.2,-1.2,1.2,3.2]){cyl(g,.32,.32,.18,M.dark,0,3.18,z,Math.PI/2);cyl(g,.2,.2,.2,M.steel,0,3.2,z,Math.PI/2)}box(g,.5,.48,.55,M.dark,0,3.38,2.5);box(g,.5,.48,.55,M.dark,0,3.38,-2.5)}
 makeBogie(g,-2.75);makeBogie(g,2.75);
 // Real locomotive running gear: suspension coils, axle boxes, brake discs and underframe equipment.
 const springMat=mat(0x777f82,.42,.82),pipeMat=mat(0x343b40,.34,.82);
 for(const bz of [-2.75,2.75]){
  for(const side of [-1,1]){
   for(const wz of [-.82,.82]){
    const x=side*1.48;
    cyl(g,.19,.19,.28,M.steel,x,.98,bz+wz,Math.PI/2,0,0,20);
    cyl(g,.115,.115,.31,M.yellow,x,1.0,bz+wz,Math.PI/2,0,0,16);
    for(let k=0;k<5;k++){const a=k*Math.PI*2/5;const coil=new THREE.Mesh(new THREE.TorusGeometry(.16,.025,6,16),springMat);coil.position.set(x+Math.cos(a)*.035,1.18+k*.075,bz+wz);coil.rotation.x=Math.PI/2;g.add(coil)}
   }
   for(const z of [bz-.95,bz+.95]){line(g,[side*1.35,1.0,z],[side*1.35,1.48,z],.055,M.steel);line(g,[side*1.35,1.48,z],[side*1.35,1.48,z+.32],.055,M.steel)}
   // Side access steps and grab rails.
   for(const z of [-3.4,-2.9,2.9,3.4]){box(g,.34,.09,.48,M.steel,side*1.72,.78,z);box(g,.28,.07,.4,M.yellow,side*1.72,.88,z)}
   line(g,[side*1.69,1.05,-3.9],[side*1.69,2.18,-3.9],.035,M.steel);
   line(g,[side*1.69,2.18,-3.9],[side*1.69,2.18,-3.25],.035,M.steel);
   // Recessed radiator grille frames and individual vertical louvers.
   for(let z=-1.9;z<1.65;z+=.18){box(g,.035,.48,.035,M.dark,side*1.665,1.91,z);box(g,.045,.035,.045,M.steel,side*1.69,1.91,z)}
   // Fuel / equipment cabinet doors and hinges.
   box(g,.035,.78,.92,M.steel,side*1.665,1.76,2.15);
   for(const z of [1.76,2.5])cyl(g,.025,.025,.08,M.yellow,side*1.7,1.76,z,0,0,0,10);
  }
  // Underframe air reservoirs and traction equipment boxes.
  for(const z of [bz-.45,bz+.45]){cyl(g,.25,.25,1.35,pipeMat,0,.78,z,Math.PI/2,0,0,20);box(g,.9,.34,.62,M.dark,0,.78,z)}
 }
 for(const side of [-1,1]){
  for(const z of [-3.7,3.7]){const lamp=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.055,20),M.yellow);lamp.rotation.z=Math.PI/2;lamp.position.set(side*1.68,2.4,z);g.add(lamp)}
  // Windscreen wipers and mirror arms.
  for(const x of [-.72,.72]){line(g,[x,2.48,4.36],[x+.18,2.72,4.39],.025,M.dark);line(g,[x+.18,2.72,4.39],[x+.48,2.70,4.39],.018,M.steel)}
  line(g,[side*1.12,2.68,4.12],[side*1.42,3.0,4.0],.035,M.steel);
  box(g,.34,.08,.48,M.dark,side*1.48,3.03,3.96);
 }
 // Roof insulators and high-voltage equipment, distinct from the pantograph frame.
 if(spec.electric){
  for(const z of [-2.1,2.0])for(const x of [-.92,.92]){
   cyl(g,.12,.16,.22,M.white,x,3.27,z,0,0,0,16);
   cyl(g,.055,.055,.3,M.steel,x,3.5,z,0,0,0,12);
  }
  line(g,[-.95,3.72,-1.7],[.95,3.72,1.7],.035,M.yellow);
  box(g,.55,.18,1.35,M.dark,0,3.22,0);
 }
 // Driver cab: instrument binnacle, digital displays, brake/traction levers and seat.
 box(g,2.55,.38,.48,M.dark,0,1.16,-2.72);
 box(g,.72,.36,.055,mat(0x102f3c),-.62,1.43,-2.49);
 box(g,.58,.36,.055,mat(0x183e4b),.12,1.43,-2.49);
 box(g,.44,.25,.055,mat(0x172d38),.68,1.42,-2.49);
 for(const x of [-.82,-.48,.42,.76]){cyl(g,.055,.055,.58,M.steel,x,1.52,-2.12);cyl(g,.13,.13,.09,stripeMat,x,1.82,-2.12)}
 box(g,.72,.18,.72,M.dark,0,1.08,.55);box(g,.78,.12,.74,M.steel,0,1.66,.62);
 if(spec.name==='WAG-12'){
  // Twin-section articulated freight locomotive silhouette.
  box(g,3.12,1.42,7.8,bodyMat,0,1.7,6.15);box(g,3.14,.18,7.8,stripeMat,0,1.22,6.15);
  for(const side of [-1,1])for(let z=3.3;z<=9;z+=1.2)box(g,.06,.72,.78,M.glass,side*1.59,2.15,z);
  makeBogie(g,6.4);makeBogie(g,9.2);
  box(g,2.3,.24,5.4,M.steel,0,2.96,6.15);
 }
 for(const end of [-1,1]){box(g,.72,.34,.7,M.dark,0,.72,end*4.9);for(const x of [-1.05,1.05])cyl(g,.17,.17,.32,M.dark,x,.83,end*4.65,Math.PI/2);line(g,[-.45,.8,end*4.65],[.45,.8,end*4.65],.055,M.steel)}
 const headMat=new THREE.MeshStandardMaterial({color:0xfff3c4,emissive:0xffd66b,emissiveIntensity:2.2});
 g.userData.headlamps=[];for(const end of [-1,1])for(const x of [-.72,.72]){const lamp=new THREE.Mesh(new THREE.SphereGeometry(.14,16,12),headMat);lamp.position.set(x,1.88,end*4.99);g.add(lamp);const glow=new THREE.PointLight(0xffe2a1,.75,24,2);glow.position.set(x,1.9,end*5.05);glow.visible=false;g.add(glow);g.userData.headlamps.push(glow)}
 return g;
}
function makeCoach(){
 const g=new THREE.Group();box(g,3.12,2.32,12.1,M.cream,0,1.72,0);box(g,3.14,.26,12.12,mat(0xe87526),0,.61,0);box(g,3.15,.12,12.12,M.dark,0,.46,0);box(g,3.16,.12,12.1,mat(0x8e9699),0,2.91,0);
 for(const side of [-1,1]){for(let z=-5.05;z<=5.05;z+=1.05){box(g,.055,.78,.78,M.glass,side*1.58,2.05,z);box(g,.07,.055,.82,M.dark,side*1.61,2.05,z)}for(const z of [-4.1,4.1]){box(g,.065,1.55,.72,M.dark,side*1.6,1.72,z);box(g,.07,.12,1,mat(0xe87526),side*1.63,1.28,z)}box(g,.06,.12,10.5,mat(0xe87526),side*1.62,1.3,0)}
 for(const z of [-3.8,-1.3,1.3,3.8])box(g,1,.22,.82,mat(0x9ca6a8),0,3.08,z);
 for(let z=-4.5;z<=4.5;z+=1.5){for(const side of [-1,1]){const seat=box(g,.52,.68,.58,mat(0x31566a),side*.55,1.28,z);seat.rotation.y=side*.12;box(g,.52,.12,.58,mat(0x263e4c),side*.55,.94,z+.08)}}
 for(const z of [-4.15,4.15]){const bogie=new THREE.Group();bogie.position.set(0,0,z);g.add(bogie);box(bogie,2.55,.28,1.55,M.steel,0,.7,0);for(const side of [-1,1])for(const wz of [-.48,.48]){const w=cyl(bogie,.48,.48,.22,M.rubber,side*1.48,.54,wz,0,0,Math.PI/2,24);wheelMeshes.push(w);cyl(bogie,.19,.19,.24,M.rail,side*1.48,.54,wz,0,0,Math.PI/2,18)}}
 box(g,.34,.32,.5,M.dark,0,.68,-6.22);box(g,.34,.32,.5,M.dark,0,.68,6.22);return g;
}
let loco=makeLoco(engineSpec);scene.add(loco);loco.position.set(0,0,18);
// Side radiator grilles and locomotive body detailing.
for(const side of [-1,1]){
 for(let z=-2.9;z<3;z+=.22)box(loco,.035,.44,.055,M.steel,side*1.66,1.92,z);
}
function makeFreightWagon(){
 const g=new THREE.Group(),cargo=mat(0x795338,.82),frame=mat(0x30383d,.48,.72);
 box(g,3.05,1.82,10.8,cargo,0,1.55,0);box(g,3.12,.2,11.1,frame,0,.55,0);
 for(const side of [-1,1]){box(g,.09,1.9,10.9,frame,side*1.57,1.55,0);for(let z=-4.7;z<5;z+=1.1)box(g,.1,1.75,.08,mat(0x9a7656),side*1.63,1.55,z)}
 for(const z of [-3.8,3.8]){const bogie=new THREE.Group();bogie.position.set(0,0,z);g.add(bogie);box(bogie,2.55,.28,1.45,frame,0,.62,0);for(const side of [-1,1])for(const wz of [-.45,.45]){const w=cyl(bogie,.46,.46,.22,M.rubber,side*1.48,.48,wz,0,0,Math.PI/2,22);wheelMeshes.push(w);cyl(bogie,.18,.18,.24,M.rail,side*1.48,.48,wz,0,0,Math.PI/2,16)}}
 box(g,.3,.3,.4,M.dark,0,.62,-5.55);box(g,.3,.3,.4,M.dark,0,.62,5.55);return g;
}
const coaches=[];for(let i=0;i<8;i++){const c=makeCoach();c.position.set(0,0,-20-i*13);scene.add(c);coaches.push(c)}
const freightWagons=[];for(let i=0;i<8;i++){const w=makeFreightWagon();w.position.set(0,0,-20-i*13);w.visible=false;scene.add(w);freightWagons.push(w)} 
const townPalette=[0xd5b88e,0xc9c1a8,0xb87958,0xd8d0bd];
function townHouse(x,z,i){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);const w=5+i%3,h=4+(i%4)*1.4;box(g,w,h,5,mat(townPalette[i%4]),0,h/2,0);box(g,w+.2,.2,5.2,M.dark,0,h+.1,0);for(let y=1.3;y<h-.4;y+=1.7)for(let xx=-w/2+.8;xx<w/2-.4;xx+=1.4)box(g,.55,.72,.07,M.glass,xx,y,2.54)}
for(let i=0;i<18;i++){const z=130-i*23;townHouse(-24-(i%3)*5,z,i);townHouse(25+(i%4)*5,z-8,i+1)}
// Four explorable Tamil Nadu route regions placed along the extended main line.
const routeCatalog={
 CHENNAI:{name:'Chennai Central – Beach',start:18,description:'Coastal city route · Chennai Central, harbour and beach scenery.'},
 AVADI:{name:'Chennai – Avadi Suburban',start:-190,description:'Busy suburban corridor · Avadi station, flyover and residential town.'},
 ARAKKONAM:{name:'Arakkonam Countryside',start:-410,description:'Rural railway section · fields, village houses, ponds and tree lines.'},
 JOLARPETTAI:{name:'Jolarpettai Hill Section',start:-630,description:'Scenic hill route · rocky hills, forest edges and a mountain valley.'}
};
function routeStation(z,name){
 box(scene,6.4,.42,68,M.concrete,-4,.08,z-54);box(scene,6.4,.12,68,mat(0xd9c9a5),-4,.35,z-54);box(scene,.18,.13,68,M.yellow,-6.95,.45,z-54);
 box(scene,6.1,.2,68,mat(0x777b7b),-4,4.7,z-54);
 for(let pz=z-26;pz>z-85;pz-=14)cyl(scene,.12,.12,4.3,M.white,-6.5,2.4,pz,0,0,0,12);
 for(let pz=z-28;pz>z-86;pz-=14)box(scene,5.8,.15,.2,M.dark,-4,2.6,pz);
 box(scene,4.2,.9,.18,M.green,-4,4.05,z-18);textBoard(name.toUpperCase(),-4,4.08,z-17.88);
}
for(const id of ['AVADI','ARAKKONAM','JOLARPETTAI'])routeStation(routeCatalog[id].start,routeCatalog[id].name);
{
 const z=-115;
 const sea=new THREE.Mesh(new THREE.PlaneGeometry(92,190),mat(0x347f9b,.28,.12));sea.rotation.x=-Math.PI/2;sea.position.set(-67,-.19,z);scene.add(sea);
 box(scene,24,.18,190,mat(0xc4ae80),-22,-.08,z);
 cyl(scene,1.5,2.2,13,M.white,-48,6,z-28);cyl(scene,2.5,2.5,.65,M.red,-48,12.5,z-28);cyl(scene,.42,.42,2,M.yellow,-48,13.5,z-28);
 for(let i=0;i<8;i++){const x=-35-(i%2)*7,pz=z-75+i*19;cyl(scene,.22,.28,4.5,mat(0x765033),x,2.25,pz);for(let j=0;j<3;j++){const crown=new THREE.Mesh(new THREE.SphereGeometry(1.5-j*.22,10,8),mat(0x27734d));crown.position.set(x,4.1+j*.55,pz);scene.add(crown)}}
 for(let i=0;i<5;i++){const hut=townHouse(-18-i*7,z-92-i*15,i+30)}
}
{
 const z=-300;
 box(scene,18,.55,2.2,M.steel,0,7.8,z);box(scene,17,.22,2.6,M.concrete,0,8.2,z);
 for(const x of [-8,8]){box(scene,.65,8,.7,M.concrete,x,4,z);box(scene,1.1,.18,4,M.concrete,x,7.8,z+2.4)}
 for(let i=0;i<10;i++){townHouse(-23-(i%3)*5,z-70-i*13,i+50);townHouse(24+(i%4)*4,z-85-i*12,i+70)}
 for(let i=0;i<6;i++)tree((i%2?-1:1)*(14+Math.random()*8),z-35-i*22,.8+Math.random()*.4);
}
{
 const z=-520;
 for(let side of [-1,1]){box(scene,28,.12,190,mat(side===1?0x829b4d:0x8b9c55),side*27,-.16,z);for(let i=0;i<12;i++)tree(side*(15+(i%3)*5),z-85+i*15,.65+Math.random()*.35)}
 const pond=new THREE.Mesh(new THREE.CircleGeometry(15,32),mat(0x5b9aab,.25,.1));pond.rotation.x=-Math.PI/2;pond.position.set(39,-.12,z-45);scene.add(pond);
 for(let i=0;i<7;i++)townHouse(-22-(i%2)*6,z-95-i*18,i+90);
}
{
 const z=-740,rock=mat(0x777568,.96),green=mat(0x466a43);
 for(const side of [-1,1]){for(let i=0;i<5;i++){const hill=new THREE.Mesh(new THREE.ConeGeometry(17+i%2*5,34+i%3*8,7),rock);hill.position.set(side*(32+i*5),13,z-85+i*42);hill.scale.z=1.5;hill.castShadow=true;scene.add(hill)}for(let i=0;i<16;i++)tree(side*(13+Math.random()*18),z-115+Math.random()*180,.7+Math.random()*.65)}
 box(scene,2,.2,170,green,0,-.12,z);
}
box(scene,12,.12,560,mat(0x3c3e3d),-16,.02,-140);for(let z=180;z>-450;z-=10)box(scene,.16,.03,.3,M.yellow,-16,.1,z);
function human(x,z,color){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);const skin=mat(0xb98260);cyl(g,.17,.2,.76,mat(color),0,1.14,0,0,0,0,12);const head=new THREE.Mesh(new THREE.SphereGeometry(.17,12,10),skin);head.position.y=1.68;g.add(head);cyl(g,.1,.12,.48,mat(0x343b43),-.1,.39,0);cyl(g,.1,.12,.48,mat(0x343b43),.1,.39,0);return g}
const walkers=[];for(let i=0;i<10;i++){const p=human(-6.7,-7-i*6,[0x365b7a,0x8b593b,0x416c4f,0x85899a][i%4]);walkers.push({g:p,z:p.position.z,phase:i*.7})}human(-12,-22,0x78523b);human(-12,-38,0x426b50);human(-12,-55,0x334c70);
const opposing=new THREE.Group();scene.add(opposing);opposing.add(makeLoco());for(let i=0;i<8;i++){const c=makeCoach();c.position.set(0,0,10.2+i*12.4);opposing.add(c)}opposing.position.set(7,0,-260);let crossingAlert=false;

let coupled=false,speed=0,throttle=0,brake=0,direction=1,engineOn=false,worldTime=0,pantographRaised=false,emergencyBrake=false,brakePipe=5.0,brakeCylinder=0;
const cameraModes=['CHASE','FRONT','REAR','COUPLING','CAB'];let cameraMode=0;
const $=id=>document.getElementById(id);
let pendingEngine=selectedEngine;
function showEngineSpec(id){
 const s=engineCatalog[id];pendingEngine=id;
 $('engineGrid').querySelectorAll('[data-engine]').forEach(b=>b.classList.toggle('selected',b.dataset.engine===id));
 $('engineSpec').textContent=s.name+' · '+s.maxSpeed+' km/h · '+s.type+' · '+s.power;
}
$('engineGrid').querySelectorAll('[data-engine]').forEach(b=>b.addEventListener('click',()=>showEngineSpec(b.dataset.engine)));
function applyEngine(id){
 if(speed>.15||coupled){toast('Stop the train and uncouple the rake before changing locomotives.');return}
 selectedEngine=id;engineSpec=engineCatalog[id];engineOn=false;pantographRaised=false;emergencyBrake=false;const freightMode=id.startsWith('WAG');coaches.forEach(c=>c.visible=!freightMode);freightWagons.forEach(w=>w.visible=freightMode);setThrottle(0);setBrake(0);
 const oldPosition=loco.position.clone();scene.remove(loco);
 loco=makeLoco(engineSpec);loco.position.copy(oldPosition);scene.add(loco);
 const oldOpposing=opposing.children[0];if(oldOpposing)opposing.remove(oldOpposing);opposing.add(makeLoco(engineSpec));
 $('missionTitle').textContent=engineSpec.name+' · '+engineSpec.service;
 $('missionDesc').textContent=engineSpec.type+' · '+engineSpec.power+' · Maximum rated speed '+engineSpec.maxSpeed+' km/h. Switch between cabin and exterior cameras while driving.';
 $('pantograph').style.display=engineSpec.electric?'inline-block':'none';$('pantograph').classList.remove('active');$('pantograph').textContent='RAISE PANTOGRAPH';$('engine').textContent=engineSpec.electric?'START TRACTION':'START DIESEL';$('emergency').classList.remove('active');if(motor)motor.type=engineSpec.electric?'sawtooth':'triangle';
 $('engine').classList.remove('active');$('engineSpec').textContent=engineSpec.name+' selected';
 $('engineDepot').classList.add('hidden');toast(engineSpec.name+' selected · '+engineSpec.type);
}
$('selectLoco').onclick=()=>{$('engineDepot').classList.remove('hidden');showEngineSpec(selectedEngine)};
$('closeDepot').onclick=()=>$('engineDepot').classList.add('hidden');
$('confirmEngine').onclick=()=>applyEngine(pendingEngine);
showEngineSpec(selectedEngine);
let activeMap='CHENNAI',pendingMap='CHENNAI';
function showMap(id){pendingMap=id;$('mapGrid').querySelectorAll('[data-map]').forEach(b=>b.classList.toggle('selected',b.dataset.map===id));$('mapSpec').textContent=routeCatalog[id].name+' · Tamil Nadu';}
$('mapGrid').querySelectorAll('[data-map]').forEach(b=>b.addEventListener('click',()=>showMap(b.dataset.map)));
$('mapSelect').onclick=()=>{$('mapDepot').classList.remove('hidden');showMap(activeMap)};
$('closeMap').onclick=()=>$('mapDepot').classList.add('hidden');
function applyMap(id){
 if(speed>.15){toast('Stop the train before changing route.');return}
 const zone=routeCatalog[id];
 if(coupled){const oldRake=engineSpec.name.startsWith('WAG')?freightWagons:coaches;oldRake.forEach(c=>scene.attach(c));coupled=false;$('couple').textContent='🔗 COUPLE RAKE'}
 loco.position.set(0,0,zone.start);
 coaches.forEach((c,i)=>{c.position.set(0,0,zone.start-10.2-i*12.4);c.visible=!engineSpec.name.startsWith('WAG')});
 freightWagons.forEach((w,i)=>{w.position.set(0,0,zone.start-10.2-i*12.4);w.visible=engineSpec.name.startsWith('WAG')});
 opposing.position.set(7,0,zone.start-260);crossingAlert=false;
 activeMap=id;engineOn=false;emergencyBrake=false;setThrottle(0);setBrake(0);
 $('engine').classList.remove('active');$('engine').textContent=engineSpec.electric?'START TRACTION':'START DIESEL';
 $('emergency').classList.remove('active');$('emergency').textContent='EMERGENCY BRAKE';
 $('missionTitle').textContent=zone.name;$('missionDesc').textContent=zone.description+' Select a locomotive and drive this route.';
 $('mapDepot').classList.add('hidden');toast('Route loaded · '+zone.name);
}
$('confirmMap').onclick=()=>applyMap(pendingMap);
function toast(t){const el=$('toast');el.textContent=t;el.style.opacity=1;clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.style.opacity=0,3000)}
function setThrottle(v){throttle=Math.max(0,Math.min(100,v));$('throttle').value=throttle;$('throttleLabel').textContent=Math.round(throttle)+'%';$('throttleRead').textContent=Math.round(throttle)+'%'}
function setBrake(v){brake=Math.max(0,Math.min(100,v));$('brake').value=brake;$('brakeLabel').textContent=Math.round(brake)+'%'}
$('throttle').addEventListener('input',e=>setThrottle(+e.target.value));
$('brake').addEventListener('input',e=>setBrake(+e.target.value));
function raisePantograph(){if(!engineSpec.electric)return;if(speed>.2){toast('Stop before operating the pantograph.');return}pantographRaised=!pantographRaised;if(!pantographRaised&&engineOn){engineOn=false;setThrottle(0)}$('pantograph').classList.toggle('active',pantographRaised);$('pantograph').textContent=pantographRaised?'LOWER PANTOGRAPH':'RAISE PANTOGRAPH';$('pantoStatus').textContent=pantographRaised?'RAISED':'LOWERED';$('engine').textContent=engineOn?'POWER OFF':(pantographRaised?'START TRACTION':'TRACTION ISOLATED');toast(pantographRaised?'Pantograph raised':'Pantograph lowered')} function startEngine(){audioReady();if(engineSpec.electric&&!pantographRaised){toast('Raise pantograph first.');return}engineOn=!engineOn;if(!engineOn){setThrottle(0);toast('Traction power OFF')}else toast(engineSpec.electric?'Electric traction enabled':'Diesel engine started');$('engine').textContent=engineOn?'POWER OFF':(engineSpec.electric?'START TRACTION':'START DIESEL');$('engine').classList.toggle('active',engineOn)}
$('engine').onclick=startEngine;$('pantograph').onclick=raisePantograph;$('emergency').onclick=()=>{emergencyBrake=!emergencyBrake;if(emergencyBrake){setThrottle(0);setBrake(100)}else setBrake(0);$('emergency').classList.toggle('active',emergencyBrake);$('emergency').textContent=emergencyBrake?'RELEASE EMERGENCY':'EMERGENCY BRAKE';toast(emergencyBrake?'Emergency brake applied':'Emergency brake released')};$('radioBtn').onclick=()=>radioCall('Chennai Central control, this is locomotive pilot. Requesting line clearance for departure.');
$('reverse').onclick=()=>{if(speed>1.5){toast('Bring the train to a complete stop before changing direction.');return}direction*=-1;$('gear').textContent=direction===1?'F':'R';$('reverse').innerHTML='DIRECTION <b>'+(direction===1?'FWD':'REV')+'</b>';toast(direction===1?'Forward selected':'Reverse selected')};
$('camera').onclick=()=>{cameraMode=(cameraMode+1)%cameraModes.length;$('camera').innerHTML='VIEW <b>'+cameraModes[cameraMode]+'</b>';toast('Camera: '+cameraModes[cameraMode])};
$('couple').onclick=()=>{if(coupled){toast('The rake is already coupled.');return}const rake=engineSpec.name.startsWith('WAG')?freightWagons:coaches;const gap=Math.abs(rake[0].position.z-loco.position.z);if(gap>12||speed>1){toast('Stop and slowly approach the rake to couple.');return}coupled=true;rake.forEach((c,i)=>{scene.remove(c);loco.add(c);c.position.set(0,0,-10.2-i*12.4)});$('couple').textContent='✓ RAKE COUPLED';toast('Coupling complete · 8 '+(engineSpec.name.startsWith('WAG')?'freight wagons':'passenger coaches')+' attached')};

let ac=null,master=null,motor=null,motorGain=null,railGain=null,windGain=null,dieselPulse=null,dieselGain=null,tractionWhine=null,whineGain=null,clackClock=0,brakeSquealClock=0,soundEnabled=true;
function audioReady(){
 if(ac){if(soundEnabled&&ac.state==='suspended')ac.resume().catch(()=>{});return}
 ac=new(window.AudioContext||window.webkitAudioContext)();ac.resume().catch(()=>{});master=ac.createGain();master.gain.value=.82;master.connect(ac.destination);
 motor=ac.createOscillator();motor.type='sawtooth';motor.frequency.value=55;const mf=ac.createBiquadFilter();mf.type='lowpass';mf.frequency.value=210;motorGain=ac.createGain();motorGain.gain.value=.0001;motor.connect(mf);mf.connect(motorGain);motorGain.connect(master);motor.start();
 dieselPulse=ac.createOscillator();dieselPulse.type='square';dieselPulse.frequency.value=engineSpec.idle*.5;const df=ac.createBiquadFilter();df.type='lowpass';df.frequency.value=125;dieselGain=ac.createGain();dieselGain.gain.value=.0001;dieselPulse.connect(df);df.connect(dieselGain);dieselGain.connect(master);dieselPulse.start();
 tractionWhine=ac.createOscillator();tractionWhine.type='sine';tractionWhine.frequency.value=180;const qf=ac.createBiquadFilter();qf.type='bandpass';qf.frequency.value=650;qf.Q.value=1.1;whineGain=ac.createGain();whineGain.gain.value=.0001;tractionWhine.connect(qf);qf.connect(whineGain);whineGain.connect(master);tractionWhine.start();
 const buffer=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.65;
 const src=ac.createBufferSource();src.buffer=buffer;src.loop=true;const rf=ac.createBiquadFilter();rf.type='lowpass';rf.frequency.value=850;railGain=ac.createGain();railGain.gain.value=.0001;src.connect(rf);rf.connect(railGain);railGain.connect(master);src.start();
 const wind=ac.createBufferSource();wind.buffer=buffer;wind.loop=true;const wf=ac.createBiquadFilter();wf.type='bandpass';wf.frequency.value=420;wf.Q.value=.55;windGain=ac.createGain();windGain.gain.value=.0001;wind.connect(wf);wf.connect(windGain);windGain.connect(master);wind.start();
}
function soundTone(freq,dur,vol=.10,type='sine'){if(!ac||!soundEnabled)return;const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,ac.currentTime);g.gain.exponentialRampToValueAtTime(vol,ac.currentTime+.012);g.gain.setValueAtTime(vol,ac.currentTime+dur*.55);g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+dur);o.connect(g);g.connect(master);o.start();o.stop(ac.currentTime+dur+.03)}
function railClack(){if(!ac)return;const t=ac.currentTime;[0,.035].forEach((delay,i)=>{const o=ac.createOscillator(),g=ac.createGain(),f=ac.createBiquadFilter();o.type=i?'triangle':'square';o.frequency.setValueAtTime(i?185:125,t+delay);o.frequency.exponentialRampToValueAtTime(i?72:48,t+delay+.11);f.type='lowpass';f.frequency.value=i?620:420;g.gain.setValueAtTime(.0001,t+delay);g.gain.exponentialRampToValueAtTime(i?.075:.13,t+delay+.004);g.gain.exponentialRampToValueAtTime(.0001,t+delay+.13);o.connect(f);f.connect(g);g.connect(master);o.start(t+delay);o.stop(t+delay+.14)})}
function trainHorn(remote=false){audioReady();if(!soundEnabled)return;const t=ac.currentTime;const tones=engineSpec.horn||[370,465];[remote?tones[0]*.88:tones[0],remote?tones[1]*.88:tones[1]].forEach((f,i)=>{const o=ac.createOscillator(),g=ac.createGain();o.type='sawtooth';o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(remote?.04:.07,t+.12);g.gain.setValueAtTime(remote?.04:.07,t+1);g.gain.exponentialRampToValueAtTime(.0001,t+1.8);o.connect(g);g.connect(master);o.start(t+i*.025);o.stop(t+1.85)})}
function radioCall(message){audioReady();$('radioText').textContent=message;$('radioPanel').classList.add('radio-active');soundTone(1050,.1,.03,'square');const u=new SpeechSynthesisUtterance(message);u.lang='en-IN';u.rate=.88;u.pitch=.82;u.onend=()=>{$('radioPanel').classList.remove('radio-active');soundTone(820,.08,.03,'square')};speechSynthesis.cancel();speechSynthesis.speak(u)}

function horn(){trainHorn(false);toast(engineSpec.name+' twin-tone horn')}
$('horn').onclick=horn;$('soundToggle').onclick=()=>{soundEnabled=!soundEnabled;if(soundEnabled){audioReady();if(ac)master.gain.setTargetAtTime(.82,ac.currentTime,.04);$('soundToggle').textContent='SOUND ON';toast('Driving audio enabled')}else{if(ac)master.gain.setTargetAtTime(0,ac.currentTime,.04);$('soundToggle').textContent='SOUND OFF';toast('Driving audio muted')}};$('helpBtn').onclick=()=>$('help').classList.remove('hidden');$('closeHelp').onclick=()=>$('help').classList.add('hidden');
$('mHorn').onclick=horn;$('mBrake').onpointerdown=()=>setBrake(75);$('mBrake').onpointerup=()=>setBrake(0);$('mBrake').onpointerleave=()=>setBrake(0);
const keys={};addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(['ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();if(e.key.toLowerCase()==='r'&&!e.repeat)$('reverse').click();if(e.key.toLowerCase()==='c'&&!e.repeat)$('couple').click();if(e.key.toLowerCase()==='v'&&!e.repeat)$('camera').click();if(e.key.toLowerCase()==='m'&&!e.repeat)$('mapSelect').click();if(e.key.toLowerCase()==='h'&&!e.repeat)horn();if(e.key.toLowerCase()==='e'&&!e.repeat)startEngine();if(e.key.toLowerCase()==='p'&&!e.repeat)raisePantograph();if(e.key.toLowerCase()==='x'&&!e.repeat)$('emergency').click();if(e.key.toLowerCase()==='o'&&!e.repeat){(loco.userData.cabDoors||[]).forEach(d=>{d.open=!d.open;d.mesh.rotation.y=d.open?d.side*.95:0});toast('Cab doors '+((loco.userData.cabDoors||[])[0]?.open?'opened':'closed'))}});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
let last=performance.now();
function animate(now){
 requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.04);last=now;
 if(keys.w||keys.arrowup){if(engineOn)setThrottle(throttle+35*dt)}
 if(keys.s||keys.arrowdown)setBrake(Math.min(100,brake+75*dt));
 if(!emergencyBrake&&!keys.s&&!keys.arrowdown&&document.activeElement!==$('brake'))setBrake(Math.max(0,brake-45*dt));
 const consistMass=engineSpec.mass+(coupled?8*(engineSpec.name.startsWith('WAG')?55:48):0);
 const availableAccel=engineSpec.tractiveEffort/consistMass;
 const traction=engineOn?Math.min(engineSpec.accel,availableAccel)*(throttle/100):0;
 const effectiveBrake=emergencyBrake?1.45:(brake/100)*.92;
 const decel=effectiveBrake+.018;
 brakePipe=emergencyBrake ? 0.55 : 5-(brake/100)*3.5;
 brakeCylinder=emergencyBrake?3.8:(5-brakePipe)*.82;
 if(speed>0)speed=Math.max(0,speed+(traction-decel)*dt);
 else speed=Math.max(0,traction-decel)*dt;
 speed=Math.min(speed,engineSpec.maxSpeed/3.6);
 const travel=speed*direction*dt;loco.position.z-=travel;
 const gapOld=Math.abs(opposing.position.z-loco.position.z);opposing.position.z+=18*dt;const gapNew=Math.abs(opposing.position.z-loco.position.z);
 if(gapOld>14&&gapNew<=14&&!crossingAlert){crossingAlert=true;trainHorn(true);radioCall('Attention driver. An express train is passing on the opposite line. Maintain your line.');toast('Opposite line express passing!')}
 if(opposing.position.z>loco.position.z+190){opposing.position.z=loco.position.z-310;crossingAlert=false}
 walkers.forEach(p=>{p.g.position.z=p.z+Math.sin(worldTime*.8+p.phase)*.35;p.g.rotation.y=Math.sin(worldTime*.5+p.phase)*.1});
 if(ac){const running=engineOn&&soundEnabled;motorGain.gain.setTargetAtTime(running ? .105+throttle*.00115+(speed>.3?.035:0):.0001,ac.currentTime,.16);motor.frequency.setTargetAtTime(engineSpec.idle+throttle*(engineSpec.electric?1.35:.58)+speed*(engineSpec.electric?2.1:1.05),ac.currentTime,.14);if(dieselGain){dieselGain.gain.setTargetAtTime(running&&!engineSpec.electric ? .055+throttle*.00055 : .0001,ac.currentTime,.18);dieselPulse.frequency.setTargetAtTime(engineSpec.idle*.48+throttle*.22,ac.currentTime,.18)}if(whineGain){whineGain.gain.setTargetAtTime(running&&engineSpec.electric&&throttle>2 ? .045+throttle*.0005 : .0001,ac.currentTime,.12);tractionWhine.frequency.setTargetAtTime(160+throttle*7+speed*32,ac.currentTime,.12)}railGain.gain.setTargetAtTime(soundEnabled&&speed>.18?Math.min(.34,.075+speed*.009):.0001,ac.currentTime,.13);windGain.gain.setTargetAtTime(soundEnabled&&speed>.5?Math.min(.16,speed*.0027):.0001,ac.currentTime,.25);clackClock-=dt;if(soundEnabled&&speed>.7&&clackClock<=0){railClack();clackClock=Math.max(.24,13/Math.max(speed,1))}if(soundEnabled&&brake>18&&speed>2){brakeSquealClock-=dt;if(brakeSquealClock<=0){soundTone(1650+Math.random()*450,.16,.012,'sawtooth');brakeSquealClock=.34}}else brakeSquealClock=0}
 const wheelSpin=travel/.53;wheelMeshes.forEach(w=>{w.rotation.x-=wheelSpin});
 (loco.userData.pantographs||[]).forEach(pantograph=>{const target=pantographRaised?1:.42;pantograph.scale.y+=(target-pantograph.scale.y)*(1-Math.exp(-2.8*dt))});
 (loco.userData.headlamps||[]).forEach(light=>{light.visible=engineOn});
 if(coupled){/* coach cars move with the locomotive group */}
 $('speed').textContent=Math.round(speed*3.6);$('speedbar').style.width=Math.min(100,speed/(engineSpec.maxSpeed/3.6)*100)+'%';
 $('statusText').textContent=emergencyBrake?'EMERGENCY BRAKE':!engineOn?'POWER OFF':brake>5?'BRAKING':speed>.3?'IN MOTION':'LOCOMOTIVE READY';$('pipePressure').textContent=brakePipe.toFixed(1)+' bar';$('cylinderPressure').textContent=brakeCylinder.toFixed(1)+' bar';$('pantoStatus').textContent=engineSpec.electric?(pantographRaised?'RAISED':'LOWERED'):'NOT FITTED';
 $('gear').textContent=speed<.1?'N':direction===1?'F':'R';
 worldTime+=dt;$('clock').textContent='SIM · '+String(10+Math.floor(worldTime/3600)%10).padStart(2,'0')+':'+String(30+Math.floor(worldTime/60)%30).padStart(2,'0');
 const smooth=1-Math.exp(-3.2*dt);
 let camPos,look;
 if(cameraMode===0){camPos=new THREE.Vector3(9,7.5,loco.position.z+18);look=new THREE.Vector3(0,2.2,loco.position.z-1)}
 else if(cameraMode===1){camPos=new THREE.Vector3(0,3.5,loco.position.z-15);look=new THREE.Vector3(0,2.1,loco.position.z+1)}
 else if(cameraMode===2){camPos=new THREE.Vector3(0,4.1,loco.position.z+17);look=new THREE.Vector3(0,1.8,loco.position.z+1)}
 else if(cameraMode===3){camPos=new THREE.Vector3(3.8,1.35,loco.position.z+6.1);look=new THREE.Vector3(0,.85,loco.position.z+4.35)}
 else{camPos=new THREE.Vector3(0,3.15,loco.position.z-1.35);look=new THREE.Vector3(0,3.0,loco.position.z-32)}
 camera.position.lerp(camPos,smooth);camera.lookAt(look);
 renderer.render(scene,camera);
}
requestAnimationFrame(animate);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2))});
toast('Driver ready · Press START ENGINE to begin.');