/**
 * DealMind AI — Main Application Logic
 * B2B Contract & Procurement Negotiation Co-Pilot
 * HackwithHyderabad 3.0
 */

'use strict';

// ══════════════════════════════════════════════════════
// DEMO DATA: Synthetic Datadog SaaS Renewal Contract
// ══════════════════════════════════════════════════════

const DEMO_CONTRACT = {
  vendor: 'Datadog Inc.',
  title: 'Datadog SaaS Renewal Draft 2026',
  filename: 'Datadog SaaS Renewal 2026.pdf',
  wordCount: '2,847',
  clauses: [
    {
      id: 'c1',
      number: 'Section 1.1',
      title: 'Subscription Fees & Annual Price Escalation',
      text: `Licensee agrees to pay the Annual Subscription Fee of <span class="highlight-risk">$485,000 USD</span> for FY2026, representing a <span class="highlight-risk">32% increase</span> over the FY2025 base rate of $367,000 USD. Datadog reserves the right to increase pricing by up to <span class="highlight-risk">15% annually without prior written consent</span> of the Licensee, provided 30 days written notice is given. Price adjustments shall be effective upon renewal date.`,
      risk: 'high',
      memoryHit: true,
      riskLabel: 'Pricing Risk',
      memoryLabel: 'Memory Hit'
    },
    {
      id: 'c2',
      number: 'Section 2.3',
      title: 'Service Level Agreement (SLA) Commitments',
      text: `Datadog commits to 99.5% monthly uptime availability for the Infrastructure Monitoring and APM modules. In the event of downtime exceeding the SLA threshold, Licensee shall be eligible for service credits equal to <span class="highlight-risk">5% of monthly fees per hour of excess downtime, capped at 20% of monthly fees</span>. Credits shall be applied to the next billing cycle and shall be the <span class="highlight-risk">sole and exclusive remedy</span> for service unavailability.`,
      risk: 'high',
      memoryHit: true,
      riskLabel: 'SLA Cap Risk',
      memoryLabel: '2 Past Breaches'
    },
    {
      id: 'c3',
      number: 'Section 3.7',
      title: 'Auto-Renewal & Cancellation Policy',
      text: `This Agreement shall automatically renew for successive one-year terms unless either party provides written notice of non-renewal at least <span class="highlight-risk">60 days prior to the expiration</span> of the then-current term. Failure to provide timely notice shall obligate Licensee to payment of the full annual renewal fee at the then-current pricing, including any applicable escalation adjustments per Section 1.1.`,
      risk: 'high',
      memoryHit: false,
      riskLabel: 'Auto-Renewal Trap'
    },
    {
      id: 'c4',
      number: 'Section 4.2',
      title: 'Data Processing & Privacy Compliance',
      text: `Datadog shall process Licensee's data in accordance with the Datadog Data Processing Addendum (DPA), incorporated herein by reference. Licensee acknowledges that telemetry data may be retained for up to <span class="highlight-memory">15 months for AI model training purposes</span> unless Licensee explicitly opts out via the privacy settings console. GDPR and CCPA compliance attestations are available upon written request.`,
      risk: 'medium',
      memoryHit: true,
      riskLabel: 'Data Retention',
      memoryLabel: 'Opt-Out Available'
    },
    {
      id: 'c5',
      number: 'Section 5.1',
      title: 'Limitation of Liability',
      text: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, DATADOG'S TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT SHALL NOT EXCEED THE <span class="highlight-risk">TOTAL FEES PAID BY LICENSEE IN THE THREE (3) MONTHS PRECEDING THE CLAIM</span>. IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES, REGARDLESS OF CAUSE.`,
      risk: 'high',
      memoryHit: false,
      riskLabel: 'Liability Cap'
    },
    {
      id: 'c6',
      number: 'Section 6.4',
      title: 'Support Tiers & Response Times',
      text: `Licensee's subscription includes Standard Support. Enterprise Support (P1: 1-hour response, P2: 4-hour response, 24/7 coverage) is available as an add-on at an additional <span class="highlight-risk">$48,000/year</span>. Current contract includes Business Support (P1: 4-hour response, P2: 8-hour response, business hours only). Escalation to Engineering is subject to Datadog's discretion.`,
      risk: 'medium',
      memoryHit: false,
      riskLabel: 'Support Tier'
    },
    {
      id: 'c7',
      number: 'Section 7.2',
      title: 'Usage Limits & Overage Charges',
      text: `Annual subscription includes: 500 infrastructure hosts, 50M custom metrics/month, 200GB log ingestion/day, and 10 APM services. Usage exceeding these limits will be billed at standard list rates: <span class="highlight-risk">$18/host/month, $0.05/1000 metrics, $0.10/GB logs</span>. Datadog reserves the right to throttle service or require immediate payment for overages exceeding 120% of contracted volumes.`,
      risk: 'medium',
      memoryHit: false,
      riskLabel: 'Overage Risk'
    },
    {
      id: 'c8',
      number: 'Section 8.1',
      title: 'Intellectual Property & Data Ownership',
      text: `Licensee retains all rights, title, and interest in its data submitted to the Datadog platform. Datadog retains all rights in the platform, AI/ML models, and aggregate anonymized insights derived from platform usage. Datadog may use <span class="highlight-memory">aggregated, anonymized telemetry benchmarks</span> for product improvement without Licensee consent, unless Licensee opts out in writing.`,
      risk: 'low',
      memoryHit: true,
      riskLabel: 'IP Boundary',
      memoryLabel: 'Negotiable'
    },
  ]
};

// ══════════════════════════════════════════════════════
// DEMO DATA: Hindsight Memory Entries
// ══════════════════════════════════════════════════════

const MEMORY_ENTRIES_WITH = [
  {
    id: 'm1',
    type: 'SLA Breach Log',
    date: 'Mar 2023',
    vendor: 'Datadog',
    text: 'Datadog APM suffered 4.2 hours of P1 outage on March 14, 2023 (incident DD-89234). SLA breach exceeded cap. Internal impact: $127K in lost productivity. Credit issued: $18,400 (3-month equivalent). Breach acknowledged in writing by Datadog VP of Customer Success.',
    leverage: '→ 18% price reduction leverage confirmed via precedent',
    strength: 5
  },
  {
    id: 'm2',
    type: 'SLA Breach Log',
    date: 'Nov 2023',
    vendor: 'Datadog',
    text: 'Secondary SLA breach: Logs ingestion pipeline degradation for 6+ hours (Nov 7–8, 2023). P1 ticket response exceeded 4-hour SLA by 2.7 hours. Engineering escalation required. Vendor offered 15-day trial of Enterprise Support as remedy (declined by procurement).',
    leverage: '→ Pattern: 2 documented breaches = strong enterprise support negotiation angle',
    strength: 4
  },
  {
    id: 'm3',
    type: 'Price Concession',
    date: 'Jan 2024',
    vendor: 'Datadog',
    text: 'FY2024 renewal negotiation: Initial ask was $412,000 (+18.3% YoY). After citing 2023 SLA breaches and referencing Grafana/New Relic competitive pricing, negotiated down to $367,000 (flat YoY). Datadog AE confirmed "competitive pricing window" in Q4 end-of-year negotiations.',
    leverage: '→ Confirmed: Q4 negotiations yield 8–15% better outcomes',
    strength: 5
  },
  {
    id: 'm4',
    type: 'Vendor Concession',
    date: 'Jun 2024',
    vendor: 'Datadog',
    text: 'Mid-year review: Successfully negotiated removal of overage auto-charge clause. Datadog agreed to 30-day grace period and email notification at 80% usage before any overage billing triggers. Negotiated by referencing AWS marketplace alternative pricing structure.',
    leverage: '→ Overage clause is negotiable; use AWS Marketplace as leverage',
    strength: 3
  },
  {
    id: 'm5',
    type: 'Competitive Intel',
    date: 'Aug 2024',
    vendor: 'Market Research',
    text: 'Internal evaluation: Grafana Cloud Enterprise at comparable scale priced at $290,000/year. New Relic All-In priced at $315,000/year. Both include enterprise support. Datadog\'s unique value: superior APM correlation + existing integrations (78 active). Migration cost estimated at $85K over 6 months.',
    leverage: '→ Alternatives exist but migration cost softens — use as negotiation floor',
    strength: 3
  },
  {
    id: 'm6',
    type: 'Contract Clause Win',
    date: 'Jan 2024',
    vendor: 'Datadog',
    text: 'Successfully removed "AI training opt-in" from DPA in FY2024. Datadog legal initially resisted but agreed after GDPR compliance team flagged the clause as non-standard. Enterprise Support bundle added without cost increase after SLA breach citation.',
    leverage: '→ AI data training clause is removable; use GDPR/CCPA as basis',
    strength: 4
  },
  {
    id: 'm7',
    type: 'Negotiation Pattern',
    date: 'Jan 2025',
    vendor: 'Datadog',
    text: 'Datadog AE (Marcus Chen) confirms end-of-quarter pressure in March and December. Company reports earnings pressure in Q4. Procurement manager at TechCorp (similar size) reported 22% discount by threatening to migrate 40% of workloads to Grafana before renewal.',
    leverage: '→ Best negotiation window: Dec 1–15 or final week of Q1',
    strength: 5
  }
];

const MEMORY_ENTRIES_WITHOUT = [
  {
    id: 'mw1',
    type: 'System Note',
    date: 'Now',
    vendor: 'System',
    text: 'Hindsight Memory is currently disabled. Enable Memory Mode to access 7 historical negotiation entries including 2 documented SLA breaches and 3 confirmed vendor concessions for Datadog Inc.',
    leverage: '→ Enable Memory Mode for expert leverage insights',
    strength: 0
  }
];

// ══════════════════════════════════════════════════════
// COUNTER-OFFER TEMPLATES
// ══════════════════════════════════════════════════════

const COUNTER_OFFER_WITHOUT = (tone) => `Subject: Re: Datadog SaaS Renewal 2026 — Counter-Proposal

Dear Datadog Account Team,

Thank you for sending the renewal proposal for our FY2026 subscription.

After reviewing the proposed terms, we have the following feedback:

1. PRICING: The proposed increase of 32% to $485,000 exceeds our budget allocation. We would like to discuss more competitive pricing aligned with market rates.

2. SLA TERMS: We would like to explore stronger SLA commitments with more meaningful remedies.

3. AUTO-RENEWAL: We request extending the cancellation notice period from 60 to 30 days.

We look forward to your response and finding mutually beneficial terms.

Best regards,
Procurement Team

---
⚠️  Generated without Hindsight Memory — Generic baseline response
    No historical context or leverage applied.`;

const COUNTER_OFFER_WITH = (tone) => {
  const toneOpeners = {
    assertive: 'After a thorough review of your proposal and our 3-year negotiation history, we find the terms unacceptable as presented.',
    collaborative: 'We value our 3-year partnership with Datadog and are committed to finding terms that reflect our shared investment in this relationship.',
    firm: 'This is our final counter-proposal. We are prepared to proceed with Grafana Cloud Enterprise migration within 60 days if alignment is not reached.',
    exploratory: 'We\'d like to explore several options with your team before finalizing terms for the upcoming renewal cycle.'
  };

  return `Subject: Datadog SaaS Renewal 2026 — Formal Counter-Proposal [REF: DD-CONTRACT-2026-003]

Dear Marcus,

${toneOpeners[tone] || toneOpeners.assertive}

EXECUTIVE SUMMARY OF OUR POSITION:
Based on 18 months of documented interactions and our internal records, we are counter-proposing the following:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. PRICING — Counter: $342,000 (vs. proposed $485,000)

Memory Context: Our FY2024 renewal was held flat at $367K (a reduction from the initially proposed $412K) after citing documented SLA incidents. The current proposed 32% increase is inconsistent with market benchmarks:
  • Grafana Cloud Enterprise: $290K/yr at comparable scale
  • New Relic All-In: $315K/yr with enterprise support included
  • Datadog FY2024 rate: $367K (your own precedent)

Requested: $342,000 flat renewal with a price escalation cap of 5% annually.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. SLA REMEDIES — Counter: Uncapped credits + Service credits in cash

Memory Context: We have 2 documented SLA breaches on record:
  • Incident DD-89234 (Mar 14, 2023): 4.2-hour P1 APM outage.
    Business impact: $127,000. Credit received: $18,400. Deficit: ~$108K.
  • Nov 7–8, 2023: Log pipeline degradation exceeding P1 SLA by 2.7 hours.

The current "20% monthly cap" on SLA credits is inadequate given documented financial impact. We require:
  • SLA credit cap raised to 100% of monthly ARR for P1 breaches
  • Enterprise Support (24/7, 1-hr P1 response) included at no additional cost
  • Escalation rights to VP-level within 2 hours of P1 declaration

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. CONTRACT TERMS — Specific Clause Modifications

  (a) Section 3.7 Auto-Renewal: Reduce notice period from 60 to 30 days.
  (b) Section 1.1 Escalation: Cap annual price increases at 5% (vs. current 15%).
  (c) Section 4.2 Data Retention: Explicit opt-out from AI training data usage (per GDPR Article 22; precedent set in our FY2024 DPA amendment).
  (d) Section 5.1 Liability: Cap minimum at 12-month subscription value (vs. 3-month).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. TIMELINE & NEXT STEPS

We require a response by November 15, 2026 to allow adequate time for our internal procurement review. In the absence of alignment by December 1, 2026, we will proceed with evaluation of migration alternatives.

We remain open to a video call with your Solutions Engineering and Legal teams to expedite resolution.

Respectfully,
[Your Name]
VP of Procurement & Technology Operations
[Company Name]

CC: Legal Counsel, CFO Office, IT Operations Lead

---
🧠 Generated WITH Hindsight Memory (5+ interaction cycles)
   Memory applied: 2 SLA breach logs, 3 vendor concessions, competitive intel
   Estimated leverage increase: +55% vs. baseline response`;
};

// ══════════════════════════════════════════════════════
// STATE MANAGEMENT
// ══════════════════════════════════════════════════════

const state = {
  currentView: 'home',
  memoryMode: false,
  demoMode: 'without',
  contractTab: 'full',
  mobileTab: 'contract',
  counterOfferGenerated: false,
  isGenerating: false,
  isRefreshing: false,
};

// ══════════════════════════════════════════════════════
// VIEW MANAGEMENT
// ══════════════════════════════════════════════════════

function showView(view) {
  // Update state
  state.currentView = view;

  // Home view
  const homeView = document.getElementById('home-view');
  const dashView = document.getElementById('dashboard-view');

  if (view === 'home') {
    homeView.classList.add('active');
    dashView.classList.remove('active');
    homeView.style.display = '';
    dashView.style.display = 'none';
  } else if (view === 'dashboard') {
    homeView.classList.remove('active');
    dashView.classList.add('active');
    homeView.style.display = 'none';
    dashView.style.display = 'flex';
    dashView.style.flexDirection = 'column';
    // Initialize dashboard content
    initDashboard();
  }

  // Update nav links
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  document.querySelectorAll('.mobile-nav a').forEach(a => a.classList.remove('active'));

  const navEl = document.getElementById(`nav-${view}`);
  if (navEl) navEl.classList.add('active');

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// ══════════════════════════════════════════════════════
// DASHBOARD INIT
// ══════════════════════════════════════════════════════

let dashboardInitialized = false;

function initDashboard() {
  if (dashboardInitialized) return;
  dashboardInitialized = true;

  renderContractContent();
  renderMemoryPanel();
  animateRiskBar();
}

// ══════════════════════════════════════════════════════
// CONTRACT VIEWER
// ══════════════════════════════════════════════════════

function renderContractContent() {
  renderFullContract();
  renderRiskClauses();
  renderMemoryClauses();
}

function renderFullContract() {
  const container = document.getElementById('contract-full');
  if (!container) return;

  let html = `<div style="margin-bottom:1.25rem; padding:0.75rem 1rem; background:var(--bg-elevated); border-radius:var(--radius-md); border: 1px solid var(--border);">
    <div style="font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:0.35rem;">Master Services Agreement</div>
    <div style="font-size:0.95rem; font-weight:700; color:var(--text-primary);">${DEMO_CONTRACT.title}</div>
    <div style="display:flex; gap:0.75rem; margin-top:0.5rem; flex-wrap:wrap;">
      <span style="font-size:0.72rem; color:var(--text-muted);">Effective: Jan 15, 2026</span>
      <span style="font-size:0.72rem; color:var(--text-muted);">Term: 12 months</span>
      <span style="font-size:0.72rem; color:var(--text-muted);">${DEMO_CONTRACT.wordCount} words</span>
    </div>
  </div>`;

  DEMO_CONTRACT.clauses.forEach(clause => {
    const riskClass = `risk-${clause.risk}`;
    const memClass = clause.memoryHit ? ' memory-hit' : '';

    html += `<div class="clause ${riskClass}${memClass}" onclick="focusClause('${clause.id}')" role="article" aria-labelledby="${clause.id}-title" tabindex="0" onkeydown="if(event.key==='Enter')focusClause('${clause.id}')">
      <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem;">
        <div class="clause-number">${clause.number}</div>
        ${clause.riskLabel ? `<span class="clause-badge clause-badge-risk" aria-label="${clause.riskLabel}">${clause.riskLabel}</span>` : ''}
        ${clause.memoryHit && state.memoryMode ? `<span class="clause-badge clause-badge-memory" aria-label="Memory hit: ${clause.memoryLabel || ''}"">🧠 ${clause.memoryLabel || 'Memory Hit'}</span>` : ''}
      </div>
      <div class="clause-title" id="${clause.id}-title">${clause.title}</div>
      <div class="clause-text">${clause.text}</div>
    </div>`;
  });

  container.innerHTML = html;
}

function renderRiskClauses() {
  const container = document.getElementById('contract-risks');
  if (!container) return;

  const riskClauses = DEMO_CONTRACT.clauses.filter(c => c.risk === 'high' || c.risk === 'medium');

  let html = `<div class="insight-callout" style="margin-bottom:1rem;">
    <span class="insight-callout-icon" aria-hidden="true">⚠️</span>
    <span><strong>${riskClauses.length} risk clauses detected</strong> — ${riskClauses.filter(c=>c.risk==='high').length} High, ${riskClauses.filter(c=>c.risk==='medium').length} Medium priority</span>
  </div>`;

  riskClauses.forEach(clause => {
    html += `<div class="clause risk-${clause.risk}" role="article" aria-labelledby="risk-${clause.id}-title">
      <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem;">
        <div class="clause-number">${clause.number}</div>
        <span class="badge badge-${clause.risk}" aria-label="Risk level: ${clause.risk}">${clause.risk.toUpperCase()} RISK</span>
      </div>
      <div class="clause-title" id="risk-${clause.id}-title">${clause.title}</div>
      <div class="clause-text">${clause.text}</div>
    </div>`;
  });

  container.innerHTML = html;
}

function renderMemoryClauses() {
  const container = document.getElementById('contract-memory');
  if (!container) return;

  const memoryClauses = DEMO_CONTRACT.clauses.filter(c => c.memoryHit);

  if (!state.memoryMode) {
    container.innerHTML = `<div style="text-align:center; padding:3rem 1.5rem; color:var(--text-muted);">
      <div style="font-size:2rem; opacity:0.4; margin-bottom:0.75rem;">🧠</div>
      <div style="font-size:0.9rem; font-weight:600; margin-bottom:0.5rem;">Memory Mode is Off</div>
      <div style="font-size:0.8rem;">Enable Hindsight Memory in the AI panel to see memory-matched clauses.</div>
    </div>`;
    return;
  }

  let html = `<div class="insight-callout" style="margin-bottom:1rem;">
    <span class="insight-callout-icon" aria-hidden="true">🧠</span>
    <span><strong>${memoryClauses.length} clauses matched</strong> against historical Datadog negotiation memory — enabling precise leverage points.</span>
  </div>`;

  memoryClauses.forEach(clause => {
    html += `<div class="clause memory-hit" role="article" aria-labelledby="mem-${clause.id}-title">
      <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem;">
        <div class="clause-number">${clause.number}</div>
        <span class="clause-badge clause-badge-memory" aria-label="Memory hit">🧠 ${clause.memoryLabel || 'Memory Match'}</span>
      </div>
      <div class="clause-title" id="mem-${clause.id}-title">${clause.title}</div>
      <div class="clause-text">${clause.text}</div>
    </div>`;
  });

  container.innerHTML = html;
}

// ══════════════════════════════════════════════════════
// CONTRACT TABS
// ══════════════════════════════════════════════════════

function switchContractTab(tab) {
  state.contractTab = tab;

  // Update tab buttons
  document.querySelectorAll('.contract-tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  const activeTab = document.getElementById(`ctab-${tab}`);
  if (activeTab) {
    activeTab.classList.add('active');
    activeTab.setAttribute('aria-selected', 'true');
  }

  // Show/hide panels
  ['full', 'risks', 'memory'].forEach(t => {
    const panel = document.getElementById(`contract-${t}`);
    if (panel) panel.style.display = t === tab ? '' : 'none';
  });
}

// ══════════════════════════════════════════════════════
// MEMORY PANEL
// ══════════════════════════════════════════════════════

function renderMemoryPanel() {
  const body = document.getElementById('memory-body');
  const badge = document.getElementById('memory-count-badge');
  if (!body) return;

  const entries = state.memoryMode ? MEMORY_ENTRIES_WITH : MEMORY_ENTRIES_WITHOUT;
  badge.textContent = state.memoryMode ? '7 Entries' : '0 Active';

  if (!state.memoryMode) {
    body.innerHTML = `<div class="memory-empty" role="status">
      <div class="memory-empty-icon" aria-hidden="true">🧠</div>
      <div style="font-weight:600; color:var(--text-secondary); margin-bottom:0.25rem;">Memory Mode Disabled</div>
      <div>Toggle Hindsight Memory on to unlock 7 historical entries including SLA breach logs, price concessions, and competitive intelligence.</div>
    </div>`;
    return;
  }

  let html = '';
  entries.forEach((entry, i) => {
    const strengthBars = Array.from({length: 5}, (_, idx) => 
      `<span class="${idx < entry.strength ? 'filled' : ''}" aria-hidden="true"></span>`
    ).join('');

    html += `<div class="memory-entry animate-fade-in" style="animation-delay:${i * 0.08}s" role="article" aria-labelledby="mem-entry-${entry.id}">
      <div class="memory-entry-header">
        <span class="memory-entry-type" id="mem-entry-${entry.id}">${entry.type}</span>
        <span class="memory-entry-date">${entry.date} · ${entry.vendor}</span>
      </div>
      <div class="memory-entry-text">${entry.text}</div>
      <div class="memory-entry-leverage" aria-label="Leverage insight: ${entry.leverage.replace('→ ', '')}">
        <span aria-hidden="true">⚡</span> ${entry.leverage.replace('→ ', '')}
      </div>
      ${entry.strength > 0 ? `<div class="memory-strength-bar" aria-label="Signal strength: ${entry.strength} out of 5">
        ${strengthBars}
      </div>` : ''}
    </div>`;
  });

  body.innerHTML = html;
}

function toggleMemoryExpanded() {
  const body = document.getElementById('memory-body');
  const btn = document.getElementById('memory-expand-btn');
  if (!body) return;

  if (body.style.maxHeight) {
    body.style.maxHeight = '';
    btn.textContent = '⤢';
    btn.setAttribute('data-tooltip', 'Expand all');
  } else {
    body.style.maxHeight = 'none';
    btn.textContent = '⤡';
    btn.setAttribute('data-tooltip', 'Collapse');
  }
}

// ══════════════════════════════════════════════════════
// MEMORY MODE TOGGLE
// ══════════════════════════════════════════════════════

function toggleMemoryMode(enabled) {
  state.memoryMode = enabled;

  const toggle = document.getElementById('memory-toggle');
  const statusBadge = document.getElementById('memory-status-badge');
  const demoDesc = document.getElementById('demo-mode-desc');
  const counterModelBadge = document.getElementById('counter-model-badge');

  if (enabled) {
    statusBadge.textContent = 'Memory: Active';
    statusBadge.classList.add('badge-memory');
    counterModelBadge.textContent = 'GPT-4o + Memory';
    if (demoDesc) demoDesc.textContent = 'With Memory: Expert leverage — 5+ interaction cycles';
    toggle.setAttribute('aria-checked', 'true');

    // Auto-select "with memory" demo option
    selectDemoMode('with');
    showToast('🧠 Hindsight Memory activated — 7 historical entries loaded', 'success');
  } else {
    statusBadge.textContent = 'Memory: Off';
    counterModelBadge.textContent = 'GPT-4o · No Memory';
    if (demoDesc) demoDesc.textContent = 'Without Memory: Generic baseline response';
    toggle.setAttribute('aria-checked', 'false');

    selectDemoMode('without');
    showToast('Memory disabled — Generic mode active', 'info');
  }

  renderMemoryPanel();
  renderFullContract();
  renderMemoryClauses();

  // Reset counter offer if mode changed
  if (state.counterOfferGenerated) {
    resetCounterOffer();
  }
}

// ══════════════════════════════════════════════════════
// DEMO MODE SELECTION
// ══════════════════════════════════════════════════════

function selectDemoMode(mode) {
  state.demoMode = mode;

  const opt1 = document.getElementById('demo-opt-1');
  const opt2 = document.getElementById('demo-opt-2');
  const leverageFill = document.getElementById('demo-leverage-fill');
  const leverageValue = document.getElementById('demo-leverage-value');
  const demoBarAria = document.getElementById('demo-bar-aria');
  const toggle = document.getElementById('memory-toggle');

  if (mode === 'without') {
    opt1.classList.add('selected-without');
    opt1.classList.remove('selected-with');
    opt2.classList.remove('selected-with');
    opt2.classList.remove('selected-without');
    opt1.setAttribute('aria-checked', 'true');
    opt2.setAttribute('aria-checked', 'false');

    leverageFill.style.width = '12%';
    leverageFill.style.background = 'var(--risk-medium)';
    leverageValue.textContent = '12%';
    leverageValue.style.color = 'var(--risk-medium)';
    if (demoBarAria) demoBarAria.setAttribute('aria-valuenow', '12');

    if (toggle.checked) {
      toggle.checked = false;
      state.memoryMode = false;
    }
  } else {
    opt2.classList.add('selected-with');
    opt2.classList.remove('selected-without');
    opt1.classList.remove('selected-without');
    opt1.classList.remove('selected-with');
    opt2.setAttribute('aria-checked', 'true');
    opt1.setAttribute('aria-checked', 'false');

    leverageFill.style.width = '67%';
    leverageFill.style.background = 'linear-gradient(90deg, var(--accent-emerald), var(--accent-emerald-light))';
    leverageValue.textContent = '67%';
    leverageValue.style.color = 'var(--accent-emerald)';
    if (demoBarAria) demoBarAria.setAttribute('aria-valuenow', '67');

    if (!toggle.checked) {
      toggle.checked = true;
      state.memoryMode = true;
    }
  }
}

// ══════════════════════════════════════════════════════
// RISK BAR ANIMATION
// ══════════════════════════════════════════════════════

function animateRiskBar() {
  const fill = document.getElementById('risk-bar-fill');
  if (!fill) return;
  fill.style.width = '0%';
  setTimeout(() => {
    fill.style.width = '74%';
  }, 300);
}

// ══════════════════════════════════════════════════════
// COUNTER-OFFER GENERATOR
// ══════════════════════════════════════════════════════

async function generateCounterOffer() {
  if (state.isGenerating) return;
  state.isGenerating = true;

  const btn = document.getElementById('generate-btn');
  const btnIcon = document.getElementById('gen-btn-icon');
  const btnText = document.getElementById('gen-btn-text');
  const output = document.getElementById('counter-output');
  const actions = document.getElementById('counter-actions');
  const placeholder = document.getElementById('counter-placeholder');
  const toneSelect = document.getElementById('tone-select');

  const tone = toneSelect ? toneSelect.value : 'assertive';

  // Loading state
  btn.disabled = true;
  btnIcon.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px;" aria-hidden="true"></span>';
  btnText.textContent = state.memoryMode ? 'Querying Memory...' : 'Generating...';

  if (placeholder) placeholder.style.display = 'none';

  // Show AI thinking
  output.innerHTML = `<div class="ai-thinking" role="status" aria-live="polite">
    <div class="ai-dots" aria-hidden="true"><span></span><span></span><span></span></div>
    ${state.memoryMode ? 'Retrieving 7 memory entries · Cross-referencing SLA breach logs · Applying leverage...' : 'Analyzing contract clauses · Generating baseline response...'}
  </div>`;

  // Simulate AI processing
  await delay(state.memoryMode ? 2200 : 1200);

  // Generate content
  const content = state.memoryMode
    ? COUNTER_OFFER_WITH(tone)
    : COUNTER_OFFER_WITHOUT(tone);

  // Typewriter effect
  output.innerHTML = '';
  output.classList.add('typing-cursor');
  await typewrite(output, content, state.memoryMode ? 8 : 12);
  output.classList.remove('typing-cursor');

  // Show actions
  actions.style.display = 'flex';
  state.counterOfferGenerated = true;

  // Reset button
  btn.disabled = false;
  btnIcon.textContent = '↻';
  btnText.textContent = 'Regenerate';
  state.isGenerating = false;

  showToast(
    state.memoryMode
      ? '✅ Expert counter-offer generated using 7 memory entries'
      : '📝 Baseline counter-offer generated (Enable Memory for leverage)',
    'success'
  );
}

async function regenerateCounterOffer() {
  resetCounterOffer();
  await delay(100);
  await generateCounterOffer();
}

function resetCounterOffer() {
  const output = document.getElementById('counter-output');
  const actions = document.getElementById('counter-actions');
  const placeholder = document.getElementById('counter-placeholder');
  const btnIcon = document.getElementById('gen-btn-icon');
  const btnText = document.getElementById('gen-btn-text');

  if (output) {
    output.innerHTML = `<div class="counter-offer-placeholder" id="counter-placeholder">
      <div class="counter-offer-placeholder-icon" aria-hidden="true">✉️</div>
      <span>Click "Generate Counter-Offer" to draft your response</span>
      <span style="font-size:0.72rem; color:var(--text-muted);">AI will use memory context when available</span>
    </div>`;
  }
  if (actions) actions.style.display = 'none';
  if (btnIcon) btnIcon.textContent = '⚡';
  if (btnText) btnText.textContent = 'Generate Counter-Offer';
  state.counterOfferGenerated = false;
}

function copyCounterOffer() {
  const output = document.getElementById('counter-output');
  const copyBtn = document.getElementById('copy-btn');
  if (!output) return;

  const text = output.innerText;
  navigator.clipboard.writeText(text).then(() => {
    copyBtn.innerHTML = '<span aria-hidden="true">✓</span> Copied!';
    copyBtn.classList.add('copy-success');
    showToast('📋 Counter-offer copied to clipboard', 'success');
    setTimeout(() => {
      copyBtn.innerHTML = '<span aria-hidden="true">📋</span> Copy';
      copyBtn.classList.remove('copy-success');
    }, 2000);
  }).catch(() => {
    showToast('Failed to copy — please select and copy manually', 'error');
  });
}

function exportCounterOffer(type) {
  const output = document.getElementById('counter-output');
  if (!output || !state.counterOfferGenerated) return;

  if (type === 'email') {
    const subject = state.memoryMode
      ? 'Datadog SaaS Renewal 2026 — Formal Counter-Proposal [REF: DD-CONTRACT-2026-003]'
      : 'Re: Datadog SaaS Renewal 2026 — Counter-Proposal';
    const body = encodeURIComponent(output.innerText);
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;
    window.location.href = mailto;
    showToast('📧 Opening email client...', 'info');
  } else if (type === 'pdf') {
    showToast('📄 PDF export — In production, this would use a PDF renderer', 'info');
    // In production: use jsPDF or server-side PDF generation
    window.print();
  }
}

// ══════════════════════════════════════════════════════
// ANALYSIS REFRESH
// ══════════════════════════════════════════════════════

async function refreshAnalysis() {
  if (state.isRefreshing) return;
  state.isRefreshing = true;

  const refreshIcon = document.getElementById('refresh-icon');
  const statusText = document.getElementById('status-text');

  if (refreshIcon) refreshIcon.style.animation = 'spin 0.8s linear infinite';
  if (statusText) statusText.textContent = 'Re-analyzing contract...';

  await delay(1800);

  if (refreshIcon) refreshIcon.style.animation = '';
  if (statusText) statusText.textContent = `DealMind AI ready · ${DEMO_CONTRACT.filename} · ${DEMO_CONTRACT.wordCount} words analyzed`;
  state.isRefreshing = false;

  showToast('✅ Analysis refreshed — Risk score updated', 'success');
}

// ══════════════════════════════════════════════════════
// FILE UPLOAD HANDLING
// ══════════════════════════════════════════════════════

function triggerUpload() {
  document.getElementById('file-input').click();
}

function handleFileUpload(input) {
  const file = input.files[0];
  if (!file) return;

  const validTypes = ['.pdf', '.txt', '.docx', 'application/pdf', 'text/plain'];
  const docName = document.getElementById('contract-doc-name');
  const statusText = document.getElementById('status-text');

  docName.textContent = file.name;
  showToast(`📄 "${file.name}" uploaded — analyzing...`, 'info');

  setTimeout(() => {
    statusText.textContent = `DealMind AI ready · ${file.name} · Analyzing...`;
    setTimeout(() => {
      statusText.textContent = `DealMind AI ready · ${file.name} · Analysis complete`;
      showToast('✅ Contract analyzed. Note: Demo mode uses pre-loaded Datadog contract data.', 'success');
    }, 2000);
  }, 500);
}

function handleDrop(event) {
  event.preventDefault();
  const zone = document.getElementById('upload-zone');
  zone.classList.remove('drag-over');
  const file = event.dataTransfer.files[0];
  if (file) {
    const input = zone.querySelector('input[type="file"]');
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    handleFileUpload(input);
  }
}

function handleDragOver(event) {
  event.preventDefault();
  document.getElementById('upload-zone').classList.add('drag-over');
}

function handleDragLeave(event) {
  document.getElementById('upload-zone').classList.remove('drag-over');
}

// ══════════════════════════════════════════════════════
// MOBILE NAVIGATION
// ══════════════════════════════════════════════════════

function toggleMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('mobile-nav');
  const isOpen = nav.classList.contains('open');

  if (isOpen) {
    nav.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  } else {
    nav.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
  }
}

function closeMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('mobile-nav');
  nav.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}

function switchMobileTab(tab) {
  state.mobileTab = tab;

  const tabContract = document.getElementById('mob-tab-contract');
  const tabInsights = document.getElementById('mob-tab-insights');
  const paneLeft = document.getElementById('pane-left');
  const paneRight = document.getElementById('pane-right');

  if (tab === 'contract') {
    tabContract.classList.add('active');
    tabInsights.classList.remove('active');
    tabContract.setAttribute('aria-selected', 'true');
    tabInsights.setAttribute('aria-selected', 'false');
    paneLeft.classList.add('mobile-active');
    paneRight.classList.remove('mobile-active');
    paneLeft.style.display = '';
    paneRight.style.display = 'none';
  } else {
    tabInsights.classList.add('active');
    tabContract.classList.remove('active');
    tabInsights.setAttribute('aria-selected', 'true');
    tabContract.setAttribute('aria-selected', 'false');
    paneRight.classList.add('mobile-active');
    paneLeft.classList.remove('mobile-active');
    paneRight.style.display = 'flex';
    paneLeft.style.display = 'none';
  }
}

// ══════════════════════════════════════════════════════
// COOKIE CONSENT
// ══════════════════════════════════════════════════════

function initCookieBanner() {
  const prefs = localStorage.getItem('dealmind_cookie_prefs');
  if (prefs) return; // Already accepted

  setTimeout(() => {
    const banner = document.getElementById('cookie-banner');
    if (banner) banner.classList.add('visible');
  }, 1200);
}

function acceptCookies(type) {
  const banner = document.getElementById('cookie-banner');
  const prefs = {
    type,
    timestamp: new Date().toISOString(),
    version: '1.0'
  };
  localStorage.setItem('dealmind_cookie_prefs', JSON.stringify(prefs));

  if (banner) {
    banner.classList.remove('visible');
    setTimeout(() => banner.remove(), 400);
  }

  const msg = type === 'all'
    ? '🍪 All cookies accepted — Thank you!'
    : '🍪 Essential cookies only — Preferences saved';
  showToast(msg, 'success');
}

// ══════════════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ══════════════════════════════════════════════════════

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-atomic', 'true');
  toast.innerHTML = `<span class="toast-icon" aria-hidden="true">${icons[type] || 'ℹ️'}</span>${message}`;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ══════════════════════════════════════════════════════
// CLAUSE FOCUS
// ══════════════════════════════════════════════════════

function focusClause(id) {
  // Highlight the selected clause briefly
  document.querySelectorAll('.clause').forEach(c => c.style.boxShadow = '');
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.style.boxShadow = '0 0 0 2px var(--accent-emerald)';
    setTimeout(() => { el.style.boxShadow = ''; }, 2000);
  }
}

// ══════════════════════════════════════════════════════
// HOME PAGE UTILS
// ══════════════════════════════════════════════════════

function scrollToFeatures() {
  const features = document.getElementById('features');
  if (features) features.scrollIntoView({ behavior: 'smooth' });
}

// ══════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ══════════════════════════════════════════════════════

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function typewrite(element, text, speed = 10) {
  element.textContent = '';
  const chars = text.split('');
  for (let i = 0; i < chars.length; i++) {
    element.textContent += chars[i];
    if (i % 3 === 0) { // Scroll into view periodically
      element.scrollTop = element.scrollHeight;
    }
    if (i % 5 === 0) {
      await delay(speed);
    }
  }
}

// ══════════════════════════════════════════════════════
// KEYBOARD ACCESSIBILITY
// ══════════════════════════════════════════════════════

document.addEventListener('keydown', (e) => {
  // Escape key closes mobile nav
  if (e.key === 'Escape') {
    closeMobileNav();
  }
});

// ══════════════════════════════════════════════════════
// INITIALISATION
// ══════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // Hamburger toggle
  const hamburger = document.getElementById('hamburger');
  if (hamburger) hamburger.addEventListener('click', toggleMobileNav);

  // Cookie banner
  initCookieBanner();

  // Add CSS spin animation for refresh icon
  if (!document.querySelector('#spin-style')) {
    const style = document.createElement('style');
    style.id = 'spin-style';
    style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(style);
  }

  // Mobile: set initial pane visibility
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    const paneLeft = document.getElementById('pane-left');
    const paneRight = document.getElementById('pane-right');
    if (paneLeft) paneLeft.style.display = '';
    if (paneRight) paneRight.style.display = 'none';
  }

  // Intersection Observer for hero stats animation
  const stats = document.querySelectorAll('.hero-stat-number');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeIn 0.6s ease forwards';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  stats.forEach(stat => observer.observe(stat));

  // Handle resize for pane layout
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > 768) {
        const paneLeft = document.getElementById('pane-left');
        const paneRight = document.getElementById('pane-right');
        if (paneLeft) paneLeft.style.display = '';
        if (paneRight) paneRight.style.display = '';
      }
    }, 250);
  });

  // Animate risk bar on dashboard load (deferred)
  // Dashboard init is triggered by showView('dashboard')
});

// ══════════════════════════════════════════════════════
// FEATURE 1: ROI Calculator Modal
// ══════════════════════════════════════════════════════

function openROIModal() {
  const modal = document.getElementById('roi-modal');
  if (modal) modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('roi-annual-spend')?.focus(), 100);
}

function calcROI() {
  const spend    = parseFloat(document.getElementById('roi-annual-spend')?.value) || 0;
  const vendors  = parseInt(document.getElementById('roi-vendor-count')?.value) || 0;
  const renewPct = parseFloat(document.getElementById('roi-renewal-pct')?.value) || 0;
  const currDisc = parseFloat(document.getElementById('roi-current-discount')?.value) || 0;

  if (!spend || !vendors || !renewPct) return;

  const resultCard = document.getElementById('roi-result-card');
  if (!resultCard) return;

  // DealMind uplift: 14.2% average vs baseline
  const dealmindDiscount = Math.min(currDisc + 9.2, 35);
  const renewableSpend = spend * (renewPct / 100);
  const baselineSavings = renewableSpend * (currDisc / 100);
  const optimizedSavings = renewableSpend * (dealmindDiscount / 100);
  const uplift = optimizedSavings - baselineSavings;
  const paybackMonths = uplift > 0 ? Math.ceil(12000 / uplift * 12) : null;

  const fmt = (n) => n >= 1000000
    ? `$${(n / 1000000).toFixed(1)}M`
    : n >= 1000
    ? `$${Math.round(n / 1000)}K`
    : `$${Math.round(n)}`;

  const savingsEl = document.getElementById('roi-res-savings');
  const discountEl = document.getElementById('roi-res-discount');
  const paybackEl = document.getElementById('roi-res-payback');
  const insightEl = document.getElementById('roi-res-insight');

  if (savingsEl) savingsEl.textContent = fmt(uplift);
  if (discountEl) discountEl.textContent = `${dealmindDiscount.toFixed(1)}%`;
  if (paybackEl) paybackEl.textContent = paybackMonths && paybackMonths < 24 ? `${paybackMonths}mo` : '< 2yr';
  if (insightEl) insightEl.textContent = `With Hindsight Memory, your ${renewPct}% renewal pipeline (~${fmt(renewableSpend)} at risk) could yield ${fmt(uplift)} in additional savings vs. your current ${currDisc}% average discount.`;

  resultCard.classList.add('visible');
}

// ══════════════════════════════════════════════════════
// FEATURE 2: Memory Timeline View
// ══════════════════════════════════════════════════════

const TIMELINE_EVENTS = [
  { date: 'Mar 2023', type: 'SLA Breach',       title: 'Datadog APM — 4.2hr P1 Outage',              snippet: 'Incident DD-89234. Internal impact: $127K.\nCredit issued: $18,400. Acknowledged by VP Customer Success.', leverage: '18% price reduction leverage via precedent' },
  { date: 'Nov 2023', type: 'SLA Breach',       title: 'Log Pipeline Degradation — 6+ Hours',         snippet: 'P1 ticket response exceeded SLA by 2.7 hours.\nEngineering escalation required. Pattern: 2nd documented breach.', leverage: 'Strong enterprise support negotiation angle' },
  { date: 'Jan 2024', type: 'Price Concession', title: 'FY2024 Renewal — $412K → $367K Negotiated',   snippet: 'Initial ask: $412K (+18.3% YoY).\nFinal: $367K flat. Cited SLA breaches + Grafana competitive pricing.', leverage: 'Q4 negotiations yield 8–15% better outcomes' },
  { date: 'Jun 2024', type: 'Clause Win',       title: 'Overage Auto-Charge Clause Removed',           snippet: '30-day grace period added. Email alert at 80% usage.\nNegotiated via AWS Marketplace alternative pricing reference.', leverage: 'Overage clause is negotiable; use AWS as leverage' },
  { date: 'Aug 2024', type: 'Competitive Intel','title': 'Grafana $290K · New Relic $315K Benchmarked', snippet: 'Grafana Cloud Enterprise: $290K/yr.\nNew Relic All-In: $315K/yr. Migration cost est: $85K/6mo.', leverage: 'Alternatives soften migration cost — use as negotiation floor' },
  { date: 'Jan 2025', type: 'Pattern Found',    title: 'Dec / Q1-End = Best Negotiation Windows',       snippet: 'AE Marcus Chen confirmed Q4/Q1 end pressure.\nSimilar org achieved 22% discount by threatening 40% workload migration.', leverage: 'Best window: Dec 1–15 or final week of Q1' },
  { date: '2026 NOW', type: 'Leverage Applied', title: 'Counter-Offer: $342K vs $485K Proposed',        snippet: 'All 5 memory cycles applied.\nCounter proposed at $342K (-29.5%) leveraging breach history.', leverage: 'Estimated +55% leverage vs. generic baseline' },
];

function switchMemoryView(view) {
  const listView = document.getElementById('memory-body');
  const timelineView = document.getElementById('memory-timeline-view');
  const listBtn = document.getElementById('mem-view-list');
  const timelineBtn = document.getElementById('mem-view-timeline');

  if (view === 'list') {
    listView?.classList.add('active');
    timelineView?.classList.remove('active');
    listBtn?.classList.add('active');
    timelineBtn?.classList.remove('active');
    listBtn?.setAttribute('aria-pressed', 'true');
    timelineBtn?.setAttribute('aria-pressed', 'false');
  } else {
    listView?.classList.remove('active');
    timelineView?.classList.add('active');
    listBtn?.classList.remove('active');
    timelineBtn?.classList.add('active');
    listBtn?.setAttribute('aria-pressed', 'false');
    timelineBtn?.setAttribute('aria-pressed', 'true');
    renderTimeline();
  }
}

function renderTimeline() {
  const track = document.getElementById('timeline-track');
  if (!track) return;

  if (!state.memoryMode) {
    track.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-muted); font-size:0.82rem;">
      <div style="font-size:1.5rem; opacity:0.4; margin-bottom:0.5rem;">🧠</div>
      Enable Hindsight Memory to view the negotiation timeline.
    </div>`;
    return;
  }

  let html = '';
  TIMELINE_EVENTS.forEach((evt, i) => {
    html += `<div class="timeline-node" id="tnode-${i}" onclick="toggleTimelineNode(${i})" role="button" tabindex="0" aria-expanded="false" onkeydown="if(event.key==='Enter'||event.key===' ')toggleTimelineNode(${i})">
      <div class="timeline-node-dot" aria-hidden="true"></div>
      <div class="timeline-node-card">
        <div class="timeline-node-header">
          <div>
            <div class="timeline-node-date">${evt.date}</div>
            <div class="timeline-node-type">${evt.type}</div>
          </div>
          <span class="timeline-node-arrow" aria-hidden="true">▾</span>
        </div>
        <div class="timeline-node-title">${evt.title}</div>
        <div class="timeline-node-drawer" id="tdrawer-${i}">
          ${evt.snippet}
          <div class="timeline-drawer-snippet">${evt.snippet}</div>
          <div class="timeline-drawer-leverage"><span aria-hidden="true">⚡</span> ${evt.leverage}</div>
        </div>
      </div>
    </div>`;
  });

  track.innerHTML = html;
}

function toggleTimelineNode(i) {
  const node = document.getElementById(`tnode-${i}`);
  if (!node) return;
  const isExpanded = node.classList.contains('expanded');
  // Collapse all
  document.querySelectorAll('.timeline-node').forEach(n => {
    n.classList.remove('expanded');
    n.setAttribute('aria-expanded', 'false');
  });
  // Expand this one if it wasn't already open
  if (!isExpanded) {
    node.classList.add('expanded');
    node.setAttribute('aria-expanded', 'true');
  }
}

// ══════════════════════════════════════════════════════
// FEATURE 3: Vendor Comparison Matrix Tab
// ══════════════════════════════════════════════════════

const VENDOR_MATRIX = [
  {
    vendor: 'Datadog',
    metric: 'Annual Subscription Fee',
    y2024: '$367,000',   y2025: '$412,000',   y2026: '<span class="trend-up">▲ $485,000 (+32%)</span>',
    trend: 'up',
    sla: { y2024: '<span class="matrix-breach-badge">⚠ 2 Breaches</span>', y2025: '<span class="matrix-ok-badge">✓ Met</span>', y2026: '<span class="matrix-ok-badge">✓ Pending</span>' }
  },
  {
    vendor: 'AWS',
    metric: 'Reserved Instance Spend',
    y2024: '$210,000',   y2025: '$228,000',   y2026: '<span class="trend-up">▲ $261,000 (+14%)</span>',
    trend: 'up',
    sla: { y2024: '<span class="matrix-ok-badge">✓ 99.99%</span>', y2025: '<span class="matrix-ok-badge">✓ 99.99%</span>', y2026: '<span class="matrix-ok-badge">✓ Projected</span>' }
  },
  {
    vendor: 'Salesforce',
    metric: 'CRM Platform License',
    y2024: '$185,000',   y2025: '$196,000',   y2026: '<span class="trend-up">▲ $218,000 (+11%)</span>',
    trend: 'up',
    sla: { y2024: '<span class="matrix-ok-badge">✓ Met</span>', y2025: '<span class="matrix-breach-badge">⚠ 1 Breach</span>', y2026: '<span class="matrix-ok-badge">✓ Pending</span>' }
  }
];

function renderVendorMatrix() {
  const container = document.getElementById('contract-matrix');
  if (!container) return;

  let rows = '';
  VENDOR_MATRIX.forEach(v => {
    rows += `<tr>
      <td>${v.vendor}</td>
      <td>${v.metric}</td>
      <td class="year-col">${v.y2024}</td>
      <td class="year-col">${v.y2025}</td>
      <td class="year-col">${v.y2026}</td>
      <td class="year-col">${v.sla.y2024}</td>
      <td class="year-col">${v.sla.y2025}</td>
      <td class="year-col">${v.sla.y2026}</td>
    </tr>`;
  });

  container.innerHTML = `
    <div class="insight-callout" style="margin-bottom:1rem;">
      <span class="insight-callout-icon" aria-hidden="true">📊</span>
      <span><strong>Vendor Renewal History</strong> — Side-by-side comparison of 2024–2026 renewal terms. <span style="color:var(--risk-high);">▲ Red</span> = price creep detected. SLA breach patterns highlighted.</span>
    </div>
    <div class="vendor-matrix-wrap" role="region" aria-label="Vendor renewal comparison matrix">
      <table class="vendor-matrix-table" aria-label="Vendor renewal comparison 2024-2026">
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Metric</th>
            <th class="year-col">FY 2024</th>
            <th class="year-col">FY 2025</th>
            <th class="year-col">FY 2026 (Draft)</th>
            <th class="year-col">SLA 2024</th>
            <th class="year-col">SLA 2025</th>
            <th class="year-col">SLA 2026</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="insight-callout" style="margin-top:1rem; background:rgba(239,68,68,0.06); border-color:rgba(239,68,68,0.3);">
      <span class="insight-callout-icon" aria-hidden="true">🔴</span>
      <span><strong>Price Creep Alert:</strong> All 3 vendors show consistent YoY escalation. Datadog's +32% is the highest. Apply Hindsight Memory to all renewals for maximum leverage.</span>
    </div>`;
}

// ══════════════════════════════════════════════════════
// FEATURE 4: Slack & Email Integration Simulator
// ══════════════════════════════════════════════════════

function openSlackModal() {
  const modal = document.getElementById('slack-modal');
  if (modal) modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function simulateSlackSend() {
  const btn = document.getElementById('slack-send-btn');
  if (btn) {
    btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px;" aria-hidden="true"></span> Sending...';
    btn.disabled = true;
  }
  setTimeout(() => {
    closeModal('slack-modal');
    showToast('✅ Slack alert sent to #procurement — 3 team members notified', 'success');
    if (btn) { btn.innerHTML = '<span aria-hidden="true">💬</span> Send to #procurement'; btn.disabled = false; }
  }, 1600);
}

function openEmailClientModal() {
  const modal = document.getElementById('email-modal');
  if (!modal) return;

  // Pre-populate body preview from counter offer
  const output = document.getElementById('counter-output');
  const bodyPreview = document.getElementById('email-body-preview');
  const subjectPreview = document.getElementById('email-subject-preview');

  if (bodyPreview && output) {
    const text = output.innerText || '';
    bodyPreview.textContent = text.substring(0, 400) + (text.length > 400 ? '...' : '');
  }
  if (subjectPreview) {
    subjectPreview.textContent = state.memoryMode
      ? 'Datadog SaaS Renewal 2026 — Formal Counter-Proposal [REF: DD-CONTRACT-2026-003]'
      : 'Re: Datadog SaaS Renewal 2026 — Counter-Proposal';
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function launchMailto() {
  const output = document.getElementById('counter-output');
  const subject = state.memoryMode
    ? 'Datadog SaaS Renewal 2026 — Formal Counter-Proposal [REF: DD-CONTRACT-2026-003]'
    : 'Re: Datadog SaaS Renewal 2026 — Counter-Proposal';
  const body = output ? output.innerText : 'Please find our counter-proposal attached.';
  const mailto = `mailto:marcus.chen@datadog.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
  showToast('📧 Opening your email client...', 'info');
  closeModal('email-modal');
}

// ══════════════════════════════════════════════════════
// FEATURE 5: Contract Redline Exporter
// ══════════════════════════════════════════════════════

const REDLINE_DATA = [
  {
    section: 'Section 1.1 — Subscription Fees',
    changes: true,
    lines: [
      { type: 'removed', text: 'Annual Subscription Fee of $485,000 USD representing a 32% increase.' },
      { type: 'added',   text: 'Annual Subscription Fee of $342,000 USD (DealMind counter-term: 5% max annual escalation cap).' },
    ]
  },
  {
    section: 'Section 2.3 — SLA Remedies',
    changes: true,
    lines: [
      { type: 'removed', text: 'Service credits capped at 20% of monthly fees (sole and exclusive remedy).' },
      { type: 'added',   text: 'Service credits uncapped for P1 breaches; Enterprise Support (24/7, 1-hr P1) included at no cost.' },
    ]
  },
  {
    section: 'Section 3.7 — Auto-Renewal',
    changes: true,
    lines: [
      { type: 'removed', text: '60 days written notice required for non-renewal.' },
      { type: 'added',   text: '30 days written notice required for non-renewal.' },
    ]
  },
  {
    section: 'Section 4.2 — Data Retention',
    changes: true,
    lines: [
      { type: 'unchanged', text: 'Datadog processes Licensee data per the DPA.' },
      { type: 'removed',   text: 'Telemetry data retained up to 15 months for AI model training.' },
      { type: 'added',     text: 'Explicit opt-out from AI training data usage (GDPR Article 22 compliance; FY2024 DPA precedent).' },
    ]
  },
  {
    section: 'Section 5.1 — Limitation of Liability',
    changes: true,
    lines: [
      { type: 'removed', text: 'Datadog liability capped at fees paid in the 3 months preceding the claim.' },
      { type: 'added',   text: 'Datadog liability capped at minimum 12-month subscription value.' },
    ]
  },
  {
    section: 'Section 6.4 — Support Tiers',
    changes: false,
    lines: [
      { type: 'unchanged', text: 'Standard Support as baseline. Enterprise add-on available.' },
    ]
  },
];

function toggleRedlinePreview() {
  const wrap = document.getElementById('redline-preview');
  const btn = document.getElementById('redline-toggle-btn');
  if (!wrap) return;

  const isVisible = wrap.classList.contains('visible');
  if (isVisible) {
    wrap.classList.remove('visible');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  } else {
    renderRedlinePreview();
    wrap.classList.add('visible');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    showToast('📝 Redline preview generated — 4 removed, 6 added', 'info');
  }
}

function renderRedlinePreview() {
  const body = document.getElementById('redline-preview-body');
  if (!body) return;

  let html = '';
  REDLINE_DATA.forEach(block => {
    const linesHtml = block.lines.map(line => {
      if (line.type === 'removed')
        return `<div><span class="redline-removed">${line.text}</span></div>`;
      if (line.type === 'added')
        return `<div><span class="redline-added">+ ${line.text}</span></div>`;
      return `<div><span class="redline-unchanged">${line.text}</span></div>`;
    }).join('');

    html += `<div class="redline-clause-block ${block.changes ? 'has-changes' : ''}">
      <div class="redline-clause-num">${block.section}</div>
      ${linesHtml}
    </div>`;
  });

  body.innerHTML = html;
}

function downloadRedlinePDF() {
  showToast('📄 Generating redlined PDF summary briefing...', 'info');
  setTimeout(() => {
    window.print();
    showToast('✅ PDF export triggered — check your print dialog', 'success');
  }, 800);
}

// ══════════════════════════════════════════════════════
// MODAL UTILITY
// ══════════════════════════════════════════════════════

function closeModal(id, event) {
  if (event && event.target !== event.currentTarget) return; // Only close on backdrop click
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    ['roi-modal', 'slack-modal', 'email-modal'].forEach(id => {
      const m = document.getElementById(id);
      if (m && m.classList.contains('open')) {
        m.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
});

// ══════════════════════════════════════════════════════
// PATCH: extend switchContractTab for matrix tab
// and extend renderContractContent for matrix
// ══════════════════════════════════════════════════════

const _origSwitchContractTab = switchContractTab;
switchContractTab = function(tab) {
  _origSwitchContractTab(tab);
  // Show/hide matrix tab panel
  const matrixPanel = document.getElementById('contract-matrix');
  if (matrixPanel) matrixPanel.style.display = tab === 'matrix' ? '' : 'none';
  // Render matrix lazily
  if (tab === 'matrix') renderVendorMatrix();
};

const _origRenderContractContent = renderContractContent;
renderContractContent = function() {
  _origRenderContractContent();
  // matrix is rendered lazily on tab click
};

