/* ==========================================================================
   Sketium Engenharia — app.js
   Motor de movimento próprio (sem dependências) + UI.
   Segue sistema-de-movimento.md: gate data-motion, reveal em 3 camadas de
   gatilho, scroll-behavior:auto, lerp só em ponteiro fino, reduced-motion off.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Constantes de negócio ---------- */
  var WHATSAPP = '5562993188227';   // número real (portfólio oficial)
  var WA_TEXTO = 'Olá! Vim pelo site da Sketium Engenharia e gostaria de solicitar um orçamento.';

  var reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };

  /* ======================================================================
     1. Gate do movimento
     ====================================================================== */
  if (!reduzirMovimento) {
    document.documentElement.setAttribute('data-motion', 'on');
    // Rede de segurança: se algo falhar, o conteúdo aparece de qualquer forma.
    setTimeout(function () {
      $$('[data-reveal]:not(.visivel)').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 1.2) el.classList.add('visivel');
      });
    }, 2600);
  }

  /* ======================================================================
     1b. Loader — sai no load; o CSS garante a saída mesmo sem JS
     ====================================================================== */
  (function () {
    var loader = document.getElementById('loader');
    if (!loader) return;
    var sair = function () { loader.classList.add('saiu'); };
    if (reduzirMovimento) { sair(); return; }
    if (document.readyState === 'complete') setTimeout(sair, 260);
    else window.addEventListener('load', function () { setTimeout(sair, 260); });
    setTimeout(sair, 2400);           // teto absoluto
  })();

  /* ======================================================================
     2. WhatsApp — número centralizado numa constante
     ====================================================================== */
  $$('[data-wa-btn]').forEach(function (btn) {
    var origem = btn.getAttribute('data-wa-btn') || '';
    var texto = WA_TEXTO + (origem ? ' (' + origem + ')' : '');
    btn.setAttribute('href', 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto));
    btn.setAttribute('target', '_blank');
    btn.setAttribute('rel', 'noopener');
  });

  /* ======================================================================
     3. Movimento — títulos em máscara, reveals e barra de leitura
     ====================================================================== */

  /* --- 3.1 Títulos palavra a palavra ---------------------------------- */
  /* Só títulos de texto puro. Com <strong>, <br> ou ícone dentro, não mexe —
     quebrar a marcação sairia mais caro que o efeito. Divide apenas em espaço
     normal: o &nbsp; de "grande porte" tem que continuar inseparável. */
  function dividirTitulo(h) {
    if (h.children.length) return false;
    var texto = h.textContent;
    if (!texto.trim() || texto.length > 160) return false;
    var partes = texto.split(' ');
    h.textContent = '';
    partes.forEach(function (palavra, i) {
      var span = document.createElement('span');
      span.className = 'pal';
      var it = document.createElement('i');
      it.textContent = palavra;
      span.appendChild(it);
      h.appendChild(span);
      if (i < partes.length - 1) h.appendChild(document.createTextNode(' '));
    });
    // stagger de 42ms por palavra
    Array.prototype.forEach.call(h.querySelectorAll('.pal > i'), function (it, i) {
      it.style.transitionDelay = Math.min(i, 14) * 42 + 'ms';
    });
    return true;
  }

  if (!reduzirMovimento) {
    $$('main h1, main h2').forEach(function (h) {
      var alvo = h.closest('[data-reveal]');
      // Uma ideia de movimento por bloco: onde o bloco já entra lateralmente
      // (data-rv), o título NÃO é dividido — senão os dois movimentos somam.
      if (alvo && alvo.hasAttribute('data-rv')) return;
      if (!dividirTitulo(h)) return;
      // o bloco em volta só faz fade: é o texto que carrega o movimento
      if (alvo) alvo.setAttribute('data-reveal', 'soft');
      else h.setAttribute('data-reveal', 'soft');
    });
  }

  /* --- 3.2 Reveals ---------------------------------------------------- */
  var alvos = $$('[data-reveal], .filete[data-desenha], .timeline');
  $$('.timeline').forEach(function (t) { t.setAttribute('data-linha', ''); });

  // Stagger automático entre irmãos diretos (índice x 80ms, teto de 6)
  var porPai = new Map();
  $$('[data-reveal]').forEach(function (el) {
    var pai = el.parentElement;
    if (!porPai.has(pai)) porPai.set(pai, []);
    porPai.get(pai).push(el);
  });
  porPai.forEach(function (filhos) {
    if (filhos.length < 2) return;
    filhos.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i, 6) * 80 + 'ms';
    });
  });

  function revelar(el, semAnimacao) {
    if (el.classList.contains('visivel')) return;
    if (semAnimacao) {
      el.classList.add('sem-anim');
      $$('.pal > i', el).forEach(function (i) { i.classList.add('sem-anim'); i.style.transitionDelay = '0ms'; });
      el.classList.add('visivel');
      // devolve a transição depois de pintar, para hover/estados seguirem animados
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          el.classList.remove('sem-anim');
          $$('.pal > i', el).forEach(function (i) { i.classList.remove('sem-anim'); });
        });
      });
      return;
    }
    el.classList.add('visivel');
  }

  function noFimDaPagina() {
    return window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 6;
  }

  // Revela sem animação tudo que ainda falta — usado ao chegar no fim da página
  function revelarRestante() {
    alvos.forEach(function (el) { revelar(el, true); });
  }

  if (!reduzirMovimento && 'IntersectionObserver' in window) {
    // rootMargin negativo pequeno: dispara assim que o topo do bloco cruza ~90%
    // da viewport, para a animação TERMINAR antes do usuário chegar nele.
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        // Se o usuário já está no fim da página, entra sem animação:
        // nada deve estar animando quando não há mais scroll para dar.
        revelar(e.target, noFimDaPagina());
        obs.unobserve(e.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });

    alvos.forEach(function (el) { obs.observe(el); });

    // Camada 1 — primeira tela por timer (IO não dispara em aba de fundo)
    requestAnimationFrame(function () {
      setTimeout(function () {
        alvos.forEach(function (el) {
          if (el.getBoundingClientRect().top < window.innerHeight * 0.92) revelar(el);
        });
      }, 180);
    });

    // Camada 2 — o último "écran" do documento é revelado com antecedência,
    // senão o rodapé/CTA só entrariam quando já não há scroll sobrando.
    var antecipaFim = function () {
      var restante = document.documentElement.scrollHeight - (window.pageYOffset + window.innerHeight);
      if (restante > window.innerHeight * 1.15) return;
      // Sem scroll sobrando o usuário não "chega" no bloco: ele já tem de estar
      // lá. Abaixo de 35% de viewport restante, a entrada é instantânea.
      var semAnim = restante < window.innerHeight * 0.35;
      alvos.forEach(function (el) {
        if (el.classList.contains('visivel')) return;
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 1.15) revelar(el, semAnim);
      });
    };

    // Camada 3 — saltos (âncora, hash, arraste da barra): o que já passou
    // aparece direto, sem animação.
    var descarregar = function () {
      alvos.forEach(function (el) {
        if (el.classList.contains('visivel')) return;
        if (el.getBoundingClientRect().bottom < window.innerHeight * 0.35) revelar(el, true);
      });
      // A checagem de fim vem ANTES da antecipação: no fim da página tudo
      // entra sem animação, em vez de a antecipação animar na chegada.
      if (noFimDaPagina()) { revelarRestante(); return; }
      antecipaFim();
    };
    window.addEventListener('scroll', descarregar, { passive: true });
    window.addEventListener('resize', antecipaFim);

    // Rede de segurança final
    setTimeout(function () {
      alvos.forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight * 1.3) revelar(el, true);
      });
    }, 3000);
  } else {
    alvos.forEach(function (el) { el.classList.add('visivel'); });
  }

  /* --- 3.3 Barra de leitura ------------------------------------------- */
  (function () {
    var barra = $('#barra-progresso');
    if (!barra) return;
    var linha = barra.firstElementChild;
    if (reduzirMovimento) { barra.style.display = 'none'; return; }
    var tick = false;
    function pintar() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(window.pageYOffset / max, 1) : 0;
      linha.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      tick = false;
    }
    window.addEventListener('scroll', function () {
      if (!tick) { tick = true; requestAnimationFrame(pintar); }
    }, { passive: true });
    window.addEventListener('resize', pintar);
    pintar();
  })();

  /* ======================================================================
     4. Header — sólido ao rolar, esconde ao descer
     ====================================================================== */
  var cabecalho = $('#cabecalho');
  var ultimoY = 0;

  function aoRolar() {
    if (!cabecalho) return;
    var y = window.pageYOffset || document.documentElement.scrollTop;
    cabecalho.setAttribute('data-solido', y > 40 ? 'true' : 'false');

    var lb = $('#lightbox');
    var oc = $('#offcanvas');
    var lightboxAberto = !!lb && !lb.hidden;
    var menuAberto = !!oc && oc.classList.contains('aberto');
    if (y > 260 && y > ultimoY && !lightboxAberto && !menuAberto) {
      cabecalho.setAttribute('data-oculto', 'true');
    } else {
      cabecalho.setAttribute('data-oculto', 'false');
    }
    ultimoY = y;
  }
  window.addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();

  /* ======================================================================
     5. Contadores
     ====================================================================== */
  function formatarMilhar(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function animarContador(el) {
    var alvo = parseInt(el.getAttribute('data-contador'), 10);
    if (isNaN(alvo)) return;
    var milhar = el.getAttribute('data-formato') === 'milhar';
    if (reduzirMovimento) {
      el.textContent = milhar ? formatarMilhar(alvo) : alvo;
      return;
    }
    var inicio = null, dur = 1600;
    function passo(ts) {
      if (!inicio) inicio = ts;
      var p = Math.min((ts - inicio) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);           // easeOutCubic
      var valor = Math.round(alvo * eased);
      el.textContent = milhar ? formatarMilhar(valor) : valor;
      if (p < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }

  var contadores = $$('[data-contador]');
  if (contadores.length && 'IntersectionObserver' in window) {
    var obsCont = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = contadores.indexOf(e.target);
        setTimeout(function () { animarContador(e.target); }, Math.max(0, i) * 180);
        obsCont.unobserve(e.target);
      });
    }, { threshold: 0.5 });
    contadores.forEach(function (el) { obsCont.observe(el); });
  }

  /* ======================================================================
     6. Passos do CTA ("Como funciona")
     ====================================================================== */
  var passos = $('#passos');
  if (passos) {
    if (reduzirMovimento || !('IntersectionObserver' in window)) {
      passos.setAttribute('data-ligado', 'true');
    } else {
      var obsPassos = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          if (e.isIntersecting) {
            passos.setAttribute('data-ligado', 'true');
            obsPassos.disconnect();
          }
        });
      }, { threshold: 0.28 });
      obsPassos.observe(passos);
    }
  }

  /* ======================================================================
     7. Parallax discreto (≤0.12) nas quebras editoriais
     ====================================================================== */
  var camadas = $$('[data-parallax]');
  if (camadas.length && !reduzirMovimento && window.matchMedia('(min-width: 760px)').matches) {
    var tickParallax = false;
    var aplicarParallax = function () {
      camadas.forEach(function (c) {
        var f = parseFloat(c.getAttribute('data-parallax')) || 0.1;
        var r = c.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
        var centro = r.top + r.height / 2 - window.innerHeight / 2;
        c.style.transform = 'translate3d(0,' + (-centro * f).toFixed(2) + 'px,0)';
      });
      tickParallax = false;
    };
    window.addEventListener('scroll', function () {
      if (!tickParallax) { tickParallax = true; requestAnimationFrame(aplicarParallax); }
    }, { passive: true });
    aplicarParallax();
  }

  /* ======================================================================
     8. Menu off-canvas
     ====================================================================== */
  var hamburguer = $('#hamburguer');
  var offcanvas = $('#offcanvas');
  var veu = $('#veu');
  var fecharBtn = $('#offcanvas-fechar');
  if (offcanvas) offcanvas.setAttribute('inert', '');   // fechado na carga

  function abrirMenu() {
    offcanvas.classList.add('aberto');
    offcanvas.removeAttribute('inert');
    offcanvas.setAttribute('aria-hidden', 'false');
    veu.hidden = false;
    requestAnimationFrame(function () { veu.classList.add('aberto'); });
    hamburguer.setAttribute('aria-expanded', 'true');
    hamburguer.setAttribute('aria-label', 'Fechar menu');
    document.body.style.overflow = 'hidden';
    fecharBtn.focus();
  }

  function fecharMenu(devolverFoco) {
    offcanvas.classList.remove('aberto');
    offcanvas.setAttribute('inert', '');
    offcanvas.setAttribute('aria-hidden', 'true');
    veu.classList.remove('aberto');
    setTimeout(function () { if (!offcanvas.classList.contains('aberto')) veu.hidden = true; }, 300);
    hamburguer.setAttribute('aria-expanded', 'false');
    hamburguer.setAttribute('aria-label', 'Abrir menu');
    document.body.style.overflow = '';
    if (devolverFoco !== false) hamburguer.focus();
  }

  if (hamburguer && offcanvas && veu && fecharBtn) {
    hamburguer.addEventListener('click', function () {
      if (offcanvas.classList.contains('aberto')) fecharMenu(); else abrirMenu();
    });
    fecharBtn.addEventListener('click', function () { fecharMenu(); });
    veu.addEventListener('click', function () { fecharMenu(); });
    $$('a', offcanvas).forEach(function (a) {
      a.addEventListener('click', function () { fecharMenu(false); });
    });
  }

  /* ======================================================================
     9. Âncoras com scroll suave (o motor cuida — html{scroll-behavior:auto})
     ====================================================================== */
  function alturaHeader() {
    return (cabecalho && cabecalho.getAttribute('data-solido') === 'true') ? 68 : 84;
  }

  function irPara(destino, atraso) {
    setTimeout(function () {
      var y = destino.getBoundingClientRect().top + window.pageYOffset - alturaHeader() - 8;
      window.scrollTo({ top: y, behavior: reduzirMovimento ? 'auto' : 'smooth' });
    }, atraso || 0);
  }

  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var destino = document.querySelector(id);
      if (!destino) return;
      ev.preventDefault();
      var veioDoMenu = !!a.closest('#offcanvas');
      irPara(destino, veioDoMenu ? 420 : 60);
      history.replaceState(null, '', id);
    });
  });

  /* ======================================================================
     10. Portfólio — filtros por disciplina
     ====================================================================== */
  var chips = $$('.chip[data-filtro]');
  var projetos = $$('.projeto');
  var vazio = $('#portfolio-vazio');

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var filtro = chip.getAttribute('data-filtro');
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
      var visiveis = 0;
      projetos.forEach(function (p) {
        var ok = filtro === 'todos' || p.getAttribute('data-categoria') === filtro;
        p.hidden = !ok;
        if (ok) visiveis++;
      });
      if (vazio) vazio.hidden = visiveis > 0;
    });
  });

  /* ======================================================================
     11. Lightbox em modo galeria por projeto
     ====================================================================== */
  var lightbox = $('#lightbox');
  var lbImg = $('#lb-img');
  var lbTitulo = $('#lb-titulo');
  var lbFicha = $('#lb-ficha');
  var lbContador = $('#lb-contador');
  var lbPrev = $('#lb-prev');
  var lbProx = $('#lb-prox');
  var lbFechar = $('#lb-fechar');

  var galeria = [];
  var legendas = [];
  var indice = 0;
  var gatilho = null;

  function renderizar() {
    if (!lbImg) return;
    lbImg.setAttribute('src', galeria[indice]);
    lbImg.setAttribute('alt', (legendas[indice] || lbTitulo.textContent) + ' — ' + lbTitulo.textContent);
    lbContador.textContent = galeria.length > 1 ? (indice + 1) + ' / ' + galeria.length : '';
    var unica = galeria.length < 2;
    lbPrev.hidden = unica;
    lbProx.hidden = unica;
  }

  function abrirLightbox(btn) {
    galeria = (btn.getAttribute('data-galeria') || '').split('|').filter(Boolean);
    legendas = (btn.getAttribute('data-legendas') || '').split('|');
    if (!galeria.length) return;
    indice = 0;
    gatilho = btn;
    lbTitulo.textContent = btn.getAttribute('data-titulo') || 'Projeto';
    lbFicha.textContent = btn.getAttribute('data-ficha') || '';
    renderizar();
    lightbox.hidden = false;
    lightbox.classList.add('aberto');
    document.body.style.overflow = 'hidden';
    lbFechar.focus();
  }

  function fecharLightbox() {
    lightbox.classList.remove('aberto');
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (gatilho) { gatilho.focus(); gatilho = null; }
  }

  function navegar(passo) {
    if (galeria.length < 2) return;
    indice = (indice + passo + galeria.length) % galeria.length;
    renderizar();
  }

  // As páginas internas (política, fornecedores) não têm portfólio nem lightbox.
  if (lightbox && lbFechar && lbPrev && lbProx) {
    $$('.projeto-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { abrirLightbox(btn); });
    });
    lbFechar.addEventListener('click', fecharLightbox);
    lbPrev.addEventListener('click', function () { navegar(-1); });
    lbProx.addEventListener('click', function () { navegar(1); });
    lightbox.addEventListener('click', function (ev) {
      if (ev.target === lightbox) fecharLightbox();
    });
  }

  /* Teclado global: Esc fecha, setas navegam, Tab fica preso no diálogo */
  document.addEventListener('keydown', function (ev) {
    if (lightbox && !lightbox.hidden) {
      if (ev.key === 'Escape') { ev.preventDefault(); fecharLightbox(); return; }
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); navegar(-1); return; }
      if (ev.key === 'ArrowRight') { ev.preventDefault(); navegar(1); return; }
      if (ev.key === 'Tab') {
        var focaveis = [lbFechar, lbPrev, lbProx].filter(function (b) { return !b.hidden; });
        var i = focaveis.indexOf(document.activeElement);
        ev.preventDefault();
        var prox = ev.shiftKey ? i - 1 : i + 1;
        if (prox < 0) prox = focaveis.length - 1;
        if (prox >= focaveis.length) prox = 0;
        focaveis[prox].focus();
      }
      return;
    }

    if (!offcanvas) return;
    if (ev.key === 'Escape' && offcanvas.classList.contains('aberto')) fecharMenu();

    // Foco preso no menu off-canvas
    if (ev.key === 'Tab' && offcanvas.classList.contains('aberto')) {
      var itens = $$('a, button', offcanvas).filter(function (el) { return el.offsetParent !== null; });
      if (!itens.length) return;
      var primeiro = itens[0], ultimo = itens[itens.length - 1];
      if (ev.shiftKey && document.activeElement === primeiro) { ev.preventDefault(); ultimo.focus(); }
      else if (!ev.shiftKey && document.activeElement === ultimo) { ev.preventDefault(); primeiro.focus(); }
    }
  });

  /* ======================================================================
     12. Link do menu ativo conforme a seção visível
     ====================================================================== */
  var secoesAncoradas = ['#disciplinas', '#diferenciais', '#projetos', '#incendio', '#sobre']
    .map(function (id) { return document.querySelector(id); })
    .filter(Boolean);

  if (secoesAncoradas.length && 'IntersectionObserver' in window) {
    var obsNav = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        var link = document.querySelector('.nav-menu a[href="#' + e.target.id + '"]');
        if (!link) return;
        if (e.isIntersecting) {
          $$('.nav-menu a').forEach(function (a) { a.removeAttribute('aria-current'); });
          link.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secoesAncoradas.forEach(function (s) { obsNav.observe(s); });
  }

  /* ======================================================================
     13. Ano do rodapé
     ====================================================================== */
  var ano = $('#ano');
  if (ano) ano.textContent = new Date().getFullYear();

})();
