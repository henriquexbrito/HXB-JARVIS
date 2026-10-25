const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const store = { get(key, fallback) { try { return JSON.parse(localStorage.getItem(`hxb-${key}`)) ?? fallback; } catch { return fallback; } }, set(key, value) { localStorage.setItem(`hxb-${key}`, JSON.stringify(value)); } };
const defaults = { name:'Henrique', style:'' };
let prefs = store.get('prefs', defaults);
let history = store.get('history', []);
let tasks = store.get('tasks', []);
let recognition = null;
let toastTimer;

function showToast(message) { const el=$('#toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),3200); }
function setName() { const name=prefs.name || 'Henrique'; $('#profile-name').textContent=name; $('#welcome-name').textContent=name; $('#setting-name').value=name; $('#setting-style').value=prefs.style || ''; }
function showView(name) { $$('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${name}`)); $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===name)); const labels={chat:'Conversa',inbox:'E-mail',agenda:'Agenda & tarefas',studio:'Estúdio de voz',integrations:'Integrações'}; $('#page-title').textContent=labels[name]; }
function renderMessages() { const box=$('#messages'); box.replaceChildren(); history.forEach((m,i)=>{const el=document.createElement('div');el.className=`message ${m.role}`;if(m.role==='assistant'){const label=document.createElement('span');label.className='speaker';label.textContent='JARVIS';el.append(label)}el.append(document.createTextNode(m.content));if(m.role==='assistant'){const tools=document.createElement('div');tools.className='message-tools';const play=document.createElement('button');play.textContent='▶ Ouvir';play.onclick=()=>speak(m.content);tools.append(play);el.append(tools)}box.append(el)});box.scrollTop=box.scrollHeight;$('#welcome').style.display=history.length?'none':''; }
function renderTasks() {const list=$('#task-list');list.replaceChildren();tasks.forEach((task,index)=>{const row=document.createElement('label');row.className=`task-row ${task.done?'done':''}`;const check=document.createElement('input');check.type='checkbox';check.checked=task.done;check.onchange=()=>{tasks[index].done=check.checked;store.set('tasks',tasks);renderTasks()};const title=document.createElement('span');title.textContent=task.title;const remove=document.createElement('button');remove.type='button';remove.setAttribute('aria-label','Remover tarefa');remove.textContent='×';remove.onclick=()=>{tasks.splice(index,1);store.set('tasks',tasks);renderTasks()};row.append(check,title,remove);list.append(row)});$('#task-count').textContent=tasks.filter(t=>!t.done).length;$('#empty-tasks').style.display=tasks.length?'none':'flex';}
function speak(text,rate=1,voice=null) { if(!('speechSynthesis' in window)){showToast('A leitura de voz não está disponível neste navegador.');return}speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang='pt-BR';utterance.rate=rate;if(voice)utterance.voice=voice;speechSynthesis.speak(utterance); }
function loadVoices(){const select=$('#voice-select');const voices=speechSynthesis?.getVoices?.()||[];const portuguese=voices.filter(v=>v.lang.toLowerCase().startsWith('pt'));if(portuguese.length){select.replaceChildren(new Option('Português (padrão)',''));portuguese.forEach(v=>select.add(new Option(`${v.name} · ${v.lang}`,v.name)))} }
async function send(text) {if(!text.trim())return;history.push({role:'user',content:text.trim()});renderMessages();store.set('history',history);const form=$('#chat-form');const input=$('#chat-input');input.value='';input.disabled=true;const button=form.querySelector('.send-button');button.textContent='…';try{const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:history,prefs,name:prefs.name,style:prefs.style})});const data=await res.json();if(!res.ok)throw new Error(data.error||'Não foi possível responder.');history.push({role:'assistant',content:data.reply});store.set('history',history);$('#model-status').textContent='Assistente conectado';renderMessages()}catch(error){history.pop();store.set('history',history);renderMessages();showToast(error.message)}finally{input.disabled=false;button.textContent='↑';input.focus()} }

$$('.nav-item').forEach(button=>button.addEventListener('click',()=>showView(button.dataset.view)));
$$('[data-go="integrations"]').forEach(button=>button.addEventListener('click',()=>showView('integrations')));
$$('.suggestion').forEach(button=>button.addEventListener('click',()=>send(button.dataset.prompt)));
$('#chat-form').addEventListener('submit',e=>{e.preventDefault();send($('#chat-input').value)});
$('#chat-input').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('#chat-form').requestSubmit()}});
$('#task-form').addEventListener('submit',e=>{e.preventDefault();const input=$('#task-input');if(!input.value.trim())return;tasks.unshift({title:input.value.trim(),done:false});store.set('tasks',tasks);input.value='';renderTasks()});
$('#speak-script').addEventListener('click',()=>{const text=$('#script-text').value.trim();if(!text){showToast('Escreva ou cole um texto para narrar.');return}const voiceName=$('#voice-select').value;const voice=speechSynthesis.getVoices().find(v=>v.name===voiceName);speak(text,Number($('#voice-rate').value),voice)});
$('#stop-speaking').addEventListener('click',()=>speechSynthesis.cancel());
$('#voice-input').addEventListener('click',()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){showToast('Reconhecimento de voz indisponível. Tente o Chrome ou Edge.');return}if(recognition){recognition.stop();return}recognition=new SR();recognition.lang='pt-BR';recognition.interimResults=false;const button=$('#voice-input');button.classList.add('recording');recognition.onresult=e=>{$('#chat-input').value=e.results[0][0].transcript};recognition.onerror=e=>showToast(e.error==='not-allowed'?'Permita o acesso ao microfone no navegador.':'Não consegui ouvir. Tente novamente.');recognition.onend=()=>{button.classList.remove('recording');recognition=null};recognition.start()});
$('#open-settings').addEventListener('click',()=>$('#settings-dialog').showModal());$('#open-settings-mobile').addEventListener('click',()=>$('#settings-dialog').showModal());
$('#save-settings').addEventListener('click',e=>{e.preventDefault();prefs={name:$('#setting-name').value.trim()||'Henrique',style:$('#setting-style').value.trim()};store.set('prefs',prefs);setName();$('#settings-dialog').close();showToast('Preferências salvas neste navegador.')});
document.querySelectorAll('[data-prompt]').forEach(button=>button.addEventListener('click',()=>{}));
const date=new Date();$('#today-date').textContent=new Intl.DateTimeFormat('pt-BR',{weekday:'short',day:'numeric',month:'long'}).format(date).replace('.','');
setName();renderMessages();renderTasks();loadVoices();if('speechSynthesis'in window)speechSynthesis.onvoiceschanged=loadVoices;

let wakeLock = null;
let installPrompt = null;
const awakeButton = $('#keep-awake');
const installButton = $('#install-app');
async function enableWakeLock() {
  if (!('wakeLock' in navigator)) { showToast('Este navegador não oferece tela ativa. Ajuste o tempo de bloqueio nas configurações do tablet.'); return; }
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    awakeButton.classList.add('selected'); awakeButton.setAttribute('aria-pressed','true'); awakeButton.textContent='◉ Tela ativa';
    wakeLock.addEventListener('release',()=>{wakeLock=null;awakeButton.classList.remove('selected');awakeButton.setAttribute('aria-pressed','false');awakeButton.textContent='◐ Tela ativa'});
  } catch { showToast('Não foi possível manter a tela ativa. Deixe o JARVIS em primeiro plano e tente novamente.'); }
}
awakeButton?.addEventListener('click',()=>wakeLock ? wakeLock.release() : enableWakeLock());
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&awakeButton?.getAttribute('aria-pressed')==='true'&&!wakeLock)enableWakeLock()});
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;installButton?.classList.add('available')});
installButton?.addEventListener('click',async()=>{if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;return}showToast(/iPhone|iPad/i.test(navigator.userAgent)?'No Safari, toque em Compartilhar e depois em Adicionar à Tela de Início.':'No menu do navegador, escolha “Instalar app” ou “Adicionar à tela inicial”.')});
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));