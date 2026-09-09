import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RippleEngineService } from '../services/ripple-engine.service';
import { TopologyNode } from '../models/ripple.types';

@Component({
  selector: 'app-node-inspector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule, DecimalPipe],
  template: `
    <div class="h-full flex flex-col bg-white text-slate-800 overflow-y-auto select-none p-4 space-y-4">
      @if (selectedNode(); as node) {
        <!-- Header -->
        <div class="border-b border-stone-200 pb-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div
                [class.bg-rose-100_text-rose-800]="node.health === 'ROOT_ANOMALY' || node.health === 'CRITICAL_RISK'"
                [class.bg-amber-100_text-amber-800]="node.health === 'DOWNGRADED_RISK'"
                [class.bg-emerald-100_text-emerald-800]="node.health === 'FALSIFIED_SAFE'"
                [class.bg-stone-100_text-slate-700]="node.health === 'HEALTHY'"
                class="w-8 h-8 rounded-xl flex items-center justify-center border border-stone-200 font-bold"
              >
                <mat-icon class="text-base">{{ getNodeCategoryIcon(node.category) }}</mat-icon>
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-900">{{ node.name }}</h3>
                <span class="text-[11px] text-slate-500 font-mono">{{ node.id }} • {{ node.tier }}</span>
              </div>
            </div>

            <!-- Health Status Badge -->
            <span
              [class.bg-rose-100_text-rose-800_border-rose-300]="node.health === 'ROOT_ANOMALY'"
              [class.bg-red-100_text-red-800_border-red-300]="node.health === 'CRITICAL_RISK'"
              [class.bg-amber-100_text-amber-800_border-amber-300]="node.health === 'DOWNGRADED_RISK'"
              [class.bg-emerald-100_text-emerald-800_border-emerald-300]="node.health === 'FALSIFIED_SAFE'"
              [class.bg-stone-100_text-slate-600_border-stone-300]="node.health === 'HEALTHY'"
              class="text-[10px] font-bold px-2 py-0.5 rounded-full border"
            >
              {{ formatHealth(node.health) }}
            </span>
          </div>
          <p class="text-xs text-slate-600 mt-2 leading-relaxed">{{ node.description }}</p>
        </div>

        <!-- Live Telemetry Grid -->
        <div>
          <span class="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
            Real-Time Node Telemetry
          </span>
          <div class="grid grid-cols-2 gap-2.5 font-mono text-xs">
            <div class="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
              <span class="text-[10px] text-slate-500 block">p99 Latency:</span>
              <div class="flex items-baseline gap-1 mt-0.5">
                <span class="text-sm font-bold text-teal-800">{{ node.p99LatencyMs }}ms</span>
                <span class="text-[10px] text-slate-400">/ {{ node.baselineLatencyMs }}ms</span>
              </div>
            </div>

            <div class="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
              <span class="text-[10px] text-slate-500 block">Error Rate:</span>
              <div class="flex items-baseline gap-1 mt-0.5">
                <span
                  [class.text-rose-700]="node.errorRatePercent > 5"
                  [class.text-amber-700]="node.errorRatePercent > 0 && node.errorRatePercent <= 5"
                  [class.text-emerald-700]="node.errorRatePercent === 0"
                  class="text-sm font-bold"
                >
                  {{ node.errorRatePercent }}%
                </span>
                <span class="text-[10px] text-slate-400">HTTP 5xx</span>
              </div>
            </div>

            <div class="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
              <span class="text-[10px] text-slate-500 block">Baseline Latency:</span>
              <div class="flex items-baseline gap-1 mt-0.5">
                <span class="text-sm font-bold text-slate-800">{{ node.baselineLatencyMs | number }}</span>
                <span class="text-[10px] text-slate-400">ms</span>
              </div>
            </div>

            <div class="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
              <span class="text-[10px] text-slate-500 block">Owner Team:</span>
              <div class="flex items-baseline gap-1 mt-0.5">
                <span class="text-xs font-semibold text-slate-700 truncate" [title]="node.ownerTeam">
                  {{ node.ownerTeam }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Node Dependencies -->
        <div class="space-y-2">
          <span class="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
            Direct Dependency Graph Links:
          </span>
          <div class="space-y-1.5">
            @for (edge of connectedEdges(); track edge.id) {
              <button
                type="button"
                (click)="engine.selectEdge(edge.id)"
                class="w-full bg-stone-50 hover:bg-stone-100 p-2.5 rounded-xl border border-stone-200 cursor-pointer transition-colors text-xs flex items-center justify-between text-left"
              >
                <div class="flex items-center gap-1.5">
                  <mat-icon class="text-sm text-teal-600">arrow_forward</mat-icon>
                  <span class="font-medium text-slate-800">
                    {{ edge.from === node.id ? 'Outbound to ' + getNodeName(edge.to) : 'Inbound from ' + getNodeName(edge.from) }}
                  </span>
                </div>
                <span class="font-mono text-[11px] font-bold text-slate-600">
                  {{ (edge.calibratedProbability * 100).toFixed(0) }}% risk
                </span>
              </button>
            }
          </div>
        </div>
      } @else {
        <div class="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
          <mat-icon class="text-3xl text-slate-300">touch_app</mat-icon>
          <p class="text-xs">Select any node on the topology canvas to view real-time latency, error telemetry, and dependency relationships.</p>
        </div>
      }
    </div>
  `,
})
export class NodeInspectorComponent {
  readonly engine = inject(RippleEngineService);

  readonly selectedNode = computed<TopologyNode | null>(() => {
    return this.engine.inspectNode();
  });

  readonly connectedEdges = computed(() => {
    const node = this.selectedNode();
    if (!node) return [];
    return this.engine.dynamicEdges().filter((e) => e.from === node.id || e.to === node.id);
  });

  getNodeCategoryIcon(cat: string): string {
    switch (cat) {
      case 'STORAGE':
        return 'storage';
      case 'DATABASE':
        return 'dns';
      case 'CACHE':
        return 'memory';
      case 'GATEWAY':
        return 'router';
      case 'QUEUE':
        return 'swap_horiz';
      default:
        return 'layers';
    }
  }

  formatHealth(health: string): string {
    switch (health) {
      case 'ROOT_ANOMALY':
        return 'ROOT ANOMALY';
      case 'CRITICAL_RISK':
        return 'CRITICAL CASCADE';
      case 'DOWNGRADED_RISK':
        return 'DOWNGRADED';
      case 'FALSIFIED_SAFE':
        return 'FALSIFIED (SAFE)';
      default:
        return 'HEALTHY';
    }
  }

  getNodeName(id: string): string {
    const node = this.engine.dynamicNodes().find((n) => n.id === id);
    return node ? node.name : id;
  }
}
