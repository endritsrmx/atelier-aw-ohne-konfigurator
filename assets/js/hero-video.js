(function(){var v=document.querySelector('.aw-hero-video');if(!v)return;
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var m=matchMedia('(max-width: 760px)').matches;
if(m)v.poster='assets/video/hero-poster-960.jpg';
v.src=m?v.dataset.srcMobile:v.dataset.src;v.muted=true;
v.addEventListener('playing',function(){v.classList.add('is-on')});
var p=v.play();if(p&&p.catch)p.catch(function(){});
document.addEventListener('visibilitychange',function(){document.hidden?v.pause():v.play().catch(function(){})});})();
