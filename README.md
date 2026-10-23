# HXB-JARVIS

Assistente pessoal em português, inspirado na abordagem local-first do [OpenJarvis](https://github.com/open-jarvis/OpenJarvis). Esta primeira versão inclui conversa com modelo configurável, entrada e saída de voz pelo navegador, tarefas locais e um estúdio para narrar roteiros.

## Iniciar

Requer Node.js 20 ou superior.

```bash
npm start
```

Abra `http://localhost:3000`. Sem chave de API, o painel abre em modo local: tarefas e narração no dispositivo funcionam, enquanto respostas inteligentes aguardam configuração.

Para ativar a conversa com Groq, defina `GROQ_API_KEY` **no ambiente do servidor** (nunca no navegador) e, opcionalmente, `GROQ_MODEL`. O padrão é `openai/gpt-oss-20b`:

```bash
# Linux / macOS
GROQ_API_KEY=sua-chave npm start

# PowerShell
$env:GROQ_API_KEY="sua-chave"; npm start
```

O servidor envia somente as mensagens da conversa à API Groq. Na Vercel, cadastre `GROQ_API_KEY` em **Project Settings → Environment Variables** e faça um novo deploy. O histórico e as preferências ficam no `localStorage` deste navegador. Limpe os dados do site para apagá-los.

## Recursos desta versão

- Chat em português com personalidade configurável e chave mantida no servidor.
- Reconhecimento de fala pelo navegador (Chrome/Edge normalmente oferecem suporte; requer permissão de microfone e contexto seguro).
- Leitura de respostas e narração de textos com vozes instaladas no dispositivo.
- Lista de tarefas salva localmente.
- Interface preparada para e-mail, WhatsApp, Telegram e Home Assistant, identificados como **não conectados**.

## Integrações ainda necessárias

E-mail requer OAuth do Google com escopo mínimo de leitura, fluxo de autorização no servidor e armazenamento seguro de tokens. WhatsApp requer a API oficial da Meta e configuração de webhook; Telegram requer um bot e token protegidos no servidor. Nenhuma dessas integrações está ativa nesta versão, e o app não simula acesso a mensagens nem envia respostas. A clonagem de voz também exige um provedor de voz e consentimento explícito do titular.

Antes de publicar, configure a chave do modelo como segredo de ambiente no host. Não coloque credenciais em arquivos do frontend, no Git ou em `localStorage`.
