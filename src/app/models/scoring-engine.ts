/**
 * Ripple: Agentic Impact Intelligence
 * Calibrated Probability Scoring Engine & Mathematical Formulation
 *
 * Core Formula:
 * P(Impact) = clamp(BaseRate(edge) × Similarity(current, analogs) × CurrentConditionAdjustment, 0.01, 0.99)
 *
 * Post-Falsification Transformation:
 * P_final = P_calibrated × FalsifierImpactFactor
 */

import {
  CalibratedEdgeScoring,
  CurrentConditionAdjustment,
  FalsifierVerdict,
  HistoricalAnalog,
  HistoricalAnalogSet,
} from './ripple.types';

export interface ScoringInputs {
  edgeId: string;
  analogSet: HistoricalAnalogSet;
  currentMagnitudeRatio: number;
  conditionAdjustment: CurrentConditionAdjustment;
  timeWindowMinutes: number;
  falsifierVerdict?: FalsifierVerdict;
  falsifierEvidenceFound?: string;
  falsifierReason?: string;
}

/**
 * Computes cosine-weighted similarity between current incident magnitude and historical analogs.
 */
export function calculateAnalogSimilarity(
  currentMagnitudeRatio: number,
  analogs: HistoricalAnalog[]
): number {
  if (!analogs || analogs.length === 0) {
    return 0.5; // Neutral prior when no analogs exist
  }

  // Weight analogs by inverse distance of magnitude ratio
  let weightedSum = 0;
  let totalWeight = 0;

  for (const analog of analogs) {
    const magnitudeDelta = Math.abs(currentMagnitudeRatio - analog.pastMagnitudeRatio);
    // Gaussian decay weight based on magnitude delta
    const weight = Math.exp(-0.5 * Math.pow(magnitudeDelta / 1.5, 2));
    weightedSum += analog.similarityScore * weight;
    totalWeight += weight;
  }

  const rawSimilarity = totalWeight > 0 ? weightedSum / totalWeight : 0.5;
  // Bounded between 0.10 and 0.98
  return Math.min(0.98, Math.max(0.10, rawSimilarity));
}

/**
 * Calculates current condition adjustment multiplier based on live telemetry & safeguards.
 */
export function calculateConditionMultiplier(adjustment: CurrentConditionAdjustment): number {
  let multiplier = adjustment.systemLoadMultiplier;

  if (adjustment.circuitBreakerActive) {
    multiplier *= adjustment.circuitBreakerDampening; // e.g. * 0.20
  }

  if (adjustment.replicaReroutingActive) {
    multiplier *= adjustment.replicaReroutingDampening; // e.g. * 0.05
  }

  if (adjustment.cacheHitRatePercent > 90) {
    // High cache hit rate absorbs downstream read thrashing
    multiplier *= adjustment.cacheAbsorptionFactor;
  }

  if (adjustment.recentDeploymentsInWindow > 0) {
    // Recent deploy might explain anomalies or introduce instability
    multiplier *= 1.10;
  }

  // Clamp multiplier between 0.02 and 2.50
  return Math.min(2.50, Math.max(0.02, multiplier));
}

/**
 * Computes Wilson score / standard error confidence intervals for the probability.
 */
export function calculateConfidenceInterval(p: number, sampleSize = 30): { low: number; high: number } {
  const n = Math.max(5, sampleSize);
  const z = 1.96; // 95% confidence
  const margin = z * Math.sqrt((p * (1 - p)) / n);

  return {
    low: Math.max(0.0, Number((p - margin).toFixed(3))),
    high: Math.min(1.0, Number((p + margin).toFixed(3))),
  };
}

/**
 * Executes the complete Calibrated Probability Scoring calculation for an edge.
 */
export function computeCalibratedScoring(inputs: ScoringInputs): CalibratedEdgeScoring {
  const baseRate = inputs.analogSet.empiricalBaseRate;
  const similarityScore = calculateAnalogSimilarity(
    inputs.currentMagnitudeRatio,
    inputs.analogSet.analogs
  );
  const conditionMultiplier = calculateConditionMultiplier(inputs.conditionAdjustment);

  // 1. Raw Prior Calculation: BaseRate × Similarity × CurrentCondition
  const rawPrior = baseRate * similarityScore * conditionMultiplier;

  // 2. Statistical Clamping [0.01, 0.99]
  const calibratedPrior = Math.min(0.99, Math.max(0.01, Number(rawPrior.toFixed(3))));

  // 3. Falsifier Impact Assessment
  const verdict = inputs.falsifierVerdict || 'PENDING';
  let falsifierImpactFactor = 1.0;

  if (verdict === 'KILL') {
    falsifierImpactFactor = 0.0; // Counter-evidence completely disproved hypothesis
  } else if (verdict === 'DOWNGRADE') {
    falsifierImpactFactor = 0.35; // Partial protection/caching confirmed
  } else if (verdict === 'KEEP') {
    falsifierImpactFactor = 1.0; // Hypothesis confirmed without counter-evidence
  }

  // 4. Final Post-Falsification Probability
  const finalProbability = verdict === 'KILL'
    ? 0.0
    : Math.min(0.99, Math.max(0.01, Number((calibratedPrior * falsifierImpactFactor).toFixed(3))));

  const confidenceInterval = calculateConfidenceInterval(calibratedPrior, inputs.analogSet.totalHistoricalEvents);

  return {
    baseRate: Number(baseRate.toFixed(3)),
    similarityScore: Number(similarityScore.toFixed(3)),
    currentConditionMultiplier: Number(conditionMultiplier.toFixed(3)),
    rawPriorProbability: Number(rawPrior.toFixed(3)),
    calibratedPriorProbability: calibratedPrior,
    confidenceInterval,
    timeWindowMinutes: inputs.timeWindowMinutes,
    falsifierVerdict: verdict,
    falsifierReason: inputs.falsifierReason,
    falsifierEvidenceFound: inputs.falsifierEvidenceFound,
    falsifierImpactFactor,
    finalPostFalsifierProbability: finalProbability,
  };
}
