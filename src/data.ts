import type {
  AppState,
  AthenaInsight,
  AuditEntry,
  CaseEvent,
  CaseStatus,
  CustodyStop,
  DonorCase,
  MatchCandidate,
  Referral,
  Risk,
  ScheduleItem,
  Severity,
  WorkflowStage,
  WorkflowStep,
} from './types'

export const STAGES: WorkflowStage[] = [
  { name: 'Intake', checklist: ['Demographics', 'Consent', 'Initial labs'] },
  { name: 'Evaluation', checklist: ['HLA panel', 'Imaging', 'Cardiac workup'] },
  { name: 'Authorization', checklist: ['Next-of-kin signature', 'DCD/DBD declaration'] },
  { name: 'Allocation', checklist: ['Match list run', 'Recipient confirmation', 'OPO notified'] },
  { name: 'Recovery', checklist: ['OR scheduled', 'Recovery team mobilized', 'Preservation prep'] },
  { name: 'Transport', checklist: ['Cold ischemic timer', 'Transport leg confirmed', 'Recipient hospital ready'] },
]

const now = Date.now()

export function pseudoHash(seed: string | number) {
  let hash = 2166136261
  const input = String(seed)
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0') + 'c4a1'
}

export function timeAgo(t: number) {
  const minutes = Math.max(1, Math.round((Date.now() - t) / 60000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 48) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

export function elapsedHours(t: number) {
  return Math.max(1, Math.round((Date.now() - t) / 3600000))
}

export function formatTime(t: number | null) {
  if (!t) return 'pending'
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  }).format(t)
}

function workflow(currentStageIdx: number): WorkflowStep[] {
  return STAGES.map((stage, index) => ({
    name: stage.name,
    status: index < currentStageIdx ? 'complete' : index === currentStageIdx ? 'current' : 'pending',
    checklist: stage.checklist.map((text, itemIndex) => ({
      text,
      done: index < currentStageIdx || (index === currentStageIdx && itemIndex === 0),
      missing: index === currentStageIdx && itemIndex === 2,
    })),
    completedAt: index < currentStageIdx ? now - (STAGES.length - index) * 5400000 : null,
  }))
}

function audit(id: number, action: string, severity: Severity, seq = 1): AuditEntry {
  const prevHash = seq === 1 ? '000000000000' : pseudoHash(`${id}-${seq - 1}`)
  return {
    seq,
    t: now - (7 - seq) * 2200000,
    actor: seq % 2 === 0 ? 'Coordinator' : 'system',
    action,
    severity,
    prevHash,
    hash: pseudoHash(`${id}-${seq}-${action}`),
  }
}

function events(stage: string, risk: Risk): CaseEvent[] {
  return [
    { t: now - 18500000, text: 'Referral accepted from EHR feed', severity: 'complete' },
    { t: now - 13200000, text: `${stage} workflow state synchronized`, severity: 'info' },
    {
      t: now - 7600000,
      text: risk === 'High' ? 'Athena detected cold ischemic timing risk' : 'Coordinator review completed',
      severity: risk === 'High' ? 'critical' : 'complete',
    },
  ]
}

function insight(id: string, text: string, severity: AthenaInsight['severity'], source: string, caseId?: number): AthenaInsight {
  return {
    id,
    text,
    severity,
    t: now - Math.floor(Math.random() * 9000000),
    source,
    caseId,
    actions: severity === 'critical' ? ['escalate', 'take_action'] : ['acknowledge', 'view_case'],
  }
}

function custody(caseId: number, active: boolean): CustodyStop[] {
  const stages: CustodyStop[] = [
    {
      stage: 'Sealed at OPO',
      location: 'Donor Hospital / OR Suite 3',
      custodian: 'OPO Recovery Lead',
      t: now - 2800000,
      tempC: '4.1',
      hash: pseudoHash(`${caseId}-sealed`),
      status: 'complete',
      signed: true,
    },
    {
      stage: 'Ground transport',
      location: 'Phoenix Med Air Transfer',
      custodian: 'Logistics Team Alpha',
      t: active ? now - 900000 : null,
      tempC: active ? '4.4' : null,
      hash: active ? pseudoHash(`${caseId}-ground`) : null,
      status: active ? 'current' : 'pending',
      signed: active,
    },
    {
      stage: 'Recipient handoff',
      location: 'Transplant Center Receiving',
      custodian: 'Center OR Desk',
      t: null,
      tempC: null,
      hash: null,
      status: 'pending',
      signed: false,
    },
  ]
  return stages
}

function buildCase(
  id: number,
  name: string,
  ageSex: string,
  risk: Risk,
  status: CaseStatus,
  currentStageIdx: number,
  ageHours: number,
  flags: string[],
  ctx: Pick<DonorCase, 'hospital' | 'center' | 'organType' | 'ehrSource' | 'donorType'>,
): DonorCase {
  const caseEvents = events(STAGES[currentStageIdx].name, risk)
  return {
    id,
    name,
    ageSex,
    risk,
    status,
    createdAt: now - ageHours * 3600000,
    flags,
    currentStageIdx,
    workflowSteps: workflow(currentStageIdx),
    events: caseEvents,
    notes: [
      { author: 'Coordinator', text: 'Family communication updated. Center team awaiting next timing confirmation.', t: now - 6200000 },
      { author: 'Athena', text: 'Source-linked summary generated from workflow state, EHR intake, and logistics events.', t: now - 2400000 },
    ],
    insights: [
      insight(`case-${id}-a`, risk === 'High' ? 'High-risk case requires escalation review before recovery mobilization.' : 'Workflow is progressing inside expected operating window.', risk === 'High' ? 'critical' : 'info', 'Case timeline + workflow checklist', id),
      insight(`case-${id}-b`, 'Missing checklist item may block the next stage if not resolved.', 'warning', 'Current workflow stage', id),
    ],
    auditChain: [
      audit(id, 'FHIR bundle received and normalized', 'complete', 1),
      audit(id, 'Coordinator accepted referral into active case board', 'complete', 2),
      audit(id, `${STAGES[currentStageIdx].name} state recomputed`, risk === 'High' ? 'warning' : 'info', 3),
    ],
    custody: currentStageIdx >= 3 ? custody(id, status !== 'Completed') : [],
    ...ctx,
  }
}

export const initialCases: DonorCase[] = [
  buildCase(1729384472, 'Donor A', '47M', 'High', 'Rapid', 2, 9, ['Cold ischemic warning', 'DCD'], {
    hospital: 'Mayo Clinic Phoenix',
    center: 'Banner Transplant',
    organType: 'Heart+Lung',
    ehrSource: 'Epic',
    donorType: 'DCD',
  }),
  buildCase(1729384511, 'Donor B', '32F', 'Medium', 'Active', 3, 15, ['HLA pending'], {
    hospital: 'St. Vincent Medical',
    center: 'Stanford Transplant',
    organType: 'Kidney',
    ehrSource: 'Cerner',
    donorType: 'DBD',
  }),
  buildCase(1729384580, 'Donor C', '58M', 'Low', 'Pending', 1, 4, ['Family consult'], {
    hospital: 'Desert Regional',
    center: 'Unassigned',
    organType: 'Liver',
    ehrSource: 'Epic',
    donorType: 'DBD',
  }),
  buildCase(1729384604, 'Donor D', '41F', 'Medium', 'Completed', 5, 31, ['Chain verified'], {
    hospital: 'Valley Trauma Center',
    center: 'UCLA Transplant',
    organType: 'Multi-organ',
    ehrSource: 'Manual',
    donorType: 'DCD',
  }),
]

export const referrals: Referral[] = [
  {
    id: 'REF-9815',
    receivedAt: now - 1300000,
    hospital: 'Mayo Clinic Phoenix',
    ehr: 'Epic',
    fhirVersion: 'R4',
    donorName: 'Donor (M, ~52)',
    triggerType: 'Vented / mechanical ventilation > 24h',
    glasgowComa: 3,
    riskHint: 'High',
    organCandidates: ['Liver', 'Kidney', 'Heart'],
    bundleSize: '61 resources',
    status: 'new',
  },
  {
    id: 'REF-9821',
    receivedAt: now - 4100000,
    hospital: 'Banner Desert',
    ehr: 'Cerner',
    fhirVersion: 'R4',
    donorName: 'Donor (F, ~39)',
    triggerType: 'Neurologic death trigger',
    glasgowComa: 5,
    riskHint: 'Medium',
    organCandidates: ['Kidney', 'Pancreas'],
    bundleSize: '47 resources',
    status: 'new',
  },
  {
    id: 'REF-9774',
    receivedAt: now - 15200000,
    hospital: 'St. Joseph Regional',
    ehr: 'Epic',
    fhirVersion: 'R4',
    donorName: 'Donor (M, ~64)',
    triggerType: 'Manual coordinator review',
    glasgowComa: 7,
    riskHint: 'Low',
    organCandidates: ['Liver'],
    bundleSize: '33 resources',
    status: 'triaged',
  },
]

export const matches: MatchCandidate[] = [
  { id: 'M-441', name: 'Recipient 441', score: 94, region: 'AZ / local', hla: '5/6', cpra: 18, age: 44, organ: 'Kidney', rationale: 'Strong HLA overlap, low travel risk, center criteria aligned.' },
  { id: 'M-447', name: 'Recipient 447', score: 87, region: 'CA / regional', hla: '4/6', cpra: 62, age: 51, organ: 'Liver', rationale: 'Medically urgent with acceptable cold ischemic window.' },
  { id: 'M-452', name: 'Recipient 452', score: 81, region: 'NV / regional', hla: '4/6', cpra: 41, age: 38, organ: 'Heart', rationale: 'Timing viable if air leg confirms within 45 minutes.' },
  { id: 'M-488', name: 'Recipient 488', score: 73, region: 'AZ / local', hla: '3/6', cpra: 12, age: 59, organ: 'Lung', rationale: 'Compatible, but center acceptance window is narrowing.' },
  { id: 'M-501', name: 'Recipient 501', score: 66, region: 'UT / regional', hla: '3/6', cpra: 77, age: 29, organ: 'Kidney', rationale: 'Backup candidate; elevated sensitization and logistics risk.' },
]

export const schedules: ScheduleItem[] = [
  { id: 'SCH-18', label: 'OR Suite 3 recovery block', caseId: 1729384472, location: 'Mayo Clinic Phoenix', owner: 'Recovery Lead', eta: '21:20', status: 'at-risk' },
  { id: 'SCH-22', label: 'Air leg PHX to SFO', caseId: 1729384511, location: 'Phoenix Med Air', owner: 'Logistics Alpha', eta: '22:10', status: 'confirmed' },
  { id: 'SCH-31', label: 'Recipient handoff prep', caseId: 1729384604, location: 'UCLA Receiving', owner: 'Center OR Desk', eta: 'Complete', status: 'confirmed' },
  { id: 'SCH-37', label: 'Evaluation lab courier', caseId: 1729384580, location: 'Desert Regional', owner: 'Courier Desk', eta: '19:45', status: 'pending' },
]

export const initialState: AppState = {
  page: 'dashboard',
  selectedCaseId: null,
  cases: initialCases,
  referrals,
  matches,
  schedules,
  globalInsights: [
    insight('global-1', 'UNOS reconciliation queue has four field mismatches pending coordinator review.', 'warning', 'OPTN Hub / policy mappings'),
    insight('global-2', 'One rapid case has a critical timing risk and should remain pinned in command view.', 'critical', 'Case board status distribution'),
    insight('global-3', 'Epic and Cerner feeds are live; latest referral bundle arrived under two minutes ago.', 'info', 'FHIR inbox connector telemetry'),
  ],
}
