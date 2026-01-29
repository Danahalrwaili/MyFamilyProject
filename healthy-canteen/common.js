
const $ = (s, r=document)=>r.querySelector(s);
const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));

// Fusha-only manifest
const AUDIO_MANIFEST_URL = 'assets/audio/manifest.fusha.json';
let audioManifest = null;
let audioCache = new Map();
let currentVoiceAudio = null;

async function loadManifest(){ if(audioManifest) return audioManifest; const res = await fetch(AUDIO_MANIFEST_URL); audioManifest = await res.json(); return audioManifest; }
async function playClip(key, {vol=1.0}={}){
  const man = await loadManifest();
  const file = man.clips[key];
  if(!file) return;

  const url = `assets/audio/fusha/${file}`;

  try {
    const a = audioCache.get(url) || new Audio(url);
    a.volume = vol;
    a.currentTime = 0;
    audioCache.set(url,a);

    // ⬅️ احفظ آخر صوت سؤال
    currentVoiceAudio = a;

    await a.play();
  } catch(e){ }
}

const SFX = { click: ()=>playClip('click',{vol:0.8}), correct: ()=>playClip('correct',{vol:0.95}), wrong: ()=>playClip('wrong',{vol:0.95}), applause: ()=>playClip('applause',{vol:1.0}) };
const celebrationSound = new Audio('assets/audio/confetti.mpeg');
celebrationSound.volume = 1;

const VO  = {
  promptLettersPos: ()=>playClip('prompt_letters_pos'),
  promptLettersOrder: ()=>playClip('prompt_letters_order'),
  promptAnimalsName: ()=>playClip('prompt_animals_name'),
  promptAnimalsLetter: ()=>playClip('prompt_animals_letter'),
  promptNumbersMatch: ()=>playClip('prompt_numbers_match'),
  good: ()=>playClip('good_job'), great: ()=>playClip('great'), tryAgain: ()=>playClip('try_again'),
  word: (k)=>playClip(k), animal: (k)=>playClip(k)
};

function renderStars(score=0, outOf=5){ const d=document.createElement('div'); d.className='stars'; for(let i=0;i<outOf;i++){ const s=document.createElement('span'); s.className='star'+(i<score?' on':''); d.appendChild(s);} return d; }
function showResultModal(score, onRestart) {
    const modalEl = document.getElementById('resultModal');
    const body = modalEl.querySelector('.modal-body');
    body.innerHTML = '';

    // ⭐ عرض النجوم فوق إغلاق الـ Modal
    const stars = renderStars(score, 5);
    stars.style.display = 'flex';
    stars.style.justifyContent = 'center';
    stars.style.marginBottom = '10px';
    body.appendChild(stars);

    // 🖼 إضافة الصورة
    const img = document.createElement('img');
    img.src = 'image/congrats.jpeg'; // حطي رابط الصورة اللي تبينه
    img.alt = 'تهانينا';
    img.style.display = 'block';
    img.style.margin = '0 auto';
    img.style.width = '180px'; // ممكن تعدلي الحجم
    body.appendChild(img);

    // ✨ إضافة النص تحت الصورة
    const p = document.createElement('p');
    p.className = 'text-center mt-3';
    p.textContent = 'عَمَلٌ رَائِعٌ أَحْسَنْتْ';
    p.style.color = '#F1C40F';
    p.style.fontSize = '1.3rem';
    p.style.fontWeight = 'bold';
    body.appendChild(p);

    // 🟢 زر إعادة اللعب
    if (onRestart) modalEl.querySelector('.btn-restart').onclick = onRestart;

    const m = new bootstrap.Modal(modalEl);
    m.show();
    launchConfetti();
    celebrationSound.currentTime = 0;
    celebrationSound.play();

    SFX.applause();

}
function launchConfetti() {
  setupConfettiCanvas();

  const myConfetti = confetti.create(confettiCanvas, {
    resize: true,
    useWorker: true
  });

  const duration = 2000;
  const end = Date.now() + duration;

  (function frame() {
    myConfetti({
      particleCount: 8,
      spread: 80,
      startVelocity: 35,
      origin: { y: 0.3 }
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}


function setProgress(el,c,t){ const bar=el.querySelector('.bar'); const pct=Math.max(0,Math.min(100,Math.round((c/t)*100))); bar.style.width=pct+'%'; }
function shuffle(arr){return arr.map(v=>[Math.random(),v]).sort((a,b)=>a[0]-b[0]).map(v=>v[1]);}

// Expose
window.SFX = SFX; window.VO = VO;
async function preloadAudio(keys=[]){
  const man = await loadManifest();
  keys.forEach(k=>{
    const file = man.clips[k];
    if(!file) return;
    const url = `assets/audio/fusha/${file}`;
    if(!audioCache.has(url)){
      const a = new Audio(url);
      a.preload = 'auto';
      audioCache.set(url,a);
    }
  });
}
let confettiCanvas = null;

function setupConfettiCanvas() {
  if (confettiCanvas) return;

  confettiCanvas = document.createElement('canvas');
  confettiCanvas.style.position = 'fixed';
  confettiCanvas.style.top = 0;
  confettiCanvas.style.left = 0;
  confettiCanvas.style.width = '100%';
  confettiCanvas.style.height = '100%';
  confettiCanvas.style.pointerEvents = 'none';
  confettiCanvas.style.zIndex = 9999; // 👈 أعلى من الـ modal

  document.body.appendChild(confettiCanvas);
}

window.preloadAudio = preloadAudio;
function stopQuestionAudio(){
  if(currentVoiceAudio){
    currentVoiceAudio.pause();
    currentVoiceAudio.currentTime = 0;
  }
}
window.stopQuestionAudio = stopQuestionAudio;
