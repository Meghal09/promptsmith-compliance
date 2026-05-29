# Promptsmith Compliance

Bank-grade AML/KYC compliance assistant.

## Three tools in one:
- **SAR Generator** — Draft SARs for USA, UK, Canada, Australia, Singapore, EU
- **KYC Review Copilot** — Review any customer type with full risk assessment
- **Country Briefing** — AML rules for 50+ jurisdictions

## Deploy to Vercel in 2 minutes

### Option 1 — Vercel CLI (fastest)
```bash
npm install -g vercel
cd promptsmith-compliance-app
vercel deploy
# When prompted: set ANTHROPIC_API_KEY environment variable
```

### Option 2 — Vercel Dashboard
1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → Import the repo
3. Add environment variable: `ANTHROPIC_API_KEY` = your Anthropic API key
4. Click Deploy

### Get your Anthropic API key
1. Go to console.anthropic.com
2. API Keys → Create Key
3. Copy and paste into Vercel environment variables

## Local development
```bash
npm install
echo "ANTHROPIC_API_KEY=your_key_here" > .env.local
npm run dev
# Open http://localhost:3000
```

## What is built in
- All 51 country compliance rules
- Global compliance agent (10 non-negotiable rules)
- SAR templates for 6 jurisdictions
- KYC checklists for 6 customer types
- AML typologies library (10 typologies)
- PEP lookback periods
- FATF grey/black list intelligence
- Sanctions regimes (OFAC, EU, UK, UN)
- Risk scoring model
- UBO tracing rules

## Disclaimer
Compliance tool only. Not legal advice.
