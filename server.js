import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml' };

http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self' https://api.groq.com; style-src 'self'; script-src 'self'; img-src 'self' data:; base-uri 'self'; form-action 'self'");
  if (req.method === 'POST' && req.url === '/api/chat') {
    if (!process.env.GROQ_API_KEY) { res.writeHead(503, {'Content-Type':'application/json'}); return res.end(JSON.stringify({error:'Configure GROQ_API_KEY no servidor para ativar a conversa inteligente.'})); }
    try {
      let raw=''; for await (const chunk of req) { raw += chunk; if (raw.length > 20000) throw new Error('Mensagem muito longa.'); }
      const { messages = [], name = 'Henrique', style = '' } = JSON.parse(raw);
      const safeMessages = messages.slice(-12).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content).slice(0,5000) }));
      const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', { method:'POST', headers:{'Authorization':`Bearer ${process.env.GROQ_API_KEY}`,'Content-Type':'application/json'}, body:JSON.stringify({model:process.env.GROQ_MODEL || 'openai/gpt-oss-20b', messages:[{role:'system',content:`Você é JARVIS, assistente pessoal de ${String(name).slice(0,80)}. Responda em português brasileiro, com clareza, cordialidade e concisão. Adapte o tom conforme estas preferências: ${String(style).slice(0,500)}. Não afirme que leu emails, enviou mensagens ou controlou dispositivos se nenhuma integração estiver conectada. Peça confirmação antes de qualquer ação externa.`},...safeMessages], temperature:0.7}) });
      const data = await upstream.json(); if (!upstream.ok) throw new Error(data.error?.message || 'Falha ao consultar o modelo.');
      res.writeHead(200, {'Content-Type':'application/json'}); return res.end(JSON.stringify({reply:data.choices?.[0]?.message?.content || 'Não consegui gerar uma resposta.'}));
    } catch (error) { res.writeHead(400, {'Content-Type':'application/json'}); return res.end(JSON.stringify({error:error.message || 'Falha ao processar a mensagem.'})); }
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  const requested = decodeURIComponent((req.url || '/').split('?')[0]);
  const path = requested === '/' ? 'index.html' : normalize(requested).replace(/^([/\\]|\.\.(?:[/\\]|$))+/, '');
  try { const body = await readFile(join(root, path)); res.writeHead(200, {'Content-Type':mime[extname(path)] || 'application/octet-stream'}); res.end(req.method === 'HEAD' ? undefined : body); }
  catch { res.writeHead(404); res.end('Não encontrado'); }
}).listen(port, () => console.log(`HXB-JARVIS disponível em http://localhost:${port}`));
