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
- [ ] 3. Design system
- [ ] 4. Copy estruturada (extrair-copy — Ramo B, copy provisória)
- [ ] 5. Front-end (gerar-frontend + revisar-frontend)
- [ ] 6. Ajustes finais (imagens .webp, responsividade 320px+)
- [ ] 7. Módulos LGPD + tags
- [ ] 8. Revisão humana
- [ ] 9. Deploy (gate humano)
