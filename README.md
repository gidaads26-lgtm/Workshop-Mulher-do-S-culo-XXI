# Workshop Mulher do Século XXI

Página de captura do workshop online e gratuito com **Solange Godoy**, hipnoterapeuta clínica.
Ao vivo em 03/11/2026, às 20h, via Zoom.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | O site completo em um único arquivo (código, estilos e fotos embutidos). |
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
