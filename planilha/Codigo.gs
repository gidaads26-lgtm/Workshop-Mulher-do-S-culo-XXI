/**
 * Workshop Mulher do Século XXI — recebe as inscrições do site e grava na planilha.
 *
 * Como instalar (passo a passo completo no README do repositório):
 *  1. Planilha Google nova > Extensões > Apps Script.
 *  2. Apague o conteúdo e cole este arquivo inteiro. Salve.
 *  3. Rode a função "configurar" uma vez (autorize o acesso).
 *  4. Implantar > Nova implantação > Tipo: App da Web
 *       Executar como: Eu  |  Quem pode acessar: Qualquer pessoa
 *  5. Copie a URL que termina em /exec e cole no site (campo "sheetUrl").
 */

var ABA = 'Inscrições';
var CABECALHO = [
  'Data/hora', 'Nome', 'WhatsApp', 'WhatsApp (+55)', 'Consentimento', 'Origem',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'
];
var UTMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
var JANELA_DUPLICADA_SEG = 600; // ignora o mesmo WhatsApp repetido em 10 minutos

/** Recebe cada inscrição enviada pelo site. */
function doPost(e) {
  var p = (e && e.parameter) || {};

  // Campo invisível preenchido = robô. Responde "ok" sem gravar.
  if (p['bot-field']) return resposta_();

  var nome = limpar_(p.nome, 80);
  var zap = String(p.whatsapp || '').replace(/\D/g, '').slice(0, 11);
  if (nome.length < 2 || zap.length < 10) return resposta_();

  // Evita linhas duplicadas por clique duplo ou reenvio.
  var cache = CacheService.getScriptCache();
  if (cache.get('z' + zap)) return resposta_();
  cache.put('z' + zap, '1', JANELA_DUPLICADA_SEG);

  var linha = [
    new Date(),
    nome,
    zap,
    '+55' + zap,
    p.consentimento === 'sim' ? 'Sim' : 'Não',
    limpar_(p.origem, 20)
  ];
  UTMS.forEach(function (k) { linha.push(limpar_(p[k], 100)); });

  var trava = LockService.getScriptLock();
  trava.waitLock(10000);
  try {
    var aba = aba_();
    aba.getRange(aba.getLastRow() + 1, 1, 1, linha.length).setValues([linha]);
  } finally {
    trava.releaseLock();
  }
  return resposta_();
}

/** Abrir a URL /exec no navegador mostra "ok": serve para testar se está publicado. */
function doGet() {
  return resposta_();
}

/** Rode uma vez para criar a aba, o cabeçalho e autorizar o script. */
function configurar() {
  aba_();
  SpreadsheetApp.getActive().toast('Planilha pronta para receber inscrições.');
}

/** Opcional: grava uma inscrição de teste. Apague a linha depois. */
function testar() {
  doPost({ parameter: { nome: 'Teste', whatsapp: '11999999999', consentimento: 'sim', origem: 'teste' } });
}

function aba_() {
  var planilha = SpreadsheetApp.getActive();
  var aba = planilha.getSheetByName(ABA);
  if (!aba) {
    aba = planilha.insertSheet(ABA);
    aba.getRange(1, 1, 1, CABECALHO.length).setValues([CABECALHO])
      .setFontWeight('bold').setBackground('#721D3C').setFontColor('#FFE4EB');
    aba.setFrozenRows(1);
    aba.getRange('C:D').setNumberFormat('@'); // WhatsApp como texto
    aba.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm');
  }
  return aba;
}

/** Tira caracteres invisíveis e impede que o texto vire fórmula na planilha. */
function limpar_(valor, max) {
  var s = String(valor || '').replace(/[\u0000-\u001F\u007F<>]/g, '').trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function resposta_() {
  return ContentService.createTextOutput('ok').setMimeType(ContentService.MimeType.TEXT);
}
