
/* Delivery Score page: illustrative live demos, adapted from the Ask Contracks quiz page. Decorative only:
   example values (each C 0, 33, 67 or 100; 9 Yes of 15 gives 60), nothing is scored or sent. */
(function(){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CS=['CONTAIN','COMMAND','CLOSE','CONFIRM','CONTROL'],VALS=[67,67,33,67,67],WEAK=2,SCORE=60;
  var col=function(v){return v<40?'#C0392B':v<70?'#C5A050':'#2D6A4F';};
  var band=function(v){return v<40?'Fragile':v<70?'Exposed':'Resilient';};
  var $=function(id){return document.getElementById(id);};
  var wait=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  function count(el,to,ms,fmt){return new Promise(function(r){if(reduce){el.textContent=fmt?fmt(to):to;return r();}var t0=performance.now();(function f(t){var k=Math.min(1,(t-t0)/ms),v=Math.round(to*(1-Math.pow(1-k,3)));el.textContent=fmt?fmt(v):v;k<1?requestAnimationFrame(f):r();})(t0);});}
  function ring(el,numEl,to,ms){return new Promise(function(r){var t0=performance.now();if(reduce){el.style.setProperty('--p',to);el.style.setProperty('--c',col(to));numEl.textContent=to;return r();}(function f(t){var k=Math.min(1,(t-t0)/ms),v=Math.round(to*(1-Math.pow(1-k,3)));el.style.setProperty('--p',v);el.style.setProperty('--c',col(v));numEl.textContent=v;k<1?requestAnimationFrame(f):r();})(t0);});}
  function onView(el,fn,keep){if(!el)return;if(!('IntersectionObserver' in window)){fn(true);return;}var o=new IntersectionObserver(function(e){if(e[0].isIntersecting){fn(true);if(!keep)o.disconnect();}else if(keep)fn(false);},{threshold:.35});o.observe(el);}
  function bars(box){box.innerHTML=CS.map(function(c,k){return '<div class="dbar" data-k="'+k+'"><span>'+c+'</span><i><u></u></i><b>0%</b></div>';}).join('');}

  /* 1. Steps + live demo loop */
  var demo=$('demo');
  if(demo){
    var steps=document.querySelectorAll('.how-step'),phases=demo.querySelectorAll('.dp'),running=false,loopId=0;
    var cfg=window.DELIVERY_SCORE_CONFIG,KEYS=['contain','command','close','confirm','control'],qs=KEYS.map(function(c){var q=cfg&&cfg.questions.filter(function(x){return x.c===c;})[0];return q?q.text:'';});
    bars($('dBars'));bars($('dBars2'));
    var show=function(p,step){phases.forEach(function(d){d.classList.toggle('on',+d.dataset.p===p);});steps.forEach(function(s,k){s.classList.toggle('on',k===step);});};
    var fill=function(box,anim){return Promise.all([].map.call(box.querySelectorAll('.dbar'),function(b,k){var u=b.querySelector('u');u.style.background=col(VALS[k]);u.style.width=VALS[k]+'%';return anim?count(b.querySelector('b'),VALS[k],900,function(v){return v+'%';}):(b.querySelector('b').textContent=VALS[k]+'%');}));};
    var reset=function(){demo.querySelectorAll('.drail u').forEach(function(u){u.style.width='0';});demo.querySelectorAll('.dbar u').forEach(function(u){u.style.width='0';});demo.querySelectorAll('.dbar b').forEach(function(b){b.textContent='0%';});demo.querySelectorAll('.dbar').forEach(function(b){b.classList.remove('weak');});demo.querySelectorAll('#dRep li').forEach(function(l){l.classList.remove('ok');});$('dPdf').classList.remove('on');$('dRing').style.setProperty('--p',0);$('dNum').textContent='0';};
    async function loop(id){
      while(running&&id===loopId){
        reset();show(0,0);
        for(var k=0;k<5&&running&&id===loopId;k++){
          $('dqC').textContent=CS[k];$('dqN').textContent='Question '+(k*3+1)+' of 15';$('dqT').textContent=qs[k];
          await wait(950);
          var hit=k===WEAK?$('dNo'):$('dYes');hit.classList.add('hit');
          demo.querySelectorAll('.drail u')[k].style.width='100%';
          await wait(420);hit.classList.remove('hit');
        }
        if(!running||id!==loopId)break;
        show(1,0);await ring($('dRing'),$('dNum'),SCORE,1300);$('dBand').textContent=band(SCORE);await wait(1300);
        if(!running||id!==loopId)break;
        show(2,1);await wait(250);await fill($('dBars'),true);await wait(1300);
        if(!running||id!==loopId)break;
        show(3,2);fill($('dBars2'),false);$('dBars2').querySelector('[data-k="'+WEAK+'"]').classList.add('weak');await wait(2600);
        if(!running||id!==loopId)break;
        show(4,3);var lis=demo.querySelectorAll('#dRep li');for(var i=0;i<lis.length;i++){await wait(550);lis[i].classList.add('ok');}
        await wait(450);$('dPdf').classList.add('on');await wait(2200);
      }
    }
    if(reduce){show(2,1);fill($('dBars'),false);}
    else onView(demo,function(v){if(v&&!running){running=true;loop(++loopId);}else if(!v){running=false;}},true);
  }

  /* 2. 5Cs bars */
  var cs=document.querySelector('.how-cs');
  onView(cs,function(){cs.querySelectorAll('.cbar u').forEach(function(u){var v=+u.dataset.v;u.style.background=col(v);u.style.width=v+'%';});cs.querySelectorAll('.cpct').forEach(function(e){count(e,+e.dataset.v,1100,function(v){return v+'%';});});});

  /* 3. FAQ counters */
  var st=document.querySelector('.how-stats');
  onView(st,function(){st.querySelectorAll('[data-count]').forEach(function(e){count(e,+e.dataset.count,1200);});
    var sw=$('sw'),swT=$('swT');count({set textContent(v){sw.style.setProperty('--p',v);}},100,1600);count(swT,240,1600,function(v){return Math.floor(v/60)+':'+String(v%60).padStart(2,'0');});});

  /* 4. Closing ring: Fragile 33 -> Exposed 60 -> Resilient 93 */
  var er=$('eRing');
  if(er){var seq=[33,60,93],n=0,on=false,id=0;
    var step=async function(my){while(on&&my===id){var v=seq[n%3];$('eBand').textContent=band(v);$('eBand').style.color=col(v);await ring(er,$('eNum'),v,1100);await wait(1700);n++;}};
    if(reduce){er.style.setProperty('--p',60);er.style.setProperty('--c',col(60));$('eNum').textContent=60;$('eBand').textContent='Exposed';}
    else onView(er,function(v){if(v&&!on){on=true;step(++id);}else if(!v){on=false;}},true);}
})();
