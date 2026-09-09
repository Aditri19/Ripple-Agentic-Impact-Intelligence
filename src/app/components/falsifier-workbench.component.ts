import { ChangeDetectionStrategy, Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RippleEngineService } from '../services/ripple-engine.service';
import {
  FalsifierToolService,
} from '../services/falsifier-tool.service';
import { TopologyEdge } from '../models/ripple.types';
import { ReportPlaceholderComponent } from './report-placeholder.component';

@Component({
  selector: 'app-falsifier-workbench',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule, ReportPlaceholderComponent],
  template: `
    <div class="h-full flex flex-col bg-white text-slate-800 overflow-y-auto select-none p-4 sm:p-6 space-y-5">
      @if (!engine.isAutoplayComplete()) {
        <!-- Dynamic Staging Placeholder when Autoplay hasn't run yet -->
        <app-report-placeholder
          reportName="Adversarial Falsifier Workbench"
          reportCategory="Counter-Evidence Probes"
          reportDescription="Automated adversarial agent hunting for counter-evidence across GitOps commits, circuit breakers, and caches to KILL false alarms or DOWNGRADE cascade risk."
          icon="security"
        />
      } @else {
        <!-- Section Header -->
        <div class="border-b border-stone-200 pb-4 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center shadow-xs">
              <mat-icon class="text-xl">security</mat-icon>
            </div>
            <div>
              <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
                Adversarial Falsifier Workbench
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  ✓ Probes Evaluated
                </span>
              </h2>
              <p class="text-xs text-slate-500 mt-0.5">
                Automated adversarial agent hunting for counter-evidence to KILL false alarms or DOWNGRADE cascade risk.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span
              title="Automated inspection across GitOps commits, Circuit Breaker trip states, Memcached cache hit rates, async worker queues, and SLO thresholds"
              class="text-xs font-mono px-2.5 py-1 rounded-xl bg-stone-100 text-slate-700 border border-stone-200 font-semibold cursor-help"
            >
              5 Grounded Tool Probes
            </span>

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
        </div>

      <!-- Live Scan Completed Notification Banner -->
      @if (scanCompletedBanner(); as banner) {
        <div class="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <mat-icon class="text-xl">task_alt</mat-icon>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold font-mono">SCAN COMPLETED & SYNTHESIZED:</span>
                <span class="text-xs font-mono font-semibold">{{ banner.edgeName }}</span>
              </div>
              <p class="text-xs text-emerald-800 mt-0.5">
                Verdict: <strong class="font-bold underline">{{ banner.verdict }}</strong> — Cascading risk adjusted from {{ banner.prior }}% down to <strong>{{ banner.calibrated }}%</strong>. The dependency topology and SRE runbook have been updated.
              </p>
            </div>
          </div>
          <button
            type="button"
            (click)="scanCompletedBanner.set(null)"
            title="Close this notice"
            class="p-1 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <mat-icon class="text-base">close</mat-icon>
          </button>
        </div>
      }

      <!-- Edge Target Selector -->
      <div>
        <span class="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
          Select Cascade Edge To Interrogate:
        </span>
        <div class="flex flex-wrap gap-2">
          @for (edge of engine.dynamicEdges(); track edge.id) {
            <button
              type="button"
              (click)="selectEdge(edge)"
              [class.bg-rose-600]="selectedEdge() && selectedEdge()!.id === edge.id"
              [class.text-white]="selectedEdge() && selectedEdge()!.id === edge.id"
              [class.border-rose-600]="selectedEdge() && selectedEdge()!.id === edge.id"
              [class.bg-stone-50]="!selectedEdge() || selectedEdge()!.id !== edge.id"
              [class.text-slate-700]="!selectedEdge() || selectedEdge()!.id !== edge.id"
              [class.border-stone-200]="!selectedEdge() || selectedEdge()!.id !== edge.id"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>{{ getNodeName(edge.from) }} → {{ getNodeName(edge.to) }}</span>
              @if (edge.falsifierVerdict === 'KILL') {
                <span class="text-[9px] px-1.5 py-0.2 rounded font-bold"
                  [class.bg-white_text-rose-700]="selectedEdge() && selectedEdge()!.id === edge.id"
                  [class.bg-emerald-100_text-emerald-800]="!selectedEdge() || selectedEdge()!.id !== edge.id"
                >KILL (0%)</span>
              } @else if (edge.falsifierVerdict === 'DOWNGRADE') {
                <span class="text-[9px] px-1.5 py-0.2 rounded font-bold"
                  [class.bg-white_text-rose-700]="selectedEdge() && selectedEdge()!.id === edge.id"
                  [class.bg-amber-100_text-amber-800]="!selectedEdge() || selectedEdge()!.id !== edge.id"
                >DOWNGRADE</span>
              } @else if (edge.falsifierVerdict === 'KEEP') {
                <span class="text-[9px] px-1.5 py-0.2 rounded font-bold"
                  [class.bg-white_text-rose-700]="selectedEdge() && selectedEdge()!.id === edge.id"
                  [class.bg-rose-100_text-rose-800]="!selectedEdge() || selectedEdge()!.id !== edge.id"
                >KEEP</span>
              }
            </button>
          }
        </div>
      </div>

      <!-- Active Edge Investigation Banner -->
      @if (selectedEdge(); as edge) {
        <div class="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-stone-200 text-slate-700">
                  {{ edge.dependencyType }} DEPENDENCY
                </span>
                <span class="text-xs font-mono text-slate-500">{{ edge.id }}</span>
              </div>
              <h3 class="text-sm font-bold text-slate-900 mt-1">
                {{ getNodeName(edge.from) }} ➔ {{ getNodeName(edge.to) }}
              </h3>
            </div>

            <!-- Run Tool Suite Action -->
            <button
              type="button"
              (click)="runInvestigationOnSelected()"
              [disabled]="falsifierService.isRunningSuite()"
              title="Runs 5 live observability tools against this edge to check for mitigating configs, cache hit rates, circuit breakers, and commit logs"
              class="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              @if (falsifierService.isRunningSuite()) {
                <span class="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                <span>Probing Observability Tools...</span>
              } @else {
                <mat-icon class="text-base">biotech</mat-icon>
                <span>Run Full Adversarial Scan</span>
              }
            </button>
          </div>

          <!-- Probability Comparison Meter -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
              <span class="text-[10px] text-slate-500 font-mono block">Raw Prior Probability:</span>
              <span class="text-lg font-bold text-slate-800 block mt-0.5 font-mono">
                {{ (edge.priorProbability * 100).toFixed(0) }}%
              </span>
              <span class="text-[10px] text-slate-400">Initial hypothesis prior</span>
            </div>

            <div class="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
              <span class="text-[10px] text-slate-500 font-mono block">Falsifier Verdict:</span>
              <div class="mt-0.5 flex items-center gap-1.5">
                @if (edge.falsifierVerdict === 'KILL') {
                  <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    KILL (FALSE ALARM)
                  </span>
                } @else if (edge.falsifierVerdict === 'DOWNGRADE') {
                  <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    DOWNGRADE (MITIGATED)
                  </span>
                } @else if (edge.falsifierVerdict === 'KEEP') {
                  <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                    KEEP (TRUE CASCADE)
                  </span>
                } @else {
                  <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-slate-600 border border-stone-200">
                    PENDING SCAN
                  </span>
                }
              </div>
              <span class="text-[10px] text-slate-400">Based on counter-evidence</span>
            </div>

            <div class="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
              <span class="text-[10px] text-slate-500 font-mono block">Calibrated Probability:</span>
              <div class="flex items-baseline gap-1 mt-0.5">
                <span class="text-lg font-bold font-mono"
                  [class.text-emerald-700]="edge.calibratedProbability === 0"
                  [class.text-amber-700]="edge.calibratedProbability > 0 && edge.calibratedProbability < 0.4"
                  [class.text-rose-700]="edge.calibratedProbability >= 0.4"
                >
                  {{ (edge.calibratedProbability * 100).toFixed(0) }}%
                </span>
                @if (edge.priorProbability !== edge.calibratedProbability) {
                  <span class="text-xs text-slate-400 line-through font-mono">
                    {{ (edge.priorProbability * 100).toFixed(0) }}%
                  </span>
                }
              </div>
              <span class="text-[10px] text-slate-400">SRE escalation metric</span>
            </div>
          </div>

          <!-- Discovered Counter-Evidence Callout -->
          <div class="bg-white rounded-xl p-3.5 border border-stone-200 space-y-1.5 shadow-2xs">
            <div class="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <mat-icon class="text-base text-teal-600">find_in_page</mat-icon>
              <span>Grounded Counter-Evidence Log:</span>
            </div>
            <p class="text-xs text-slate-700 leading-relaxed font-mono">
              {{ edge.falsifierEvidenceFound || 'Click "Run Full Adversarial Scan" above to query infrastructure probes for counter-evidence.' }}
            </p>
          </div>
        </div>
      }

      <!-- Terminal Output of Executed Tool Probes -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <mat-icon class="text-sm text-teal-600">terminal</mat-icon>
            Live Tool Execution Stream:
          </span>
          <span class="text-[10px] font-mono text-slate-400">Real-Time Observability Probes</span>
        </div>

        <div class="bg-slate-950 text-slate-200 rounded-2xl p-4 font-mono text-xs space-y-2 max-h-48 overflow-y-auto border border-slate-800 shadow-inner">
          @if (falsifierService.executionLog().length === 0) {
            <p class="text-slate-500 italic">Select an edge and click "Run Full Adversarial Scan" to view live tool command outputs and evidence synthesis.</p>
          } @else {
            @for (log of falsifierService.executionLog(); track log) {
              <div class="leading-relaxed"
                [class.text-emerald-400]="log.includes('Synthesis Complete') && log.includes('KILL')"
                [class.text-amber-300]="log.includes('Synthesis Complete') && log.includes('DOWNGRADE')"
                [class.text-rose-400]="log.includes('Synthesis Complete') && log.includes('KEEP')"
                [class.text-cyan-300]="log.includes('Executed')"
                [class.text-slate-300]="!log.includes('Executed') && !log.includes('Synthesis Complete')"
              >
                {{ log }}
              </div>
            }
          }
        </div>
      </div>

      <!-- Available Falsifier Tools Overview -->
      <div class="space-y-3">
        <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">
          5 Grounded Observability Interrogation Tools:
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          @for (tool of falsifierService.availableTools(); track tool.id) {
            <div class="bg-stone-50 rounded-xl p-3 border border-stone-200 flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shrink-0">
                <mat-icon class="text-base">{{ tool.icon }}</mat-icon>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-1">
                  <h5 class="text-xs font-bold text-slate-900 truncate">{{ tool.name }}</h5>
                  <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-stone-200 text-slate-700 font-bold">
                    {{ tool.category }}
                  </span>
                </div>
                <p class="text-[11px] text-slate-600 mt-1 leading-snug">{{ tool.description }}</p>
                <code class="block mt-1.5 text-[10px] text-slate-500 bg-white px-2 py-1 rounded border border-stone-200 truncate">
                  $ {{ tool.commandSnippet }}
                </code>
              </div>
            </div>
          }
        </div>
      </div>
      }
    </div>
  `,
})
export class FalsifierWorkbenchComponent {
  readonly engine = inject(RippleEngineService);
  readonly falsifierService = inject(FalsifierToolService);
  readonly scanCompletedBanner = signal<{ edgeName: string; verdict: string; prior: number; calibrated: number } | null>(null);

  readonly selectedEdge = computed<TopologyEdge | null>(() => {
    return this.engine.inspectEdge() || this.engine.dynamicEdges()[0] || null;
  });

  selectEdge(edge: TopologyEdge) {
    this.engine.selectEdge(edge.id);
    this.scanCompletedBanner.set(null);
  }

  getNodeName(nodeId: string): string {
    const node = this.engine.dynamicNodes().find((n) => n.id === nodeId);
    return node ? node.name : nodeId;
  }

  async runInvestigationOnSelected() {
    const edge = this.selectedEdge();
    if (!edge) return;
    const label = `${this.getNodeName(edge.from)} → ${this.getNodeName(edge.to)}`;
    const completedRun = await this.falsifierService.investigateEdge(edge, label);

    // Update the edge in the engine so the graph, meters, and DAG immediately reflect the new verdict!
    this.engine.updateEdgeFalsifierOutcome(
      edge.id,
      completedRun.verdict,
      completedRun.calibratedProbability,
      completedRun.evidenceFound,
      completedRun.justification
    );

    // Display confirmation banner with live calibrated values
    this.scanCompletedBanner.set({
      edgeName: label,
      verdict: completedRun.verdict,
      prior: Math.round(edge.priorProbability * 100),
      calibrated: Math.round(completedRun.calibratedProbability * 100),
    });
  }
}
