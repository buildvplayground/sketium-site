# Sketium Engenharia — Site

- **Cliente:** Sketium Engenharia e Consultoria LTDA
- **Slug:** `sketium-site`
- **Segmento:** Engenharia civil — projetos, infraestrutura, consultoria e perícias
- **Praça:** Goiânia-GO (Jardim Atlântico)
- **Iniciado em:** 2026-08-27
- **Drive:** `1bfN1hQPONIp8PnQ81yYAlvw-j3Jost7L`

## Inventário do material
- `Marca/`: 17 arquivos (logos PNG com alpha em alta resolução, DWG vetorial, placas, `PADRÃO DE IDENTIDADE VISUAL.xlsx`)
- `Copys/`: 7 arquivos (Portfólio PDF/PPTX + texto extraído, 2 folders institucionais em PNG, 2 CSV de formulário)
- `imagens/`: 15 arquivos (8 renders de projetos residenciais, 4 fotos aéreas/obra, 3 outras)
- Pendente em `_raw/`: 4 arquivos auxiliares de CAD (`.bak`, `.dwl`, `.dwl2`, `plot.log`) — descartáveis

### Observações do material
- O questionário **Aprofundamento veio em branco** — nenhum dado preenchido pelo cliente.
  Toda a copy foi minerada do **Portfólio (15 páginas)** e dos **2 folders institucionais**.
- Pastas `02. Criativos` e `03. Site e Páginas (Copy + Backup Site Antigo)` estão **vazias
  no Drive** — não há copy oficial nem backup de site antigo. Copy é **provisória**.
- Contato **real** obtido do portfólio: (62) 99318-8227 · @sketiumengenharia ·
  Rua da Raia, Qd. 18, Lt. 01, Sala 02 — Galeria Maya Center, Jardim Atlântico, Goiânia-GO,
  CEP 74.343-490.
- **E-mail comercial não consta** em nenhum material → pendência.

## Marca (extraída de PADRÃO DE IDENTIDADE VISUAL.xlsx + folders)
- Laranja: `#EA783B` (RGB 234,120,59) — acento oficial
- Cinza claro: `#CDCCCA` · Cinza escuro: `#727273`
- Navy profundo aplicado nos folders: `#011627` · Off-white: `#F0F0F0`
- Tipografia: **Montserrat SemiBold** (institucional) + Relidux (apenas no logotipo)

## Checklist do pipeline
- [x] 1. Material extraído do Drive (rclone — 42 arquivos, 131 MB)
- [x] 2. Pastas organizadas (scaffold-projeto)
- [x] 2b. Repositório GitHub criado (`dev-buildv/sketium-site` privado)
- [x] 3. Design system (paleta/tipografia da marca real; direção de estilo + anti-padrões)
- [x] 4. Copy estruturada (Ramo B — provisória, minerada do portfólio e dos folders)
- [x] 5. Front-end (3 páginas, HTML+CSS+JS vanilla; auditoria adversarial sem bloqueantes)
- [x] 6. Ajustes finais (imagens -91%, overflow 0 de 320→1920px, contraste sem falhas)
- [x] 7. Módulos LGPD (cookies + Política + Fornecedores + backend PHP); tags pendentes de ID
- [ ] 8. Revisão humana  ← **VOCÊ ESTÁ AQUI**
- [ ] 9. Deploy (gate humano — falta hospedagem, domínio e secrets)

## Entregáveis
- `Site/` — código-fonte (3 páginas + PHP + .htaccess)
- `deploy-vercel/` — pasta estática publicável (2,5 MB), **é a única versionada**
- `.github/workflows/deploy-hostinger.yml` — deploy por FTP, disparo manual
- `design-system/` — tokens.css, design-system.md, direcao-estilo.md
- `brief-pack.md` — referência de layout, eixos de variação e decisões

## Verificações medidas (não estimadas)
| Item | Resultado |
|---|---|
| Overflow horizontal (320→1920px, 3 páginas) | **0 px** |
| Contraste WCAG AA no DOM renderizado | **0 falhas** |
| Alvos de toque < 24px (WCAG 2.5.8) | **0** |
| Erros de JavaScript | **0** nas 3 páginas |
| Imagens | 22 MB → 2,1 MB (**-91%**) |
| Formulários em CTA de orçamento | **0** (só botão WhatsApp) |
| Blocos invisíveis após varrer a página | **0** |
| Animações rodando ao fim do scroll | **0** (entrada instantânea no fim) |
