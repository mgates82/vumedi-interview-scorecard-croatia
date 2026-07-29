# Vumedi Interview Scorecard Generator

Paste a Croatian/English/mixed interview transcript + notes, get back an English
scorecard formatted for Greenhouse. Built for the Croatian Hiring Employees
course in the Interview at Vumedi program.

## How it works

- `index.html` — the whole UI. Single static file, no build step.
- `api/generate.js` — a small Vercel serverless function. It holds the OpenAI
  API key (as a server-side environment variable) and forwards requests to
  OpenAI, so no one has to paste in their own API key and the key is never
  exposed in the browser.

The "Download as Word doc" button works entirely in the browser (no server
involved) and produces a real `.docx` file, safe with Croatian diacritics
(č, ć, ž, š, đ).

## Deploy to Vercel (one time setup)

1. **Push this folder to a GitHub repo.**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-org>/<your-repo>.git
   git push -u origin main
   ```

2. **Import the repo into Vercel.**
   - Go to [vercel.com/new](https://vercel.com/new), sign in, and select the
     GitHub repo you just pushed.
   - Framework preset: choose "Other" (it's a static site + one serverless
     function — no build step needed).
   - Click **Deploy**.

3. **Add your OpenAI API key.**
   - In the Vercel project, go to **Settings → Environment Variables**.
   - Add a variable named `OPENAI_API_KEY` with your team's OpenAI API key as
     the value (get one at platform.openai.com/api-keys if you don't have one).
   - Apply it to Production (and Preview, if you want preview deployments to
     work too).
   - Go to **Deployments**, open the latest deployment's menu, and
     **Redeploy** (env vars only take effect on a new deployment).

4. **Done.** Vercel gives you a URL like `your-project.vercel.app` — share
   that with your Croatian interviewers. No one needs their own API key or
   any setup on their end.

## Updating later

Any time you edit `index.html` or `api/generate.js` and push to the `main`
branch on GitHub, Vercel automatically redeploys.

## Local testing (optional)

If you have the [Vercel CLI](https://vercel.com/docs/cli) installed:

```bash
npm install -g vercel
vercel dev
```

This runs the site + the `/api/generate` function locally at
`http://localhost:3000`, using an `OPENAI_API_KEY` you can set in a local
`.env` file (never commit that file — it's already in `.gitignore`).

## Cost & usage notes

- Every "Generate scorecard" click makes one OpenAI API call, billed to
  whichever OpenAI account owns the `OPENAI_API_KEY`. Costs are per-token
  (transcript + notes + generated output), typically a few cents per
  interview with `gpt-4o-mini` or `gpt-4o`.
- Consider setting a usage limit or budget alert on the OpenAI account used
  for this key (platform.openai.com → Settings → Limits).
- This app does not store or log transcripts, notes, or generated scorecards
  anywhere — each request is stateless and only lives in the interviewer's
  browser tab.
