// Vercel Serverless Function
//
// Purpose: keep the Anthropic (Claude) API key on the server (a Vercel
// environment variable) instead of in the browser. The frontend
// (index.html) posts { model, system, messages } here; this function
// attaches the key and forwards the request to Anthropic's Messages API.

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: { message: 'Method not allowed. Use POST.' } });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: {
        message:
          'Server is missing ANTHROPIC_API_KEY. In your Vercel project, go to Settings \u2192 Environment Variables, add ANTHROPIC_API_KEY, then redeploy.',
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
  const { model, system, messages } = body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: { message: 'Missing "messages" in request body.' } });
    return;
  }

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-5',
        max_tokens: 4096,
        temperature: 0.3,
        system: system || undefined,
        messages,
      }),
    });

    const data = await anthropicRes.json().catch(() => ({}));

    if (!anthropicRes.ok) {
      res.status(anthropicRes.status).json({
        error: {
          message: data?.error?.message || `Anthropic request failed (HTTP ${anthropicRes.status}).`,
        },
      });
      return;
    }

    // Normalize to the same shape the frontend expects:
    // { choices: [ { message: { content: "..." } } ] }
    const text = Array.isArray(data?.content)
      ? data.content.map((block) => block?.text || '').join('')
      : '';

    res.status(200).json({ choices: [{ message: { content: text || '(No content returned.)' } }] });
  } catch (err) {
    res.status(500).json({ error: { message: 'Server error calling Anthropic: ' + err.message } });
  }
};
