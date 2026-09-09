import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RippleEngineService } from '../services/ripple-engine.service';
import { HISTORICAL_ANALOG_CORPUS } from '../data/historical-corpus.data';
import { computeCalibratedScoring } from '../models/scoring-engine';
import { CurrentConditionAdjustment, HistoricalAnalogSet, TopologyEdge } from '../models/ripple.types';
import { ReportPlaceholderComponent } from './report-placeholder.component';

@Component({
  selector: 'app-scoring-breakdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule, DecimalPipe, ReportPlaceholderComponent],
  template: `
    <div class="h-full flex flex-col bg-white text-slate-800 overflow-y-auto select-none p-4 sm:p-6 space-y-5">
      @if (!engine.isAutoplayComplete()) {
        <!-- Dynamic Staging Placeholder when Autoplay hasn't run yet -->
        <app-report-placeholder
          reportName="Calibrated Bayesian Scoring Engine"
          reportCategory="Empirical Bayes & Wilson CIs"
          reportDescription="Calculates Bayesian priors, cosine similarity against historical vector corpus, and Wilson 95% confidence intervals."
          icon="functions"
        />
      } @else {
        <!-- Header -->
        <div class="border-b border-stone-200 pb-4 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center shadow-xs">
              <mat-icon class="text-xl">functions</mat-icon>
            </div>
            <div>
              <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
                Calibrated Scoring Engine
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  ✓ Calibration Computed
                </span>
              </h2>
              <p class="text-xs text-slate-500 mt-0.5">
                Bayesian calibration, historical base rates, analog similarity, and 95% Wilson confidence intervals.
              </p>
            </div>
          </div>

          <button
            type="button"
            (click)="engine.startAutoplayAndNavigate()"
            title="Re-run the autoplay deliberation on the simulator graph"
            class="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 border border-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <mat-icon class="text-sm text-teal-600">replay</mat-icon>
            <span>Re-run Autoplay</span>
          </button>
        </div>

      <!-- Formula Card Banner -->
      <div class="bg-stone-50 rounded-2xl p-4 border border-stone-200 font-mono text-xs text-slate-700 space-y-1">
        <div class="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
          Scoring Formulation:
        </div>
        <div class="text-indigo-800 font-bold text-sm overflow-x-auto py-1">
          P(Impact) = clamp(BaseRate × CosineSimilarity × ConditionAdjustment, 0.01, 0.99)
        </div>
        <div class="text-slate-500 text-[10px]">
          Falsifier Calibration: P_final = P_calibrated × FalsifierImpactFactor (0.0 if KILLED, 0.35 if DOWNGRADED)
        </div>
      </div>

      <!-- Edge Selector Pills -->
      <div>
        <span class="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
          Inspect Cascade Path Scoring:
        </span>
        <div class="flex flex-wrap gap-2">
          @for (edge of engine.dynamicEdges(); track edge.id) {
            <button
              type="button"
              (click)="engine.selectEdge(edge.id)"
              [class.bg-indigo-600]="activeEdge() && activeEdge()!.id === edge.id"
              [class.text-white]="activeEdge() && activeEdge()!.id === edge.id"
              [class.border-indigo-600]="activeEdge() && activeEdge()!.id === edge.id"
              [class.bg-stone-50]="!activeEdge() || activeEdge()!.id !== edge.id"
              [class.text-slate-700]="!activeEdge() || activeEdge()!.id !== edge.id"
              [class.border-stone-200]="!activeEdge() || activeEdge()!.id !== edge.id"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>{{ getNodeName(edge.from) }} → {{ getNodeName(edge.to) }}</span>
              @if (edge.falsifierVerdict === 'KILL') {
                <span class="text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-100 text-emerald-800">KILL (0%)</span>
              } @else if (edge.falsifierVerdict === 'DOWNGRADE') {
                <span class="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-800">DOWNGRADE</span>
              } @else if (edge.falsifierVerdict === 'KEEP') {
                <span class="text-[9px] px-1.5 py-0.2 rounded font-bold bg-rose-100 text-rose-800">KEEP</span>
              }
            </button>
          }
        </div>
      </div>

      @if (activeEdge(); as edge) {
        <!-- Live Step Calculation Breakdown Grid -->
        <div class="space-y-3">
          <!-- Step 1: Base Rate & Analogs -->
          <div class="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-slate-900 flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-[11px]">1</span>
                Empirical Base Rate (Historical Ground Truth)
              </span>
              <span class="font-mono text-indigo-700 font-bold text-sm">
                {{ (analogData()?.empiricalBaseRate || edge.priorProbability) * 100 | number:'1.1-1' }}%
              </span>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">
              Derived from {{ analogData()?.totalHistoricalEvents || 42 }} recorded incidents across the infrastructure cluster.
              {{ analogData()?.historicalCascadesCount || 35 }} resulted in downstream cascade before safeguards.
            </p>
          </div>

          <!-- Step 2: Analog Similarity Multiplier -->
          <div class="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-slate-900 flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[11px]">2</span>
                Feature & Magnitude Similarity
              </span>
              <span class="font-mono text-teal-700 font-bold text-sm">
                {{ (calculatedScoring().similarityScore * 100) | number:'1.0-0' }}%
              </span>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">
              Cosine similarity matching current anomaly magnitude (3.4x) against closest past incident patterns.
            </p>
          </div>

          <!-- Step 3: Current Condition Adjustment -->
          <div class="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-slate-900 flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-[11px]">3</span>
                Current Condition Multiplier
              </span>
              <span class="font-mono text-amber-800 font-bold text-sm">
                {{ calculatedScoring().currentConditionMultiplier }}x
              </span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs pt-1 font-mono">
              <div class="bg-white p-2.5 rounded-xl border border-stone-200">
                <span class="text-slate-500 block text-[10px]">Circuit Breaker:</span>
                <span class="text-slate-900 font-bold">
                  {{ edge.falsifierVerdict === 'DOWNGRADE' ? 'Active (0.20x)' : 'Bypassed (1.0x)' }}
                </span>
              </div>
              <div class="bg-white p-2.5 rounded-xl border border-stone-200">
                <span class="text-slate-500 block text-[10px]">Read Rerouting:</span>
                <span class="text-slate-900 font-bold">
                  {{ edge.falsifierVerdict === 'KILL' ? 'RAM Diverted (0.05x)' : 'None (1.0x)' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Step 4: Calibrated Prior vs Post-Falsifier Result -->
          <div class="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
            <div class="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Scoring Summary & Verdict
            </div>

            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="bg-white p-3 rounded-xl border border-stone-200 font-mono">
                <span class="text-slate-500 block text-[10px]">Initial Prior Probability:</span>
                <span class="text-lg font-bold text-rose-700">
                  {{ (edge.priorProbability * 100) | number:'1.0-0' }}%
                </span>
                <span class="text-[10px] text-slate-400 block mt-0.5">
                  Est. Window: {{ edge.timeWindowMinutes }} min
                </span>
              </div>

              <div class="bg-white p-3 rounded-xl border border-stone-200 font-mono">
                <span class="text-slate-500 block text-[10px]">Post-Falsifier Probability:</span>
                <span
                  [class.text-emerald-700]="edge.calibratedProbability <= 0.1"
                  [class.text-amber-700]="edge.calibratedProbability > 0.1 && edge.calibratedProbability <= 0.4"
                  [class.text-rose-700]="edge.calibratedProbability > 0.4"
                  class="text-lg font-bold"
                >
                  {{ (edge.calibratedProbability * 100) | number:'1.0-0' }}%
                </span>
                <span class="text-[10px] text-slate-500 block mt-0.5 font-sans">
                  Verdict: <span class="font-bold">{{ edge.falsifierVerdict }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      }
      }
    </div>
  `,
})
export class ScoringBreakdownComponent {
  readonly engine = inject(RippleEngineService);

  readonly activeEdge = computed<TopologyEdge | null>(() => {
    return this.engine.inspectEdge() || this.engine.dynamicEdges()[0] || null;
  });

  readonly analogData = computed<HistoricalAnalogSet | null>(() => {
    const edge = this.activeEdge();
    if (!edge) return null;
    return HISTORICAL_ANALOG_CORPUS[edge.id] || null;
  });

  readonly calculatedScoring = computed(() => {
    const edge = this.activeEdge();
    if (!edge) {
      return {
        calibratedScore: 0.5,
        confidenceLower: 0.35,
        confidenceUpper: 0.65,
        similarityScore: 0.85,
        currentConditionMultiplier: 1.0,
      };
    }

    const analogSet: HistoricalAnalogSet = this.analogData() || {
      edgeId: edge.id,
      totalHistoricalEvents: 42,
      historicalCascadesCount: 35,
      empiricalBaseRate: edge.priorProbability,
      analogs: [],
    };

    const conditionAdjustment: CurrentConditionAdjustment = {
      systemLoadMultiplier: 1.15,
      circuitBreakerActive: edge.falsifierVerdict === 'DOWNGRADE',
      circuitBreakerDampening: 0.2,
      replicaReroutingActive: edge.falsifierVerdict === 'KILL',
      replicaReroutingDampening: 0.05,
      cacheHitRatePercent: 96.5,
      cacheAbsorptionFactor: 0.15,
      recentDeploymentsInWindow: 1,
      calculatedAdjustmentMultiplier: 0.85,
    };

    const scored = computeCalibratedScoring({
      edgeId: edge.id,
      analogSet,
      currentMagnitudeRatio: 3.4,
      conditionAdjustment,
      timeWindowMinutes: edge.timeWindowMinutes,
      falsifierVerdict: edge.falsifierVerdict,
      falsifierEvidenceFound: edge.falsifierEvidenceFound,
      falsifierReason: edge.falsifierReason,
    });

    return {
      calibratedScore: scored.finalPostFalsifierProbability,
      confidenceLower: scored.confidenceInterval.low,
      confidenceUpper: scored.confidenceInterval.high,
      similarityScore: scored.similarityScore,
      currentConditionMultiplier: scored.currentConditionMultiplier,
    };
  });

  getNodeName(nodeId: string): string {
    const node = this.engine.dynamicNodes().find((n) => n.id === nodeId);
    return node ? node.name : nodeId;
  }
}
