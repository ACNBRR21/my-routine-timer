// =========================================================
// ANCHOR & FLOW — MULTI-TIER AI ENGINE
// OpenAI (GPT-4o / GPT-4o-mini), DeepSeek, Cloudflare Proxy, & Local Heuristics
// =========================================================

const STORAGE_KEY_OPENAI = 'anchor_flow_openai_key';
const STORAGE_KEY_DEEPSEEK = 'anchor_flow_deepseek_key';
const STORAGE_KEY_PROXY = 'anchor_flow_proxy_url';
const STORAGE_KEY_PREFERRED_ENGINE = 'anchor_flow_preferred_engine';
const DEFAULT_PROXY_URL = 'https://anchor-flow-proxy.rishi-roy.workers.dev';

async function executeMultiTierAi(systemPrompt, userPrompt, options = {}) {
  const openaiKey = localStorage.getItem(STORAGE_KEY_OPENAI) || '';
  const deepseekKey = localStorage.getItem(STORAGE_KEY_DEEPSEEK) || '';
  const proxyUrl = localStorage.getItem(STORAGE_KEY_PROXY) || DEFAULT_PROXY_URL;
  const preferred = localStorage.getItem(STORAGE_KEY_PREFERRED_ENGINE) || 'gpt-4o';

  // 1. Try OpenAI directly if key is configured
  async function tryOpenAI(modelName = 'gpt-4o') {
    if (!openaiKey) return null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.2
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
          return {
            engine: modelName === 'gpt-4o' ? 'OpenAI (GPT-4o Flagship)' : `OpenAI (${modelName})`,
            content: data.choices[0].message.content,
            isLlm: true
          };
        }
      }
    } catch (e) {
      console.warn('OpenAI API fetch error:', e);
    }
    return null;
  }

  // 2. Try DeepSeek directly if key is configured
  async function tryDeepSeek() {
    if (!deepseekKey) return null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);
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
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
          return {
            engine: 'DeepSeek (deepseek-chat)',
            content: data.choices[0].message.content,
            isLlm: true
          };
        }
      }
    } catch (e) {
      console.warn('DeepSeek fetch error:', e);
    }
    return null;
  }

  // 3. Try Cloudflare Worker / Serverless Proxy
  async function tryProxy() {
    const target = proxyUrl || (window.location.origin.includes('vercel.app') ? '/api/ai' : '');
    if (!target) return null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(target, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, userPrompt, model: preferred }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data && data.content) {
          return {
            engine: data.engine || 'Cloudflare AI Proxy',
            content: data.content,
            isLlm: true
          };
        }
      }
    } catch(e) {
      console.warn('AI Proxy fetch error:', e);
    }
    return null;
  }

  // Multi-tier priority resolution:
  if (preferred === 'deepseek') {
    const ds = await tryDeepSeek();
    if (ds) return ds;
    const oai = await tryOpenAI('gpt-4o');
    if (oai) return oai;
    const prx = await tryProxy();
    if (prx) return prx;
  } else if (preferred === 'gpt-4o-mini') {
    const oai = await tryOpenAI('gpt-4o-mini');
    if (oai) return oai;
    const ds = await tryDeepSeek();
    if (ds) return ds;
    const prx = await tryProxy();
    if (prx) return prx;
  } else {
    // Default: gpt-4o -> deepseek -> proxy
    const oai = await tryOpenAI('gpt-4o');
    if (oai) return oai;
    const ds = await tryDeepSeek();
    if (ds) return ds;
    const prx = await tryProxy();
    if (prx) return prx;
  }

  return null; // Return null to invoke local time-aware executive heuristics
}

// Exports for Node testing and browser global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    executeMultiTierAi,
    STORAGE_KEY_OPENAI,
    STORAGE_KEY_DEEPSEEK,
    STORAGE_KEY_PROXY,
    STORAGE_KEY_PREFERRED_ENGINE,
    DEFAULT_PROXY_URL
  };
}
