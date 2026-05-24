/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useReducer } from 'react'
import { STAGES, initialState, pseudoHash } from './data'
import type { AppState, AthenaInsight, CaseStatus, DonorCase, Page, Referral, Severity } from './types'

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

function insight(text: string, severity: AthenaInsight['severity'], source: string, caseId?: number): AthenaInsight {
  return {
    id: `ins-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text,
    severity,
    source,
    caseId,
    t: Date.now(),
    actions: severity === 'critical' ? ['escalate', 'take_action'] : ['acknowledge', caseId ? 'view_case' : 'view_matches'],
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
        `${referral.id} FHIR Bundle`,
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
          insight(`${referral.id} became an active case. Athena is now tracking Evaluation blockers.`, 'info', 'FHIR Inbox acceptance', nextId),
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
            insights: [
              insight(`Workflow advanced to ${STAGES[nextStage].name}; verify next-stage checklist before external coordination.`, c.risk === 'High' ? 'warning' : 'info', 'Workflow engine', c.id),
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
                insights: [insight(`Status changed to ${action.status}; board and reports have been recalculated.`, action.status === 'Rapid' ? 'critical' : 'info', 'Case board status action', c.id), ...c.insights],
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
