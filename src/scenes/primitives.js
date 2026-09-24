import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
const cache=new Map();
export function mat(color){if(!cache.has(color))cache.set(color,new THREE.MeshStandardMaterial({color,roughness:.88,metalness:0}));return cache.get(color);}
export function mesh(g,geo,color,x=0,y=0,z=0){const m=new THREE.Mesh(geo,mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
export function box(g,w,h,d,c,x=0,y=0,z=0,r=.08){return mesh(g,new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/5,h/5,d/5)),c,x,y,z);}
export function cyl(g,rt,rb,h,c,x=0,y=0,z=0,n=20){return mesh(g,new THREE.CylinderGeometry(rt,rb,h,n),c,x,y,z);}
export function ball(g,r,c,x,y,z){return mesh(g,new THREE.SphereGeometry(r,16,12),c,x,y,z);}
export function arch(g,w,h,d,c,x,y,z,pointed=false){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(-w/2,h-w*.55);if(pointed){s.quadraticCurveTo(-w/2,h-w*.15,0,h);s.quadraticCurveTo(w/2,h-w*.15,w/2,h-w*.55);}else s.absarc(0,h-w/2,w/2,Math.PI,0,true);s.lineTo(w/2,0);s.closePath();return mesh(g,new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false,curveSegments:12}),c,x,y,z);}
export function tree(g,x,z,scale=1){const t=new THREE.Group();g.add(t);t.position.set(x,0,z);t.scale.setScalar(scale);cyl(t,.07,.1,.8,'#857960',0,.4,0);ball(t,.45,'#6a8b71',0,1.06,0);ball(t,.31,'#87a786',.25,1,0);return t;}
export function plate(g,w,d,c,x=0,z=0){return box(g,w,.36,d,c,x,-.14,z,.15);}
