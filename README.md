# Workshop Mulher do Século XXI

Página de captura do workshop online e gratuito com **Solange Godoy**, hipnoterapeuta clínica.
Ao vivo em 10/11/2026, às 20h, via Zoom.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | O site completo em um único arquivo (código, estilos e fotos embutidos). |
| `og-workshop.jpg` | Imagem de compartilhamento (WhatsApp, Instagram, Facebook), 1200x630. |
| `planilha/Codigo.gs` | Script da Planilha Google que recebe as inscrições. |
| `vercel.json` | Cabeçalhos de segurança aplicados pela Vercel. |
| `_headers` | Os mesmos cabeçalhos, para o caso de publicar no Netlify. |

## Configuração rápida

No topo do `index.html` fica o bloco de configuração:

```html
<script type="application/json" id="workshop-config">
  {
    "whatsappGroupUrl": "https://chat.whatsapp.com/...",
    "sheetUrl": "https://script.google.com/macros/s/.../exec"
  }
</script>
```

- `whatsappGroupUrl`: link do grupo. Só links `https://chat.whatsapp.com/...` são aceitos.
- `sheetUrl`: endereço da Planilha Google. Só links `https://script.google.com/macros/s/.../exec` são aceitos.
  Se ficar vazio, o site tenta o formulário do Netlify, que **não funciona na Vercel**.

## Pixel da Meta e API de Conversões

O pixel `939323018973642` está no `<head>` do `index.html`. Eventos enviados pelo navegador:

- **PageView**: ao abrir a página.
- **Lead**: quando a pessoa envia nome e WhatsApp (use como conversão nas campanhas).

A **API de Conversões** envia o mesmo **Lead** a partir do script da planilha (`planilha/Codigo.gs`),
com o WhatsApp e o primeiro nome **codificados em SHA-256**. Pixel e API usam o mesmo `event_id`,
então a Meta não conta a mesma inscrição duas vezes.

Para ativar: no Apps Script, **Configurações do projeto → Propriedades do script**, crie `META_TOKEN`
com o token gerado no Gerenciador de Eventos. **O token fica só no Apps Script; nunca no site nem neste repositório.**
Para testar, crie também `META_TEST_CODE` (código de "Testar eventos"), rode a função `testarMeta`
e depois **apague** `META_TEST_CODE` (com ela, os eventos ficam só no modo de teste).

Se trocar de pixel, substitua o número no bloco "Meta Pixel Code" do `index.html` (duas ocorrências)
e em `META_PIXEL_ID` no script.

## 1. Criar a Planilha Google (uma vez só, cerca de 5 minutos)

1. Acesse [sheets.new](https://sheets.new) com a conta Google que vai guardar as inscrições e dê um nome à planilha.
2. Menu **Extensões → Apps Script**.
3. Apague tudo o que aparecer no editor, cole o conteúdo de `planilha/Codigo.gs` e clique em **Salvar**.
4. No seletor de funções (ao lado de "Depurar"), escolha **configurar** e clique em **Executar**.
   O Google vai pedir autorização: **Revisar permissões → escolha sua conta → Avançado → Acessar (não seguro) → Permitir**.
   O aviso "não seguro" aparece em todo script pessoal; o script só mexe nesta planilha.
5. Clique em **Implantar → Nova implantação**. Na engrenagem, escolha **App da Web** e preencha:
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
6. Clique em **Implantar** e copie a **URL do app da Web** (termina em `/exec`).
7. Teste: abra essa URL no navegador. Deve aparecer só a palavra `ok`.
8. Cole a URL no campo `sheetUrl` do `index.html` (pelo GitHub: abra o arquivo, clique no lápis, edite e salve com **Commit changes**).

A aba **Inscrições** é criada automaticamente com as colunas: data/hora, nome, WhatsApp, WhatsApp (+55),
consentimento, origem (formulário do topo ou do final) e UTMs.

**Proteções do script:** ignora robôs (campo invisível), ignora o mesmo WhatsApp repetido em 10 minutos,
limita o tamanho dos campos e impede que um texto digitado vire fórmula na planilha.

> Se um dia alterar o script, use **Implantar → Gerenciar implantações → editar (lápis) → Versão: Nova versão**.
> Assim a URL `/exec` continua a mesma.

## 2. Publicar na Vercel

1. Em [vercel.com](https://vercel.com), **Add New → Project** e importe este repositório.
2. **Framework Preset:** Other. Deixe **Build Command** e **Output Directory** vazios.
3. Clique em **Deploy**.

Cada alteração enviada para a branch `main` publica o site automaticamente.

## 3. Conferir antes de divulgar

1. Faça uma inscrição de teste pelo celular, no site publicado.
2. Confira se a linha apareceu na aba **Inscrições** da planilha.
3. Apague a linha de teste.
