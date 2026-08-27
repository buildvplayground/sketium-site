/* ==========================================================================
   Formulário de Fornecedores / Trabalhe Conosco
   Validação acessível no cliente. O servidor (enviar-cadastro.php) revalida
   tudo — validação de cliente é conveniência, nunca segurança.
   ========================================================================== */
(function () {
  'use strict';

  var form = document.getElementById('form-cadastro');
  if (!form) return;

  var status = document.getElementById('form-status');
  var botao = document.getElementById('form-enviar');
  var MAX_ARQUIVO = 5 * 1024 * 1024;   // 5 MB

  function mensagemErro(campo) {
    var v = (campo.value || '').trim();
    if (campo.type === 'checkbox') {
      return campo.checked ? '' : 'É preciso autorizar o tratamento dos dados para enviar.';
    }
    if (campo.required && !v) return 'Preencha este campo.';
    if (campo.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
      return 'Informe um e-mail válido.';
    }
    if (campo.type === 'tel' && v && v.replace(/\D/g, '').length < 10) {
      return 'Informe um telefone com DDD.';
    }
    if (campo.type === 'file' && campo.files.length) {
      if (campo.files[0].size > MAX_ARQUIVO) return 'O arquivo passa de 5 MB.';
    }
    return '';
  }

  function marcar(campo, erro) {
    var caixa = campo.closest('.campo') || campo.closest('.consentimento');
    if (!caixa) return;
    var aviso = caixa.querySelector('.campo-erro');
    if (erro) {
      campo.setAttribute('aria-invalid', 'true');
      if (!aviso) {
        aviso = document.createElement('span');
        aviso.className = 'campo-erro';
        aviso.id = (campo.id || 'campo') + '-erro';
        caixa.appendChild(aviso);
      }
      aviso.textContent = erro;
      campo.setAttribute('aria-describedby',
        ((campo.getAttribute('aria-describedby') || '').replace(aviso.id, '').trim() + ' ' + aviso.id).trim());
    } else {
      campo.removeAttribute('aria-invalid');
      if (aviso) aviso.remove();
    }
  }

  var campos = Array.prototype.slice.call(
    form.querySelectorAll('input[required], select[required], textarea[required], input[type=file]')
  );

  campos.forEach(function (c) {
    c.addEventListener('blur', function () { marcar(c, mensagemErro(c)); });
    c.addEventListener('input', function () {
      if (c.getAttribute('aria-invalid') === 'true') marcar(c, mensagemErro(c));
    });
  });

  form.addEventListener('submit', function (ev) {
    var primeiroInvalido = null;
    campos.forEach(function (c) {
      var erro = mensagemErro(c);
      marcar(c, erro);
      if (erro && !primeiroInvalido) primeiroInvalido = c;
    });

    if (primeiroInvalido) {
      ev.preventDefault();
      status.textContent = 'Confira os campos destacados antes de enviar.';
      status.setAttribute('data-tipo', 'erro');
      primeiroInvalido.focus();
      return;
    }

    status.textContent = 'Enviando…';
    status.setAttribute('data-tipo', '');
    botao.disabled = true;
    // O envio segue normalmente para o PHP (POST tradicional).
    // Se o backend não estiver disponível (hospedagem estática), o navegador
    // mostra o erro — a pendência de hospedagem está registrada no state.json.
  });
})();
