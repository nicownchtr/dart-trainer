const canvas=document.getElementById("board");
const ctx=canvas.getContext("2d");

let size=Math.min(window.innerWidth*0.95,600);
canvas.width=size;
canvas.height=size;

const isMobile = window.innerWidth < 768;

const center=size/2;
const sectorAngle=(2*Math.PI)/20;
const rotationOffset=-Math.PI/2 - sectorAngle/2;

const official=[20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];

let assignments=new Array(20).fill(null);
let locked=new Array(20).fill(false);

let training=false;
let hardcore=false;

let selectedNumber=null;
let pulse=0;

const radii={
 outer:center*0.95,
 doubleOuter:center*0.85,
 doubleInner:center*0.78,
 tripleOuter:center*0.60,
 tripleInner:center*0.53,
 inner:center*0.45,
 bullOuter:center*0.06,
 bullInner:center*0.03
};

function animate(){
 pulse+=0.05;
 draw();
 requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

function draw(){
 ctx.clearRect(0,0,size,size);

 for(let i=0;i<20;i++){
  const start=rotationOffset+i*sectorAngle;
  const end=start+sectorAngle;

  const baseColor=i%2===0?"#d6d6d6":"#bcbcbc"; // gris clair / gris plus foncé
  const ringColor=i%2===0?"#cc0000":"#008000";

  if(training && assignments[i]===official[i]){
   ctx.save();
   ctx.shadowColor="rgba(0,150,255,1)";
   ctx.shadowBlur=50+20*Math.sin(pulse);
   drawSegment(radii.outer,0,start,end,"rgba(0,0,0,0.001)");
   ctx.restore();
  }

  // alternance pleine zone centre → inner
  drawSegment(radii.inner,0,start,end,baseColor);

  // triple
  drawSegment(radii.tripleOuter,radii.tripleInner,start,end,ringColor);

  // entre inner et triple
  drawSegment(radii.tripleInner,radii.inner,start,end,baseColor);

  // double
  drawSegment(radii.doubleOuter,radii.doubleInner,start,end,ringColor);

  // entre triple et double
  drawSegment(radii.doubleInner,radii.tripleOuter,start,end,baseColor);

  if(assignments[i]){
   drawNumber(assignments[i],start,baseColor);
  }

  if(training && !assignments[i]){
   drawGhost(official[i],start,baseColor);
  }
 }

 drawSeparators();
 drawBull();
}

function drawSegment(outer,inner,start,end,color){
 ctx.beginPath();
 ctx.arc(center,center,outer,start,end);
 ctx.arc(center,center,inner,end,start,true);
 ctx.closePath();
 ctx.fillStyle=color;
 ctx.fill();
}

function drawNumber(num,start,base){
 const a=start+sectorAngle/2;
 const x=center+Math.cos(a)*center*0.7;
 const y=center+Math.sin(a)*center*0.7;

 ctx.fillStyle="#000";
 ctx.font=(isMobile?center*0.055:center*0.08)+"px Arial";
 ctx.fillText(num,x-10,y+8);
}

function drawGhost(num,start){
 const a=start+sectorAngle/2;
 const x=center+Math.cos(a)*center*0.7;
 const y=center+Math.sin(a)*center*0.7;

 ctx.globalAlpha=0.25;
 ctx.fillStyle="#000";
 ctx.font=(isMobile?center*0.055:center*0.08)+"px Arial";
 ctx.fillText(num,x-10,y+8);
 ctx.globalAlpha=1;
}

function drawSeparators(){
 ctx.strokeStyle="#777";
 for(let r of [radii.doubleOuter,radii.doubleInner,radii.tripleOuter,radii.tripleInner,radii.bullOuter]){
  ctx.beginPath();
  ctx.arc(center,center,r,0,2*Math.PI);
  ctx.stroke();
 }
 for(let i=0;i<20;i++){
  const a=rotationOffset+i*sectorAngle;
  ctx.beginPath();
  ctx.moveTo(center,center);
  ctx.lineTo(center+Math.cos(a)*radii.outer,
             center+Math.sin(a)*radii.outer);
  ctx.stroke();
 }
}

function drawBull(){
 ctx.beginPath();
 ctx.arc(center,center,radii.bullOuter,0,2*Math.PI);
 ctx.fillStyle="#008000"; ctx.fill();
 ctx.beginPath();
 ctx.arc(center,center,radii.bullInner,0,2*Math.PI);
 ctx.fillStyle="#cc0000"; ctx.fill();
}

function getSector(x,y){
 const angle=Math.atan2(y,x);
 let adj=angle-rotationOffset;
 if(adj<0) adj+=2*Math.PI;
 return Math.floor(adj/sectorAngle);
}

canvas.addEventListener("click",e=>{
 const rect=canvas.getBoundingClientRect();
 const x=e.clientX-rect.left-center;
 const y=e.clientY-rect.top-center;

 const sector=getSector(x,y);

 if(selectedNumber!==null){
  if(hardcore && official[sector]!==selectedNumber){
   if(navigator.vibrate) navigator.vibrate(200);
   return;
  }
  assignments[sector]=selectedNumber;
  removeFromList(selectedNumber);
  selectedNumber=null;
  return;
 }

 if(assignments[sector]){
  returnToList(assignments[sector]);
  assignments[sector]=null;
 }
});

const numbersDiv=document.getElementById("numbers");

function initNumbers(){
 numbersDiv.innerHTML="";
 for(let i=1;i<=20;i++){
  const slot=document.createElement("div");
  slot.className="slot";
  slot.dataset.value=i;

  const num=document.createElement("div");
  num.className="number";
  num.textContent=i;

  num.onclick=()=>{
   selectedNumber=i;
   document.querySelectorAll(".number").forEach(n=>n.style.background="#eee");
   num.style.background="#00aaff";
  };

  slot.appendChild(num);
  numbersDiv.appendChild(slot);
 }
}

function removeFromList(num){
 const slot=[...numbersDiv.children].find(s=>s.dataset.value==num);
 if(slot) slot.innerHTML="";
}

function returnToList(num){
 const slot=[...numbersDiv.children].find(s=>s.dataset.value==num);
 if(slot && slot.children.length===0){
  const n=document.createElement("div");
  n.className="number";
  n.textContent=num;
  n.onclick=()=>{
   selectedNumber=num;
   document.querySelectorAll(".number").forEach(n=>n.style.background="#eee");
   n.style.background="#00aaff";
  };
  slot.appendChild(n);
 }
}

trainingBtn.onclick=()=>{
 training=!training;
 trainingBtn.classList.toggle("active");
};

hardcoreBtn.onclick=()=>{
 hardcore=!hardcore;
 hardcoreBtn.classList.toggle("active");
 assignments.fill(null);
 initNumbers();
};

resetBtn.onclick=()=>{
 assignments.fill(null);
 training=false;
 hardcore=false;
 selectedNumber=null;
 trainingBtn.classList.remove("active");
 hardcoreBtn.classList.remove("active");
 initNumbers();
};

initNumbers();
