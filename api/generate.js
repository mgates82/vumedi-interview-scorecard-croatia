// Vercel Serverless Function
//
// Purpose: keep the OpenAI API key on the server (a Vercel environment
// variable) instead of in the browser. The frontend (index.html) posts
// { model, temperature, messages } here; this function attaches the key
// and forwards the request to OpenAI's Chat Completions API.

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: { message: 'Method not allowed. Use POST.' } });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: {
        message:
          'Server is missing OPENAI_API_KEY. In your Vercel project, go to Settings \u2192 Environment Variables, add OPENAI_API_KEY, then redeploy.',
      },
    });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  const { model, temperature, messages } = body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: { message: 'Missing "messages" in request body.' } });
    return;
  }

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        temperature: typeof temperature === 'number' ? temperature : 0.3,
        messages,
      }),
    });

    const data = await openaiRes.json().catch(() => ({}));

    if (!openaiRes.ok) {
      res.status(openaiRes.status).json({
        error: {
          message: data?.error?.message || `OpenAI request failed (HTTP ${openaiRes.status}).`,
        },
      });
      return;
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: { message: 'Server error calling OpenAI: ' + err.message } });
  }
};
