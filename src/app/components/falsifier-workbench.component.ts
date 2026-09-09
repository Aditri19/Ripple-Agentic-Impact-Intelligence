import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RippleEngineService } from '../services/ripple-engine.service';
import {
  FalsifierToolService,
} from '../services/falsifier-tool.service';
import { TopologyEdge } from '../models/ripple.types';

@Component({
  selector: 'app-falsifier-workbench',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule, DecimalPipe],
  template: `
    <div class="h-full flex flex-col bg-slate-900 border-l border-slate-800 text-slate-100 overflow-y-auto custom-scrollbar select-none p-4 space-y-4">
      <!-- Section Header -->
      <div class="border-b border-slate-800 pb-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
            <mat-icon class="text-lg">security</mat-icon>
          </div>
          <div>
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              Falsifier Agent Workbench
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                Adversarial Engine
              </span>
            </h2>
            <p class="text-[11px] text-slate-400">
              Tool-equipped agent actively hunting for counter-evidence to KILL false alarms or DOWNGRADE risk
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            5 Grounded Tools
          </span>
        </div>
      </div>

      <!-- Edge Target Selector -->
      <div>
        <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Select Cascade Edge To Interrogate:
        </span>
        <div class="flex flex-wrap gap-1.5">
          @for (edge of engine.dynamicEdges(); track edge.id) {
            <button
              type="button"
              (click)="selectEdge(edge)"
              [class.bg-rose-600]="selectedEdge() && selectedEdge()!.id === edge.id"
              [class.text-white]="selectedEdge() && selectedEdge()!.id === edge.id"
              [class.bg-slate-800]="!selectedEdge() || selectedEdge()!.id !== edge.id"
              [class.text-slate-300]="!selectedEdge() || selectedEdge()!.id !== edge.id"
              class="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-700/60 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{{ getNodeName(edge.from) }} → {{ getNodeName(edge.to) }}</span>
              @if (edge.falsifierVerdict === 'KILL') {
                <span class="text-[9px] px-1 rounded bg-rose-950 text-rose-300 border border-rose-800">KILL</span>
              } @else if (edge.falsifierVerdict === 'DOWNGRADE') {
                <span class="text-[9px] px-1 rounded bg-amber-950 text-amber-300 border border-amber-800">DOWNGRADE</span>
              } @else if (edge.falsifierVerdict === 'KEEP') {
                <span class="text-[9px] px-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">KEEP</span>
              }
            </button>
          }
        </div>
      </div>

      @if (selectedEdge(); as edge) {
        <!-- Adversarial Hypothesis Banner -->
        <div class="bg-slate-950/90 rounded-xl p-3.5 border border-slate-800 space-y-2">
          <div class="flex items-center justify-between text-xs font-mono">
            <span class="text-slate-400 font-bold uppercase tracking-wider">Candidate Cascade Hypothesis</span>
            <span class="text-rose-400 font-semibold">Prior Risk: {{ (edge.priorProbability * 100) | number:'1.0-0' }}%</span>
          </div>
          <p class="text-xs text-slate-200 leading-relaxed font-mono">
            "Primary Anomaly in <strong class="text-cyan-300">{{ getNodeName(edge.from) }}</strong> will cause catastrophic outage on downstream <strong class="text-cyan-300">{{ getNodeName(edge.to) }}</strong> within {{ edge.timeWindowMinutes }} min."
          </p>
          <div class="text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-slate-800/80 pt-2">
            <mat-icon class="text-sm text-rose-400">gavel</mat-icon>
            <span>Falsifier Objective: Probe system state to prove the hypothesis FALSE before waking on-call.</span>
          </div>
        </div>

        <!-- Tool Suite Trigger Actions -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Available Falsifier Tools:
            </span>
            <button
              type="button"
              (click)="runAllTools(edge)"
              [disabled]="toolService.isRunningSuite()"
              class="px-3 py-1 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white transition-all shadow flex items-center gap-1.5 cursor-pointer"
            >
              @if (toolService.isRunningSuite()) {
                <span class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Executing Tool Suite...</span>
              } @else {
                <mat-icon class="text-sm">play_arrow</mat-icon>
                <span>Run Full Adversarial Scan</span>
              }
            </button>
          </div>

          <!-- Tool Cards Grid -->
          <div class="grid grid-cols-1 gap-2">
            @for (tool of toolService.availableTools(); track tool.id) {
              <div class="bg-slate-950/70 rounded-xl p-2.5 border border-slate-800 flex items-start justify-between gap-2 text-xs">
                <div class="flex items-start gap-2">
                  <div class="w-6 h-6 rounded-lg bg-slate-800 text-cyan-400 flex items-center justify-center text-sm mt-0.5">
                    <mat-icon class="text-sm">{{ tool.icon }}</mat-icon>
                  </div>
                  <div>
                    <h4 class="font-bold text-slate-200 text-xs">{{ tool.name }}</h4>
                    <p class="text-[10px] text-slate-400 leading-tight mt-0.5">{{ tool.description }}</p>
                    <code class="text-[9px] font-mono text-slate-500 block mt-1 select-all">{{ tool.commandSnippet }}</code>
                  </div>
                </div>

                <button
                  type="button"
                  (click)="runSingleTool(edge)"
                  [disabled]="toolService.isRunningSuite()"
                  class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 hover:text-white text-[10px] font-mono border border-slate-700 whitespace-nowrap cursor-pointer"
                >
                  Run Tool
                </button>
              </div>
            }
          </div>
        </div>

        <!-- Real-Time Tool Execution Terminal Stream -->
        @if (toolService.executionLog().length > 0) {
          <div class="bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-[10px] space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
            <div class="text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-1 mb-1">
              <span class="flex items-center gap-1">
                <mat-icon class="text-xs text-emerald-400">terminal</mat-icon>
                Falsifier Live Execution Stream
              </span>
              <span class="text-cyan-400">{{ toolService.executionLog().length }} events</span>
            </div>
            @for (log of toolService.executionLog(); track log) {
              <div class="text-slate-300 leading-snug">{{ log }}</div>
            }
          </div>
        }

        <!-- Active Investigation Verdict & Findings -->
        @if (toolService.currentInvestigation(); as inv) {
          <div class="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
            <div class="flex items-center justify-between">
              <div class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <mat-icon class="text-sm text-cyan-400">assignment_turned_in</mat-icon>
                Adversarial Verdict & Synthesis
              </div>

              <!-- Verdict Tag -->
              @if (inv.verdict === 'KILL') {
                <span class="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold flex items-center gap-1">
                  <mat-icon class="text-sm">cancel</mat-icon>
                  VERDICT: KILL (FALSE ALARM)
                </span>
              } @else if (inv.verdict === 'DOWNGRADE') {
                <span class="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                  <mat-icon class="text-sm">shield</mat-icon>
                  VERDICT: DOWNGRADE (DEGRADED)
                </span>
              } @else if (inv.verdict === 'KEEP') {
                <span class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                  <mat-icon class="text-sm">check_circle</mat-icon>
                  VERDICT: KEEP (CRITICAL CASCADE)
                </span>
              } @else {
                <span class="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  SCANNING TOOLS...
                </span>
              }
            </div>

            <!-- Probability Shift Comparison -->
            <div class="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-900/90 p-3 rounded-lg border border-slate-800">
              <div>
                <span class="text-[10px] text-slate-400 block">Initial Unfiltered Prior:</span>
                <span class="text-lg font-bold text-rose-400 line-through">
                  {{ (inv.priorProbability * 100) | number:'1.0-0' }}%
                </span>
                <span class="text-[9px] text-slate-500 block">Raw LLM / Graph Guess</span>
              </div>

              <div>
                <span class="text-[10px] text-slate-400 block">Post-Falsifier Calibrated:</span>
                <span
                  [class.text-emerald-400]="inv.calibratedProbability <= 0.1"
                  [class.text-amber-400]="inv.calibratedProbability > 0.1 && inv.calibratedProbability <= 0.4"
                  [class.text-rose-400]="inv.calibratedProbability > 0.4"
                  class="text-lg font-bold"
                >
                  {{ (inv.calibratedProbability * 100) | number:'1.0-0' }}%
                </span>
                <span class="text-[9px] text-slate-400 block font-sans">Grounded by Tools</span>
              </div>
            </div>

            <!-- Justification Details -->
            <p class="text-xs text-slate-300 leading-relaxed font-sans">{{ inv.justification }}</p>

            <!-- Evidence Breakdown -->
            @if (inv.evidenceFound) {
              <div class="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono">
                <span class="text-cyan-400 font-bold block mb-0.5">Empirical Evidence Artifacts:</span>
                <span class="text-slate-300">{{ inv.evidenceFound }}</span>
              </div>
            }

            <!-- Individual Tool Output Accordion -->
            @if (inv.toolResults.length > 0) {
              <div class="space-y-1.5 pt-2 border-t border-slate-800">
                <span class="text-[10px] font-mono text-slate-400 block">Tool Probe Results ({{ inv.toolResults.length }}/5):</span>
                @for (res of inv.toolResults; track res.toolId) {
                  <div class="bg-slate-900/60 rounded p-2 border border-slate-800 text-[10px] space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-slate-200 font-mono">{{ res.toolName }}</span>
                      <span
                        [class.text-rose-400]="res.status === 'COUNTER_EVIDENCE_FOUND'"
                        [class.text-amber-400]="res.status === 'MITIGATING_CONFIG_FOUND'"
                        [class.text-slate-400]="res.status === 'NO_COUNTER_EVIDENCE'"
                        class="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800"
                      >
                        {{ res.status }}
                      </span>
                    </div>
                    <p class="text-slate-300 font-sans leading-tight">{{ res.summary }}</p>
                  </div>
                }
              </div>
            }
          </div>
        }
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
export class FalsifierWorkbenchComponent {
  readonly engine = inject(RippleEngineService);
  readonly toolService = inject(FalsifierToolService);

  readonly selectedEdge = computed(() => {
    return this.engine.inspectEdge() || this.engine.dynamicEdges()[0] || null;
  });

  selectEdge(edge: TopologyEdge) {
    this.engine.selectEdge(edge.id);
  }

  getNodeName(nodeId: string): string {
    const node = this.engine.activeScenario().nodes.find((n) => n.id === nodeId);
    return node ? node.name : nodeId;
  }

  async runAllTools(edge: TopologyEdge) {
    const label = `${this.getNodeName(edge.from)} → ${this.getNodeName(edge.to)}`;
    await this.toolService.investigateEdge(edge, label);
  }

  async runSingleTool(edge: TopologyEdge) {
    const label = `${this.getNodeName(edge.from)} → ${this.getNodeName(edge.to)}`;
    await this.toolService.investigateEdge(edge, label);
  }
}
