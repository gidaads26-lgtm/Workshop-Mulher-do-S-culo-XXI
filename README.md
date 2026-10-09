# Workshop Mulher do Século XXI

Página de captura do workshop online e gratuito com **Solange B. Cerqueira**, hipnoterapeuta clínica.
Ao vivo em 03/11/2026, às 20h, via Zoom.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | O site completo em um único arquivo (código, estilos e fotos embutidos). |
| `_headers` | Cabeçalhos de segurança que o Netlify aplica automaticamente. |

## Configuração rápida

O link do grupo de WhatsApp fica no topo do `index.html`, no bloco:

```html
<script type="application/json" id="workshop-config">
  { "whatsappGroupUrl": "https://chat.whatsapp.com/..." }
</script>
```

Por segurança, só links `https://chat.whatsapp.com/...` são aceitos.

## Inscrições

O formulário usa o **Netlify Forms** (formulário `inscricao`). As inscrições aparecem no painel do Netlify em
**Forms → inscricao**, com nome, WhatsApp, consentimento, origem e UTMs.
A detecção de formulários precisa estar ativada em **Forms → Enable form detection**.

## Publicação

O Netlify publica direto deste repositório: cada alteração enviada para a branch `main` gera uma nova publicação.
Configuração no Netlify: *Build command* vazio e *Publish directory* `.` (raiz).

> Cada publicação consome créditos do plano gratuito do Netlify, então agrupe as alterações antes de enviar.
