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
- Atalhos de instalação PWA e bloqueio de tela ativa para uso contínuo em tablet.
- Interface para Instagram, TikTok, YouTube, e-mail, WhatsApp, Telegram e Home Assistant, todos identificados como **não conectados** até configurar OAuth/API oficial.

## Integrações ainda necessárias

Instagram, TikTok e YouTube exigem apps de desenvolvedor e OAuth oficial, permissões aprovadas e armazenamento seguro de tokens; a publicação e as respostas devem pedir confirmação. E-mail requer OAuth do Google com escopo mínimo de leitura. WhatsApp requer a API oficial da Meta e webhook; Telegram requer um bot protegido. Essas integrações ainda não estão ativas. A clonagem de voz também exige um provedor especializado e consentimento explícito do titular.

Antes de publicar, configure a chave do modelo como segredo de ambiente no host. Não coloque credenciais em arquivos do frontend, no Git ou em `localStorage`.

## Uso contínuo no tablet

Abra o domínio da Vercel no Chrome/Edge do tablet e escolha **Instalar app** (ou **Adicionar à tela inicial** no menu). No Safari do iPad, use **Compartilhar → Adicionar à Tela de Início**. O botão **Tela ativa** solicita ao navegador que evite apagar o ecrã enquanto o JARVIS estiver visível. Para operação longa, mantenha o tablet ligado à energia e permita que o navegador fique em primeiro plano. O service worker mantém a interface estática disponível em cache, mas o chat precisa de internet.