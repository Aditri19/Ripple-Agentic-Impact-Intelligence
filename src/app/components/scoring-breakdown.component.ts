import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RippleEngineService } from '../services/ripple-engine.service';
import { HISTORICAL_ANALOG_CORPUS } from '../data/historical-corpus.data';
import { computeCalibratedScoring } from '../models/scoring-engine';
import { HistoricalAnalogSet } from '../models/ripple.types';

@Component({
  selector: 'app-scoring-breakdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, DecimalPipe],
  template: `
    <div class="h-full flex flex-col bg-slate-900 border-l border-slate-800 text-slate-100 overflow-y-auto custom-scrollbar select-none p-4 space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div class="flex items-center gap-2">
          <mat-icon class="text-cyan-400 text-xl">functions</mat-icon>
          <div>
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              Calibrated Scoring Engine
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                Statistical Rigor
              </span>
            </h2>
            <p class="text-[11px] text-slate-400">
              Grounded in historical base rates, analog similarity, and live operational conditions
            </p>
          </div>
        </div>
      </div>

      <!-- Formula Card Banner -->
      <div class="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 font-mono text-xs text-slate-300">
        <div class="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
          Scoring Formulation
        </div>
        <div class="text-cyan-300 font-semibold text-[13px] overflow-x-auto py-1">
          P(Impact) = clamp(BaseRate × Similarity × ConditionAdjustment, 0.01, 0.99)
        </div>
        <div class="text-slate-400 text-[10px] mt-1">
          Post-Falsifier: P_final = P_calibrated × FalsifierImpactFactor (0.0 if KILLED, 0.35 if DOWNGRADED)
        </div>
      </div>

      <!-- Edge Selector Pills -->
      <div>
        <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Inspect Cascade Path Scoring:
        </span>
        <div class="flex flex-wrap gap-1.5">
          @for (edge of engine.dynamicEdges(); track edge.id) {
            <button
              type="button"
              (click)="engine.selectEdge(edge.id)"
              [class.bg-cyan-600]="activeEdge() && activeEdge()!.id === edge.id"
              [class.text-white]="activeEdge() && activeEdge()!.id === edge.id"
              [class.bg-slate-800]="!activeEdge() || activeEdge()!.id !== edge.id"
              [class.text-slate-300]="!activeEdge() || activeEdge()!.id !== edge.id"
              class="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-700/60 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{{ getNodeName(edge.from) }} → {{ getNodeName(edge.to) }}</span>
              @if (edge.falsifierVerdict === 'KILL') {
                <span class="w-2 h-2 rounded-full bg-rose-400"></span>
              } @else if (edge.falsifierVerdict === 'DOWNGRADE') {
                <span class="w-2 h-2 rounded-full bg-amber-400"></span>
              } @else if (edge.falsifierVerdict === 'KEEP') {
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              }
            </button>
          }
        </div>
      </div>

      @if (activeEdge(); as edge) {
        <!-- Live Step Calculation Breakdown Grid -->
        <div class="space-y-3">
          <!-- Step 1: Base Rate & Analogs -->
          <div class="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-slate-200 flex items-center gap-1.5">
                <span class="w-5 h-5 rounded bg-indigo-500/30 text-indigo-300 flex items-center justify-center text-[10px]">1</span>
                Empirical Base Rate (Historical Ground Truth)
              </span>
              <span class="font-mono text-cyan-300 font-bold text-sm">
                {{ (analogData()?.empiricalBaseRate || edge.priorProbability) * 100 | number:'1.1-1' }}%
              </span>
            </div>
            <p class="text-[11px] text-slate-400">
              Derived from {{ analogData()?.totalHistoricalEvents || 42 }} recorded incidents across the infrastructure cluster.
              {{ analogData()?.historicalCascadesCount || 35 }} resulted in downstream cascade before safeguards.
            </p>
          </div>

          <!-- Step 2: Analog Similarity Multiplier -->
          <div class="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-slate-200 flex items-center gap-1.5">
                <span class="w-5 h-5 rounded bg-purple-500/30 text-purple-300 flex items-center justify-center text-[10px]">2</span>
                Feature & Magnitude Similarity
              </span>
              <span class="font-mono text-purple-300 font-bold text-sm">
                {{ (calculatedScoring().similarityScore * 100) | number:'1.0-0' }}%
              </span>
            </div>
            <p class="text-[11px] text-slate-400">
              Cosine similarity matching current anomaly magnitude (3.4x) against closest past incident patterns.
            </p>
          </div>

          <!-- Step 3: Current Condition Adjustment -->
          <div class="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-slate-200 flex items-center gap-1.5">
                <span class="w-5 h-5 rounded bg-blue-500/30 text-blue-300 flex items-center justify-center text-[10px]">3</span>
                Current Condition Multiplier
              </span>
              <span class="font-mono text-blue-300 font-bold text-sm">
                {{ calculatedScoring().currentConditionMultiplier }}x
              </span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-[11px] pt-1 font-mono">
              <div class="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span class="text-slate-400 block text-[10px]">Circuit Breaker:</span>
                <span class="text-slate-200 font-bold">
                  {{ edge.falsifierVerdict === 'DOWNGRADE' ? 'Active (0.20x)' : 'Bypassed (1.0x)' }}
                </span>
              </div>
              <div class="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span class="text-slate-400 block text-[10px]">Read Rerouting:</span>
                <span class="text-slate-200 font-bold">
                  {{ edge.falsifierVerdict === 'KILL' ? 'RAM Diverted (0.05x)' : 'None (1.0x)' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Step 4: Calibrated Prior vs Post-Falsifier Result -->
          <div class="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
            <div class="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Scoring Summary & Verdict
            </div>

            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono">
                <span class="text-slate-400 block text-[10px]">Initial Prior Probability:</span>
                <span class="text-lg font-bold text-rose-400">
                  {{ (edge.priorProbability * 100) | number:'1.0-0' }}%
                </span>
                <span class="text-[10px] text-slate-500 block mt-0.5">
                  Est. Window: {{ edge.timeWindowMinutes }} min
                </span>
              </div>

              <div class="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono">
                <span class="text-slate-400 block text-[10px]">Post-Falsifier Probability:</span>
                <span
                  [class.text-emerald-400]="edge.calibratedProbability <= 0.1"
                  [class.text-amber-400]="edge.calibratedProbability > 0.1 && edge.calibratedProbability <= 0.4"
                  [class.text-rose-400]="edge.calibratedProbability > 0.4"
                  class="text-lg font-bold"
                >
                  {{ (edge.calibratedProbability * 100) | number:'1.0-0' }}%
                </span>
                <span class="text-[10px] text-slate-400 block mt-0.5 font-sans">
                  Verdict: <span class="font-bold">{{ edge.falsifierVerdict }}</span>
                </span>
              </div>
            </div>

            <!-- Falsifier Evidence Log -->
            @if (edge.falsifierReason) {
              <div class="bg-slate-900/90 rounded-lg p-3 border border-slate-800 text-xs">
                <div class="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
                  <mat-icon class="text-sm">verified</mat-icon>
                  <span>Empirical Investigation Verdict:</span>
                </div>
                <p class="text-slate-300 text-[11px] leading-relaxed mb-2">{{ edge.falsifierReason }}</p>

                @if (edge.falsifierEvidenceFound) {
                  <div class="bg-slate-950 p-2 rounded border border-slate-800 text-[10px] text-slate-400 font-mono">
                    <span class="text-cyan-400 font-bold block mb-0.5">Counter-Evidence Log:</span>
                    {{ edge.falsifierEvidenceFound }}
                  </div>
                }
              </div>
            }
          </div>

          <!-- Historical Analogs Drilldown List -->
          @if (analogData()?.analogs; as analogs) {
            <div class="space-y-2 pt-2">
              <div class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Historical Analog Corpus</span>
                <span class="text-[10px] font-mono text-slate-400">{{ analogs.length }} analogs matched</span>
              </div>

              @for (analog of analogs; track analog.analogId) {
                <div class="bg-slate-800/40 rounded-lg p-2.5 border border-slate-700/50 text-xs space-y-1">
                  <div class="flex items-center justify-between font-mono">
                    <span class="text-cyan-300 font-semibold">{{ analog.title }}</span>
                    <span class="text-[10px] text-slate-400">{{ analog.incidentDate }}</span>
                  </div>
                  <div class="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                    <span>Past Spike: {{ analog.pastMagnitudeRatio }}x</span>
                    <span>Cascade: {{ analog.observedCascade ? 'YES' : 'NO (Absorbed)' }}</span>
                    <span>Similarity: {{ (analog.similarityScore * 100) | number:'1.0-0' }}%</span>
                  </div>
                  @if (analog.mitigatingFactors && analog.mitigatingFactors.length > 0) {
                    <p class="text-[10px] text-amber-300/80 italic">
                      Safeguard: {{ analog.mitigatingFactors.join(', ') }}
                    </p>
                  }
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 5px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(15, 23, 42, 0.6);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(51, 65, 85, 0.8);
      border-radius: 4px;
    }
  `],
})
export class ScoringBreakdownComponent {
  readonly engine = inject(RippleEngineService);

  readonly activeEdge = computed(() => {
    return this.engine.inspectEdge() || this.engine.activeHighlightedEdge() || this.engine.dynamicEdges()[0] || null;
  });

  readonly analogData = computed<HistoricalAnalogSet | null>(() => {
    const edge = this.activeEdge();
    if (!edge) return null;
    return HISTORICAL_ANALOG_CORPUS[edge.id] || null;
  });

  readonly calculatedScoring = computed(() => {
    const edge = this.activeEdge();
    const analogs = this.analogData() || {
      edgeId: edge?.id || 'unknown',
      totalHistoricalEvents: 30,
      historicalCascadesCount: 22,
      empiricalBaseRate: edge?.priorProbability || 0.75,
      analogs: [],
    };

    return computeCalibratedScoring({
      edgeId: edge?.id || 'default',
      analogSet: analogs,
      currentMagnitudeRatio: 3.4,
      conditionAdjustment: {
        systemLoadMultiplier: 1.05,
        circuitBreakerActive: edge?.falsifierVerdict === 'DOWNGRADE',
        circuitBreakerDampening: 0.20,
        replicaReroutingActive: edge?.falsifierVerdict === 'KILL',
        replicaReroutingDampening: 0.05,
        cacheHitRatePercent: 98.4,
        cacheAbsorptionFactor: 0.15,
        recentDeploymentsInWindow: 1,
        calculatedAdjustmentMultiplier: 1.0,
      },
      timeWindowMinutes: edge?.timeWindowMinutes || 20,
      falsifierVerdict: edge?.falsifierVerdict || 'PENDING',
      falsifierReason: edge?.falsifierReason,
      falsifierEvidenceFound: edge?.falsifierEvidenceFound,
    });
  });

  getNodeName(nodeId: string): string {
    const node = this.engine.activeScenario().nodes.find((n) => n.id === nodeId);
    return node ? node.name.split(' ')[0] : nodeId;
  }
}
