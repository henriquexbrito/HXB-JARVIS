export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Método não permitido.' }); }
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'Configure OPENAI_API_KEY nas variáveis de ambiente da Vercel para ativar a conversa inteligente.' });
  try {
    const { messages = [], name = 'Henrique', style = '' } = req.body || {};
    if (!Array.isArray(messages)) return res.status(400).json({ error: 'Formato de conversa inválido.' });
    const safeMessages = messages.slice(-12).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '').slice(0, 5000) }));
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'system', content: `Você é JARVIS, assistente pessoal de ${String(name).slice(0, 80)}. Responda em português brasileiro, com clareza, cordialidade e concisão. Adapte o tom conforme estas preferências: ${String(style).slice(0, 500)}. Não afirme que leu emails, enviou mensagens ou controlou dispositivos se nenhuma integração estiver conectada. Peça confirmação antes de qualquer ação externa.` }, ...safeMessages],
        temperature: 0.7
      })
    });
    const data = await upstream.json();
    if (!upstream.ok) return res.status(upstream.status).json({ error: data.error?.message || 'Falha ao consultar o modelo.' });
    return res.status(200).json({ reply: data.choices?.[0]?.message?.content || 'Não consegui gerar uma resposta.' });
  } catch { return res.status(500).json({ error: 'Falha ao processar a mensagem.' }); }
}
