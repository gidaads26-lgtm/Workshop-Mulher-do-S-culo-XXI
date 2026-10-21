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
 *
 * API de Conversões da Meta (opcional):
 *  - Configurações do projeto (engrenagem) > Propriedades do script > Adicionar:
 *      META_TOKEN      = token de acesso gerado no Gerenciador de Eventos
 *      META_TEST_CODE  = (só para testar) código de "Testar eventos", ex.: TEST12345
 *  - Rode "testarMeta" uma vez (autoriza o acesso externo) e publique uma nova versão.
 *  - O token fica só aqui no Apps Script. Nunca coloque no site nem no GitHub.
 */

var ABA = 'Inscrições';
var CABECALHO = [
  'Data/hora', 'Nome', 'WhatsApp', 'WhatsApp (+55)', 'Consentimento', 'Origem',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'
];
var UTMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
var JANELA_DUPLICADA_SEG = 600; // ignora o mesmo WhatsApp repetido em 10 minutos
var META_PIXEL_ID = '2049925319002692';
var META_API = 'https://graph.facebook.com/v25.0/';
var META_EVENTO = 'Workshop Mulher do Século XXI';
var SITE_PADRAO = 'https://solangebcgodoy.com.br/';

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

  // Avisa a Meta (API de Conversões). Uma falha aqui nunca impede a gravação na planilha.
  try {
    enviarMeta_(p, zap);
  } catch (erro) {
    console.error('Meta CAPI: ' + erro);
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

/**
 * Opcional: envia um Lead de teste para a Meta.
 * Antes, cadastre META_TOKEN e META_TEST_CODE nas Propriedades do script.
 * O resultado aparece em Gerenciador de Eventos > Testar eventos e no registro de execução.
 */
function testarMeta() {
  var codigo = enviarMeta_({
    nome: 'Teste', event_id: 'teste-' + Date.now(), url: SITE_PADRAO, ua: 'Apps Script (teste)'
  }, '11999999999');
  console.log(codigo === 200 ? 'Meta recebeu o evento de teste.' : 'Meta respondeu: ' + codigo + ' (veja o erro acima).');
}

/** Envia o evento Lead para a API de Conversões, com dados pessoais codificados (SHA-256). */
function enviarMeta_(p, zap) {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('META_TOKEN');
  if (!token) return 0; // sem token: só grava na planilha
  var pixel = props.getProperty('META_PIXEL_ID') || META_PIXEL_ID;
  var codigoTeste = props.getProperty('META_TEST_CODE');

  var usuario = {
    ph: [sha256_('55' + zap)],
    country: [sha256_('br')]
  };
  var primeiroNome = String(p.nome || '').replace(/[\u0000-\u001F\u007F<>]/g, '').trim().split(/\s+/)[0].toLowerCase();
  if (primeiroNome) usuario.fn = [sha256_(primeiroNome)];
  var fbp = String(p.fbp || '').slice(0, 120);
  var fbc = String(p.fbc || '').slice(0, 300);
  if (/^fb\.\d\.\d+\.[\w.-]+$/.test(fbp)) usuario.fbp = fbp;
  if (/^fb\.\d\.\d+\.[\w.-]+$/.test(fbc)) usuario.fbc = fbc;
  if (p.ua) usuario.client_user_agent = String(p.ua).slice(0, 300);

  var url = String(p.url || '');
  var evento = {
    event_name: 'Lead',
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_source_url: /^https:\/\/[^\s<>"']{1,200}$/.test(url) ? url : SITE_PADRAO,
    user_data: usuario,
    custom_data: { content_name: META_EVENTO }
  };
  var id = String(p.event_id || '').replace(/[^\w-]/g, '').slice(0, 64);
  if (id) evento.event_id = id; // mesmo código do pixel: a Meta não conta duas vezes

  var corpo = { data: [evento] };
  if (codigoTeste) corpo.test_event_code = codigoTeste;

  var resposta = UrlFetchApp.fetch(META_API + encodeURIComponent(pixel) + '/events?access_token=' + encodeURIComponent(token), {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(corpo),
    muteHttpExceptions: true
  });
  var status = resposta.getResponseCode();
  if (status !== 200) console.error('Meta CAPI ' + status + ': ' + resposta.getContentText().slice(0, 500));
  return status;
}

/** SHA-256 em hexadecimal minúsculo, como a Meta exige. */
function sha256_(texto) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(texto), Utilities.Charset.UTF_8);
  return bytes.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
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
