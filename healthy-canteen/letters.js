document.addEventListener('DOMContentLoaded', () => { 
  initGame1(); 
  initGame2(); 
});

function letterForm(letter,pos){
  if(pos==='start')return letter+'ـ';
  if(pos==='middle')return 'ـ'+letter+'ـ';
  if(pos==='end')return 'ـ'+letter;
  return letter;
}

function initGame1(){

  let repeatTimer = null;
  let answered = false;

  const rounds = [
    {
      question: 'اختر الحرف المُناسب للكلمه التاليه : ',
      image: 'image/grandpa.jpeg',
      word: ' ... ــدّي ',
      letter: 'جَــ',
      options: ['جُــ', 'جِــ', 'جَــ'],
      correct: 'جَــ',
      audio: 'grandpa'
    },
    {
      question: ' اختر اسم الإشارة المناسب للجمله التاليه :',
      image: 'image/sister.jpg',
      word: '.... هي أختي',
      letter: 'هذه',
      options: ['هذا', 'هذه', 'هذان'],
      correct: 'هذه',
      audio: 'sister'
    },
    {
      question: 'اختر حرف المد المناسب للجمله التاليه : ',
      image: 'image/father.jpg',
      word: ' أبــ ... ',
      letter: 'ـي',
      options: ['ـي', 'ا', 'و'],
      correct: 'ـي',
      audio: 'father'
    },
    {
      question: 'اختر اسم الإشارة المناسب للجمله التاليه : ',
      image: 'image/brother.jpg',
      word: ' .... أخي صخر ',
      letter: 'هذا',
      options: ['هذان', 'هذا', 'هذه'],
      correct: 'هذا',
      audio: 'brother'
    },
    {
      question: ' اختر حرف المد المناسب للكلمه التاليه : ',
      image: 'image/myfamily.jpeg',
      word: 'أسرتـ ...',
      letter: 'ـي',
      options: ['و', 'ا', 'ـي'],
      correct: 'ـي',
      audio: 'family'
    }
  ];

  function playQuestionAudio(key){
    if(!key) return;

    answered = false;

    VO.word(key);

    clearTimeout(repeatTimer);
    repeatTimer = setTimeout(function repeat(){
      if(!answered){
        VO.word(key);
        repeatTimer = setTimeout(repeat, 5000);
      }
    }, 5000);
  }

  let step=0,score=0,total=rounds.length;
  const wordEl=$('#g1-word');
  const buttonsWrap=$('#g1-options');
  const prog=$('#g1 .progress-small');

  preloadAudio([
  'grandpa',
  'sister',
  'father',
  'brother',
  'family',
  'good_job',
  'try_again'
]);


  function render(){
    const r = rounds[step];

    const qEl = document.getElementById('g1-question');
    const imgEl = document.getElementById('g1-image');

    qEl.textContent = r.question;
    qEl.style.color = 'rgb(199, 89, 5)';

    if (r.image) {
      imgEl.src = r.image;
      imgEl.style.display = 'inline-block';
      imgEl.style.borderColor = 'rgb(199, 89, 5)';
    } else {
      imgEl.style.display = 'none';
    }

    wordEl.innerHTML = highlightLetter(r.word, r.letter);
    wordEl.style.color = 'rgb(199, 89, 5)';

    buttonsWrap.innerHTML = r.options.map(opt => `
      <div class="col-auto d-flex justify-content-center mb-2">
        <button class="btn option-btn" data-value="${opt}">
          ${opt}
        </button>
      </div>
    `).join('');

    // 🔊 تشغيل صوت السؤال
    playQuestionAudio(r.audio);

    $$('#g1-options .option-btn').forEach(btn =>
      btn.addEventListener('click', () => {

        answered = true;
        clearTimeout(repeatTimer);
        stopQuestionAudio();

        SFX.click();

        if (btn.dataset.value === r.correct) {
          btn.classList.add('correct');
          score++;
          SFX.correct();
          VO.good();
        } else {
          btn.classList.add('wrong');
          SFX.wrong();
          VO.tryAgain();
        }

        const delay = (btn.dataset.value === r.correct) ? 1500 : 1800;
        
        setTimeout(() => {
          step++;
          if (step < total) {
            setProgress(prog, step, total);
            render();
          } else {
            setProgress(prog, total, total);
            showResultModal(score, () => {
              step = 0;
              score = 0;
              setProgress(prog, 0, total);
              render();
            });
  }
}, delay);

      })
    );

    setProgress(prog, step, total);
  }

  function highlightLetter(word,letter){
    const idx=word.indexOf(letter);
    if(idx===-1)return word;
    return [...word].map((ch,i)=>
      i===idx ? `<span class="fw-bold text-primary">${ch}</span>` : ch
    ).join('');
  }

  render();
}
