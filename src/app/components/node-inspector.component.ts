import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RippleEngineService } from '../services/ripple-engine.service';
import { TopologyNode } from '../models/ripple.types';

@Component({
  selector: 'app-node-inspector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, DecimalPipe],
  template: `
    <div class="h-full flex flex-col bg-slate-900 border-l border-slate-800 text-slate-100 overflow-y-auto custom-scrollbar select-none p-4 space-y-4">
      @if (selectedNode(); as node) {
        <!-- Header -->
        <div class="border-b border-slate-800 pb-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div
                [class.bg-rose-500_20]="node.health === 'ROOT_ANOMALY' || node.health === 'CRITICAL_RISK'"
                [class.text-rose-400]="node.health === 'ROOT_ANOMALY' || node.health === 'CRITICAL_RISK'"
                [class.bg-amber-500_20]="node.health === 'DOWNGRADED_RISK'"
                [class.text-amber-400]="node.health === 'DOWNGRADED_RISK'"
                [class.bg-emerald-500_20]="node.health === 'FALSIFIED_SAFE' || node.health === 'HEALTHY'"
                [class.text-emerald-400]="node.health === 'FALSIFIED_SAFE' || node.health === 'HEALTHY'"
                class="w-8 h-8 rounded-xl flex items-center justify-center border border-slate-700/60"
              >
                <mat-icon class="text-lg">{{ getNodeCategoryIcon(node.category) }}</mat-icon>
              </div>
              <div>
                <h3 class="text-sm font-bold text-white">{{ node.name }}</h3>
                <span class="text-[11px] text-slate-400 font-mono">{{ node.id }} • {{ node.tier }}</span>
              </div>
            </div>

            <!-- Health Status Badge -->
            <span
              [class.bg-rose-500_20]="node.health === 'ROOT_ANOMALY'"
              [class.text-rose-300]="node.health === 'ROOT_ANOMALY'"
              [class.border-rose-500_40]="node.health === 'ROOT_ANOMALY'"
              [class.bg-red-500_20]="node.health === 'CRITICAL_RISK'"
              [class.text-red-300]="node.health === 'CRITICAL_RISK'"
              [class.border-red-500_40]="node.health === 'CRITICAL_RISK'"
              [class.bg-amber-500_20]="node.health === 'DOWNGRADED_RISK'"
              [class.text-amber-300]="node.health === 'DOWNGRADED_RISK'"
              [class.border-amber-500_40]="node.health === 'DOWNGRADED_RISK'"
              [class.bg-emerald-500_20]="node.health === 'FALSIFIED_SAFE'"
              [class.text-emerald-300]="node.health === 'FALSIFIED_SAFE'"
              [class.border-emerald-500_40]="node.health === 'FALSIFIED_SAFE'"
              [class.bg-slate-700_30]="node.health === 'HEALTHY'"
              [class.text-slate-300]="node.health === 'HEALTHY'"
              [class.border-slate-600_40]="node.health === 'HEALTHY'"
              class="text-[10px] font-bold px-2 py-0.5 rounded-full border"
            >
              {{ formatHealth(node.health) }}
            </span>
          </div>
          <p class="text-xs text-slate-300 mt-2 leading-relaxed">{{ node.description }}</p>
        </div>

        <!-- Live Telemetry Grid -->
        <div>
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Real-Time Node Telemetry
          </span>
          <div class="grid grid-cols-2 gap-2.5 font-mono text-xs">
            <div class="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span class="text-[10px] text-slate-400 block">p99 Latency:</span>
              <div class="flex items-baseline gap-1 mt-0.5">
                <span class="text-sm font-bold text-cyan-300">{{ node.p99LatencyMs }}ms</span>
                <span class="text-[10px] text-slate-500">/ {{ node.baselineLatencyMs }}ms base</span>
              </div>
            </div>

            <div class="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span class="text-[10px] text-slate-400 block">Error Rate:</span>
              <div class="flex items-baseline gap-1 mt-0.5">
                <span
                  [class.text-rose-400]="node.errorRatePercent > 1.0"
                  [class.text-emerald-400]="node.errorRatePercent <= 1.0"
                  class="text-sm font-bold"
                >
                  {{ node.errorRatePercent }}%
                </span>
                <span class="text-[10px] text-slate-500">/ {{ node.baselineErrorRate }}% base</span>
              </div>
            </div>

            <div class="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span class="text-[10px] text-slate-400 block">SLA Objective:</span>
              <span class="text-xs font-semibold text-slate-200 block mt-0.5">{{ node.slaTarget }}</span>
            </div>

            <div class="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span class="text-[10px] text-slate-400 block">On-Call Team:</span>
              <span class="text-xs font-semibold text-slate-200 block mt-0.5 truncate">{{ node.ownerTeam }}</span>
            </div>
          </div>
        </div>

        <!-- Cascade Relationships -->
        <div class="space-y-3">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Incoming & Outgoing Dependencies
          </span>

          <!-- Incoming -->
          @if (incomingEdges().length > 0) {
            <div class="space-y-1.5">
              <span class="text-[10px] text-slate-400 font-mono">Incoming Upstream Paths:</span>
              @for (edge of incomingEdges(); track edge.id) {
                <div
                  role="button"
                  tabindex="0"
                  (click)="engine.selectEdge(edge.id)"
                  (keydown.enter)="engine.selectEdge(edge.id)"
                  (keydown.space)="engine.selectEdge(edge.id)"
                  class="bg-slate-800/60 hover:bg-slate-800 p-2 rounded-lg border border-slate-700/60 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <span class="text-slate-200 font-medium">From: {{ getNodeName(edge.from) }}</span>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-mono text-slate-400">{{ edge.protocol }}</span>
                    <span
                      [class.text-rose-400]="edge.calibratedProbability > 0.4"
                      [class.text-amber-400]="edge.calibratedProbability <= 0.4 && edge.calibratedProbability > 0.1"
                      [class.text-emerald-400]="edge.calibratedProbability <= 0.1"
                      class="font-mono font-bold text-[11px]"
                    >
                      {{ (edge.calibratedProbability * 100) | number:'1.0-0' }}%
                    </span>
                  </div>
                </div>
              }
            </div>
          }

          <!-- Outgoing -->
          @if (outgoingEdges().length > 0) {
            <div class="space-y-1.5 pt-1">
              <span class="text-[10px] text-slate-400 font-mono">Downstream Cascade Targets:</span>
              @for (edge of outgoingEdges(); track edge.id) {
                <div
                  role="button"
                  tabindex="0"
                  (click)="engine.selectEdge(edge.id)"
                  (keydown.enter)="engine.selectEdge(edge.id)"
                  (keydown.space)="engine.selectEdge(edge.id)"
                  class="bg-slate-800/60 hover:bg-slate-800 p-2 rounded-lg border border-slate-700/60 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <span class="text-slate-200 font-medium">To: {{ getNodeName(edge.to) }}</span>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-mono text-slate-400">{{ edge.dependencyType }}</span>
                    <span
                      [class.text-rose-400]="edge.calibratedProbability > 0.4"
                      [class.text-amber-400]="edge.calibratedProbability <= 0.4 && edge.calibratedProbability > 0.1"
                      [class.text-emerald-400]="edge.calibratedProbability <= 0.1"
                      class="font-mono font-bold text-[11px]"
                    >
                      {{ (edge.calibratedProbability * 100) | number:'1.0-0' }}%
                    </span>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      } @else {
        <div class="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
          <mat-icon class="text-3xl text-slate-600 mb-2">touch_app</mat-icon>
          <p class="text-xs">Click on any node in the topology canvas to inspect its telemetry and cascade state.</p>
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
export class NodeInspectorComponent {
  readonly engine = inject(RippleEngineService);

  readonly selectedNode = computed<TopologyNode | null>(() => {
    return this.engine.inspectNode() || this.engine.dynamicNodes()[0] || null;
  });

  readonly incomingEdges = computed(() => {
    const node = this.selectedNode();
    if (!node) return [];
    return this.engine.dynamicEdges().filter((e) => e.to === node.id);
  });

  readonly outgoingEdges = computed(() => {
    const node = this.selectedNode();
    if (!node) return [];
    return this.engine.dynamicEdges().filter((e) => e.from === node.id);
  });

  getNodeName(nodeId: string): string {
    const node = this.engine.activeScenario().nodes.find((n) => n.id === nodeId);
    return node ? node.name : nodeId;
  }

  getNodeCategoryIcon(category: string): string {
    switch (category) {
      case 'STORAGE':
        return 'dns';
      case 'DATABASE':
        return 'database';
      case 'CACHE':
        return 'memory';
      case 'GATEWAY':
        return 'router';
      case 'QUEUE':
        return 'queue';
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
      case 'HEALTHY':
        return 'HEALTHY';
      default:
        return health;
    }
  }
}
