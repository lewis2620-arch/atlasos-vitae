/* eslint-disable react-refresh/only-export-components */
import { Activity, AlertTriangle, ArrowRight, CheckCircle2, Database, FileJson, GitCommitHorizontal, Plane, Plus, ShieldCheck, Timer, Truck } from 'lucide-react'
import { CaseHeader, CaseRow, EHRBadge, EmptyState, Panel, ProgressDots, RiskTag, SeverityDot, StatusPill, Timeline } from './components'
import { STAGES, elapsedHours, formatTime, timeAgo } from './data'
import { useAppState } from './state'
import type { CaseStatus, DonorCase, Referral } from './types'

export function Dashboard() {
  const { state } = useAppState()
  const activeCases = state.cases.filter((c) => c.status !== 'Completed')
  const highRisk = activeCases.filter((c) => c.risk === 'High').length
  const avgHours = Math.round(activeCases.reduce((sum, c) => sum + elapsedHours(c.createdAt), 0) / Math.max(activeCases.length, 1))

  return (
    <div className="screen-stack">
      <div className="screen-head">
        <div>
          <div className="subhead">LIVE / {activeCases.length} ACTIVE CASES / {state.referrals.filter((r) => r.status === 'new').length} NEW REFERRALS</div>
          <h2>Operations command center</h2>
        </div>
      </div>
      <div className="connector-row">
        {[
          ['Epic Connection Hub', '3 hospitals / 38s ago', 'ok'],
          ['Cerner FHIR', '2 hospitals / 1m ago', 'ok'],
          ['UNOS / OPTN API', '4 in recon queue', 'warn'],
          ['HL7 Lab Feeds', '5 channels / live', 'ok'],
          ['Audit Ledger', `${state.cases.reduce((s, c) => s + c.auditChain.length, 0)} events / valid`, 'ok'],
        ].map(([name, meta, status]) => (
          <div className="connector-tile" key={name}>
            <span className={`connector-dot ${status}`} />
            <div>
              <strong>{name}</strong>
              <span>{meta}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="kpi-grid">
        <Kpi label="Total cases" value={state.cases.length} meta="seeded operational board" />
        <Kpi label="High-risk active" value={highRisk} meta="requires urgency monitoring" tone="critical" />
        <Kpi label="Avg time open" value={`${avgHours}h`} meta="active workflow cases" />
        <Kpi label="Referral queue" value={state.referrals.filter((r) => r.status === 'new').length} meta="FHIR intake candidates" tone="warning" />
      </div>
      <Panel title="Active Case Stream" meta="click any row to open flagship detail">
        <div className="case-list">
          {activeCases.map((c) => <CaseRow c={c} key={c.id} />)}
        </div>
      </Panel>
    </div>
  )
}

function Kpi({ label, value, meta, tone = 'default' }: { label: string; value: string | number; meta: string; tone?: 'default' | 'critical' | 'warning' }) {
  return (
    <div className={`kpi ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{meta}</small>
    </div>
  )
}

export function DonorIntake() {
  const { state } = useAppState()
  const newRefs = state.referrals.filter((r) => r.status === 'new')
  const triaged = state.referrals.filter((r) => r.status !== 'new')
  return (
    <div className="two-column intake-grid">
      <Panel title="FHIR Referral Inbox" meta={`${newRefs.length} new`}>
        <div className="referral-stack">
          {newRefs.map((referral) => <ReferralCard referral={referral} key={referral.id} />)}
        </div>
      </Panel>
      <div className="screen-stack">
        <Panel title="Triaged / Accepted" meta="provenance retained">
          <div className="referral-stack compact">
            {triaged.map((referral) => <ReferralCard referral={referral} key={referral.id} compact />)}
          </div>
        </Panel>
        <Panel title="Manual Entry" meta="no EHR provenance">
          <div className="manual-entry">
            <Database size={22} />
            <div>
              <strong>Manual donor intake remains available but inferior.</strong>
              <p>Use only when a structured EHR bundle is unavailable. Audit provenance will mark the case as manual source.</p>
            </div>
            <button><Plus size={15} /> Draft manual case</button>
          </div>
        </Panel>
      </div>
    </div>
  )
}

function ReferralCard({ referral, compact = false }: { referral: Referral; compact?: boolean }) {
  const { dispatch } = useAppState()
  return (
    <article className={`referral-card ${compact ? 'is-compact' : ''}`}>
      <div className="referral-top">
        <div>
          <div className="mono">{referral.id}</div>
          <h3>{referral.donorName}</h3>
          <p>{referral.hospital} / GCS {referral.glasgowComa} / {referral.bundleSize}</p>
        </div>
        <EHRBadge source={referral.ehr} />
      </div>
      <div className="tag-row">
        <RiskTag risk={referral.riskHint} />
        <span className="tag">FHIR {referral.fhirVersion}</span>
        {referral.organCandidates.map((organ) => <span className="tag" key={organ}>{organ}</span>)}
      </div>
      {!compact ? (
        <pre className="fhir-preview">{`Bundle.resource[${referral.bundleSize.split(' ')[0]}]
Patient.demographics: normalized
Observation.gcs: ${referral.glasgowComa}
ServiceRequest.trigger: ${referral.triggerType}`}</pre>
      ) : null}
      <div className="referral-actions">
        <span>{timeAgo(referral.receivedAt)} / {referral.status}</span>
        {referral.status !== 'accepted' ? <button onClick={() => dispatch({ type: 'acceptReferral', referralId: referral.id })}>Open as Case <ArrowRight size={14} /></button> : null}
      </div>
    </article>
  )
}

export function CaseBoard() {
  const statuses: CaseStatus[] = ['Pending', 'Rapid', 'Active', 'Completed']
  const { state } = useAppState()
  return (
    <div className="board">
      {statuses.map((status) => (
        <Panel title={status} meta={`${state.cases.filter((c) => c.status === status).length} cases`} key={status}>
          <div className="board-column">
            {state.cases.filter((c) => c.status === status).map((c) => <BoardCard c={c} key={c.id} />)}
          </div>
        </Panel>
      ))}
    </div>
  )
}

function BoardCard({ c }: { c: DonorCase }) {
  const { dispatch } = useAppState()
  const nextStatus: CaseStatus | null = c.status === 'Pending' ? 'Rapid' : c.status === 'Rapid' ? 'Active' : c.status === 'Active' ? 'Completed' : null
  return (
    <article className={`board-card risk-${c.risk.toLowerCase()} ${c.status === 'Rapid' || (c.risk === 'High' && c.status === 'Active') ? 'pulse' : ''}`}>
      <button className="board-open" onClick={() => dispatch({ type: 'openCase', caseId: c.id })}>
        <div>
          <strong>{c.name}</strong>
          <span>{c.organType} / {c.donorType}</span>
        </div>
        <RiskTag risk={c.risk} />
      </button>
      <ProgressDots c={c} />
      <div className="board-meta">
        <span>{STAGES[c.currentStageIdx].name}</span>
        <span>{elapsedHours(c.createdAt)}h</span>
      </div>
      {nextStatus ? <button className="mini-action" onClick={() => dispatch({ type: 'updateStatus', caseId: c.id, status: nextStatus })}>to {nextStatus}</button> : null}
    </article>
  )
}

export function CaseDetail() {
  const { selectedCase } = useAppState()
  if (!selectedCase) return <EmptyState title="No case selected">Open a donor case from Dashboard or Case Board.</EmptyState>
  const c = selectedCase
  return (
    <div className="detail-screen">
      <CaseHeader c={c} />
      <div className="detail-grid">
        <Panel title="Donor Summary" meta="cross-org context">
          <div className="summary-card">
            <div className="summary-main">
              <h3>{c.name} <span>{c.ageSex}</span></h3>
              <div className="tag-row"><RiskTag risk={c.risk} /><StatusPill status={c.status} /><EHRBadge source={c.ehrSource} /></div>
            </div>
            <div className="context-bar">
              <span>{c.hospital}</span>
              <ArrowRight size={14} />
              <span>{c.center}</span>
              <span>{c.organType}</span>
              <span>{c.donorType}</span>
              <span>audit valid</span>
            </div>
          </div>
          <Timeline c={c} />
          <div className="notes">
            {c.notes.map((note) => (
              <div className="note" key={`${note.t}-${note.author}`}>
                <strong>{note.author}</strong>
                <p>{note.text}</p>
                <time>{formatTime(note.t)}</time>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Workflow Engine" meta={`${STAGES[c.currentStageIdx].name} active`}>
          <div className="workflow-stack">
            {c.workflowSteps.map((step, index) => (
              <div className={`workflow-step ${step.status} ${c.risk === 'High' && step.status === 'current' ? 'high-risk' : ''}`} key={step.name}>
                <div className="workflow-head">
                  <span>{index + 1}</span>
                  <div><strong>{step.name}</strong><small>{step.status}</small></div>
                </div>
                <div className="checklist">
                  {step.checklist.map((item) => (
                    <div className={item.missing ? 'missing' : ''} key={item.text}>
                      <CheckCircle2 size={14} />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Case Athena" meta="source-linked">
          <div className="case-insight-list">
            {c.insights.filter((item) => !item.dismissed).slice(0, 5).map((item) => (
              <div className={`insight ${item.severity}`} key={item.id}>
                <div className="insight-top"><SeverityDot severity={item.severity} /><span>{item.severity}</span><time>{timeAgo(item.t)}</time></div>
                <p>{item.text}</p>
                <div className="source">Source: {item.source}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}

export function WorkflowAggregate() {
  const { state } = useAppState()
  return (
    <div className="screen-stack">
      <div className="stage-grid">
        {STAGES.map((stage, index) => {
          const count = state.cases.filter((c) => c.currentStageIdx === index && c.status !== 'Completed').length
          return <KpiTile key={stage.name} label={stage.name} value={count} icon={<Activity size={17} />} />
        })}
      </div>
      <Panel title="Workflow Distribution" meta="all active cases">
        <div className="case-list">
          {state.cases.map((c) => <CaseRow c={c} key={c.id} />)}
        </div>
      </Panel>
    </div>
  )
}

function KpiTile({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return <div className="stage-tile">{icon}<strong>{value}</strong><span>{label}</span></div>
}

export function Matching() {
  const { state } = useAppState()
  return (
    <div className="screen-stack">
      <Panel title="Recipient Match Queue" meta="green >=85 / yellow 70-84 / muted below 70">
        <div className="match-grid">
          {state.matches.map((m) => (
            <article className={`match-card ${m.score >= 85 ? 'strong' : m.score >= 70 ? 'watch' : 'muted-match'}`} key={m.id}>
              <div className="score">{m.score}</div>
              <div>
                <h3>{m.name}</h3>
                <div className="tag-row"><span className="tag">{m.organ}</span><span className="tag">HLA {m.hla}</span><span className="tag">CPRA {m.cpra}</span><span className="tag">{m.region}</span></div>
                <p>{m.rationale}</p>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  )
}

export function Scheduling() {
  const { state } = useAppState()
  const custodyCases = state.cases.filter((c) => c.custody.length > 0)
  return (
    <div className="screen-stack">
      <div className="two-column">
        <Panel title="OR Suites" meta="recovery blocks">
          <ScheduleRows filter="OR" />
        </Panel>
        <Panel title="Transport Legs" meta="live logistics">
          <ScheduleRows filter="transport" />
        </Panel>
      </div>
      <Panel title="Chain of Custody" meta={`${custodyCases.length} cases past allocation`}>
        <div className="custody-grid">
          {custodyCases.map((c) => (
            <article className="custody-card" key={c.id}>
              <div className="custody-head"><strong>{c.name}</strong><span>{c.organType}</span></div>
              {c.custody.map((stop) => (
                <div className={`custody-stop ${stop.status}`} key={stop.stage}>
                  <span className="custody-dot" />
                  <div>
                    <strong>{stop.stage}</strong>
                    <p>{stop.location} / {stop.custodian}</p>
                    <small>{formatTime(stop.t)} / {stop.tempC ? `${stop.tempC} C` : 'temp pending'} / {stop.hash ?? 'hash pending'} / {stop.signed ? 'signed' : 'pending signature'}</small>
                  </div>
                </div>
              ))}
            </article>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function ScheduleRows({ filter }: { filter: 'OR' | 'transport' }) {
  const { state } = useAppState()
  const rows = state.schedules.filter((item) => filter === 'OR' ? item.label.includes('OR') || item.label.includes('prep') : !item.label.includes('OR'))
  return (
    <div className="schedule-list">
      {rows.map((item) => {
        const Icon = item.status === 'at-risk' ? AlertTriangle : item.label.includes('Air') ? Plane : item.label.includes('transport') ? Truck : Timer
        return (
          <div className={`schedule-row ${item.status}`} key={item.id}>
            <Icon size={17} />
            <div><strong>{item.label}</strong><span>{item.location} / {item.owner}</span></div>
            <time>{item.eta}</time>
          </div>
        )
      })}
    </div>
  )
}

export function Reports() {
  const { state } = useAppState()
  const statusCounts = ['Pending', 'Rapid', 'Active', 'Completed'].map((status) => [status, state.cases.filter((c) => c.status === status).length] as const)
  const riskCounts = ['Low', 'Medium', 'High'].map((risk) => [risk, state.cases.filter((c) => c.risk === risk).length] as const)
  return (
    <div className="screen-stack">
      <div className="kpi-grid">
        <KpiTile label="Completed" value={state.cases.filter((c) => c.status === 'Completed').length} icon={<CheckCircle2 size={17} />} />
        <KpiTile label="Audit events" value={state.cases.reduce((sum, c) => sum + c.auditChain.length, 0)} icon={<GitCommitHorizontal size={17} />} />
        <KpiTile label="Custody chains" value={state.cases.filter((c) => c.custody.length).length} icon={<ShieldCheck size={17} />} />
        <KpiTile label="New referrals" value={state.referrals.filter((r) => r.status === 'new').length} icon={<FileJson size={17} />} />
      </div>
      <div className="two-column">
        <Distribution title="Status Distribution" data={statusCounts} />
        <Distribution title="Risk Distribution" data={riskCounts} />
      </div>
      <Panel title="Audit Ledger Snapshot" meta="hash-linked / 7-year WORM target">
        <div className="audit-list">
          {state.cases.flatMap((c) => c.auditChain.map((entry) => ({ ...entry, caseName: c.name }))).sort((a, b) => b.t - a.t).slice(0, 10).map((entry) => (
            <div className="audit-row" key={`${entry.caseName}-${entry.seq}-${entry.hash}`}>
              <span className="mono">#{entry.seq}</span>
              <div><strong>{entry.action}</strong><small>{entry.caseName} / {entry.actor}</small></div>
              <span className="mono">{entry.prevHash} to {entry.hash}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function Distribution({ title, data }: { title: string; data: readonly (readonly [string, number])[] }) {
  const max = Math.max(...data.map(([, value]) => value), 1)
  return (
    <Panel title={title}>
      <div className="distribution">
        {data.map(([label, value]) => (
          <div className="dist-row" key={label}>
            <span>{label}</span>
            <div><i style={{ width: `${(value / max) * 100}%` }} /></div>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </Panel>
  )
}

export const screenMap = {
  dashboard: <Dashboard />,
  intake: <DonorIntake />,
  board: <CaseBoard />,
  workflow: <WorkflowAggregate />,
  matching: <Matching />,
  schedule: <Scheduling />,
  reports: <Reports />,
  case: <CaseDetail />,
}
