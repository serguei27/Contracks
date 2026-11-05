/* Library wall: shows the opening of an article, then asks for a name and email.
   Not access control: the full text stays in the page for search engines. */
(function(){
  var KEY='cks_library',GATES=['start','resolve','reshape','grow','control'];
  function member(){
    try{
      if(location.search.indexOf('lock')>-1){localStorage.removeItem(KEY);GATES.forEach(function(g){localStorage.removeItem('cks_gate_'+g);});return false;}
      if(localStorage.getItem(KEY)==='member')return true;
      return GATES.some(function(g){return localStorage.getItem('cks_gate_'+g)==='unlocked';});
    }catch(e){return false;}
  }
  if(member())return;
  var root=document.documentElement;root.classList.add('wall-locked');
  var css=document.createElement('style');
  css.textContent='html.wall-locked .cks-player,html.wall-locked .listen-bar,html.wall-locked .call-block{display:none!important}'
  +'.wall-hidden{display:none!important}'
  +'.wall-panel{position:relative;max-width:640px;margin:0 auto 64px;padding:32px;background:#0A1628;color:#fff;border-radius:18px;font-family:"DM Sans",system-ui,sans-serif}'
  +'.wall-panel::before{content:"";position:absolute;left:-60px;right:-60px;top:-131px;height:130px;background:linear-gradient(rgba(255,255,255,0),#fff);pointer-events:none}'
  +'.wall-panel .k{display:block;font-size:.72rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#D4B470;margin-bottom:10px}'
  +'.wall-panel h2{font-family:"Playfair Display",serif;font-size:1.8rem;line-height:1.2;color:#fff;margin:0 0 10px}'
  +'.wall-panel p{color:rgba(255,255,255,.8);font-size:1rem;line-height:1.55;margin:0 0 18px}'
  +'.wall-panel label{display:block;font-size:.86rem;font-weight:600;margin-bottom:12px}'
  +'.wall-panel input[type=text],.wall-panel input[type=email]{display:block;width:100%;box-sizing:border-box;margin-top:5px;padding:12px 14px;border:0;border-radius:10px;font:inherit;font-size:1rem;color:#0A1628;background:#fff}'
  +'.wall-panel .tick{display:flex;gap:10px;align-items:flex-start;font-weight:400;line-height:1.4}.wall-panel .tick input{margin-top:3px;flex:none}'
  +'.wall-panel button{width:100%;padding:14px;border:0;border-radius:999px;background:#C5A050;color:#0A1628;font:inherit;font-weight:700;font-size:1rem;cursor:pointer;margin-top:4px}'
  +'.wall-panel small{display:block;margin-top:12px;color:rgba(255,255,255,.65);font-size:.8rem;line-height:1.45}.wall-panel small a{color:#fff}'
  +'.wall-trap{position:absolute;left:-9999px}'
  +'@media(max-width:700px){.wall-panel{margin:0 16px 48px;padding:24px}.wall-panel::before{left:-16px;right:-16px}}';
  document.head.appendChild(css);
  function apply(){
    var body=document.querySelector('.article-body');
    if(!body){root.classList.remove('wall-locked');return;}
    var box=body,kids=[].slice.call(box.children);
    while(kids.length<4&&kids.length&&kids[0].children.length>3){box=kids[kids.length-1];kids=[].slice.call(box.children);}
    var total=0,len=kids.map(function(k){var n=k.textContent.trim().length;total+=n;return n;});
    var seen=0,cut=-1,fallback=-1;
    for(var i=0;i<kids.length;i++){
      var share=seen/total;
      if(fallback<0&&share>=.3&&i>0)fallback=i;
      if(cut<0&&share>=.22&&share<=.42&&/^H[23]$/.test(kids[i].tagName))cut=i;
      seen+=len[i];
    }
    if(cut<0)cut=fallback;
    if(cut<0){root.classList.remove('wall-locked');return;}
    /* keep a divider or heading out of the last visible line */
    while(cut>1&&(/^(HR)$/.test(kids[cut-1].tagName)||/divider/.test(kids[cut-1].className)))cut--;
    kids.slice(cut).forEach(function(k){k.classList.add('wall-hidden');});
    var panel=document.createElement('aside');panel.className='wall-panel';panel.id='wallPanel';
    panel.innerHTML='<span class="k">5Cs Knowledge Library</span><h2>Continue reading for free.</h2>'
    +'<p>Read this article in full, every article in the library and the five Special Reports, with narration.</p>'
    +'<form id="wallForm" name="library-access" method="POST"><label class="wall-trap">Leave empty <input type="text" name="bot-field" tabindex="-1" autocomplete="off"></label>'
    +'<label>Name<input type="text" name="name" required autocomplete="name"></label>'
    +'<label>Work email<input type="email" name="email" required autocomplete="email"></label>'
    +'<label class="tick"><input type="checkbox" name="keep_in_touch" value="yes"><span>Keep in touch: send me the Contracks Global newsletter.</span></label>'
    +'<button type="submit">Get free access &rarr;</button>'
    +'<small>Free. No payment. Unsubscribe at any time. See our <a href="/privacy.html">privacy policy</a>.</small></form>';
    body.parentNode.insertBefore(panel,body.nextSibling);
    function open(){
      try{localStorage.setItem(KEY,'member');GATES.forEach(function(g){localStorage.setItem('cks_gate_'+g,'unlocked');});}catch(e){}
      root.classList.remove('wall-locked');panel.remove();
      kids.forEach(function(k){k.classList.remove('wall-hidden');});
    }
    document.getElementById('wallForm').addEventListener('submit',function(e){
      e.preventDefault();var f=e.target,d=new URLSearchParams(new FormData(f));
      d.set('form-name','library-access');d.set('page',location.pathname);
      fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:d.toString()}).catch(function(){}).then(open);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();
