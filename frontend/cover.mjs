// Cover effects are independent from the story UI and require no third-party runtime.
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
export async function openCover(){
 const cover=document.getElementById('intro');
 if(cover.hidden||reduced()||!cover.animate)return;
 const motion=cover.animate([
  {transform:'perspective(1500px) rotateY(0)',opacity:1,filter:'brightness(1)'},
  {transform:'perspective(1500px) rotateY(-12deg) translateX(-3%)',opacity:.85,filter:'brightness(1.4)',offset:.5},
  {transform:'perspective(1500px) rotateY(-28deg) translateX(-12%)',opacity:0,filter:'brightness(1.8)'}
 ],{duration:650,easing:'cubic-bezier(.5,0,.2,1)',fill:'forwards'});
 try{await motion.finished;}finally{motion.cancel();}
}
export function setupCover(){
 const cover=document.getElementById('intro');let frame=0;
 cover.addEventListener('pointermove',e=>{if(reduced()||e.pointerType==='touch'||cover.hidden)return;cancelAnimationFrame(frame);const r=cover.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;frame=requestAnimationFrame(()=>{cover.style.setProperty('--light-x',`${x*100}%`);cover.style.setProperty('--light-y',`${y*100}%`);cover.style.setProperty('--map-x',`${(x-.5)*9}px`);cover.style.setProperty('--map-y',`${(y-.5)*7}px`);});});
 cover.addEventListener('pointerleave',()=>{cancelAnimationFrame(frame);cover.style.removeProperty('--light-x');cover.style.removeProperty('--light-y');cover.style.removeProperty('--map-x');cover.style.removeProperty('--map-y');});
}
