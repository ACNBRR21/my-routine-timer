/**
 * Cloudflare Worker for Anchor & Flow AI Proxy
 * Deploy this on Cloudflare Workers (Free tier: 100,000 requests/day).
 * 
 * Instructions:
 * 1. Go to https://dash.cloudflare.com/ -> Workers & Pages -> Create Application -> Create Worker
 * 2. Paste this entire code into the worker editor.
 * 3. Go to Settings -> Variables -> Environment Variables:
 *    Add 'OPENAI_API_KEY' (your OpenAI key)
 *    Add 'DEEPSEEK_API_KEY' (your DeepSeek key)
 * 4. Click Save and Deploy. Copy your worker URL (e.g., https://anchor-flow-proxy.yourname.workers.dev).
 * 5. Paste that URL into Anchor & Flow's Settings under "Serverless Proxy URL".
 */

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    // Friendly health check on browser GET
    if (request.method === 'GET') {
      return new Response(JSON.stringify({
        status: 'online',
        service: 'Anchor & Flow AI Proxy (Cloudflare Worker)',
        message: 'Proxy is running, healthy, and ready to process requests!',
        origin: 'https://acnbrr21.github.io/my-routine-timer/'
      }, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed. Send a POST request with JSON.' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    try {
      const body = await request.json();
      const { systemPrompt, userPrompt, model } = body || {};

      if (!systemPrompt || !userPrompt) {
        return new Response(JSON.stringify({ error: 'Missing systemPrompt or userPrompt' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      const openaiKey = env.OPENAI_API_KEY;
      const deepseekKey = env.DEEPSEEK_API_KEY;

      // 1. Try OpenAI
      if (openaiKey) {
        try {
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${openaiKey}`
            },
            body: JSON.stringify({
              model: model || 'gpt-4o-mini',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              temperature: 0.2
            })
          });

          if (res.ok) {
            const data = await res.json();
            const content = data.choices && data.choices[0] ? data.choices[0].message.content : '';
            return new Response(JSON.stringify({
              engine: 'OpenAI (gpt-4o-mini)',
              content: content
            }), {
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
          }
        } catch (e) {
          console.warn('OpenAI error in worker:', e);
        }
      }

      // 2. Fallback to DeepSeek
      if (deepseekKey) {
        try {
          const res = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${deepseekKey}`
            },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              temperature: 0.2
            })
          });

          if (res.ok) {
            const data = await res.json();
            const content = data.choices && data.choices[0] ? data.choices[0].message.content : '';
            return new Response(JSON.stringify({
              engine: 'DeepSeek (deepseek-chat)',
              content: content
            }), {
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
          }
        } catch (e) {
          console.warn('DeepSeek error in worker:', e);
        }
      }

      return new Response(JSON.stringify({ error: 'AI processing failed or no keys configured' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
};
