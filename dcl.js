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
        panel.innerHTML='<b class="dcl-h">'+l.t+': '+l.h+'</b><p>'+l.d+'</p><dl><div><dt>See</dt><dd>'+l.s+'</dd></div><div><dt>Act</dt><dd>'+l.a+'</dd></div></dl><p class="dcl-test">Think you&rsquo;re at this level? Test it.</p><a class="btn btn-navy dcl-start" href="/quiz">Get my Delivery Score &mdash; free &rarr;</a>';
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
