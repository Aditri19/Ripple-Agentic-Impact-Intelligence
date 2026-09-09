import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RippleEngineService } from '../services/ripple-engine.service';
import { AgentType } from '../models/ripple.types';

@Component({
  selector: 'app-agent-deliberation-feed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="h-full flex flex-col bg-white border-l border-stone-200 text-slate-800 overflow-hidden select-none">
      <!-- Section Header -->
      <div class="p-4 border-b border-stone-200 flex items-center justify-between bg-white">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center">
            <mat-icon class="text-base">psychology</mat-icon>
          </div>
          <div>
            <h2 class="text-xs font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
              Multi-Agent Deliberation Feed
              <span class="text-[9px] px-1.5 py-0.2 rounded bg-teal-50 text-teal-800 font-bold border border-teal-200">
                A2A Protocol
              </span>
            </h2>
            <p class="text-[11px] text-slate-500">
              Live negotiation between Discovery, Forecasting & Falsifier
            </p>
          </div>
        </div>

        <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-slate-600 border border-stone-200">
          Step {{ engine.currentStepIndex() }}/{{ engine.totalSteps() }}
        </span>
      </div>

      <!-- Agent Steps Timeline Stream -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        @for (step of engine.executedSteps(); track step.stepIndex) {
          <div
            [class.ring-2]="engine.currentStepIndex() === step.stepIndex"
            [class.ring-teal-400]="engine.currentStepIndex() === step.stepIndex"
            [class.bg-teal-50_40]="engine.currentStepIndex() === step.stepIndex"
            [class.bg-stone-50]="engine.currentStepIndex() !== step.stepIndex"
            class="rounded-2xl border border-stone-200 p-3.5 transition-all duration-200 shadow-2xs relative"
          >
            <!-- Top Agent Metadata Row -->
            <div class="flex items-center justify-between gap-2 mb-2">
              <div class="flex items-center gap-2">
                <!-- Agent Icon Badge -->
                <div
                  [class.bg-cyan-50_text-cyan-800_border-cyan-200]="step.agent === 'EVENT_AGENT'"
                  [class.bg-purple-50_text-purple-800_border-purple-200]="step.agent === 'IMPACT_GRAPH_AGENT'"
                  [class.bg-blue-50_text-blue-800_border-blue-200]="step.agent === 'FORECASTING_AGENT'"
                  [class.bg-rose-50_text-rose-800_border-rose-200]="step.agent === 'FALSIFIER_AGENT'"
                  [class.bg-emerald-50_text-emerald-800_border-emerald-200]="step.agent === 'SYNTHESIS_ENGINE'"
                  class="w-7 h-7 rounded-lg flex items-center justify-center border text-sm font-bold"
                >
                  <mat-icon class="text-base">{{ getAgentIcon(step.agent) }}</mat-icon>
                </div>

                <div>
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-bold text-slate-900">{{ formatAgentName(step.agent) }}</span>
                    <span class="text-[10px] px-1.5 py-0.2 rounded bg-white text-slate-600 font-mono border border-stone-200">
                      {{ step.stageName }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Confidence / Health Tag -->
              <span class="text-[10px] font-mono font-bold text-slate-500">
                Stage {{ step.stepIndex }}
              </span>
            </div>

            <!-- Agent Deliberation Dialogue / Explanation -->
            <p class="text-xs text-slate-700 leading-relaxed">{{ step.detailedReasoning || step.summary }}</p>

            <!-- Observation / Evidence Block -->
            @if (step.evidenceResult) {
              <div class="mt-2.5 bg-white rounded-xl p-2.5 border border-stone-200 text-[11px] font-mono text-slate-700 space-y-1 shadow-2xs">
                <div class="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <mat-icon class="text-xs text-teal-600">visibility</mat-icon>
                  <span>Ground Observation:</span>
                </div>
                <p class="leading-snug text-slate-800">{{ step.evidenceResult }}</p>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class AgentDeliberationFeedComponent {
  readonly engine = inject(RippleEngineService);

  getAgentIcon(agent: AgentType): string {
    switch (agent) {
      case 'EVENT_AGENT':
        return 'sensors';
      case 'IMPACT_GRAPH_AGENT':
        return 'schema';
      case 'FORECASTING_AGENT':
        return 'trending_up';
      case 'FALSIFIER_AGENT':
        return 'security';
      case 'SYNTHESIS_ENGINE':
        return 'fact_check';
      default:
        return 'smart_toy';
    }
  }

  formatAgentName(agent: AgentType): string {
    switch (agent) {
      case 'EVENT_AGENT':
        return 'Event Anomaly Agent';
      case 'IMPACT_GRAPH_AGENT':
        return 'Topology DAG Agent';
      case 'FORECASTING_AGENT':
        return 'Cascade Forecast Agent';
      case 'FALSIFIER_AGENT':
        return 'Adversarial Falsifier';
      case 'SYNTHESIS_ENGINE':
        return 'SRE Synthesis Engine';
      default:
        return agent;
    }
  }
}
