/* The Delivery Control Ladder: level picker, plus light event tracking.
   Events go to an analytics tool only if one is installed; none is sent otherwise. */
(function(){
  window.cksTrack=function(ev,props){
    try{if(typeof window.plausible==='function')window.plausible(ev,props?{props:props}:undefined);}catch(e){}
    try{if(window.dataLayer)window.dataLayer.push(Object.assign({event:ev},props||{}));}catch(e){}
  };
  var LV={
    1:{t:'Reactive',h:'Problems become visible after damage.',d:'You find out when the next trade stops or the invoice arrives. Delivery depends on people firefighting.',s:'After the damage',a:'Firefight'},
    2:{t:'Managed',h:'Problems become visible through reporting, often late.',d:'You have reports and governance routines, but corrective decisions often arrive after the project has already drifted.',s:'In reports, after the drift',a:'Respond late'},
    3:{t:'Controlled',h:'Emerging gaps are identified and assigned.',d:'Scope, plan, decisions, vendor dates and cadence are actively managed, and an issue gets an owner before it grows.',s:'While the gap emerges',a:'Assign, decide and resolve'},
    4:{t:'Operational',h:'Problems are anticipated and corrected before impact.',d:'The team watches the signals that move first, so it can prevent a problem or recover before it lands.',s:'Before the impact',a:'Prevent or recover'},
    5:{t:'Scalable',h:'Control is consistent across projects and teams.',d:'The same system works when projects repeat and people change, so the team can anticipate and adapt.',s:'Early, across projects',a:'Anticipate and adapt consistently'}
  };
  function init(box){
    var panel=box.querySelector('.dcl-panel'),btns=[].slice.call(box.querySelectorAll('.dcl-step'));
    btns.forEach(function(b){
      b.addEventListener('click',function(){
        var n=b.getAttribute('data-level'),l=LV[n];
        btns.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false');});
        panel.innerHTML='<b class="dcl-h">'+l.t+': '+l.h+'</b><p>'+l.d+'</p><dl><div><dt>See</dt><dd>'+l.s+'</dd></div><div><dt>Act</dt><dd>'+l.a+'</dd></div></dl><p class="dcl-test">Think you&rsquo;re at this level? Test it.</p><a class="btn btn-navy dcl-start ac-pulse" href="/quiz">Start my Delivery Score</a>';
        cksTrack('ladder_level_selected',{level:n});
      });
    });
  }
  function ready(){
    [].forEach.call(document.querySelectorAll('[data-dcl]'),init);
    var s=document.querySelector('[data-track-view]');
    if(s&&'IntersectionObserver' in window){var o=new IntersectionObserver(function(e){if(e[0].isIntersecting){cksTrack(s.getAttribute('data-track-view'));o.disconnect();}});o.observe(s);}
    var bf=document.querySelector('form[name="contracks-call"]');if(bf)bf.addEventListener('submit',function(){cksTrack('review_enquiry_submitted');});
    [].forEach.call(document.querySelectorAll('[data-track]'),function(a){a.addEventListener('click',function(){cksTrack(a.getAttribute('data-track'));});});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();

/* Example scorecards: the score counts up and the five-C bars fill once, when the card scrolls into view,
   eased as on Ask Contracks. Final values stay in the HTML, so reduced motion or no JS shows them as they are. */
(function(){
  if(!('IntersectionObserver' in window))return;
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var ease=function(k){return 1-Math.pow(1-k,3);};
  function run(card){
    var bars=[].map.call(card.querySelectorAll('.dcl-bar'),function(b){var u=b.querySelector('u'),em=b.querySelector('em');return {u:u,em:em,to:parseFloat(u.style.width)||0};});
    var num=card.querySelector('.dcl-lvl b, .cr-score span'),ring=card.querySelector('.cr-score'),to=num?parseInt(num.textContent,10)||0:0;
    var set=function(k){
      bars.forEach(function(b){var v=Math.round(b.to*k);b.u.style.width=v+'%';if(b.em)b.em.textContent=v+'%';});
      if(num){var v=Math.round(to*k);num.textContent=v;if(ring)ring.style.background='conic-gradient(var(--gold) 0 '+v+'%,#EEF0F4 '+v+'% 100%)';}
    };
    set(0);
    var o=new IntersectionObserver(function(e){
      if(!e[0].isIntersecting)return;o.disconnect();
      var t0=performance.now();(function f(t){var k=Math.min(1,(t-t0)/1100);set(ease(k));if(k<1)requestAnimationFrame(f);else set(1);})(t0);
    },{threshold:.35});
    o.observe(card);
  }
  function ready(){[].forEach.call(document.querySelectorAll('.dcl-res, .cr-wrap .dcl-card'),function(c){if(c.querySelector('.dcl-bar'))run(c);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
