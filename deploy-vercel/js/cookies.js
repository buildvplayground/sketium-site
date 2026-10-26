/* ==========================================================================
   Aviso de cookies — LGPD (Lei 13.709/2018)
   Carregado em TODAS as páginas. Aviso informativo: as tags do GTM disparam
   desde o carregamento; o aviso só explica as finalidades e some no "Entendi".
   ========================================================================== */
(function () {
  'use strict';

  var CHAVE = 'cookie_notice';
  var banner = document.getElementById('cookies');
  if (!banner) return;
  var fins = document.getElementById('cookies-fins');
  var mais = document.getElementById('cookies-mais');
  var ok = document.getElementById('cookies-ok');
  var timer;

  function jaViu() {
    try { return localStorage.getItem(CHAVE) === 'ok'; } catch (e) { return false; }
  }
  function gravar() {
    try { localStorage.setItem(CHAVE, 'ok'); } catch (e) { /* modo privado */ }
  }

  function finalidades(abrir) {
    if (!fins || !mais) return;
    fins.hidden = !abrir;
    mais.setAttribute('aria-expanded', abrir ? 'true' : 'false');
  }

  function abrir(atraso) {
    clearTimeout(timer);
    banner.removeAttribute('hidden');
    requestAnimationFrame(function () {
      timer = setTimeout(function () { banner.classList.add('aberto'); }, atraso);
    });
  }

  function fechar() {
    clearTimeout(timer);
    banner.classList.remove('aberto');
    timer = setTimeout(function () { banner.setAttribute('hidden', ''); }, 500);
  }

  if (jaViu()) banner.setAttribute('hidden', '');
  else abrir(700);

  if (ok) ok.addEventListener('click', function () { gravar(); fechar(); });
  if (mais) mais.addEventListener('click', function () { finalidades(fins.hidden); });

  // Link "Cookies" do rodapé: reabre o aviso já com as finalidades abertas.
  [].forEach.call(document.querySelectorAll('[data-cookie-prefs]'), function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      finalidades(true);
      abrir(0);
      if (ok) ok.focus();
    });
  });
})();
