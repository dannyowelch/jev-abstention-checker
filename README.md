# Jev Abstention Checker

A demo app inspired by [JEV TIP 005](https://x.com/parcadei/status/2101801605121094138) that compares three approaches to getting reliable answers from AI when evidence is thin.

## What it Demonstrates

Before trusting a Choice answer, check whether the input contains enough decision-relative evidence. This app shows three gates side by side:

1. **Forced Choice** — Standard binary choice (no abstain option). May confidently answer even when evidence is thin.

2. **Choice + IDK** — Binary choice with an explicit "idk" / abstain option. Model can decline to answer.

3. **Split Noul Gate** — Two-stage approach:
   - First: Noul query asking "Does the state contain enough decision-relative evidence?"
   - Then: If evidence is sufficient (confidence > 70%), run the forced Choice; otherwise abstain.

### Label-Order Sensitivity

The **Swap labels** control re-runs all gates with labels reversed. This reveals whether label order influences the answer more than the actual evidence does (thin-evidence order dominance).

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- TypeSafe API (JEV model)

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## TypeSafe API Key

You need a TypeSafe API key to use this app:

1. Get your key from [TypeSafe](https://typesafe.ai)
2. Enter it in the "TypeSafe API Key" field in the UI

### Optional: Server-side Key

You can optionally set a server-side fallback key (the UI key always overrides it):

```bash
TYPESAFE_API_KEY=ts_your_key_here npm run dev
```

For production deployment, add `TYPESAFE_API_KEY` as an environment variable.

## Deployment

This app is ready for Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/jev-abstention-checker)

Or manually:

```bash
npm run build
npm start
```

## Sample Inputs

The app includes two built-in samples:

- **Thin sample**: Intentionally ambiguous with minimal evidence. Gates should disagree.
- **Rich sample**: Clear, quantified evidence. Gates should agree on a definite answer.

Try both to see how each gate behaves with different evidence quality.

## License

MIT - Personal demo, no warranty.
