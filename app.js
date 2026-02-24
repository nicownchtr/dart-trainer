const canvas=document.getElementById("board");
const ctx=canvas.getContext("2d");

let size=Math.min(window.innerWidth*0.95,600);
canvas.width=size;
canvas.height=size;

const center=size/2;
const sectorAngle=(2*Math.PI)/20;
const rotationOffset=-Math.PI/2 - sectorAngle/2;

const official=[20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];

let assignments=new Array(20).fill(null);
let locked=new Array(20).fill(false);

let training=false;
let hardcore=false;
let hardcoreTargets=[];

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

  const base=i%2===0?"black":"white";
  const ring=i%2===0?"red":"green";

  if(training && assignments[i]===official[i]){
    ctx.save();
    ctx.shadowColor="rgba(0,150,255,1)";
    ctx.shadowBlur=50+20*Math.sin(pulse);
    drawSegment(radii.outer,0,start,end,"rgba(0,0,0,0.001)");
    ctx.restore();
  }

  drawSegment(radii.inner,0,start,end,base);
  drawSegment(radii.tripleOuter,radii.tripleInner,start,end,ring);
  drawSegment(radii.doubleOuter,radii.doubleInner,start,end,ring);

  if(assignments[i]){
    drawNumber(assignments[i],start,base);
  }

  if(training && !assignments[i]){
    drawGhost(official[i],start,base);
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
 ctx.fillStyle=base==="black"?"white":"black";
 ctx.font=center*0.08+"px Arial";
 ctx.fillText(num,x-10,y+8);
}

function drawGhost(num,start,base){
 const a=start+sectorAngle/2;
 const x=center+Math.cos(a)*center*0.7;
 const y=center+Math.sin(a)*center*0.7;
 ctx.globalAlpha=0.25;
 ctx.fillStyle=base==="black"?"white":"black";
 ctx.font=center*0.08+"px Arial";
 ctx.fillText(num,x-10,y+8);
 ctx.globalAlpha=1;
}

function drawSeparators(){
 ctx.strokeStyle="#333";
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
 ctx.fillStyle="green"; ctx.fill();
 ctx.beginPath();
 ctx.arc(center,center,radii.bullInner,0,2*Math.PI);
 ctx.fillStyle="red"; ctx.fill();
}

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
  num.draggable=true;

  num.ondragstart=e=>e.dataTransfer.setData("text",i);

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
  n.draggable=true;
  n.ondragstart=e=>e.dataTransfer.setData("text",num);
  slot.appendChild(n);
 }
}

canvas.ondragover=e=>e.preventDefault();

canvas.ondrop=e=>{
 e.preventDefault();
 const num=parseInt(e.dataTransfer.getData("text"));
 handlePlacement(num,e.clientX,e.clientY);
};

canvas.onclick=e=>{
 const rect=canvas.getBoundingClientRect();
 const x=e.clientX-rect.left-center;
 const y=e.clientY-rect.top-center;
 const sector=getSector(x,y);
 if(assignments[sector] && !locked[sector]){
  returnToList(assignments[sector]);
  assignments[sector]=null;
 }
};

function handlePlacement(num,clientX,clientY){
 const rect=canvas.getBoundingClientRect();
 const x=clientX-rect.left-center;
 const y=clientY-rect.top-center;
 const sector=getSector(x,y);

 if(locked[sector]) return;

 if(hardcore){
  if(official[sector]!==num){
   if(navigator.vibrate) navigator.vibrate(200);
   return;
  }
  locked[sector]=true;
 }

 assignments[sector]=num;
 removeFromList(num);
}

function getSector(x,y){
 const angle=Math.atan2(y,x);
 let adj=angle-rotationOffset;
 if(adj<0) adj+=2*Math.PI;
 return Math.floor(adj/sectorAngle);
}

trainingBtn.onclick=()=>{
 training=!training;
 trainingBtn.classList.toggle("active");
};

hardcoreBtn.onclick=()=>{
 hardcore=!hardcore;
 hardcoreBtn.classList.toggle("active");
 assignments.fill(null);
 locked.fill(false);
 if(hardcore){
  hardcoreTargets=[...official].sort(()=>0.5-Math.random()).slice(0,5);
  initNumbers();
  [...numbersDiv.children].forEach(s=>{
   if(!hardcoreTargets.includes(parseInt(s.dataset.value)))
    s.innerHTML="";
  });
 }else{
  initNumbers();
 }
};

resetBtn.onclick=()=>{
 assignments.fill(null);
 locked.fill(false);
 training=false;
 hardcore=false;
 trainingBtn.classList.remove("active");
 hardcoreBtn.classList.remove("active");
 initNumbers();
};

initNumbers();