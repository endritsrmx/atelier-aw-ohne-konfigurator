(function(){
  var root=document.querySelector('.sl'); if(!root) return;
  var slides=[].slice.call(root.querySelectorAll('.sl-slide'));
  var tabs=[].slice.call(root.querySelectorAll('.sl-tab'));
  var stage=root.querySelector('.sl-stage');
  var DUR=7000, cur=0, timer=null, t0=0, left=DUR, paused=false, inView=false, raf=null;
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function bar(i){return tabs[i].querySelector('.sl-bar span');}
  function show(i,user){
    i=(i+slides.length)%slides.length;
    slides.forEach(function(s,k){var on=k===i;s.classList.toggle('is-active',on);if(on){s.removeAttribute('aria-hidden');s.removeAttribute('inert');}else{s.setAttribute('aria-hidden','true');s.setAttribute('inert','');}});
    tabs.forEach(function(t,k){t.classList.toggle('is-active',k===i);t.classList.toggle('is-done',k<i);if(k===i)t.setAttribute('aria-current','true');else t.removeAttribute('aria-current');bar(k).style.transform='';});
    var nx=slides[(i+1)%slides.length].querySelector('img'); if(nx) nx.loading='eager';
    cur=i; left=DUR; restart();
  }
  function tick(){
    if(paused||!inView){raf=null;return;}
    var el=performance.now()-t0, p=Math.min(1,(DUR-left+el)/DUR);
    bar(cur).style.transform='scaleX('+p+')';
    if(p>=1){show(cur+1);return;}
    raf=requestAnimationFrame(tick);
  }
  function restart(){ if(raf){cancelAnimationFrame(raf);raf=null;} t0=performance.now(); if(!paused&&inView) raf=requestAnimationFrame(tick); }
  function pause(){ if(paused) return; paused=true; if(raf){left-=performance.now()-t0;cancelAnimationFrame(raf);raf=null;} }
  function resume(){ if(!paused) return; paused=false; restart(); }
  tabs.forEach(function(t){t.addEventListener('click',function(){show(+t.getAttribute('data-go'),true);});});
  root.querySelector('.sl-prev').addEventListener('click',function(){show(cur-1,true);});
  root.querySelector('.sl-next').addEventListener('click',function(){show(cur+1,true);});
  root.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){show(cur+1,true);}else if(e.key==='ArrowLeft'){show(cur-1,true);}});
  var sx=null,sy=null;
  stage.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;sy=e.touches[0].clientY;},{passive:true});
  stage.addEventListener('touchend',function(e){if(sx===null)return;var dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3){show(cur+(dx<0?1:-1),true);}sx=null;},{passive:true});
  inView=true; restart();
  document.addEventListener('visibilitychange',function(){ if(document.hidden) pause(); else resume(); });
  function fromHash(h){ for(var k=0;k<slides.length;k++){ if('#'+slides[k].id===h){ show(k,true); return true; } } return false; }
  document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="#geschichte-"]'); if(!a) return; var h=a.getAttribute('href'); if(fromHash(h)){ e.preventDefault(); var top=root.closest('section').getBoundingClientRect().top+window.pageYOffset-(parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hd'))||72); window.scrollTo({top:top,behavior:reduce?'auto':'smooth'}); history.replaceState(null,'',h);} });
  if(location.hash) fromHash(location.hash);
  slides.forEach(function(s,k){ if(k!==cur) s.setAttribute('inert',''); });
})();
