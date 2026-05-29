import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'

const TOOLS = [
  {
    id: 'SAR',
    icon: '📋',
    label: 'SAR Generator',
    desc: 'Draft a Suspicious Activity Report',
    color: '#EF4444',
    placeholder: 'Describe the suspicious activity...\n\nExample: Customer has been making cash deposits of $9,800, $9,500, $9,700 over 3 weeks at different branches. No explanation given when asked.',
    needsJurisdiction: true,
    needsCustomerType: false,
  },
  {
    id: 'KYC',
    icon: '🔍',
    label: 'KYC Review',
    desc: 'Review a customer for compliance',
    color: '#F59E0B',
    placeholder: 'Paste customer details...\n\nExample: Company name, registration country, directors, shareholders, business type, transaction volumes expected, documents already provided.',
    needsJurisdiction: true,
    needsCustomerType: true,
  },
  {
    id: 'Country',
    icon: '🌍',
    label: 'Country Briefing',
    desc: 'Get AML rules for any jurisdiction',
    color: '#10B981',
    placeholder: 'Ask about any country or regulation...\n\nExample: What AML rules apply to a crypto exchange in Singapore? Or: What does FATF Recommendation 12 say about PEPs?',
    needsJurisdiction: true,
    needsCustomerType: false,
  },
]

const JURISDICTIONS = [
  'USA', 'UK', 'EU', 'Singapore', 'UAE', 'Australia', 'Canada',
  'India', 'South Africa', 'Nigeria', 'Switzerland', 'Germany',
  'France', 'Hong Kong', 'Japan', 'Malaysia', 'Brazil',
  'Saudi Arabia', 'Qatar', 'Kenya', 'Panama', 'Cayman Islands',
  'Global / Multi-jurisdiction',
]

const CUSTOMER_TYPES = ['Individual', 'Company', 'Trust', 'PEP', 'NPO', 'MSB']

const RISK_COLOURS = {
  LOW: '#10B981', MEDIUM: '#F59E0B', HIGH: '#EF4444',
  UNACCEPTABLE: '#7C3AED', PASS: '#10B981', FAIL: '#EF4444',
}

function RiskBadge({ text }) {
  const key = Object.keys(RISK_COLOURS).find(k => text?.toUpperCase().includes(k))
  const bg = key ? RISK_COLOURS[key] : '#64748B'
  return (
    <span style={{
      background: bg + '22', border: `1px solid ${bg}44`,
      color: bg, padding: '2px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
      fontFamily: 'Space Mono, monospace', whiteSpace: 'nowrap'
    }}>{text}</span>
  )
}

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#6366F1', padding: '24px 0' }}>
      <div style={{
        width: 20, height: 20, border: '2px solid #1E293B',
        borderTop: '2px solid #6366F1', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <span style={{ fontSize: 13, fontFamily: 'Space Mono, monospace', opacity: 0.8 }}>
        Analysing with Promptsmith Compliance...
      </span>
    </div>
  )
}

function OutputBlock({ text }) {
  if (!text) return null

  // Parse sections for highlighted display
  const lines = text.split('\n')

  return (
    <div style={{
      background: '#0A0F1C',
      border: '1px solid rgba(99,102,241,0.2)',
      borderRadius: 12,
      overflow: 'hidden',
      marginTop: 20,
      animation: 'fadeUp 0.4s ease both',
    }}>
      {/* Header bar */}
      <div style={{
        background: 'rgba(99,102,241,0.1)',
        borderBottom: '1px solid rgba(99,102,241,0.15)',
        padding: '10px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span style={{ fontSize: 11, fontFamily: 'Space Mono, monospace', color: '#6366F1', fontWeight: 700 }}>
          COMPLIANCE OUTPUT
        </span>
        <button
          onClick={() => navigator.clipboard.writeText(text)}
          style={{
            background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
            color: '#818CF8', padding: '4px 14px', borderRadius: 6,
            fontSize: 11, cursor: 'pointer', fontFamily: 'Space Mono, monospace'
          }}>
          Copy
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
        {lines.map((line, i) => {
          // Section headers
          if (line.startsWith('═')) return (
            <div key={i} style={{ borderTop: '1px solid rgba(99,102,241,0.2)', margin: '12px 0' }} />
          )
          if (line.startsWith('──')) return (
            <div key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '8px 0' }} />
          )
          // Bold section labels
          if (/^(WHO:|WHAT:|WHY:|HOW:|ACTION:|RISK ASSESSMENT:|DOCUMENTS|DECISION|NEXT STEPS|SCREENING|JURISDICTION|REPORTING|KYC REQUIREMENTS|SANCTIONS|ACTION PLAN|LEGAL BASIS|COMPLIANCE REMINDERS|EDD REQUIRED|QUALITY CHECKLIST|RISK FLAGS|DISCLAIMER)/.test(line)) {
            return (
              <div key={i} style={{
                fontSize: 11, fontFamily: 'Space Mono, monospace',
                color: '#6366F1', fontWeight: 700, letterSpacing: '0.06em',
                marginTop: 14, marginBottom: 4
              }}>{line}</div>
            )
          }
          // Pass/fail lines
          if (line.includes('✅') || line.includes('❌') || line.includes('⚠️') || line.includes('⛔')) {
            const col = line.includes('✅') ? '#10B981' : line.includes('❌') ? '#EF4444' : '#F59E0B'
            return (
              <div key={i} style={{ color: col, fontSize: 13, padding: '2px 0', lineHeight: 1.6 }}>{line}</div>
            )
          }
          // Arrow items
          if (line.startsWith('→') || line.startsWith('  →')) {
            return (
              <div key={i} style={{ color: '#94A3B8', fontSize: 13, padding: '2px 0 2px 8px', lineHeight: 1.6 }}>
                <span style={{ color: '#6366F1' }}>→</span>{line.replace(/→/, '')}
              </div>
            )
          }
          // Main header line
          if (line.startsWith('SUSPICIOUS ACTIVITY REPORT') || line.startsWith('KYC REVIEW') || line.startsWith('COMPLIANCE BRIEFING')) {
            return (
              <div key={i} style={{
                fontSize: 15, fontWeight: 700, color: '#E2E8F0',
                fontFamily: 'Space Mono, monospace', padding: '4px 0'
              }}>{line}</div>
            )
          }
          // Empty line
          if (!line.trim()) return <div key={i} style={{ height: 6 }} />
          // Default
          return (
            <div key={i} style={{ color: '#CBD5E1', fontSize: 13, lineHeight: 1.7, padding: '1px 0' }}>
              {line}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Home() {
  const [tool, setTool]               = useState('SAR')
  const [jurisdiction, setJurisdiction] = useState('USA')
  const [customerType, setCustomerType] = useState('Individual')
  const [input, setInput]             = useState('')
  const [output, setOutput]           = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [history, setHistory]         = useState([])
  const outputRef = useRef(null)

  const activeTool = TOOLS.find(t => t.id === tool)

  async function run() {
    if (!input.trim()) return
    setLoading(true)
    setError('')
    setOutput('')
    try {
      const res = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool, jurisdiction, customerType, input })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOutput(data.result)
      setHistory(h => [{ tool, jurisdiction, customerType, input: input.slice(0, 60) + '...', output: data.result, ts: new Date().toLocaleTimeString() }, ...h.slice(0, 9)])
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (e) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function loadHistory(item) {
    setTool(item.tool)
    setJurisdiction(item.jurisdiction)
    setCustomerType(item.customerType)
    setInput(item.input.replace('...', ''))
    setOutput(item.output)
  }

  return (
    <>
      <Head>
        <title>Promptsmith Compliance</title>
        <meta name="description" content="Bank-grade AML/KYC compliance intelligence" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚖️</text></svg>" />
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* ── Header ── */}
        <header style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(15,23,42,0.8)',
          backdropFilter: 'blur(12px)',
          padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 56, position: 'sticky', top: 0, zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16
            }}>⚖️</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Space Mono, monospace', color: '#E2E8F0' }}>
                Promptsmith Compliance
              </div>
              <div style={{ fontSize: 10, color: '#64748B', fontFamily: 'Space Mono, monospace' }}>
                Bank-grade AML/KYC Intelligence
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['SAR', 'KYC', 'Country'].map(t => (
              <div key={t} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: t === 'SAR' ? '#EF4444' : t === 'KYC' ? '#F59E0B' : '#10B981',
                opacity: tool === t ? 1 : 0.3, transition: 'opacity 0.2s'
              }} />
            ))}
          </div>
        </header>

        <div style={{ flex: 1, display: 'flex', maxWidth: 1400, margin: '0 auto', width: '100%', padding: '0 16px' }}>

          {/* ── Left sidebar — history ── */}
          <aside style={{
            width: 220, flexShrink: 0, padding: '20px 16px 20px 0',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            display: 'none', // hide on small screens — simplified
          }}>
          </aside>

          {/* ── Main ── */}
          <main style={{ flex: 1, padding: '28px 0 60px', maxWidth: 860, margin: '0 auto', width: '100%' }}>

            {/* Hero */}
            <div className="fade-up" style={{ marginBottom: 32, textAlign: 'center' }}>
              <h1 style={{
                fontSize: 'clamp(24px,4vw,38px)', fontWeight: 700,
                fontFamily: 'Space Mono, monospace', lineHeight: 1.2,
                background: 'linear-gradient(135deg, #E2E8F0 0%, #6366F1 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                marginBottom: 10
              }}>
                Compliance in seconds.<br />Not hours.
              </h1>
              <p style={{ color: '#64748B', fontSize: 14, maxWidth: 500, margin: '0 auto' }}>
                SAR narratives · KYC reviews · Country briefings<br />
                All jurisdictions · Bank-grade standards
              </p>
            </div>

            {/* Tool selector */}
            <div className="fade-up fade-up-1" style={{
              display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24
            }}>
              {TOOLS.map(t => (
                <button key={t.id} onClick={() => { setTool(t.id); setOutput('') }} style={{
                  background: tool === t.id ? `${t.color}15` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${tool === t.id ? t.color + '40' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 12, padding: '16px 12px', cursor: 'pointer',
                  textAlign: 'left', transition: 'all 0.2s',
                  transform: tool === t.id ? 'translateY(-2px)' : 'none',
                  boxShadow: tool === t.id ? `0 8px 24px ${t.color}20` : 'none'
                }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{t.icon}</div>
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: tool === t.id ? t.color : '#E2E8F0',
                    fontFamily: 'Space Mono, monospace', marginBottom: 2
                  }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>{t.desc}</div>
                </button>
              ))}
            </div>

            {/* Config row */}
            <div className="fade-up fade-up-2" style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              {/* Jurisdiction */}
              {activeTool?.needsJurisdiction && (
                <div style={{ flex: 1, minWidth: 160 }}>
                  <label style={{ fontSize: 10, color: '#64748B', fontFamily: 'Space Mono, monospace', display: 'block', marginBottom: 5 }}>
                    JURISDICTION
                  </label>
                  <select
                    value={jurisdiction} onChange={e => setJurisdiction(e.target.value)}
                    style={{
                      width: '100%', background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 8, padding: '9px 12px', color: '#E2E8F0', fontSize: 13,
                      cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', outline: 'none'
                    }}>
                    {JURISDICTIONS.map(j => <option key={j} value={j}>{j}</option>)}
                  </select>
                </div>
              )}
              {/* Customer type */}
              {activeTool?.needsCustomerType && (
                <div style={{ flex: 1, minWidth: 140 }}>
                  <label style={{ fontSize: 10, color: '#64748B', fontFamily: 'Space Mono, monospace', display: 'block', marginBottom: 5 }}>
                    CUSTOMER TYPE
                  </label>
                  <select
                    value={customerType} onChange={e => setCustomerType(e.target.value)}
                    style={{
                      width: '100%', background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 8, padding: '9px 12px', color: '#E2E8F0', fontSize: 13,
                      cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', outline: 'none'
                    }}>
                    {CUSTOMER_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="fade-up fade-up-3" style={{ marginBottom: 14 }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={activeTool?.placeholder}
                rows={6}
                onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) run() }}
                style={{
                  width: '100%', background: '#0A0F1C',
                  border: `1px solid ${input ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 12, padding: '16px', color: '#E2E8F0',
                  fontSize: 14, lineHeight: 1.6, resize: 'vertical',
                  fontFamily: 'DM Sans, sans-serif', outline: 'none',
                  transition: 'border-color 0.2s',
                  minHeight: 140
                }}
              />
              <div style={{ fontSize: 10, color: '#334155', marginTop: 4, textAlign: 'right', fontFamily: 'Space Mono, monospace' }}>
                ⌘ + Enter to run
              </div>
            </div>

            {/* Run button */}
            <div className="fade-up fade-up-4">
              <button
                onClick={run}
                disabled={loading || !input.trim()}
                style={{
                  width: '100%', padding: '14px',
                  background: loading ? 'rgba(99,102,241,0.2)' : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  border: 'none', borderRadius: 10, color: '#fff',
                  fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Space Mono, monospace', letterSpacing: '0.04em',
                  transition: 'all 0.2s', opacity: !input.trim() ? 0.4 : 1,
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.4)',
                }}>
                {loading ? '...' : `▶  Run ${activeTool?.label}`}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginTop: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8,
                color: '#FCA5A5', fontSize: 13
              }}>
                ❌ {error}
                {error.includes('API key') && (
                  <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
                    Set ANTHROPIC_API_KEY in your Vercel environment variables
                  </div>
                )}
              </div>
            )}

            {/* Loading */}
            {loading && <Spinner />}

            {/* Output */}
            <div ref={outputRef}>
              {output && <OutputBlock text={output} />}
            </div>

            {/* Recent history */}
            {history.length > 0 && !output && (
              <div style={{ marginTop: 32 }}>
                <div style={{ fontSize: 10, color: '#334155', fontFamily: 'Space Mono, monospace', marginBottom: 10 }}>
                  RECENT
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {history.slice(0, 5).map((h, i) => (
                    <button key={i} onClick={() => loadHistory(h)} style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: 8, padding: '10px 14px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s'
                    }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontFamily: 'Space Mono, monospace', color: '#6366F1' }}>{h.tool}</span>
                        <span style={{ fontSize: 12, color: '#64748B' }}>{h.input}</span>
                      </div>
                      <span style={{ fontSize: 10, color: '#334155', fontFamily: 'Space Mono, monospace' }}>{h.ts}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </main>
        </div>

        {/* ── Footer ── */}
        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '14px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 11, color: '#334155', fontFamily: 'Space Mono, monospace'
        }}>
          <span>Promptsmith Compliance · 2026</span>
          <span style={{ color: '#1E293B' }}>
            Not legal advice · Compliance tool only · Bank-grade standards
          </span>
        </footer>

      </div>
    </>
  )
}
