import {
  Activity,
  ArrowLeft,
  Brain,
  Check,
  Clock3,
  FileText,
  GitBranch,
  HeartPulse,
  LayoutDashboard,
  Network,
  PanelRight,
  Search,
  Siren,
  Truck,
} from 'lucide-react'
import { STAGES, blockingTasks, caseOperationalState, elapsedHours, formatTime, nextTask, timeAgo } from './data'
import { useAppState } from './state'
import type { AthenaInsight, CaseStatus, DonorCase, Page, Risk, Severity } from './types'

type NavSection = {
  group: string
  items: { id: Page; label: string; icon: React.ComponentType<{ size?: number }> }[]
}

const nav: NavSection[] = [
  { group: 'Operations', items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'intake', label: 'Donor Intake', icon: Network }, { id: 'board', label: 'Case Board', icon: GitBranch }] },
  { group: 'Clinical', items: [{ id: 'workflow', label: 'Workflow', icon: Activity }, { id: 'matching', label: 'Matching', icon: HeartPulse }, { id: 'schedule', label: 'Scheduling', icon: Truck }] },
  { group: 'Intel', items: [{ id: 'reports', label: 'Reports', icon: FileText }] },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const { state, selectedCase, dispatch } = useAppState()
  const title = state.page === 'case' && selectedCase ? selectedCase.name : nav.flatMap((g) => g.items).find((item) => item.id === state.page)?.label ?? 'Dashboard'

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">A</div>
          <div>
            <div className="brand-name">AtlasOS</div>
            <div className="brand-sub">VITAE / TRANSPLANT</div>
          </div>
        </div>
        <div className="nav-stack">
          {nav.map((section) => (
            <div className="nav-section" key={section.group}>
              <div className="nav-title">{section.group}</div>
              {section.items.map((item) => {
                const Icon = item.icon
                const active = state.page === item.id
                return (
                  <button className={`nav-item ${active ? 'active' : ''}`} key={item.id} onClick={() => dispatch({ type: 'navigate', page: item.id })}>
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          <span className="live-dot" />
          Sprint Zero foundation
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <div className="eyebrow">Vitae Command</div>
            <h1>{title}</h1>
          </div>
          <div className="topbar-actions">
            <div className="clock"><Clock3 size={14} /> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="system-pill">SYSTEM ONLINE</div>
          </div>
        </header>
        <section className="workspace">{children}</section>
      </main>
      <AthenaPanel />
    </div>
  )
}

export function Panel({ title, meta, children, className = '' }: { title: string; meta?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-title">
        <span>{title}</span>
        {meta ? <span>{meta}</span> : null}
      </div>
      {children}
    </section>
  )
}

export function StatusPill({ status }: { status: CaseStatus }) {
  return <span className={`pill pill-${status.toLowerCase()}`}>{status}</span>
}

export function RiskTag({ risk }: { risk: Risk }) {
  return <span className={`risk risk-${risk.toLowerCase()}`}>{risk}</span>
}

export function SeverityDot({ severity }: { severity: Severity | AthenaInsight['severity'] }) {
  return <span className={`severity-dot ${severity}`} />
}

export function EHRBadge({ source }: { source: DonorCase['ehrSource'] }) {
  return <span className={`ehr-badge ${source.toLowerCase()}`}>{source}</span>
}

export function CaseRow({ c, compact = false }: { c: DonorCase; compact?: boolean }) {
  const { dispatch } = useAppState()
  const task = nextTask(c)
  const blockers = blockingTasks(c)
  const opState = caseOperationalState(c)
  return (
    <button className={`case-row ${compact ? 'compact' : ''} ${opState}`} onClick={() => dispatch({ type: 'openCase', caseId: c.id })}>
      <div>
        <div className="row-main">{c.name} <span className="muted">{c.ageSex}</span></div>
        <div className="row-meta">{c.hospital} to {c.center} / {c.organType} / {c.donorType}</div>
        {task ? <div className="row-meta">Owner: {task.owner} / Next: {task.nextAction} / Due {formatTime(task.dueAt)}</div> : null}
      </div>
      <div className="row-tags">
        <EHRBadge source={c.ehrSource} />
        <RiskTag risk={c.risk} />
        <StatusPill status={c.status} />
        {blockers.length ? <span className="tag blocker">{blockers.length} blocker</span> : <span className="tag">{opState}</span>}
      </div>
      <ProgressDots c={c} />
    </button>
  )
}

export function ProgressDots({ c }: { c: DonorCase }) {
  return (
    <div className="progress-dots" title={`${STAGES[c.currentStageIdx].name} stage`}>
      {c.workflowSteps.map((step) => <span className={step.status} key={step.name} />)}
    </div>
  )
}

export function AthenaPanel() {
  const { state, selectedCase, dispatch } = useAppState()
  const insights = selectedCase ? selectedCase.insights : state.globalInsights
  return (
    <aside className="athena-panel">
      <div className="athena-head">
        <div>
          <div className="athena-title"><Brain size={16} /> ATHENA AI</div>
          <div className="athena-scope">{selectedCase ? `CASE ${selectedCase.id}` : 'GLOBAL CONTEXT'}</div>
        </div>
        <PanelRight size={18} />
      </div>
      <div className="athena-feed">
        {insights.filter((item) => !item.dismissed).slice(0, 6).map((item) => (
          <div className={`insight ${item.severity}`} key={item.id}>
            <div className="insight-top">
              <SeverityDot severity={item.severity} />
              <span>{item.severity}</span>
              <span>{item.category.replace('_', ' ')}</span>
              <time>{timeAgo(item.t)}</time>
            </div>
            <p>{item.text}</p>
            <div className="source">Source: {item.source}</div>
            <div className="insight-actions">
              {item.actions.slice(0, 2).map((action) => (
                <button
                  key={action}
                  onClick={() => {
                    if (action === 'acknowledge') dispatch({ type: 'acknowledgeInsight', insightId: item.id, caseId: item.caseId })
                    else if (action === 'view_schedule') dispatch({ type: 'navigate', page: 'schedule' })
                    else if (action === 'view_workflow') dispatch({ type: 'navigate', page: 'workflow' })
                    else if (action === 'view_matches') dispatch({ type: 'navigate', page: 'matching' })
                    else if (item.caseId) dispatch({ type: 'openCase', caseId: item.caseId })
                    else dispatch({ type: 'navigate', page: 'matching' })
                  }}
                >
                  {action.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className="primary-action" onClick={() => selectedCase ? dispatch({ type: 'generateCaseInsight', caseId: selectedCase.id }) : dispatch({ type: 'generateGlobalInsight' })}>
        Generate Insight
      </button>
    </aside>
  )
}

export function CaseHeader({ c }: { c: DonorCase }) {
  const { dispatch } = useAppState()
  return (
    <div className="detail-header">
      <button className="icon-button" onClick={() => dispatch({ type: 'navigate', page: 'board' })} title="Back to board"><ArrowLeft size={17} /></button>
      <div>
        <div className="mono muted">CASE #{c.id}</div>
        <h2>{c.name} <span>{c.ageSex}</span></h2>
      </div>
      <div className="detail-tags">
        <StatusPill status={c.status} />
        <RiskTag risk={c.risk} />
        <span className="mono muted">{elapsedHours(c.createdAt)}h open</span>
      </div>
      <div className="detail-actions">
        <button onClick={() => dispatch({ type: 'generateCaseInsight', caseId: c.id })}><Brain size={15} /> Athena</button>
        <button onClick={() => dispatch({ type: 'updateStatus', caseId: c.id, status: 'Rapid' })}><Siren size={15} /> Escalate</button>
        <button className="blue" onClick={() => dispatch({ type: 'advanceWorkflow', caseId: c.id })}><Check size={15} /> Advance</button>
      </div>
    </div>
  )
}

export function Timeline({ c }: { c: DonorCase }) {
  return (
    <div className="timeline">
      {c.events.map((event) => (
        <div className="timeline-item" key={`${event.t}-${event.text}`}>
          <SeverityDot severity={event.severity} />
          <div>
            <p>{event.text}</p>
            <time>{formatTime(event.t)}</time>
          </div>
        </div>
      ))}
    </div>
  )
}

export function EmptyState({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="empty-state">
      <Search size={18} />
      <strong>{title}</strong>
      <span>{children}</span>
    </div>
  )
}
