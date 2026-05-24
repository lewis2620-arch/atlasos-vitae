/* eslint-disable react-refresh/only-export-components */
import { Activity, AlertTriangle, ArrowRight, CheckCircle2, ClipboardList, Database, FileCheck2, GitCommitHorizontal, Image, Microscope, Paperclip, Plane, Plus, ShieldCheck, Timer, Truck } from 'lucide-react'
import { CaseHeader, CaseRow, EHRBadge, EmptyState, Panel, ProgressDots, RiskTag, SeverityDot, StatusPill, Timeline } from './components'
import { STAGES, blockingTasks, caseOperationalState, dueSoonTasks, elapsedHours, formatTime, nextTask, openTasks, timeAgo } from './data'
import { useAppState } from './state'
import type { CaseStatus, ClinicalDocument, ClinicalResult, DonorCase, Referral } from './types'

export function Dashboard() {
  const { state } = useAppState()
  const activeCases = state.cases.filter((c) => c.status !== 'Completed')
  const highRisk = activeCases.filter((c) => c.risk === 'High').length
  const blocked = activeCases.filter((c) => blockingTasks(c).length > 0).length
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
        <Kpi label="Blocked tasks" value={blocked} meta="owned operational blockers" tone={blocked ? 'critical' : 'default'} />
        <Kpi label="Avg time open" value={`${avgHours}h`} meta="active workflow cases" />
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
  const task = nextTask(c)
  const blockers = blockingTasks(c)
  const opState = caseOperationalState(c)
  return (
    <article className={`board-card risk-${c.risk.toLowerCase()} ${opState} ${c.status === 'Rapid' || blockers.length || (c.risk === 'High' && c.status === 'Active') ? 'pulse' : ''}`}>
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
      <div className="board-task">
        <span>{task ? task.owner : 'No open owner'}</span>
        <strong>{task ? task.nextAction : 'No active blockers'}</strong>
        <small>{task ? `Due ${formatTime(task.dueAt)}` : opState}</small>
      </div>
      {blockers.length ? <span className="board-blocker">{blockers.length} blocker / {opState}</span> : null}
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
                <div className="insight-top"><SeverityDot severity={item.severity} /><span>{item.severity}</span><span>{item.category.replace('_', ' ')}</span><time>{timeAgo(item.t)}</time></div>
                <p>{item.text}</p>
                <div className="source">Source: {item.source}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <div className="detail-v1-grid">
        <TaskPanel c={c} />
        <ClinicalPanel title="Labs" icon={<Microscope size={15} />} results={c.clinical.labs} />
        <ClinicalPanel title="Serology" icon={<ShieldCheck size={15} />} results={c.clinical.serology} />
        <DocumentPanel title="Imaging" icon={<Image size={15} />} docs={c.clinical.imaging} />
        <DocumentPanel title="Authorization" icon={<FileCheck2 size={15} />} docs={c.clinical.authorization} />
        <DocumentPanel title="Attachments" icon={<Paperclip size={15} />} docs={c.clinical.attachments} />
      </div>
    </div>
  )
}

function TaskPanel({ c }: { c: DonorCase }) {
  return (
    <Panel title="Tasks / Blockers" meta={`${openTasks(c).length} open / ${blockingTasks(c).length} blocked`}>
      <div className="task-list">
        {c.tasks.map((task) => (
          <div className={`task-card ${task.status} ${task.severity}`} key={task.id}>
            <div className="task-top">
              <span>{task.stage}</span>
              <span>{task.status}</span>
            </div>
            <strong>{task.title}</strong>
            <p>{task.nextAction}</p>
            <div className="task-meta">
              <span>{task.owner}</span>
              <span>Due {formatTime(task.dueAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function ClinicalPanel({ title, icon, results }: { title: string; icon: React.ReactNode; results: ClinicalResult[] }) {
  return (
    <Panel title={title} meta="clinical feed">
      <div className="clinical-head">{icon}<span>{results.length} values</span></div>
      <div className="clinical-list">
        {results.map((result) => (
          <div className={`clinical-row ${result.status}`} key={result.id}>
            <div><strong>{result.label}</strong><span>{result.source}</span></div>
            <div><strong>{result.value}{result.unit ? ` ${result.unit}` : ''}</strong><span>{result.status}</span></div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function DocumentPanel({ title, icon, docs }: { title: string; icon: React.ReactNode; docs: ClinicalDocument[] }) {
  return (
    <Panel title={title} meta="source-linked">
      <div className="clinical-head">{icon}<span>{docs.length} artifacts</span></div>
      <div className="clinical-list">
        {docs.map((doc) => (
          <div className={`clinical-row ${doc.status}`} key={doc.id}>
            <div><strong>{doc.title}</strong><span>{doc.source}</span></div>
            <div><strong>{doc.status}</strong><span>{formatTime(doc.updatedAt)}</span></div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

export function WorkflowAggregate() {
  const { state } = useAppState()
  const active = state.cases.filter((c) => c.status !== 'Completed')
  return (
    <div className="screen-stack">
      <div className="stage-grid">
        {STAGES.map((stage, index) => {
          const stageCases = active.filter((c) => c.currentStageIdx === index)
          const blocked = stageCases.filter((c) => blockingTasks(c).length > 0).length
          return <KpiTile key={stage.name} label={`${stage.name} / ${blocked} blocked`} value={stageCases.length} icon={<Activity size={17} />} />
        })}
      </div>
      <Panel title="Workflow Coordination" meta="owners, blockers, next actions">
        <div className="case-list">
          {state.cases.map((c) => <CaseRow c={c} key={c.id} />)}
        </div>
      </Panel>
      <Panel title="At-Risk Work Queue" meta={`${active.filter((c) => caseOperationalState(c) !== 'on-track').length} cases`}>
        <div className="workflow-risk-grid">
          {active.filter((c) => caseOperationalState(c) !== 'on-track').map((c) => {
            const task = nextTask(c)
            return (
              <div className={`workflow-risk-card ${caseOperationalState(c)}`} key={c.id}>
                <div><strong>{c.name}</strong><span>{STAGES[c.currentStageIdx].name} / {caseOperationalState(c)}</span></div>
                <p>{task?.nextAction ?? 'Review workflow state'}</p>
                <small>{task?.owner ?? 'Coordinator'} / {task ? formatTime(task.dueAt) : 'no due time'}</small>
              </div>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}

function KpiTile({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return <div className="stage-tile">{icon}<strong>{value}</strong><span>{label}</span></div>
}

export function Matching() {
  const { state, selectedCase } = useAppState()
  const anchorCase = selectedCase ?? state.cases.find((c) => c.status === 'Rapid') ?? state.cases[0]
  return (
    <div className="screen-stack">
      <Panel title="Active Organ Context" meta={anchorCase ? `${anchorCase.name} / ${anchorCase.organType}` : 'global'}>
        <div className="match-context">
          <ClipboardList size={18} />
          <div>
            <strong>{anchorCase?.organType ?? 'Multi-organ'} ranking is scoped to donor risk, region, HLA/CPRA, and transport timing.</strong>
            <p>{anchorCase ? `${anchorCase.hospital} to ${anchorCase.center}. Current blocker: ${nextTask(anchorCase)?.nextAction ?? 'none'}.` : 'No active case selected.'}</p>
          </div>
        </div>
      </Panel>
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
  const atRiskLogistics = state.cases.filter((c) => dueSoonTasks(c).length > 0 || c.custody.some((stop) => stop.status === 'current')).length
  return (
    <div className="screen-stack">
      <div className="stage-grid">
        <KpiTile label="OR blocks" value={state.schedules.filter((item) => item.label.includes('OR') || item.label.includes('prep')).length} icon={<Timer size={17} />} />
        <KpiTile label="Transport legs" value={state.schedules.filter((item) => !item.label.includes('OR')).length} icon={<Truck size={17} />} />
        <KpiTile label="Custody chains" value={custodyCases.length} icon={<ShieldCheck size={17} />} />
        <KpiTile label="Logistics risk" value={atRiskLogistics} icon={<AlertTriangle size={17} />} />
      </div>
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
  const blockedCases = state.cases.filter((c) => blockingTasks(c).length > 0).length
  const openTaskCount = state.cases.reduce((sum, c) => sum + openTasks(c).length, 0)
  return (
    <div className="screen-stack">
      <div className="kpi-grid">
        <KpiTile label="Completed" value={state.cases.filter((c) => c.status === 'Completed').length} icon={<CheckCircle2 size={17} />} />
        <KpiTile label="Open tasks" value={openTaskCount} icon={<ClipboardList size={17} />} />
        <KpiTile label="Blocked cases" value={blockedCases} icon={<AlertTriangle size={17} />} />
        <KpiTile label="Audit events" value={state.cases.reduce((sum, c) => sum + c.auditChain.length, 0)} icon={<GitCommitHorizontal size={17} />} />
      </div>
      <div className="two-column">
        <Distribution title="Status Distribution" data={statusCounts} />
        <Distribution title="Risk Distribution" data={riskCounts} />
      </div>
      <Panel title="Operational Readiness" meta="live frontend state">
        <div className="readiness-grid">
          {state.cases.map((c) => (
            <div className={`readiness-card ${caseOperationalState(c)}`} key={c.id}>
              <strong>{c.name}</strong>
              <span>{caseOperationalState(c)} / {openTasks(c).length} open tasks / {blockingTasks(c).length} blockers</span>
              <small>{nextTask(c)?.nextAction ?? 'No active next action'}</small>
            </div>
          ))}
        </div>
      </Panel>
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
