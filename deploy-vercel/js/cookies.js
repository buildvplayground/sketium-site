/* ==========================================================================
   Banner de cookies — LGPD (Lei 13.709/2018)
   Carregado em TODAS as páginas. O consentimento emite evento no dataLayer
   para que as tags (GTM/GA4/Pixel) só disparem depois do aceite.
   ========================================================================== */
(function () {
  'use strict';

  var CHAVE = 'sketium_cookies_v1';
  var banner = document.getElementById('cookies');
  if (!banner) return;

  window.dataLayer = window.dataLayer || [];

  function lerEscolha() {
    try { return localStorage.getItem(CHAVE); } catch (e) { return null; }
  }
  function gravarEscolha(v) {
    try { localStorage.setItem(CHAVE, v); } catch (e) { /* modo privado */ }
  }

  function emitir(estado) {
    window.dataLayer.push({
      event: 'cookie_consent',
      cookie_consent: estado,                    // 'aceito' | 'recusado'
      analytics_storage: estado === 'aceito' ? 'granted' : 'denied',
      ad_storage: estado === 'aceito' ? 'granted' : 'denied'
    });
  }

  function fechar() {
    banner.classList.remove('aberto');
    setTimeout(function () { banner.setAttribute('hidden', ''); }, 500);
  }

  function decidir(estado) {
    gravarEscolha(estado);
    emitir(estado);
    fechar();
  }

  var jaEscolheu = lerEscolha();
  if (jaEscolheu) {
    // Reemite a cada carga para que as tags conheçam o estado do consentimento.
    emitir(jaEscolheu);
    banner.setAttribute('hidden', '');
  } else {
    banner.removeAttribute('hidden');
    requestAnimationFrame(function () {
      setTimeout(function () { banner.classList.add('aberto'); }, 700);
    });
  }

  var aceitar = document.getElementById('cookies-aceitar');
  var recusar = document.getElementById('cookies-recusar');
  if (aceitar) aceitar.addEventListener('click', function () { decidir('aceito'); });
  if (recusar) recusar.addEventListener('click', function () { decidir('recusado'); });
})();
