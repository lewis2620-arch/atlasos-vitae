export type Severity = 'info' | 'warning' | 'critical' | 'complete'
export type Risk = 'Low' | 'Medium' | 'High'
export type CaseStatus = 'Pending' | 'Rapid' | 'Active' | 'Completed'
export type StageStatus = 'complete' | 'current' | 'pending'
export type TaskStatus = 'open' | 'blocked' | 'in-progress' | 'complete'
export type InsightCategory = 'missing_data' | 'timing_risk' | 'workflow_blocker' | 'reporting_risk' | 'logistics_risk'
export type Page =
  | 'dashboard'
  | 'intake'
  | 'board'
  | 'workflow'
  | 'matching'
  | 'schedule'
  | 'reports'
  | 'case'

export type WorkflowStage = {
  name: string
  checklist: string[]
}

export type ChecklistItem = {
  text: string
  done: boolean
  missing: boolean
}

export type WorkflowStep = {
  name: string
  status: StageStatus
  checklist: ChecklistItem[]
  completedAt: number | null
}

export type CaseEvent = {
  t: number
  text: string
  severity: Severity
}

export type CaseNote = {
  author: string
  text: string
  t: number
}

export type InsightAction = 'acknowledge' | 'take_action' | 'view_case' | 'view_matches' | 'view_schedule' | 'view_workflow' | 'escalate'

export type AthenaInsight = {
  id: string
  text: string
  severity: Exclude<Severity, 'complete'>
  category: InsightCategory
  t: number
  actions: InsightAction[]
  dismissed?: boolean
  caseId?: number
  source: string
}

export type AuditEntry = {
  seq: number
  t: number
  actor: string
  action: string
  severity: Severity
  prevHash: string
  hash: string
}

export type CustodyStop = {
  stage: string
  location: string
  custodian: string
  t: number | null
  tempC: string | null
  hash: string | null
  status: StageStatus
  signed: boolean
}

export type ClinicalResult = {
  id: string
  label: string
  value: string
  unit?: string
  status: 'normal' | 'watch' | 'critical' | 'pending'
  source: string
  updatedAt: number
}

export type ClinicalDocument = {
  id: string
  title: string
  kind: 'labs' | 'serology' | 'imaging' | 'authorization' | 'attachment'
  status: 'received' | 'pending' | 'review' | 'signed'
  source: string
  updatedAt: number
}

export type CaseTask = {
  id: string
  title: string
  owner: string
  dueAt: number
  status: TaskStatus
  severity: Exclude<Severity, 'complete'>
  caseId: number
  stage: string
  nextAction: string
}

export type ClinicalContext = {
  labs: ClinicalResult[]
  serology: ClinicalResult[]
  imaging: ClinicalDocument[]
  authorization: ClinicalDocument[]
  attachments: ClinicalDocument[]
}

export type DonorCase = {
  id: number
  name: string
  ageSex: string
  risk: Risk
  status: CaseStatus
  createdAt: number
  hospital: string
  center: string
  organType: string
  ehrSource: 'Epic' | 'Cerner' | 'Manual'
  donorType: 'DBD' | 'DCD'
  flags: string[]
  currentStageIdx: number
  workflowSteps: WorkflowStep[]
  events: CaseEvent[]
  notes: CaseNote[]
  insights: AthenaInsight[]
  auditChain: AuditEntry[]
  custody: CustodyStop[]
  tasks: CaseTask[]
  clinical: ClinicalContext
}

export type Referral = {
  id: string
  receivedAt: number
  hospital: string
  ehr: 'Epic' | 'Cerner'
  fhirVersion: string
  donorName: string
  triggerType: string
  glasgowComa: number
  riskHint: Risk
  organCandidates: string[]
  bundleSize: string
  status: 'new' | 'triaged' | 'accepted' | 'dismissed'
}

export type MatchCandidate = {
  id: string
  name: string
  score: number
  region: string
  hla: string
  cpra: number
  age: number
  organ: string
  rationale: string
}

export type ScheduleItem = {
  id: string
  label: string
  caseId: number
  location: string
  owner: string
  eta: string
  status: 'confirmed' | 'at-risk' | 'pending'
}

export type AppState = {
  page: Page
  selectedCaseId: number | null
  cases: DonorCase[]
  referrals: Referral[]
  globalInsights: AthenaInsight[]
  matches: MatchCandidate[]
  schedules: ScheduleItem[]
}
