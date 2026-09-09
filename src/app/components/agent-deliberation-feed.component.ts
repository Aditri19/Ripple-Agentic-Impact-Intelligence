import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RippleEngineService } from '../services/ripple-engine.service';
import { AgentType } from '../models/ripple.types';

@Component({
  selector: 'app-agent-deliberation-feed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="h-full flex flex-col bg-slate-900 border-l border-slate-800 text-slate-100 overflow-hidden select-none">
      <!-- Section Header -->
      <div class="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
        <div class="flex items-center gap-2">
          <mat-icon class="text-cyan-400 text-xl">psychology</mat-icon>
          <div>
            <h2 class="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              Agent Deliberation & Negotiation Feed
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                A2A Protocol
              </span>
            </h2>
            <p class="text-[11px] text-slate-400">
              Live negotiation between Discovery, Forecasting & Adversarial Falsifier agents
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Step {{ engine.currentStepIndex() }} of {{ engine.totalSteps() }}
          </span>
        </div>
      </div>

      <!-- Agent Steps Timeline Stream -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
        @for (step of engine.executedSteps(); track step.stepIndex) {
          <div
            [class.ring-2]="engine.currentStepIndex() === step.stepIndex"
            [class.ring-cyan-500]="engine.currentStepIndex() === step.stepIndex"
            [class.bg-slate-800_40]="engine.currentStepIndex() !== step.stepIndex"
            [class.bg-slate-800_90]="engine.currentStepIndex() === step.stepIndex"
            class="rounded-xl border border-slate-700/70 p-3.5 transition-all duration-200 shadow-sm relative overflow-hidden"
          >
            <!-- Top Agent Metadata Row -->
            <div class="flex items-center justify-between gap-2 mb-2">
              <div class="flex items-center gap-2">
                <!-- Agent Icon Badge -->
                <div
                  [class.bg-cyan-500_20]="step.agent === 'EVENT_AGENT'"
                  [class.text-cyan-300]="step.agent === 'EVENT_AGENT'"
                  [class.border-cyan-500_30]="step.agent === 'EVENT_AGENT'"
                  [class.bg-purple-500_20]="step.agent === 'IMPACT_GRAPH_AGENT'"
                  [class.text-purple-300]="step.agent === 'IMPACT_GRAPH_AGENT'"
                  [class.border-purple-500_30]="step.agent === 'IMPACT_GRAPH_AGENT'"
                  [class.bg-blue-500_20]="step.agent === 'FORECASTING_AGENT'"
                  [class.text-blue-300]="step.agent === 'FORECASTING_AGENT'"
                  [class.border-blue-500_30]="step.agent === 'FORECASTING_AGENT'"
                  [class.bg-rose-500_20]="step.agent === 'FALSIFIER_AGENT'"
                  [class.text-rose-300]="step.agent === 'FALSIFIER_AGENT'"
                  [class.border-rose-500_30]="step.agent === 'FALSIFIER_AGENT'"
                  [class.bg-emerald-500_20]="step.agent === 'SYNTHESIS_ENGINE'"
                  [class.text-emerald-300]="step.agent === 'SYNTHESIS_ENGINE'"
                  [class.border-emerald-500_30]="step.agent === 'SYNTHESIS_ENGINE'"
                  class="w-7 h-7 rounded-lg flex items-center justify-center border text-sm"
                >
                  <mat-icon class="text-base">{{ getAgentIcon(step.agent) }}</mat-icon>
                </div>

                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-slate-200">{{ formatAgentName(step.agent) }}</span>
                    <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-700/80 text-slate-400 font-mono">
                      {{ step.stageName }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Verdict Badge if Falsifier -->
              @if (step.falsifierVerdict) {
                <div>
                  @if (step.falsifierVerdict === 'KILL') {
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold flex items-center gap-1">
                      <mat-icon class="text-xs">cancel</mat-icon>
                      HYPOTHESIS KILLED
                    </span>
                  } @else if (step.falsifierVerdict === 'DOWNGRADE') {
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                      <mat-icon class="text-xs">shield</mat-icon>
                      RISK DOWNGRADED
                    </span>
                  } @else if (step.falsifierVerdict === 'KEEP') {
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                      <mat-icon class="text-xs">check_circle</mat-icon>
                      HYPOTHESIS CONFIRMED
                    </span>
                  }
                </div>
              }
            </div>

            <!-- Title & Summary -->
            <h3 class="text-xs font-semibold text-white mb-1.5">{{ step.title }}</h3>
            <p class="text-xs text-slate-300 leading-relaxed mb-2.5">{{ step.summary }}</p>

            <!-- Probability Delta Transition if present -->
            @if (step.probabilityDelta) {
              <div class="bg-slate-900/80 rounded-lg p-2 border border-slate-700/60 flex items-center justify-between text-xs mb-2.5 font-mono">
                <span class="text-slate-400 flex items-center gap-1">
                  <mat-icon class="text-sm text-cyan-400">trending_down</mat-icon>
                  Cascade Probability:
                </span>
                <div class="flex items-center gap-2">
                  <span class="text-rose-400 font-bold line-through">
                    {{ (step.probabilityDelta.from * 100).toFixed(0) }}%
                  </span>
                  <span class="text-slate-400">→</span>
                  <span
                    [class.text-emerald-400]="step.probabilityDelta.to <= 0.1"
                    [class.text-amber-400]="step.probabilityDelta.to > 0.1 && step.probabilityDelta.to <= 0.4"
                    [class.text-rose-400]="step.probabilityDelta.to > 0.4"
                    class="font-bold text-sm"
                  >
                    {{ (step.probabilityDelta.to * 100).toFixed(0) }}%
                  </span>
                </div>
              </div>
            }

            <!-- Adversarial Counter-Evidence Query & Result Box -->
            @if (step.evidenceQuery || step.evidenceResult) {
              <div class="bg-slate-950/70 rounded-lg p-2.5 border border-slate-800 text-[11px] space-y-1.5 mb-2.5">
                @if (step.evidenceQuery) {
                  <div class="flex items-start gap-1.5 text-cyan-300/90 font-mono">
                    <mat-icon class="text-sm mt-0.5 text-cyan-400">search</mat-icon>
                    <div>
                      <span class="text-slate-400">Falsifier Query:</span>
                      <p class="text-slate-200 mt-0.5">{{ step.evidenceQuery }}</p>
                    </div>
                  </div>
                }
                @if (step.evidenceResult) {
                  <div class="flex items-start gap-1.5 text-slate-300 font-sans border-t border-slate-800/80 pt-1.5">
                    <mat-icon class="text-sm mt-0.5 text-amber-400">find_in_page</mat-icon>
                    <div>
                      <span class="text-slate-400 font-mono">Counter-Evidence Found:</span>
                      <p class="text-slate-200 mt-0.5">{{ step.evidenceResult }}</p>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- Detailed Reasoning -->
            <div class="text-[11px] text-slate-400 border-t border-slate-700/40 pt-2 leading-relaxed">
              <span class="font-semibold text-slate-300">Agent Reasoning:</span> {{ step.detailedReasoning }}
            </div>
          </div>
        }
      </div>
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
export class AgentDeliberationFeedComponent {
  readonly engine = inject(RippleEngineService);

  getAgentIcon(agent: AgentType): string {
    switch (agent) {
      case 'EVENT_AGENT':
        return 'sensors';
      case 'IMPACT_GRAPH_AGENT':
        return 'alt_route';
      case 'FORECASTING_AGENT':
        return 'query_stats';
      case 'FALSIFIER_AGENT':
        return 'security';
      case 'SYNTHESIS_ENGINE':
        return 'summarize';
      default:
        return 'smart_toy';
    }
  }

  formatAgentName(agent: AgentType): string {
    switch (agent) {
      case 'EVENT_AGENT':
        return 'Event Agent (MCP)';
      case 'IMPACT_GRAPH_AGENT':
        return 'Impact Graph Agent';
      case 'FORECASTING_AGENT':
        return 'Forecasting Agent';
      case 'FALSIFIER_AGENT':
        return 'Falsifier Agent (Adversarial)';
      case 'SYNTHESIS_ENGINE':
        return 'Synthesis Engine';
      default:
        return agent;
    }
  }
}
