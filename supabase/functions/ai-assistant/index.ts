// Supabase Edge Function: set OPENAI_API_KEY as a server-side secret before deployment.
// This endpoint is a starting point; connect a reviewed nutrition-plan context before use.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
serve(async (req) => {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });
  const url = Deno.env.get('SUPABASE_URL')!, anon = Deno.env.get('SUPABASE_ANON_KEY')!, key = Deno.env.get('OPENAI_API_KEY');
  const auth = req.headers.get('Authorization');
  if (!auth) return new Response(JSON.stringify({error:'Authentication required'}), {status:401,headers:{...cors,'Content-Type':'application/json'}});
  const sb = createClient(url, anon, {global:{headers:{Authorization:auth}}});
  const {data:{user}} = await sb.auth.getUser();
  if (!user) return new Response(JSON.stringify({error:'Invalid session'}), {status:401,headers:{...cors,'Content-Type':'application/json'}});
  if (!key) return new Response(JSON.stringify({error:'AI server key is not configured'}), {status:503,headers:{...cors,'Content-Type':'application/json'}});
  try {
    const {question, image} = await req.json();
    if ((!question || typeof question !== 'string') && !image) return new Response(JSON.stringify({error:'Send a question or image'}), {status:400,headers:{...cors,'Content-Type':'application/json'}});
    const content:any[] = [{type:'text',text:`Você é uma assistente de bem-estar em português do Brasil. Seja clara e acolhedora. Não diagnostique nem prescreva dietas, não altere um plano de nutricionista. Diferencie estimativas de dados confirmados. Para fotos de refeições, estime porções, calorias e macros com intervalos e incerteza; peça detalhes se necessário. Nunca trate calorias gastas em exercício como algo que deve ser automaticamente descontado da comida. Contexto da pergunta: ${question||'Estime os alimentos e porções visíveis nesta imagem.'}`}];
    if (image && typeof image === 'string' && image.startsWith('data:image/')) content.push({type:'image_url',image_url:{url:image,detail:'high'}});
    const response = await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-4o-mini',messages:[{role:'user',content}],max_tokens:900})});
    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message||'AI request failed');
    return new Response(JSON.stringify({answer:result.choices?.[0]?.message?.content||'Não foi possível gerar uma resposta.'}),{headers:{...cors,'Content-Type':'application/json'}});
  } catch(e) { return new Response(JSON.stringify({error:String(e)}),{status:500,headers:{...cors,'Content-Type':'application/json'}}); }
});
