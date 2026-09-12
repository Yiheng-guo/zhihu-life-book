const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let audio,enabled=false,frame=0,last=0,stage=0,pulse=0;
const canvas=document.getElementById('particles'),ctx=canvas.getContext('2d');
let width=0,height=0,points=[];
function resize(){width=innerWidth;height=innerHeight;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=width*dpr;canvas.height=height*dpr;canvas.style.width=width+'px';canvas.style.height=height+'px';ctx.setTransform(dpr,0,0,dpr,0,0);points=Array.from({length:width<760?18:36},()=>({x:Math.random()*width,y:Math.random()*height,r:Math.random()*1.2+.4,v:Math.random()*.22+.08,p:Math.random()*6.28}));}
function draw(time=0){frame=0;if(document.hidden||reduced.matches)return;if(time-last<33){frame=requestAnimationFrame(draw);return;}last=time;ctx.clearRect(0,0,width,height);pulse*=.93;
 for(const p of points){p.y-=p.v;p.x+=Math.sin(time*.0002+p.p)*.12;if(p.y<-5)p.y=height+5;if(pulse>.02){p.x+=(width*(.35+stage*.1)-p.x)*pulse*.012;}const opacity=.18+.15*Math.sin(time*.0008+p.p);ctx.fillStyle=`rgba(150,192,244,${opacity})`;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}
 frame=requestAnimationFrame(draw);
}
function resume(){cancelAnimationFrame(frame);frame=0;if(reduced.matches){ctx.clearRect(0,0,width,height);return;}if(!document.hidden)frame=requestAnimationFrame(draw);}
function tone(freq,start,duration,volume=.05){if(!enabled||!audio)return;const osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.value=freq;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(volume,start+.025);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);osc.connect(gain).connect(audio.destination);osc.start(start);osc.stop(start+duration+.05);}
export function sound(kind){if(!enabled||!audio)return;const t=audio.currentTime;if(kind==='source'){tone(523.25,t,.25,.035);tone(783.99,t+.065,.35,.027);}else if(kind==='ending'){[261.63,329.63,392,523.25].forEach((f,i)=>tone(f,t+i*.15,1.8,.024));}else if(kind==='choose'){tone(220,t,.35,.027);tone(440,t+.08,.4,.023);}else {tone(329.63,t,.5,.025);tone(493.88,t+.09,.6,.02);}}
export function arrive(index,kind='page'){stage=index;pulse=1;sound(kind);const el=document.getElementById(kind==='ending'?'ending':'scene');el.classList.remove('scene-arrive');void el.offsetWidth;el.classList.add('scene-arrive');}
export function setupExperience(){resize();resume();addEventListener('resize',resize);document.addEventListener('visibilitychange',resume);reduced.addEventListener('change',resume);
 document.getElementById('soundBtn').onclick=async()=>{try{if(!audio)audio=new(window.AudioContext||window.webkitAudioContext)();enabled=!enabled;if(enabled){await audio.resume();sound('source');}else await audio.suspend();document.getElementById('soundBtn').setAttribute('aria-pressed',String(enabled));document.getElementById('soundLabel').textContent=enabled?'声音已开启':'开启声音';}catch{enabled=false;document.getElementById('soundLabel').textContent='声音暂不可用';}};
}
