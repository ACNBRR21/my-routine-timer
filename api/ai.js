// Serverless API Handler for Vercel / Netlify / Node.js
// Proxies requests to OpenAI (Primary) and DeepSeek (Fallback)
// Keeps your API keys secure and allows anyone to use the tool without entering keys.

export default async function handler(req, res) {
  // Enable CORS so this endpoint can be called from GitHub Pages or any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, systemPrompt, userPrompt, model } = req.body || {};

  if (!systemPrompt || !userPrompt) {
    return res.status(400).json({ error: 'Missing systemPrompt or userPrompt' });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  const deepseekKey = process.env.DEEPSEEK_API_KEY;

  if (!openaiKey && !deepseekKey) {
    return res.status(500).json({
      error: 'No API keys configured on server. Please set OPENAI_API_KEY or DEEPSEEK_API_KEY in environment variables.'
    });
  }

  // 1. Try OpenAI first (Option 1)
  if (openaiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: model || 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.2
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices && data.choices[0] ? data.choices[0].message.content : '';
        return res.status(200).json({
          engine: 'OpenAI (GPT-4o Flagship)',
          content: content
        });
      }
      console.warn('OpenAI returned HTTP ' + response.status + ', attempting DeepSeek fallback...');
    } catch (err) {
      console.warn('OpenAI request error, attempting DeepSeek fallback:', err);
    }
  }

  // 2. Try DeepSeek (Option 2 Fallback)
  if (deepseekKey) {
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
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

      if (response.ok) {
        const data = await response.json();
        const content = data.choices && data.choices[0] ? data.choices[0].message.content : '';
        return res.status(200).json({
          engine: 'DeepSeek (deepseek-chat)',
          content: content
        });
      }
      const errText = await response.text();
      return res.status(502).json({ error: 'DeepSeek API error: ' + errText });
    } catch (err) {
      return res.status(502).json({ error: 'DeepSeek request failed: ' + err.message });
    }
  }

  return res.status(502).json({ error: 'All AI engines failed.' });
}
