import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RippleEngineService } from '../services/ripple-engine.service';
import { TopologyNode } from '../models/ripple.types';

@Component({
  selector: 'app-topology-graph',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="relative w-full h-[480px] lg:h-[540px] bg-slate-950/90 rounded-2xl border border-slate-800 p-4 flex flex-col overflow-hidden select-none shadow-inner">
      <!-- Graph Header & Quick Stats -->
      <div class="flex items-center justify-between mb-2 z-10">
        <div class="flex items-center gap-2">
          <mat-icon class="text-cyan-400 text-lg">schema</mat-icon>
          <span class="text-xs font-bold uppercase tracking-wider text-slate-300">
            System Dependency Topology & Cascade DAG
          </span>
        </div>

        <!-- Legend -->
        <div class="flex items-center gap-3 text-[11px] text-slate-400">
          <div class="flex items-center gap-1">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Root Anomaly</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="w-2.5 h-2.5 rounded bg-rose-600"></span>
            <span>Critical Cascade (Keep)</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="w-2.5 h-2.5 rounded bg-amber-500"></span>
            <span>Downgraded</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="w-2.5 h-2.5 rounded bg-emerald-500 border border-emerald-300"></span>
            <span>Falsified (Killed / Safe)</span>
          </div>
        </div>
      </div>

      <!-- Graph Canvas Container -->
      <div class="relative flex-1 w-full h-full rounded-xl bg-gradient-to-b from-slate-900/60 to-slate-950/80 border border-slate-800/80 overflow-hidden">
        <!-- SVG Canvas for Connecting Edges -->
        <svg class="absolute inset-0 w-full h-full pointer-events-auto z-0">
          <defs>
            <!-- Marker for Standard / Active Red Edge -->
            <marker id="arrow-critical" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M 0 0 L 8 4 L 0 8 z" fill="#f43f5e" />
            </marker>
            <marker id="arrow-downgrade" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M 0 0 L 8 4 L 0 8 z" fill="#f59e0b" />
            </marker>
            <marker id="arrow-pending" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M 0 0 L 8 4 L 0 8 z" fill="#64748b" />
            </marker>
            <marker id="arrow-killed" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M 0 0 L 8 4 L 0 8 z" fill="#10b981" />
            </marker>

            <!-- Gradient for critical link -->
            <linearGradient id="grad-critical" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#e11d48" />
              <stop offset="100%" stop-color="#fb7185" />
            </linearGradient>
          </defs>

          @for (edge of renderedEdges(); track edge.edge.id) {
            <!-- Background interactive wider stroke for easy click -->
            <path
              [attr.d]="edge.pathD"
              (click)="engine.selectEdge(edge.edge.id)"
              fill="none"
              stroke="transparent"
              stroke-width="24"
              class="cursor-pointer"
            />

            <!-- Visible Path -->
            <path
              [attr.d]="edge.pathD"
              (click)="engine.selectEdge(edge.edge.id)"
              fill="none"
              [attr.stroke]="edge.strokeColor"
              [attr.stroke-width]="edge.strokeWidth"
              [attr.stroke-dasharray]="edge.dashArray"
              [attr.marker-end]="edge.markerEnd"
              class="cursor-pointer transition-all duration-300"
            />

            <!-- Edge Probability & Verdict Pill -->
            <g [attr.transform]="'translate(' + edge.midX + ',' + edge.midY + ')'" class="cursor-pointer" (click)="engine.selectEdge(edge.edge.id)">
              @if (edge.edge.falsifierVerdict === 'KILL') {
                <rect x="-56" y="-14" width="112" height="28" rx="6" fill="#064e3b" stroke="#10b981" stroke-width="1.5" />
                <text x="0" y="4" text-anchor="middle" fill="#a7f3d0" font-size="10" font-weight="bold">
                  🛡️ KILLED (0% Risk)
                </text>
              } @else if (edge.edge.falsifierVerdict === 'DOWNGRADE') {
                <rect x="-54" y="-14" width="108" height="28" rx="6" fill="#451a03" stroke="#f59e0b" stroke-width="1.5" />
                <text x="0" y="4" text-anchor="middle" fill="#fde68a" font-size="10" font-weight="bold">
                  📉 {{ (edge.edge.calibratedProbability * 100).toFixed(0) }}% Risk (Down)
                </text>
              } @else if (edge.edge.falsifierVerdict === 'KEEP') {
                <rect x="-52" y="-14" width="104" height="28" rx="6" fill="#881337" stroke="#f43f5e" stroke-width="1.5" />
                <text x="0" y="4" text-anchor="middle" fill="#fecdd3" font-size="10" font-weight="bold">
                  ⚠️ {{ (edge.edge.calibratedProbability * 100).toFixed(0) }}% Risk (KEEP)
                </text>
              } @else {
                <rect x="-44" y="-12" width="88" height="24" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1" />
                <text x="0" y="3" text-anchor="middle" fill="#94a3b8" font-size="9" font-weight="500">
                  {{ (edge.edge.priorProbability * 100).toFixed(0) }}% candidate
                </text>
              }
            </g>
          }
        </svg>

        <!-- HTML Interactive Nodes -->
        @for (node of engine.dynamicNodes(); track node.id) {
          <div
            tabindex="0"
            role="button"
            (click)="engine.selectNode(node.id)"
            (keydown.enter)="engine.selectNode(node.id)"
            (keydown.space)="engine.selectNode(node.id)"
            [style.left.%]="node.x"
            [style.top.%]="node.y"
            [class.ring-2]="engine.selectedNodeId() === node.id || engine.activeHighlightedNode()?.id === node.id"
            [class.ring-cyan-400]="engine.selectedNodeId() === node.id || engine.activeHighlightedNode()?.id === node.id"
            [class.scale-105]="engine.selectedNodeId() === node.id || engine.activeHighlightedNode()?.id === node.id"
            class="absolute -translate-x-1/2 -translate-y-1/2 w-48 p-2.5 rounded-xl border transition-all duration-300 cursor-pointer shadow-lg z-10 backdrop-blur-sm"
            [class.bg-rose-950_border-rose-600]="node.health === 'ROOT_ANOMALY'"
            [class.bg-red-950_border-red-600]="node.health === 'CRITICAL_RISK'"
            [class.bg-amber-950_border-amber-600]="node.health === 'DOWNGRADED_RISK'"
            [class.bg-slate-900_border-emerald-600]="node.health === 'FALSIFIED_SAFE'"
            [class.bg-slate-900_border-slate-700]="node.health === 'HEALTHY'"
          >
            <!-- Node Header -->
            <div class="flex items-start justify-between gap-1 mb-1">
              <div class="flex items-center gap-1.5 overflow-hidden">
                <mat-icon class="text-base" [class]="getNodeIconColor(node)">
                  {{ getNodeIcon(node) }}
                </mat-icon>
                <span class="text-xs font-bold text-slate-100 truncate" [title]="node.name">
                  {{ node.name }}
                </span>
              </div>

              <!-- Tier Pill -->
              <span class="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {{ node.tier }}
              </span>
            </div>

            <!-- Metric Stats row -->
            <div class="flex items-center justify-between text-[10px] text-slate-300 font-mono mt-1 pt-1 border-t border-slate-800">
              <span>p99: {{ node.p99LatencyMs }}ms</span>
              <span [class]="getErrorClass(node)">Err: {{ node.errorRatePercent }}%</span>
            </div>

            <!-- Health Status Badge -->
            <div class="mt-1.5 flex items-center justify-between text-[9px] font-semibold">
              @if (node.health === 'ROOT_ANOMALY') {
                <span class="text-rose-300 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
                  ROOT TRIGGER
                </span>
              } @else if (node.health === 'CRITICAL_RISK') {
                <span class="text-rose-400">⚠️ CASCADE RISK (P1)</span>
              } @else if (node.health === 'DOWNGRADED_RISK') {
                <span class="text-amber-400">📉 MITIGATED (P3)</span>
              } @else if (node.health === 'FALSIFIED_SAFE') {
                <span class="text-emerald-400 flex items-center gap-0.5">
                  <mat-icon class="text-xs">verified_user</mat-icon> FALSIFIED (SAFE)
                </span>
              } @else {
                <span class="text-slate-400">HEALTHY</span>
              }

              <span class="text-slate-400">{{ node.category }}</span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class TopologyGraphComponent {
  readonly engine = inject(RippleEngineService);

  readonly renderedEdges = computed(() => {
    const nodes = this.engine.dynamicNodes();
    const edges = this.engine.dynamicEdges();

    const nodeMap = new Map<string, TopologyNode>();
    nodes.forEach((n) => nodeMap.set(n.id, n));

    return edges
      .map((edge) => {
        const fromNode = nodeMap.get(edge.from);
        const toNode = nodeMap.get(edge.to);
        if (!fromNode || !toNode) return null;

        // Convert percentage to coordinate approximations (standard svg viewBox)
        const x1 = fromNode.x * 10;
        const y1 = fromNode.y * 5.4;
        const x2 = toNode.x * 10;
        const y2 = toNode.y * 5.4;

        // Mid point for label
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        // Curved cubic bezier
        const dx = x2 - x1;
        const cx1 = x1 + dx * 0.45;
        const cy1 = y1;
        const cx2 = x1 + dx * 0.55;
        const cy2 = y2;
        const pathD = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;

        let strokeColor = '#475569';
        let strokeWidth = '2';
        let dashArray = '4 4';
        let markerEnd = 'url(#arrow-pending)';

        if (edge.falsifierVerdict === 'KEEP') {
          strokeColor = '#f43f5e';
          strokeWidth = '3.5';
          dashArray = 'none';
          markerEnd = 'url(#arrow-critical)';
        } else if (edge.falsifierVerdict === 'DOWNGRADE') {
          strokeColor = '#f59e0b';
          strokeWidth = '2.5';
          dashArray = '6 4';
          markerEnd = 'url(#arrow-downgrade)';
        } else if (edge.falsifierVerdict === 'KILL') {
          strokeColor = '#10b981';
          strokeWidth = '2';
          dashArray = '2 2';
          markerEnd = 'url(#arrow-killed)';
        }

        return {
          edge,
          pathD,
          midX,
          midY,
          strokeColor,
          strokeWidth,
          dashArray,
          markerEnd,
        };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);
  });

  getNodeIcon(node: TopologyNode): string {
    switch (node.category) {
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

  getNodeIconColor(node: TopologyNode): string {
    if (node.health === 'ROOT_ANOMALY') return 'text-rose-400';
    if (node.health === 'CRITICAL_RISK') return 'text-rose-400';
    if (node.health === 'DOWNGRADED_RISK') return 'text-amber-400';
    if (node.health === 'FALSIFIED_SAFE') return 'text-emerald-400';
    return 'text-cyan-400';
  }

  getErrorClass(node: TopologyNode): string {
    if (node.errorRatePercent > 5) return 'text-rose-400 font-bold';
    if (node.errorRatePercent > 0) return 'text-amber-400 font-bold';
    return 'text-emerald-400';
  }
}
