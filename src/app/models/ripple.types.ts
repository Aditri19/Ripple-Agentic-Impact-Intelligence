/**
 * Ripple: Agentic Impact Intelligence
 * Core Data Models and Schema Definitions
 */

export type AgentType =
  | 'EVENT_AGENT'
  | 'IMPACT_GRAPH_AGENT'
  | 'FORECASTING_AGENT'
  | 'FALSIFIER_AGENT'
  | 'SYNTHESIS_ENGINE';

export type FalsifierVerdict = 'PENDING' | 'KEEP' | 'DOWNGRADE' | 'KILL';

export type NodeHealth =
  | 'ROOT_ANOMALY'
  | 'CRITICAL_RISK'
  | 'DOWNGRADED_RISK'
  | 'FALSIFIED_SAFE'
  | 'HEALTHY';

export type ProtocolType =
  | 'gRPC'
  | 'HTTP/REST'
  | 'NVMe/iSCSI'
  | 'PostgreSQL/JDBC'
  | 'Redis Protocol'
  | 'Kafka/MQ';

export type DependencyType =
  | 'SYNCHRONOUS'
  | 'ASYNCHRONOUS'
  | 'REPLICA_FALLBACK'
  | 'BACKGROUND_WORKER';

/**
 * 1. Event Object Schema
 * Structured quantification of the initial incident trigger.
 */
export interface EventTriggerObject {
  id?: string;
  trigger?: string;                    // e.g. "storage_latency_spike"
  name?: string;                       // Optional display alias for trigger
  magnitude: string;                   // e.g. "p99 latency 3.4x baseline"
  magnitudeValue?: number;             // Current measured value (e.g. 142)
  baselineValue?: number;              // Expected baseline value (e.g. 42)
  unit?: string;                       // e.g. "ms", "req/s", "%"
  timestamp: string;                   // ISO 8601 UTC
  historicalPercentile: number;        // e.g. 94th percentile
  rootCauseCandidate: string;          // Initial candidate hypothesis
  sreOwner: string;                    // Primary team on call
  affectedCluster?: string;            // Infrastructure cluster id
  cluster?: string;                    // Shorthand alias
  environment?: 'production' | 'staging' | 'canary';
  metricDeviations?: {
    metricName: string;
    baseline: number;
    observed: number;
    unit: string;
    zScore: number;
  }[];
}

/**
 * 2. Historical Analog Schema
 * Past incidents used to derive empirical Base Rate and Similarity.
 */
export interface HistoricalAnalog {
  analogId: string;
  incidentDate: string;
  title: string;
  triggerType: string;
  pastMagnitudeRatio: number;
  systemContext: string;
  downstreamService: string;
  observedCascade: boolean;
  actualTimeToCascadeMinutes: number;
  recoveryDurationMinutes: number;
  similarityScore: number;             // Cosine / feature similarity (0.0 to 1.0)
  mitigatingFactors?: string[];
}

export interface HistoricalAnalogSet {
  edgeId: string;
  totalHistoricalEvents: number;
  historicalCascadesCount: number;
  empiricalBaseRate: number;           // baseRate = cascades / total
  analogs: HistoricalAnalog[];
}

/**
 * 3. Current Condition Adjustment Schema
 * Real-time operational modifiers that dampen or amplify cascade probability.
 */
export interface CurrentConditionAdjustment {
  systemLoadMultiplier: number;        // Peak load (e.g. 1.25) vs off-peak (0.85)
  circuitBreakerActive: boolean;       // Downstream protection engaged
  circuitBreakerDampening: number;     // Multiplier applied if active (e.g. 0.20)
  replicaReroutingActive: boolean;     // Read diversion active
  replicaReroutingDampening: number;   // Multiplier applied if active (e.g. 0.05)
  cacheHitRatePercent: number;         // e.g. 98.4%
  cacheAbsorptionFactor: number;       // Multiplier derived from cache hit rate
  recentDeploymentsInWindow: number;   // Count of deploys in past 60 min
  calculatedAdjustmentMultiplier: number; // Combined multiplicative modifier
}

/**
 * 4. Calibrated Edge Scoring Schema
 * Result of the calibrated probability formula.
 */
export interface CalibratedEdgeScoring {
  baseRate: number;                    // Historical cascade frequency
  similarityScore: number;             // Analog match confidence
  currentConditionMultiplier: number;  // Real-time modifier
  rawPriorProbability: number;         // baseRate * similarity * condition
  calibratedPriorProbability: number;  // Clamped and uncertainty-calibrated [0.01, 0.99]
  confidenceInterval: {
    low: number;
    high: number;
  };
  timeWindowMinutes: number;           // Estimated window before downstream failure
  falsifierVerdict: FalsifierVerdict;
  falsifierReason?: string;
  falsifierEvidenceFound?: string;
  falsifierImpactFactor: number;       // 1.0 (KEEP), 0.0 (KILL), or 0.2-0.5 (DOWNGRADE)
  finalPostFalsifierProbability: number;
}

/**
 * 5. Topology Node & Edge Schema
 */
export interface TopologyNode {
  id: string;
  name: string;
  category: 'DATABASE' | 'STORAGE' | 'CACHE' | 'SERVICE' | 'GATEWAY' | 'QUEUE';
  tier: 'Tier 0' | 'Tier 1' | 'Tier 2';
  health: NodeHealth;
  p99LatencyMs: number;
  baselineLatencyMs: number;
  errorRatePercent: number;
  baselineErrorRate: number;
  slaTarget: string;
  ownerTeam: string;
  x: number; // coordinate percentage 0-100
  y: number; // coordinate percentage 0-100
  description: string;
}

export interface TopologyEdge {
  id: string;
  from: string;
  to: string;
  protocol: ProtocolType;
  dependencyType: DependencyType;
  isCriticalPath: boolean;
  scoring?: CalibratedEdgeScoring;
  priorProbability: number;            // Flattened for easy access
  calibratedProbability: number;       // Final probability after falsification
  timeWindowMinutes: number;
  falsifierVerdict: FalsifierVerdict;
  falsifierReason?: string;
  falsifierEvidenceFound?: string;
  activeInStep: number;
}

/**
 * 6. Agent Deliberation Step Schema
 */
export interface AgentStep {
  stepIndex: number;
  title: string;
  agent: AgentType;
  stageName: 'Ingestion' | 'Pathfinding' | 'Forecasting' | 'Falsification' | 'Synthesis';
  timestamp: string;
  summary: string;
  detailedReasoning: string;
  targetEdgeId?: string;
  targetNodeId?: string;
  falsifierVerdict?: FalsifierVerdict;
  evidenceQuery?: string;
  evidenceResult?: string;
  probabilityDelta?: {
    from: number;
    to: number;
  };
  metricsSnapshot?: {
    label: string;
    value: string;
    badgeColor?: string;
  }[];
}

/**
 * 7. Incident Scenario Container
 */
export interface IncidentScenario {
  id: string;
  title: string;
  shortDescription: string;
  category: string;
  triggerEvent: EventTriggerObject;
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  steps: AgentStep[];
  evaluation: {
    rawAlarmCount: number;
    falsifiedCount: number;
    downgradedCount: number;
    confirmedCount: number;
    falsePositiveReductionPercent: number;
    estimatedTimeToMitigateMin: number;
  };
  mitigations: {
    priority: 'P1' | 'P2' | 'P3';
    title: string;
    targetService: string;
    actionScript: string;
    rationale: string;
  }[];
}

/**
 * 8. Backtest Case Schema
 * Used to evaluate accuracy and false positive reduction against historical ground truth.
 */
export interface BacktestCase {
  caseId: string;
  incidentTitle: string;
  incidentDate: string;
  incidentType: string;
  triggerDescription: string;
  groundTruthCascadeOccurred: boolean;
  groundTruthImpactedServices: string[];
  initialUnfilteredPrediction: {
    predictedProbability: number;
    flaggedHighRisk: boolean;
  };
  falsifierInvestigation: {
    counterEvidenceFound: boolean;
    evidenceDetails: string;
    verdict: FalsifierVerdict;
    postFalsifierProbability: number;
  };
  evaluationOutcome: {
    wasFalseAlarmPrevented: boolean;
    accuracyResult: 'CORRECT_CONFIRMATION' | 'CORRECT_FALSIFICATION' | 'CORRECT_DOWNGRADE' | 'MISSED_CASCADE';
    alarmFatigueSaved: boolean;
  };
}
