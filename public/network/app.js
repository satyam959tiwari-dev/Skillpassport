/**
 * Bootable hero network for the Next.js site.
 * Safe to call on remount. Loaded by HomeHero from /network/app.js.
 */
window.__bootSkillNetwork = function __bootSkillNetwork() {
  if (typeof window.__spNetworkCleanup === "function") {
    try { window.__spNetworkCleanup(); } catch (e) {}
    window.__spNetworkCleanup = null;
  }
/**
 * Luminous Network V3 — dependency-free WebGL renderer.
 *
 * The reference is a vast spherical shell of nodes seen from just outside it:
 * front and back hemispheres overlap, long lavender filaments fan out of hubs,
 * near nodes melt into soft bokeh, and far nodes stay small and crisp. That
 * depth cue needs real perspective, so the graph lives in 3D and is drawn with
 * raw WebGL (additive light, point-sprite depth of field). No Three.js.
 *
 * No pointer listeners. The slow turn is the only motion (hub breathing is locked to it),
 * frozen entirely for prefers-reduced-motion.
 */
const canvas=document.getElementById('network');
  if (!canvas) return;
const mq=window.matchMedia('(prefers-reduced-motion: reduce)');
const SETTINGS={
  // Structure, counts and camera follow the reference's published scene (hero-graph.js), rescaled
  // so the outer shell has radius 1 (the reference's is 3.39 units).
  seed:60714,
  shellNodes:352,          // main shell on a golden-angle spiral, each linked to its 8 nearest (hubs 9)
  fillNodes:260,           // small shell nodes on an offset spiral, each linked 1-4 times inward
  coreNodes:170,           // white interior cloud the shell reaches in to
  bokehLights:104,         // large soft lights in a wide ring around the sphere; the camera orbits through them
  camDist:3.39,            // camera distance from shell centre
  focus:3.39,              // focal depth for per-node bokeh
  bokeh:.8,                // circle-of-confusion growth per unit of defocus (px)
  bokehMax:2.0,            // cap so foreground nodes never dominate
  period:180,              // seconds per orbit; the loop is seamless at this length
  tilt:.436,               // ±25° vertical swing, once per orbit and locked to it
  phase:4.887,             // where in the orbit the page opens (140s in): the stretch that matches the reference recording
  lineAlpha:0.5,
  split:3.6,               // just behind the centre: the back half of the sphere goes soft
  feather:.38,
  farBlur:.4,              // blur radius for the back layer (quarter-res texels)
  bloom:.8,               // strength of the light that spills around bright lines and nodes
  bloomThreshold:.5,
  pixelBudget:2400000,     // render resolution is scaled to stay under this many pixels
  lineColor:[0.34,0.54,1.0],  // blue
  glow:1.0,
};
let w=0,h=0,dpr=1,gl=null,prog={},buf={},counts={},fbo={},view={},animation=0,last=0,phase=0,visible=true,running=false;
// Meet-brighten: calm resting glow; clear lift when nodes cross on screen, then slow ease back.
let graph=null,pointsData=null,meetBoost=null,meetScr=null,meetLastT=0;
const POINT_STRIDE=12;
const MEET_REST=.86;     // resting intensity vs authored
const MEET_LIFT=.95;     // peak = base*(.86+.95)=1.81× authored — clearly brighter than initial
const MEET_SIZE=.28;     // slight size swell at peak so the flash reads
const MEET_HALO=.4;      // halo swell with the flash
const MEET_FADE=1.8;     // seconds to ease boost ~to zero (slow, not sudden)

function seeded(seed){return()=>{seed|=0;seed=(seed+0x6d2b79f5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function direction(rand){const z=rand()*2-1,a=rand()*6.2832,s=Math.sqrt(1-z*z);return[s*Math.cos(a),z,s*Math.sin(a)]}

// Shell nodes are warm only, as in the reference; white belongs to the interior cloud alone,
// so the shell reads as a shell around a core.
const PALETTE=[
  [.40,[1.00,.76,.40]],   // gold
  [.35,[1.00,.60,.26]],   // amber
  [.25,[1.00,.42,.18]],   // ember red-orange
];
function pickColor(rand){let r=rand();for(const[p,c]of PALETTE){if((r-=p)<0)return c}return PALETTE[0][1]}

const GOLDEN=Math.PI*(3-Math.sqrt(5));
// i-th of n points on a golden-angle spiral: evenly spaced over the sphere, with no clumps or gaps.
function spiral(i,n,offset){const y=1-i/(n-1)*2,s=Math.sqrt(Math.max(0,1-y*y)),a=GOLDEN*i+offset;return[Math.cos(a)*s,y,Math.sin(a)*s]}
const dist2=(a,b)=>(a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2;
function nearest(p,list,k){return list.map((q,j)=>[dist2(p,q.p),j]).sort((x,y)=>x[0]-y[0]).slice(0,k).map(x=>x[1])}

function generate(){
  const rand=seeded(SETTINGS.seed);
  const{shellNodes:nMain,fillNodes:nFill,coreNodes:nCore}=SETTINGS;
  const nodes=[],edges=[],seen=new Set();
  const link=(i,j,v,mesh)=>{const k=i<j?i*4096+j:j*4096+i;if(i===j||seen.has(k))return;seen.add(k);edges.push([i,j,v,mesh])};
  // A thick shell (radius 0.83-1, biased inward, as in the reference): main nodes, 15% of them hubs.
  for(let i=0;i<nMain;i++){
    const d=spiral(i,nMain,0),r=.83+Math.pow(rand(),1.6)*.17,hub=rand()<.15;
    nodes.push({p:[d[0]*r,d[1]*r,d[2]*r],tier:hub?3:1,size:hub?3+rand()*.8:1.6+rand()*.8,intensity:hub?1:.85+rand()*.15,
      color:pickColor(rand),halo:hub?.22:.14,blur:0});
  }
  // One even web: every main node links to its 8 nearest (hubs 9), so all links share one scale.
  const main=nodes.slice(0,nMain);
  for(let i=0;i<nMain;i++)for(const j of nearest(main[i].p,main,nodes[i].tier===3?10:9).slice(1))link(i,j,.28+rand()*.32,true);
  // Smaller shell nodes on an offset spiral, so they fall between the main ones.
  for(let i=0;i<nFill;i++){
    const d=spiral(i,nFill,1.1),r=.83+Math.pow(rand(),1.6)*.17;
    nodes.push({p:[d[0]*r,d[1]*r,d[2]*r],tier:0,size:.8+rand()*.5,intensity:.7+rand()*.25,color:pickColor(rand),halo:.1,blur:0});
  }
  // Interior cloud: small white points through the middle (0.6 of the shell radius).
  const c0=nodes.length;
  for(let i=0;i<nCore;i++){
    const d=direction(rand),r=.6*Math.cbrt(rand());
    nodes.push({p:[d[0]*r,d[1]*r,d[2]*r],tier:0,size:1.1+rand()*.4,intensity:.9,color:[1,.97,.92],halo:.08,blur:0});
  }
  const core=nodes.slice(c0);
  // Every main node reaches in to its nearest interior point and each fill node to 1-4 of them,
  // so many lines converge on each interior point: the bursts.
  for(let i=0;i<nMain;i++)link(i,c0+nearest(nodes[i].p,core,1)[0],.2,false);
  for(let i=nMain;i<c0;i++)for(const j of nearest(nodes[i].p,core,1+Math.floor(rand()*4)))link(i,c0+j,.2,false);
  // Background lights in a wide ring, mostly behind the sphere at first. They are fixed in the
  // world, so as the camera orbits they slide past at their own depth: the background's movement.
  const COOL=[[.3,.55,1],[.25,.85,1],[.25,.85,1],[.15,.95,1],[.25,.85,.7],[.2,.9,.75],[.3,.95,.8]];
  const WARM=[[1,.62,.25],[1,.45,.2],[1,.75,.4],[1,.5,.15],[1,.65,.3],[1,.4,.12]];
  const tones=[...WARM,...COOL];
  for(let i=0;i<SETTINGS.bokehLights;i++){
    const a=rand()*6.2832,rad=1.92+rand()*3.24,y=(rand()-.5)*3.24,z=Math.sin(a)*rad-1.47-rand()*4.72;
    const c=tones[Math.floor(rand()*tones.length)],b=.35+rand()*.45;
    // size: diameter in world units; blur -1 marks a world-sized background light.
    nodes.push({p:[Math.cos(a)*rad,y,z],tier:0,size:.41+rand()*.71,intensity:b*.45,color:c,halo:0,blur:-1});
  }
  return{nodes,edges};
}

/* ---------- WebGL ---------- */
const COMMON=`
uniform mat3 uRot;uniform float uDist,uF,uAspect;uniform vec2 uShift;
vec4 project(vec3 p,out float depth){vec3 q=uRot*p;depth=uDist-q.z;
  return vec4(q.x*uF/uAspect+uShift.x*depth,q.y*uF+uShift.y*depth,0.,depth);}
float depthFade(float d){return smoothstep(.75,1.2,d)*mix(1.,.5,smoothstep(uDist-.5,uDist+1.,d));}
// Geometry is drawn twice: once for the sharp front layer, once for the back layer that gets blurred.
uniform float uLayer,uSplit,uFeather;
float layerWeight(float d){float back=smoothstep(uSplit-uFeather,uSplit+uFeather,d);return uLayer<.5?1.-back:back;}`;
const POINT_VS=`precision highp float;${COMMON}
attribute vec3 aPos,aColor;attribute vec4 aData;attribute vec2 aExtra;   // aData: size, intensity, seed, hub
uniform float uPx,uFocus,uBokeh,uBokehMax,uMaxSize,uBreath,uUnit;   // uUnit: device px per world unit at depth 1
varying vec3 vColor;varying float vR,vSoft,vHalo,vHaloAmt,vEnergy,vSize,vHot;
void main(){
  float depth;gl_Position=project(aPos,depth);
  float persp=uDist/depth;
  // Hubs breathe on a clock locked to the turn, so everything on screen shares one rhythm.
  float core=max(.6,aData.x*uPx*persp*mix(1.,uBreath,aData.w));
  // Nodes never go through the blur pass (it would smear them away). Far-back nodes are
  // drawn in the front layer instead, as soft bokeh glows.
  float back=smoothstep(uSplit-uFeather,uSplit+uFeather,depth);
  float coc=(min(abs(depth-uFocus)*uBokeh,uBokehMax)+aExtra.y+back*1.6)*uPx;
  float r=core+coc;
  vHalo=(core*2.6+1.2*uPx)*(1.+coc/(core+2.*uPx));
  float a=aData.y*1.2*depthFade(depth)*step(uLayer,.5)*(1.-back*.15);
  vSize=min(2.*(r+vHalo*1.6)+2.,uMaxSize);
  gl_PointSize=vSize;
  vEnergy=a*pow((core*core+.5)/(r*r+.5),.5);
  vHaloAmt=aExtra.x*a;
  vR=r;vSoft=max(.7,coc*.85);
  vHot=step(2.4,aData.x)*.1;
  // Defocused light reads as warm bokeh rather than grey discs.
  vColor=mix(aColor,vec3(1.,.72,.38),clamp(coc/(uBokehMax*uPx),0.,1.)*.55);
  if(aExtra.y<0.){
    // Background lights are sized in the world: they swell and shrink with depth like real objects
    // and are drawn as soft cones, all falloff and no rim.
    float rr=min(.5*aData.x*uUnit/depth,160.*uPx);
    vR=rr;vSoft=rr;vHalo=1.;vHaloAmt=-1.;   // -1 marks the cone profile in the fragment shader
    vHot=0.;vColor=aColor;
    // Only the near cut-off applies: as in the reference, distance does not dim them.
    vEnergy=aData.y*smoothstep(.75,1.2,depth)*step(uLayer,.5);
    vSize=min(2.*rr+2.,uMaxSize);gl_PointSize=vSize;
  }
}`;
const POINT_FS=`precision highp float;
varying vec3 vColor;varying float vR,vSoft,vHalo,vHaloAmt,vEnergy,vSize,vHot;
void main(){
  vec2 q=(gl_PointCoord-.5)*vSize;
  float d=length(q);
  // Background lights fall off as a peaked cone; nodes keep their crisp core.
  float disc=vHaloAmt<0.?pow(max(1.-d/vR,0.),1.6):1.-smoothstep(vR-vSoft,vR+.5,d);
  float halo=exp(-d*d/(vHalo*vHalo))-exp(-2.56);
  if(halo<=0.&&disc<=0.)discard;
  float bloom=exp(-d*d/(vR*vR*3.2+1.))*step(0.,vHaloAmt);   // tight inner bloom: the "lit bulb" look
  vec3 c=vColor*(disc*vEnergy+bloom*min(vEnergy,.75)*.35+max(halo,0.)*max(vHaloAmt,0.));
  c+=vec3(1.,.98,.94)*disc*vEnergy*vHot*(1.-smoothstep(0.,vR,d));
  gl_FragColor=vec4(min(c,vec3(1.)),1.);
}`;
const LINE_VS=`precision highp float;${COMMON}
// Each filament is a screen-space quad: a crisp hairline core plus room for a faint glow over it.
attribute vec3 aA,aB;attribute vec4 aData;attribute float aSide;   // aData: alpha, seed, end (0=A,1=B), highlight strength
uniform float uLineAlpha,uDpr;uniform vec2 uRes;
varying float vA,vFade,vT,vSeed,vHi,vX,vBack;
void main(){
  float dA,dB;vec4 ca=project(aA,dA),cb=project(aB,dB);
  bool atA=aData.z<.5;vec4 c=atA?ca:cb;float depth=atA?dA:dB;
  vec2 h=uRes*.5,sa=ca.xy/ca.w*h,sb=cb.xy/cb.w*h;
  vec2 dir=sb-sa;dir/=max(length(dir),1e-3);
  vX=aSide*6.*uDpr;                                // in CSS px across the line
  gl_Position=vec4((c.xy/c.w*h+vec2(-dir.y,dir.x)*vX)/h*c.w,0.,c.w);
  vX/=uDpr;
  vFade=depthFade(depth)*layerWeight(depth);vT=aData.z;vSeed=aData.y;vHi=aData.w;
  // The back layer is blurred, which spreads its light thin; lift it and cool it a little so the
  // far wall's filaments read as clearly as the front's.
  vBack=smoothstep(uSplit-uFeather,uSplit+uFeather,depth);
  vA=aData.x*uLineAlpha*vFade*(1.+.35*vBack);
}`;
const LINE_FS=`precision highp float;uniform vec3 uColor;
varying float vA,vFade,vT,vSeed,vHi,vX,vBack;
void main(){
  float x=abs(vX);
  float core=1.-smoothstep(.4,.95,x);              // crisp ~1px hairline, every filament clearly readable
  float glow=exp(-x*x/5.);                         // faint light lying over the line
  vec3 base=mix(uColor,vec3(.26,.46,1.),vBack*.7)*vA*(1.+.5*exp(-min(vT,1.-vT)*12.));   // light bleeding out of the nodes
  vec3 c=base*core+base*.04*glow;
  if(vHi>0.){
    // A lit stretch fixed to the filament. It never travels on its own: the turn is the motion.
    float pos=.15+fract(vSeed*.159)*.7,width=.08+fract(vSeed*.731)*.22;
    float g=pow(max(1.-abs(vT-pos)/width,0.),2.)*vFade*vHi;
    vec3 tint=mix(vec3(.3,.5,1.),vec3(.5,.78,1.),smoothstep(-2.,2.,vX));
    c+=vec3(.46,.68,1.)*g*.55*core+tint*g*.16*glow;
  }
  gl_FragColor=vec4(c,1.);
}`;
const SKY_VS=`attribute vec2 aPos;void main(){gl_Position=vec4(aPos,0.,1.);}`;
const SKY_FS=`precision highp float;
float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){
  // Pure black: the canvas is screened onto the brand gradient (style.css), where black adds nothing.
  // The dither keeps the bloom falloff from banding.
  gl_FragColor=vec4(vec3(hash(gl_FragCoord.xy)*.6/255.),1.);
}`;
// Post-processing: full-screen passes over off-screen textures.
const QUAD_VS=`attribute vec2 aPos;varying vec2 vUv;void main(){vUv=aPos*.5+.5;gl_Position=vec4(aPos,0.,1.);}`;
const BLUR_FS=`precision mediump float;varying vec2 vUv;uniform sampler2D uTex;uniform vec2 uStep;
void main(){
  vec3 c=texture2D(uTex,vUv).rgb*.2270;
  c+=(texture2D(uTex,vUv+uStep).rgb+texture2D(uTex,vUv-uStep).rgb)*.1945;
  c+=(texture2D(uTex,vUv+uStep*2.).rgb+texture2D(uTex,vUv-uStep*2.).rgb)*.1216;
  c+=(texture2D(uTex,vUv+uStep*3.).rgb+texture2D(uTex,vUv-uStep*3.).rgb)*.0541;
  c+=(texture2D(uTex,vUv+uStep*4.).rgb+texture2D(uTex,vUv-uStep*4.).rgb)*.0162;
  gl_FragColor=vec4(c,1.);
}`;
const BRIGHT_FS=`precision mediump float;varying vec2 vUv;uniform sampler2D uTex;uniform float uThreshold;
void main(){vec3 c=texture2D(uTex,vUv).rgb;float l=max(c.r,max(c.g,c.b));
  gl_FragColor=vec4(c*smoothstep(uThreshold,uThreshold+.4,l),1.);}`;
const MIX_FS=`precision mediump float;varying vec2 vUv;uniform sampler2D uA,uB;uniform float uKa,uKb;
void main(){gl_FragColor=vec4(texture2D(uA,vUv).rgb*uKa+texture2D(uB,vUv).rgb*uKb,1.);}`;
function compile(vs,fs){
  const p=gl.createProgram();
  for(const[type,src]of[[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){
    const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));
    gl.attachShader(p,s);
  }
  gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));
  const n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS),u={};
  for(let i=0;i<n;i++){const name=gl.getActiveUniform(p,i).name.replace('[0]','');u[name]=gl.getUniformLocation(p,name)}
  return{p,u};
}
function upload(data,layout,old,dynamic){
  if(old)gl.deleteBuffer(old.b);
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);
  const arr=data instanceof Float32Array?data:new Float32Array(data);
  gl.bufferData(gl.ARRAY_BUFFER,arr,dynamic?gl.DYNAMIC_DRAW:gl.STATIC_DRAW);
  return{b,layout,stride:layout.reduce((s,[,n])=>s+n,0)*4};
}
function bind(program,buffer){
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer.b);let off=0;
  for(const[name,size]of buffer.layout){
    const loc=gl.getAttribLocation(program.p,name);
    if(loc>=0){gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,buffer.stride,off)}
    off+=size*4;
  }
}
function build(){
  const{nodes,edges}=generate();const rand=seeded(SETTINGS.seed+1);
  const baseI=nodes.map(nd=>nd.intensity);
  const baseSize=nodes.map(nd=>nd.size);
  const baseHalo=nodes.map(nd=>nd.halo*SETTINGS.glow);
  const pts=[];
  for(const nd of nodes){
    // Rest a touch calmer; meet-brighten lifts clearly above initial when nodes cross.
    const rest=nd.blur<0?nd.intensity:nd.intensity*MEET_REST;
    pts.push(...nd.p,...nd.color,nd.size,rest,rand()*6.2832,nd.tier===3?1:0,nd.halo*SETTINGS.glow,nd.blur);
  }
  pointsData=new Float32Array(pts);
  meetBoost=new Float32Array(nodes.length);
  meetLastT=0;
  buf.points=upload(pointsData,[['aPos',3],['aColor',3],['aData',4],['aExtra',2]],buf.points,true);counts.points=nodes.length;
  const ln=[];
  for(const[i,j,v,meshLink]of edges){
    const a=nodes[i],b=nodes[j],s=rand()*6.2832;
    // Every mesh filament carries a fixed lit stretch of its own length and strength; inward links stay plain.
    const hi=meshLink?.5+rand()*1.3:0;
    const va=v*(.55+.45*a.intensity),vb=v*(.55+.45*b.intensity);
    // Two triangles per filament: (A-,A+,B-) and (B-,A+,B+).
    for(const[end,side]of[[0,-1],[0,1],[1,-1],[1,-1],[0,1],[1,1]])
      ln.push(...a.p,...b.p,end?vb:va,s,end,hi,side);
  }
  buf.lines=upload(ln,[['aA',3],['aB',3],['aData',4],['aSide',1]],buf.lines);counts.lines=edges.length*6;
  graph={nodes,baseI,baseSize,baseHalo};
}
/** Clear proximity flash: any live nodes that cross on screen brighten, then ease back slowly. */
function updateMeet(m,t){
  if(!graph||!pointsData||!meetBoost||!buf.points)return;
  const{nodes,baseI,baseSize,baseHalo}=graph;
  // Every drawn graph node (shell + fill + core) can meet — skip only background bokeh lights.
  const nCheck=SETTINGS.shellNodes+SETTINGS.fillNodes+SETTINGS.coreNodes;
  if(!meetScr||meetScr.length!==nCheck*3)meetScr=new Float32Array(nCheck*3);
  for(let i=0;i<nCheck;i++){
    const s=project(nodes[i].p,m);
    meetScr[i*3]=s[0];meetScr[i*3+1]=s[1];meetScr[i*3+2]=s[2];
  }
  // Slow time-based fade so the glow eases out over ~MEET_FADE seconds, not in a few frames.
  const dt=meetLastT?Math.min(.05,Math.max(0,t-meetLastT)):0;
  meetLastT=t;
  const fade=dt>0?Math.exp(-dt*(3.2/MEET_FADE)):1;
  for(let i=0;i<nCheck;i++){
    meetBoost[i]*=fade;
    if(meetBoost[i]<.008)meetBoost[i]=0;
  }
  // Generous meet window; soft depth weight (no hard cut) so more real passes register.
  const meetPx=52*dpr,meetPx2=meetPx*meetPx,depthSoft=1.35;
  // Grid so we don't miss pairs and stay cheap with ~780 nodes.
  const cell=meetPx,inv=1/cell,buckets=new Map();
  for(let i=0;i<nCheck;i++){
    const ai=i*3;
    if(meetScr[ai+2]<.8)continue;
    const cx=Math.floor(meetScr[ai]*inv),cy=Math.floor(meetScr[ai+1]*inv);
    const key=cx*73856093^cy*19349663;
    let arr=buckets.get(key);if(!arr)buckets.set(key,arr=[]);
    arr.push(i);
  }
  const seen=new Int32Array(nCheck);let seenId=1;
  for(const list of buckets.values()){
    for(const i of list){
      const ai=i*3,xi=meetScr[ai],yi=meetScr[ai+1],di=meetScr[ai+2];
      const bx=Math.floor(xi*inv),by=Math.floor(yi*inv);
      seenId++;if(seenId>1e8){seen.fill(0);seenId=1}
      for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){
        const others=buckets.get((bx+ox)*73856093^(by+oy)*19349663);if(!others)continue;
        for(const j of others){
          if(j<=i||seen[j]===seenId)continue;seen[j]=seenId;
          const aj=j*3,dz=Math.abs(di-meetScr[aj+2]);
          if(dz>depthSoft)continue;
          const dx=xi-meetScr[aj],dy=yi-meetScr[aj+1],d2=dx*dx+dy*dy;
          if(d2>=meetPx2)continue;
          const k=1-Math.sqrt(d2)/meetPx;
          // Floor so near-misses still flash; depth weight softens only false front/back hits.
          const lift=(.4+.6*Math.pow(k,.7))*(1-dz/depthSoft);
          if(lift>meetBoost[i])meetBoost[i]=lift;
          if(lift>meetBoost[j])meetBoost[j]=lift;
        }
      }
    }
  }
  for(let i=0;i<nCheck;i++){
    const b=meetBoost[i],o=i*POINT_STRIDE;
    pointsData[o+6]=baseSize[i]*(1+MEET_SIZE*b);
    pointsData[o+7]=baseI[i]*(MEET_REST+MEET_LIFT*b);
    pointsData[o+10]=baseHalo[i]*(1+MEET_HALO*b);
  }
  gl.bindBuffer(gl.ARRAY_BUFFER,buf.points.b);
  gl.bufferSubData(gl.ARRAY_BUFFER,0,pointsData);
}
function target(w,h){
  const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  for(const[k,v]of[[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);
  const fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  return{fb,tex,w,h};
}
function buildTargets(){
  for(const t of Object.values(fbo)){gl.deleteTexture(t.tex);gl.deleteFramebuffer(t.fb)}
  const W=canvas.width,H=canvas.height,hw=Math.max(2,W>>1),hh=Math.max(2,H>>1),qw=Math.max(2,W>>2),qh=Math.max(2,H>>2);
  fbo={near:target(W,H),far:target(W,H),scene:target(W,H),qa:target(qw,qh),qb:target(qw,qh),ha:target(hw,hh),hb:target(hw,hh)};
}
function init(){
  gl=canvas.getContext('webgl',{alpha:false,antialias:false,premultipliedAlpha:false,powerPreference:'high-performance'});
  if(!gl)return false;
  prog.sky=compile(SKY_VS,SKY_FS);prog.lines=compile(LINE_VS,LINE_FS);prog.points=compile(POINT_VS,POINT_FS);
  prog.blur=compile(QUAD_VS,BLUR_FS);prog.bright=compile(QUAD_VS,BRIGHT_FS);prog.mix=compile(QUAD_VS,MIX_FS);
  buf.sky=upload([-1,-1,3,-1,-1,3],[['aPos',2]]);
  view.maxPoint=gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)[1];
  return true;
}

/* ---------- Camera and composition ---------- */
// Angle round the orbit at time t. Everything that changes over time is read off this one value.
const orbit=t=>t*6.2832/SETTINGS.period+SETTINGS.phase;
function rotation(t){
  // The only motion in the scene: the camera orbits the sphere and swings up and down once per orbit,
  // locked to it, so the loop closes without a seam. The near face drifts right to left.
  const th=orbit(t),yaw=-th,pitch=SETTINGS.tilt*Math.sin(th),roll=0;
  const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch),cr=Math.cos(roll),sr=Math.sin(roll);
  // R = Rz(roll) * Rx(pitch) * Ry(yaw), column-major for GLSL.
  const m=[cy,sp*sy,-cp*sy, 0,cp,sp, sy,-sp*cy,cp*cy];
  return[cr*m[0]-sr*m[1],sr*m[0]+cr*m[1],m[2], cr*m[3]-sr*m[4],sr*m[3]+cr*m[4],m[5], cr*m[6]-sr*m[7],sr*m[6]+cr*m[7],m[8]];
}
function layout(){
  // Framed as the reference frames its sphere: its art box is the right 70% of the hero and 132% of its
  // height, and the sphere (centre 914,185, radius 729 in a 1440x1088
  // frame) is fitted to that box like `background-size: cover`. So the sphere is centred near the top,
  // bleeds off the top and right, and the headline sits on clear dark to its left.
  // Portrait tablets and phones (matching the portrait rules in style.css) stack instead: the sphere
  // sits above the copy, centred a little right of middle, and the copy reads on calm ground below it.
  let cx,cy,radius;
  if(h>w&&w<=1100){radius=Math.min(w*.58,h*.25);cx=w*.6;cy=h*.2}
  else{
    // On ultra-wide screens the scene is framed against the same centred 1792px stage as the page's
    // content container (style.css --container + gutters), so copy and sphere stay one composition.
    const sw=Math.min(w,1792),ox=(w-sw)/2;
    const bw=sw*.7,bh=h*1.32,s=Math.max(bw/1440,bh/1088);
    // The reference frames 729px to its nominal radius, but its outer shell sits at 0.8745 of that.
    cx=ox+(sw-bw)+(bw-1440*s)/2+914*s;cy=-h*.16+185*s;radius=729*s*.8745;
  }
  const D=SETTINGS.camDist;
  // Focal length that puts the outer shell, at the centre's depth, exactly `radius` px from the centre.
  Object.assign(view,{D,radius,f:2*radius*D/h,aspect:w/h,shift:[2*cx/w-1,1-2*cy/h],
    px:dpr*clamp(radius/485,.92,1.4)});
}
function project(p,m){
  const q=[m[0]*p[0]+m[3]*p[1]+m[6]*p[2],m[1]*p[0]+m[4]*p[1]+m[7]*p[2],m[2]*p[0]+m[5]*p[1]+m[8]*p[2]];
  const depth=view.D-q[2];
  return[((q[0]*view.f/view.aspect)/depth+view.shift[0]+1)*.5*w*dpr,((q[1]*view.f)/depth+view.shift[1]+1)*.5*h*dpr,depth];
}
function setCamera(u,m){
  gl.uniformMatrix3fv(u.uRot,false,m);gl.uniform1f(u.uDist,view.D);gl.uniform1f(u.uF,view.f);
  gl.uniform1f(u.uAspect,view.aspect);gl.uniform2fv(u.uShift,view.shift);
}
function setLayer(u,layer){
  gl.uniform1f(u.uLayer,layer);gl.uniform1f(u.uSplit,SETTINGS.split);gl.uniform1f(u.uFeather,SETTINGS.feather);
}
function drawGeometry(m,t,layer){
  // Filaments
  const lu=prog.lines.u;gl.useProgram(prog.lines.p);bind(prog.lines,buf.lines);setCamera(lu,m);setLayer(lu,layer);
  gl.uniform1f(lu.uLineAlpha,SETTINGS.lineAlpha);gl.uniform3fv(lu.uColor,SETTINGS.lineColor);
  gl.uniform1f(lu.uDpr,dpr);gl.uniform2f(lu.uRes,canvas.width,canvas.height);
  gl.drawArrays(gl.TRIANGLES,0,counts.lines);
  // Nodes
  const u=prog.points.u;gl.useProgram(prog.points.p);bind(prog.points,buf.points);setCamera(u,m);setLayer(u,layer);
  // Hubs breathe four times per full turn, read off the turn itself rather than a clock of their own.
  gl.uniform1f(u.uBreath,.85+.15*Math.sin(4*orbit(t)));gl.uniform1f(u.uUnit,view.f*h*dpr/2);
  gl.uniform1f(u.uPx,view.px);gl.uniform1f(u.uFocus,SETTINGS.focus);
  gl.uniform1f(u.uBokeh,SETTINGS.bokeh);gl.uniform1f(u.uBokehMax,SETTINGS.bokehMax);gl.uniform1f(u.uMaxSize,view.maxPoint);
  gl.drawArrays(gl.POINTS,0,counts.points);
}
function pass(program,dst,textures){
  gl.bindFramebuffer(gl.FRAMEBUFFER,dst?dst.fb:null);
  gl.viewport(0,0,dst?dst.w:canvas.width,dst?dst.h:canvas.height);
  gl.useProgram(program.p);bind(program,buf.sky);
  textures.forEach(([name,t],i)=>{gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,t.tex);gl.uniform1i(program.u[name],i)});
  gl.drawArrays(gl.TRIANGLES,0,3);
}
function blur(src,dst,dx,dy){
  gl.useProgram(prog.blur.p);gl.uniform2f(prog.blur.u.uStep,dx/dst.w,dy/dst.h);pass(prog.blur,dst,[['uTex',src]]);
}
function draw(t){
  const m=rotation(t);
  updateMeet(m,t);
  gl.disable(gl.DEPTH_TEST);
  // 1. The sharp front layer and the back layer, each into its own texture.
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.clearColor(0,0,0,1);
  for(const[layer,dst]of[[0,fbo.near],[1,fbo.far]]){
    gl.bindFramebuffer(gl.FRAMEBUFFER,dst.fb);gl.viewport(0,0,dst.w,dst.h);gl.clear(gl.COLOR_BUFFER_BIT);
    drawGeometry(m,t,layer);
  }
  gl.disable(gl.BLEND);
  // 2. Soften the back layer at quarter resolution: far filaments melt into a smoky haze.
  const r=SETTINGS.farBlur;
  blur(fbo.far,fbo.qa,r,0);blur(fbo.qa,fbo.qb,0,r);blur(fbo.qb,fbo.qa,r*1.7,0);blur(fbo.qa,fbo.qb,0,r*1.7);
  gl.useProgram(prog.mix.p);gl.uniform1f(prog.mix.u.uKa,1);gl.uniform1f(prog.mix.u.uKb,1.1);
  pass(prog.mix,fbo.scene,[['uA',fbo.near],['uB',fbo.qb]]);
  // 3. Bloom: the brightest light spills softly around lines, glints and nodes.
  gl.useProgram(prog.bright.p);gl.uniform1f(prog.bright.u.uThreshold,SETTINGS.bloomThreshold);
  pass(prog.bright,fbo.ha,[['uTex',fbo.scene]]);
  // A gentle spill only: nodes stay small points of light, not blown-out blobs.
  blur(fbo.ha,fbo.hb,1,0);blur(fbo.hb,fbo.ha,0,1);blur(fbo.ha,fbo.hb,2,0);blur(fbo.hb,fbo.ha,0,2);
  // 4. Black sky underneath, then scene and bloom added on top.
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,canvas.width,canvas.height);
  gl.useProgram(prog.sky.p);bind(prog.sky,buf.sky);
  gl.drawArrays(gl.TRIANGLES,0,3);
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);
  gl.useProgram(prog.mix.p);gl.uniform1f(prog.mix.u.uKa,1);gl.uniform1f(prog.mix.u.uKb,SETTINGS.bloom);
  pass(prog.mix,null,[['uA',fbo.scene],['uB',fbo.ha]]);
  gl.disable(gl.BLEND);
}
function resize(){
  const rect=canvas.getBoundingClientRect();
  const mobile=Math.min(rect.width,rect.height)<700;
  const nw=Math.max(1,rect.width),nh=Math.max(1,rect.height);
  const regen=!counts.points||(Math.min(w,h)<700)!==mobile;
  w=nw;h=nh;dpr=Math.min(window.devicePixelRatio||1,mobile?1.5:2);
  // Several full-screen passes run per frame, so very large canvases render at a capped resolution.
  dpr*=Math.min(1,Math.sqrt(SETTINGS.pixelBudget/(w*h*dpr*dpr)));
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
  buildTargets();
  if(regen)build();
  layout();draw(phase);
  // The canvas fades in only once it holds a real frame (see .is-ready in style.css).
  canvas.classList.add('is-ready');
}
function tick(ts){
  animation=requestAnimationFrame(tick);
  const dt=last?Math.min(.05,(ts-last)/1000):0;last=ts;
  phase+=dt;draw(phase);
}
// The loop is stopped outright rather than left spinning on a frame that returns early: an idle
// rAF still costs a callback every frame on the main thread while the hero is off-screen.
function start(){if(running)return;running=true;last=0;animation=requestAnimationFrame(tick)}
function stop(){if(!running)return;running=false;cancelAnimationFrame(animation)}
function sync(){(visible&&!document.hidden&&!mq.matches)?start():stop()}

try{
  if(init()){
    window.addEventListener('resize',resize,{passive:true});
    mq.addEventListener?.('change',()=>{draw(phase);sync()});
    document.addEventListener('visibilitychange',sync);
    // Rendering stops once the hero scrolls out of view, and resumes when it returns.
    new IntersectionObserver(([e])=>{visible=e.isIntersecting;sync()},{rootMargin:'120px'}).observe(canvas);
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();stop()});
    canvas.addEventListener('webglcontextrestored',()=>{counts={};fbo={};init();resize();sync()});
    window.addEventListener('pagehide',stop);
    resize();sync();
  }
}catch(err){console.error('Network background disabled:',err)}

  window.__spNetworkCleanup = function () {
    try { stop(); } catch (e) {}
    try { window.removeEventListener("resize", resize); } catch (e) {}
    try { document.removeEventListener("visibilitychange", sync); } catch (e) {}
    try { window.removeEventListener("pagehide", stop); } catch (e) {}
  };
};
