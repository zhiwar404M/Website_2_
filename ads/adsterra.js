/* Adsterra lightweight wrapper. Paste your real tags in /ads/adsterra-config.js */
(function(){
  const cfg = (window.ADSTERRA_TAGS || {});

  function injectRawHtml(targetEl, htmlString){
    if (!targetEl) return;
    targetEl.innerHTML = htmlString;
    // Executing inline scripts from third-party tags
    const scripts = targetEl.querySelectorAll('script');
    scripts.forEach(s => {
      const ns = document.createElement('script');
      Array.from(s.attributes).forEach(a => ns.setAttribute(a.name, a.value));
      ns.text = s.text;
      s.replaceWith(ns);
    });
  }

  function fill(slotId, tagName){
    const el = document.getElementById(slotId);
    if (!el) return;
    const tag = cfg[tagName];
    if (!tag) {
      // Do nothing here; app shim will add placeholder
      return;
    }
    injectRawHtml(el, tag);
  }

  function interstitial(){
    // If you have Adsterra Social Bar or Interstitial code, place here
    if (cfg.interstitial) {
      const temp = document.createElement('div');
      temp.style.display = 'none';
      document.body.appendChild(temp);
      injectRawHtml(temp, cfg.interstitial);
    }
  }

  window.Adsterra = { fill, interstitial };
})();