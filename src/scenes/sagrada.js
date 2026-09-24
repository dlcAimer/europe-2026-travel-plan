import * as THREE from 'three';
import {box,cyl,ball,mesh,arch,tree,plate} from './primitives.js';
const stone='#dfc592',light='#eee0b9',recess='#668989',gold='#d79e54';
function tower(g,x,z,h,r=.31,top='fruit'){
 const t=new THREE.Group();g.add(t);t.position.set(x,0,z);
 const points=[[r*1.15,0],[r*1.15,.45],[r,.65],[r,h*.55],[r*.84,h*.73],[r*.54,h*.91],[r*.29,h]].map(p=>new THREE.Vector2(...p));
 mesh(t,new THREE.LatheGeometry(points,24),stone);
 for(let j=1;j<Math.floor(h/.45)-1;j++){const y=j*.45+.3;const taper=1-Math.max(0,y/h-.55)*1.3;for(let side=0;side<4;side++){const a=side*Math.PI/2;const win=arch(t,.13,.28,.025,recess,Math.sin(a)*r*taper,y,Math.cos(a)*r*taper,true);win.rotation.y=a;}}
 for(let k=0;k<3;k++)cyl(t,r*(.75-k*.15),r*(.82-k*.15),.09,light,0,h-.6+k*.23,0);
 if(top==='fruit'){cyl(t,.09,.1,.23,gold,0,h+.05,0);for(let j=0;j<5;j++)ball(t,.105,['#7baf9d','#e5b15f','#d88979'][j%3],Math.cos(j*1.26)*.08,h+.23+j*.045,Math.sin(j*1.26)*.08);}
 if(top==='cross'){box(t,.15,.88,.15,'#fff9e8',0,h+.28,0);box(t,.66,.15,.15,'#fff9e8',0,h+.43,0);box(t,.15,.15,.66,'#fff9e8',0,h+.43,0);ball(t,.1,gold,0,h-.15,0);}
 if(top==='star'){const shape=new THREE.Shape();for(let k=0;k<24;k++){const a=k*Math.PI/12,rr=k%2?.13:.3;const p=[Math.cos(a)*rr,Math.sin(a)*rr];k?shape.lineTo(...p):shape.moveTo(...p);}shape.closePath();mesh(t,new THREE.ExtrudeGeometry(shape,{depth:.08,bevelEnabled:false}),'#fffaf0',0,h+.15,0);}
 return t;
}
export function sagrada(){const g=new THREE.Group();g.userData={city:'bcn',placeId:'bcn-sagrada'};plate(g,5,5.6,'#e6d4b5');
 box(g,2.65,1.55,3.45,stone,0,.85,0);box(g,3.5,1.3,1.1,stone,0,.73,-.2);
 // Nave, layered pitched roof and transept create a connected cruciform body.
 for(let k=0;k<4;k++)box(g,2.7-k*.37,.22,3.5,light,0,1.55+k*.18,0);
 for(let side of[-1,1])for(let z=-1.5;z<=1.5;z+=.5){box(g,.18,1.55,.2,light,side*1.4,.8,z);arch(g,.2,.68,.04,recess,side*1.31,.65,z,true).rotation.y=side*Math.PI/2;}
 for(let i=0;i<3;i++){arch(g,.58,1.12,.1,light,(i-1)*.77,.03,1.75,true);arch(g,.42,.89,.13,recess,(i-1)*.77,.03,1.83,true);}
 // Deep façade reliefs, organic pinnacles and a rose window.
 for(let i=0;i<9;i++)cyl(g,.025,.14,.62,light,(i-4)*.28,1.6+(.4-Math.abs(i-4)*.08),1.73,6);
 const rose=cyl(g,.3,.3,.08,'#77a1a0',0,1.53,1.9,24);rose.rotation.x=Math.PI/2;
 for(let a=0;a<8;a++){const beam=box(g,.035,.52,.035,light,0,1.53,1.96);beam.rotation.z=a*Math.PI/4;}
 for(let side of[-1,1]){tower(g,side*.57,1.42,3.95,.31);tower(g,side*1.25,1.35,3.5,.29);tower(g,side*.57,-1.45,3.45,.28);tower(g,side*1.2,-1.38,3.1,.27);tower(g,side*1.52,.35,3.1,.25);tower(g,side*1.52,-.43,2.85,.24);}
 // Central six towers: Jesus, four evangelists, rear Mary star.
 tower(g,0,-.18,5.62,.45,'cross');tower(g,0,-1.05,4.56,.32,'star');
 for(const[x,z]of[[-.64,-.6],[.64,-.6],[-.64,.25],[.64,.25]]){tower(g,x,z,4.55,.25);ball(g,.13,'#fff6dc',x,4.84,z);}
 for(const[x,z]of[[-2,-1.8],[2,-1.8],[-2,1.6],[2,1.6]])tree(g,x,z,.75);
 for(let k=0;k<3;k++)box(g,2.45+k*.2,.1,1-k*.13,light,0,-.03-k*.055,2.14+k*.1);
 return g;}
