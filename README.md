# Meu Bem-Estar — versão inicial implantável

App web responsivo para celular e computador, visual rosa/lilás. Inclui autenticação Supabase, registros sincronizados de alimentação/macros, água, exercícios, peso/medidas e gráfico de peso. A base para IA e análise de fotos fica como Edge Function separada no servidor.

## Importante: antes de usar com dados reais

Este pacote é uma base funcional de projeto, não um serviço já hospedado. Para persistência entre dispositivos, você precisa criar um projeto Supabase e configurar as credenciais. A tela de IA e análise de fotos ainda informa que precisa ser ligada à função de servidor; não afirma que uma análise foi feita.

## 1. Configurar banco e login

1. Crie um projeto em https://supabase.com/ e guarde o Project URL e a chave anon/public.
2. No SQL Editor do Supabase, execute `supabase/schema.sql`.
3. Edite `config.js` com o Project URL e a chave anon/public. Nunca use a chave `service_role` no navegador.
4. Em Authentication → URL Configuration, configure as URLs do site e de redirecionamento depois de publicar.
5. Publique a pasta em um host estático com HTTPS (por exemplo, Netlify, Vercel ou Cloudflare Pages). Não abra `index.html` como arquivo local: módulos ES e autenticação exigem um servidor HTTP/HTTPS.

## 2. Ligar a IA e estimativa por foto

A função `supabase/functions/ai-assistant/index.ts` é uma base de servidor. Antes de usar:

1. Instale a Supabase CLI e vincule o projeto.
2. Configure o segredo no servidor: `supabase secrets set OPENAI_API_KEY=...`.
3. Faça deploy: `supabase functions deploy ai-assistant`.
4. Atualize os handlers de `app.js` para chamar a função com a sessão do usuário; envie imagem como data URL comprimida, não uma URL pública. Configure limite de tamanho, rate limit e política de retenção antes de aceitar fotos.
5. Conecte o contexto completo e revisado do plano alimentar antes de usar a IA para responder perguntas específicas sobre equivalências. A função atual tem instruções gerais, não indexa automaticamente o PDF.

## Segurança e privacidade

- O esquema usa Row Level Security (RLS) para que cada conta leia/escreva apenas os próprios registros.
- Publique apenas por HTTPS e use a chave pública do Supabase no cliente. Chaves privadas ficam somente em secrets no servidor.
- Ative confirmação de e-mail, política de senha adequada, limites de requisições e backups no provedor.
- Fotos corporais não são enviadas neste protótipo; o campo ainda não persiste nem envia essas fotos. Se adicionar armazenamento, use bucket privado com políticas por usuário e URLs temporárias.
- Adicione exportação e exclusão de dados e uma política de privacidade antes de distribuir o app.
- Informações de saúde são sensíveis. Use apenas com consentimento, proteja a conta e não registre dados que não queira armazenar.

## Limites conhecidos desta versão

- O plano está resumido na interface; consulte o PDF original para quantidades e substituições completas.
- Os valores nutricionais são inseridos pelo usuário. A estimativa por foto precisa da integração de servidor descrita acima.
- A interface mostra o gráfico de peso e registra medidas; não calcula metas médicas.
- Não há integração com Apple Health, Google Fit, relógios, notificações ou cálculo confiável de calorias gastas.
- Não desconta calorias de exercício da alimentação e não substitui profissionais de saúde.
