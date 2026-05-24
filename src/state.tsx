/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useReducer } from 'react'
import { STAGES, initialState, makeInsight, pseudoHash } from './data'
import type { AppState, AthenaInsight, CaseStatus, CaseTask, ClinicalContext, DonorCase, InsightCategory, Page, Referral, Severity } from './types'

type Action =
  | { type: 'navigate'; page: Page; caseId?: number | null }
  | { type: 'openCase'; caseId: number }
  | { type: 'advanceWorkflow'; caseId: number }
  | { type: 'updateStatus'; caseId: number; status: CaseStatus }
  | { type: 'acceptReferral'; referralId: string }
  | { type: 'generateGlobalInsight' }
  | { type: 'generateCaseInsight'; caseId: number }
  | { type: 'acknowledgeInsight'; insightId: string; caseId?: number }

type AppContextValue = {
  state: AppState
  dispatch: React.Dispatch<Action>
  selectedCase: DonorCase | null
}

const AppContext = createContext<AppContextValue | null>(null)

function insight(text: string, severity: AthenaInsight['severity'], category: InsightCategory, source: string, caseId?: number): AthenaInsight {
  return {
    ...makeInsight(`ins-${Date.now()}-${Math.random().toString(16).slice(2)}`, text, severity, category, source, caseId),
    t: Date.now(),
  }
}

function addCaseEvent(c: DonorCase, text: string, severity: Severity, actor = 'Coordinator'): DonorCase {
  const prev = c.auditChain.at(-1)
  const seq = (prev?.seq ?? 0) + 1
  const hash = pseudoHash(`${c.id}-${seq}-${text}-${Date.now()}`)
  return {
    ...c,
    events: [{ t: Date.now(), text, severity }, ...c.events],
    auditChain: [
      ...c.auditChain,
      {
        seq,
        t: Date.now(),
        actor,
        action: text,
        severity,
        prevHash: prev?.hash ?? '000000000000',
        hash,
      },
    ],
  }
}

function statusAfterStage(stageIndex: number): CaseStatus {
  if (stageIndex >= STAGES.length - 1) return 'Completed'
  if (stageIndex >= 3) return 'Active'
  return 'Rapid'
}

function clinicalFromReferral(referral: Referral, caseId: number): ClinicalContext {
  const createdAt = Date.now()
  return {
    labs: [
      { id: `lab-${caseId}-abo`, label: 'ABO', value: referral.id.endsWith('15') ? 'O+' : 'A+', status: 'normal', source: `${referral.id} FHIR Observation`, updatedAt: createdAt },
      { id: `lab-${caseId}-gcs`, label: 'GCS', value: `${referral.glasgowComa}`, status: referral.glasgowComa <= 4 ? 'critical' : 'watch', source: `${referral.id} FHIR Observation`, updatedAt: createdAt },
      { id: `lab-${caseId}-cr`, label: 'Creatinine', value: referral.riskHint === 'High' ? '2.2' : '1.4', unit: 'mg/dL', status: referral.riskHint === 'High' ? 'watch' : 'normal', source: `${referral.id} lab bundle`, updatedAt: createdAt },
    ],
    serology: [
      { id: `ser-${caseId}-hiv`, label: 'HIV Ag/Ab', value: 'Non-reactive', status: 'normal', source: `${referral.id} serology bundle`, updatedAt: createdAt },
      { id: `ser-${caseId}-cmv`, label: 'CMV IgG', value: 'Pending', status: 'pending', source: `${referral.id} serology bundle`, updatedAt: createdAt },
      { id: `ser-${caseId}-hcv`, label: 'HCV Ab', value: 'Pending', status: 'pending', source: `${referral.id} serology bundle`, updatedAt: createdAt },
    ],
    imaging: [
      { id: `img-${caseId}-ct`, title: 'Initial CT packet', kind: 'imaging', status: 'review', source: `${referral.id} DocumentReference`, updatedAt: createdAt },
      { id: `img-${caseId}-echo`, title: 'Echo request', kind: 'imaging', status: 'pending', source: 'Evaluation checklist', updatedAt: createdAt },
    ],
    authorization: [
      { id: `auth-${caseId}-nok`, title: 'Next-of-kin authorization', kind: 'authorization', status: 'pending', source: 'Coordinator workflow', updatedAt: createdAt },
      { id: `auth-${caseId}-decl`, title: 'DCD / DBD declaration', kind: 'authorization', status: 'review', source: `${referral.id} clinical trigger`, updatedAt: createdAt },
    ],
    attachments: [
      { id: `att-${caseId}-bundle`, title: `${referral.bundleSize} normalized FHIR resources`, kind: 'attachment', status: 'received', source: referral.ehr, updatedAt: createdAt },
      { id: `att-${caseId}-summary`, title: 'Athena intake summary draft', kind: 'attachment', status: 'review', source: 'Athena', updatedAt: createdAt },
    ],
  }
}

function tasksFromReferral(referral: Referral, caseId: number): CaseTask[] {
  const createdAt = Date.now()
  return [
    {
      id: `task-${caseId}-eval`,
      title: referral.riskHint === 'High' ? 'Resolve high-risk evaluation blockers' : 'Complete evaluation checklist',
      owner: referral.riskHint === 'High' ? 'Clinical Lead' : 'Coordinator',
      dueAt: createdAt + (referral.riskHint === 'High' ? 30 : 90) * 60000,
      status: referral.riskHint === 'High' ? 'blocked' : 'in-progress',
      severity: referral.riskHint === 'High' ? 'critical' : 'warning',
      caseId,
      stage: 'Evaluation',
      nextAction: referral.riskHint === 'High' ? 'Review GCS and pending serology' : 'Close imaging and HLA checklist items',
    },
    {
      id: `task-${caseId}-auth`,
      title: 'Confirm authorization path and family communication',
      owner: 'Family Services',
      dueAt: createdAt + 120 * 60000,
      status: 'open',
      severity: 'warning',
      caseId,
      stage: 'Authorization',
      nextAction: 'Prepare authorization documentation',
    },
    {
      id: `task-${caseId}-report`,
      title: 'Prepare OPTN draft fields for human review',
      owner: 'Reporting Analyst',
      dueAt: createdAt + 180 * 60000,
      status: 'open',
      severity: 'info',
      caseId,
      stage: 'Allocation',
      nextAction: 'Review policy-version mapping coverage',
    },
  ]
}

function createCaseFromReferral(referral: Referral, nextId: number): DonorCase {
  const createdAt = Date.now()
  const workflowSteps = STAGES.map((stage, index) => ({
    name: stage.name,
    status: index === 0 ? 'complete' : index === 1 ? 'current' : 'pending',
    checklist: stage.checklist.map((text, itemIndex) => ({
      text,
      done: index === 0 || (index === 1 && itemIndex === 0),
      missing: index === 1 && itemIndex === 2,
    })),
    completedAt: index === 0 ? createdAt : null,
  })) satisfies DonorCase['workflowSteps']

  return {
    id: nextId,
    name: `Donor ${String.fromCharCode(65 + (nextId % 20))}`,
    ageSex: referral.donorName.replace('Donor (', '').replace(')', ''),
    risk: referral.riskHint,
    status: referral.riskHint === 'High' ? 'Rapid' : 'Pending',
    createdAt,
    hospital: referral.hospital,
    center: 'Unassigned',
    organType: referral.organCandidates.join('+'),
    ehrSource: referral.ehr,
    donorType: referral.riskHint === 'High' ? 'DCD' : 'DBD',
    flags: ['FHIR intake complete', `${referral.bundleSize} normalized`],
    currentStageIdx: 1,
    workflowSteps,
    events: [
      { t: createdAt, text: `${referral.id} opened as donor case from ${referral.ehr} FHIR bundle`, severity: 'complete' },
      { t: createdAt, text: 'Evaluation stage activated from structured intake', severity: 'info' },
    ],
    notes: [{ author: 'Coordinator', text: 'Structured referral accepted. Intake checklist completed from EHR provenance.', t: createdAt }],
    insights: [
      insight(
        `${referral.ehr} provided ${referral.bundleSize}; intake is complete and Evaluation is now the active blocker.`,
        referral.riskHint === 'High' ? 'critical' : 'info',
        referral.riskHint === 'High' ? 'workflow_blocker' : 'missing_data',
        `${referral.id} FHIR Bundle`,
        nextId,
      ),
      insight(
        `Serology and imaging review were seeded from ${referral.id}; pending items are now visible as owned tasks.`,
        'warning',
        'missing_data',
        `${referral.id} normalized clinical context`,
        nextId,
      ),
    ],
    auditChain: [
      {
        seq: 1,
        t: createdAt,
        actor: `${referral.ehr} EHR`,
        action: `${referral.id} FHIR bundle received and normalized`,
        severity: 'complete',
        prevHash: '000000000000',
        hash: pseudoHash(`${referral.id}-received`),
      },
      {
        seq: 2,
        t: createdAt,
        actor: 'Coordinator',
        action: 'Referral accepted into active donor workflow',
        severity: 'complete',
        prevHash: pseudoHash(`${referral.id}-received`),
        hash: pseudoHash(`${referral.id}-accepted`),
      },
    ],
    custody: [],
    tasks: tasksFromReferral(referral, nextId),
    clinical: clinicalFromReferral(referral, nextId),
  }
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'navigate':
      return { ...state, page: action.page, selectedCaseId: action.caseId ?? null }
    case 'openCase':
      return { ...state, page: 'case', selectedCaseId: action.caseId }
    case 'acceptReferral': {
      const referral = state.referrals.find((item) => item.id === action.referralId)
      if (!referral || referral.status === 'accepted') return state
      const nextId = Math.max(...state.cases.map((c) => c.id)) + 11
      const newCase = createCaseFromReferral(referral, nextId)
      return {
        ...state,
        page: 'case',
        selectedCaseId: nextId,
        referrals: state.referrals.map((item) => (item.id === action.referralId ? { ...item, status: 'accepted' } : item)),
        cases: [newCase, ...state.cases],
        globalInsights: [
          insight(`${referral.id} became an active case. Athena is now tracking Evaluation blockers and pending serology.`, 'info', 'workflow_blocker', 'FHIR Inbox acceptance', nextId),
          ...state.globalInsights,
        ],
      }
    }
    case 'advanceWorkflow':
      return {
        ...state,
        cases: state.cases.map((c) => {
          if (c.id !== action.caseId) return c
          const nextStage = Math.min(c.currentStageIdx + 1, STAGES.length - 1)
          const updatedSteps = c.workflowSteps.map((step, index) => ({
            ...step,
            status: index < nextStage ? 'complete' : index === nextStage ? 'current' : 'pending',
            completedAt: index < nextStage ? step.completedAt ?? Date.now() : null,
            checklist: step.checklist.map((item) => ({
              ...item,
              done: index < nextStage || item.done,
              missing: index === nextStage && item.missing,
            })),
          })) satisfies DonorCase['workflowSteps']
          const updated = addCaseEvent(
            { ...c, currentStageIdx: nextStage, status: statusAfterStage(nextStage), workflowSteps: updatedSteps },
            `Workflow advanced to ${STAGES[nextStage].name}`,
            nextStage >= 4 && c.risk === 'High' ? 'warning' : 'complete',
          )
          return {
            ...updated,
            tasks: updated.tasks.map((task) =>
              task.stage === STAGES[c.currentStageIdx].name && task.status !== 'complete'
                ? { ...task, status: 'complete' }
                : task.stage === STAGES[nextStage].name && task.status === 'open'
                  ? { ...task, status: 'in-progress' }
                  : task,
            ),
            insights: [
              insight(`Workflow advanced to ${STAGES[nextStage].name}; verify next-stage checklist before external coordination.`, c.risk === 'High' ? 'warning' : 'info', 'workflow_blocker', 'Workflow engine', c.id),
              ...updated.insights,
            ],
          }
        }),
      }
    case 'updateStatus':
      return {
        ...state,
        cases: state.cases.map((c) =>
          c.id === action.caseId
            ? {
                ...addCaseEvent({ ...c, status: action.status }, `Status changed to ${action.status}`, action.status === 'Rapid' ? 'critical' : 'info'),
                insights: [insight(`Status changed to ${action.status}; board, reports, and urgency indicators have been recalculated.`, action.status === 'Rapid' ? 'critical' : 'info', action.status === 'Rapid' ? 'timing_risk' : 'workflow_blocker', 'Case board status action', c.id), ...c.insights],
              }
            : c,
        ),
      }
    case 'generateGlobalInsight':
      return {
        ...state,
        globalInsights: [
          insight(
            `${state.cases.filter((c) => c.status !== 'Completed').length} active workflows, ${state.cases.filter((c) => c.risk === 'High').length} high-risk cases, ${state.referrals.filter((r) => r.status === 'new').length} new referrals require monitoring.`,
            state.cases.some((c) => c.status === 'Rapid') ? 'warning' : 'info',
            state.cases.some((c) => c.tasks.some((task) => task.status === 'blocked')) ? 'workflow_blocker' : 'timing_risk',
            'Live cross-case state',
          ),
          ...state.globalInsights,
        ],
      }
    case 'generateCaseInsight':
      return {
        ...state,
        cases: state.cases.map((c) =>
          c.id === action.caseId
            ? {
                ...c,
                insights: [
                  insight(
                    `${c.name} is in ${STAGES[c.currentStageIdx].name}; ${c.workflowSteps[c.currentStageIdx].checklist.filter((item) => !item.done).length} checklist items remain open.`,
                    c.risk === 'High' ? 'critical' : 'warning',
                    c.tasks.some((task) => task.status === 'blocked') ? 'workflow_blocker' : 'missing_data',
                    'Case workflow + checklist state',
                    c.id,
                  ),
                  ...c.insights,
                ],
              }
            : c,
        ),
      }
    case 'acknowledgeInsight':
      return {
        ...state,
        globalInsights: state.globalInsights.map((item) => (item.id === action.insightId ? { ...item, dismissed: true } : item)),
        cases: state.cases.map((c) =>
          c.id === action.caseId
            ? { ...c, insights: c.insights.map((item) => (item.id === action.insightId ? { ...item, dismissed: true } : item)) }
            : c,
        ),
      }
    default:
      return state
  }
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const selectedCase = state.selectedCaseId ? state.cases.find((c) => c.id === state.selectedCaseId) ?? null : null
  const value = useMemo(() => ({ state, dispatch, selectedCase }), [state, selectedCase])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppState() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppState must be used within AppStateProvider')
  return context
}
