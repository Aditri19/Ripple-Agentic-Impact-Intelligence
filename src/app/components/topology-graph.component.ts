import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RippleEngineService } from '../services/ripple-engine.service';
import { TopologyNode, TopologyEdge } from '../models/ripple.types';

interface RenderedEdge {
  edge: TopologyEdge;
  pathD: string;
  midX: number;
  midY: number;
  strokeColor: string;
  strokeWidth: string;
  dashArray: string;
  markerEnd: string;
  isHighlighted: boolean;
}

@Component({
  selector: 'app-topology-graph',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="relative w-full h-[520px] lg:h-[580px] bg-white rounded-3xl border border-stone-200/90 p-4 flex flex-col overflow-hidden select-none shadow-xs">
      <!-- Graph Header & Quick Legend -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-3 z-10">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center">
            <mat-icon class="text-base">schema</mat-icon>
          </div>
          <span class="text-xs font-bold uppercase tracking-wider text-slate-800">
            System Dependency Topology & Cascade DAG
          </span>
        </div>

        <!-- Legend with Pastel Badges -->
        <div class="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-600">
          <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800">
            <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Root Anomaly</span>
          </div>
          <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-800">
            <span class="w-2 h-2 rounded bg-red-600"></span>
            <span>Critical Cascade (Keep)</span>
          </div>
          <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800">
            <span class="w-2 h-2 rounded bg-amber-500"></span>
            <span>Downgraded</span>
          </div>
          <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800">
            <span class="w-2 h-2 rounded bg-emerald-600"></span>
            <span>Falsified (Safe)</span>
          </div>
        </div>
      </div>

      <!-- Graph Canvas Container (horizontal scroll fallback on narrow mobile screens) -->
      <div class="relative flex-1 w-full h-full rounded-2xl bg-[#fafbfa] border border-stone-200/80 overflow-x-auto overflow-y-hidden">
        <div class="relative w-full min-w-[640px] h-full">
          <!-- Subtle Grid Pattern Background -->
          <svg class="absolute inset-0 w-full h-full pointer-events-none opacity-40 z-0">
            <defs>
              <pattern id="grid-pattern" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#cbd5e1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>

          <!-- SVG Canvas for Connecting Edges & Badges (Phase-locked to HTML nodes via 1000x600 viewBox) -->
          <svg
            class="absolute inset-0 w-full h-full pointer-events-auto z-10"
            viewBox="0 0 1000 600"
            preserveAspectRatio="none"
          >
            <defs>
              <!-- Arrowhead Markers -->
              <marker id="arrow-critical" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M 0 0 L 8 4 L 0 8 z" fill="#e11d48" />
              </marker>
              <marker id="arrow-downgrade" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M 0 0 L 8 4 L 0 8 z" fill="#d97706" />
              </marker>
              <marker id="arrow-pending" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M 0 0 L 8 4 L 0 8 z" fill="#94a3b8" />
              </marker>
              <marker id="arrow-killed" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M 0 0 L 8 4 L 0 8 z" fill="#059669" />
              </marker>

              <!-- Drop shadow filter for verdict badges -->
              <filter id="badge-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#0f172a" flood-opacity="0.1" />
              </filter>
            </defs>

            @for (edge of renderedEdges(); track edge.edge.id) {
              <!-- Background interactive wider stroke for easy click -->
              <path
                [attr.d]="edge.pathD"
                (click)="engine.selectEdge(edge.edge.id)"
                fill="none"
                stroke="transparent"
                stroke-width="26"
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
              <g
                [attr.transform]="'translate(' + edge.midX + ',' + edge.midY + ')'"
                class="cursor-pointer transition-transform duration-200"
                (click)="engine.selectEdge(edge.edge.id)"
              >
                @if (edge.edge.falsifierVerdict === 'KILL') {
                  <rect
                    x="-54"
                    y="-12"
                    width="108"
                    height="24"
                    rx="8"
                    fill="#ffffff"
                    stroke="#059669"
                    stroke-width="1.6"
                    filter="url(#badge-shadow)"
                  />
                  <rect x="-54" y="-12" width="108" height="24" rx="8" fill="#ecfdf5" fill-opacity="0.85" />
                  <text x="0" y="4" text-anchor="middle" fill="#065f46" font-size="10" font-weight="bold" font-family="system-ui, sans-serif">
                    🛡️ KILLED (0% Risk)
                  </text>
                } @else if (edge.edge.falsifierVerdict === 'DOWNGRADE') {
                  <rect
                    x="-55"
                    y="-12"
                    width="110"
                    height="24"
                    rx="8"
                    fill="#ffffff"
                    stroke="#d97706"
                    stroke-width="1.6"
                    filter="url(#badge-shadow)"
                  />
                  <rect x="-55" y="-12" width="110" height="24" rx="8" fill="#fffbeb" fill-opacity="0.85" />
                  <text x="0" y="4" text-anchor="middle" fill="#92400e" font-size="10" font-weight="bold" font-family="system-ui, sans-serif">
                    📉 {{ (edge.edge.calibratedProbability * 100).toFixed(0) }}% Risk (Down)
                  </text>
                } @else if (edge.edge.falsifierVerdict === 'KEEP') {
                  <rect
                    x="-53"
                    y="-12"
                    width="106"
                    height="24"
                    rx="8"
                    fill="#ffffff"
                    stroke="#e11d48"
                    stroke-width="1.8"
                    filter="url(#badge-shadow)"
                  />
                  <rect x="-53" y="-12" width="106" height="24" rx="8" fill="#fff1f2" fill-opacity="0.85" />
                  <text x="0" y="4" text-anchor="middle" fill="#9f1239" font-size="10" font-weight="bold" font-family="system-ui, sans-serif">
                    ⚠️ {{ (edge.edge.calibratedProbability * 100).toFixed(0) }}% Risk (KEEP)
                  </text>
                } @else {
                  <rect
                    x="-42"
                    y="-10"
                    width="84"
                    height="20"
                    rx="6"
                    fill="#ffffff"
                    stroke="#cbd5e1"
                    stroke-width="1.2"
                    filter="url(#badge-shadow)"
                  />
                  <text x="0" y="4" text-anchor="middle" fill="#64748b" font-size="9" font-weight="600" font-family="system-ui, sans-serif">
                    {{ (edge.edge.priorProbability * 100).toFixed(0) }}% prior
                  </text>
                }
              </g>
            }
          </svg>

          <!-- HTML Interactive Nodes (Positioned cleanly with exact percentages) -->
          @for (node of engine.dynamicNodes(); track node.id) {
            <div
              tabindex="0"
              role="button"
              (click)="engine.selectNode(node.id)"
              (keydown.enter)="engine.selectNode(node.id)"
              (keydown.space)="engine.selectNode(node.id)"
              [style.left.%]="node.x"
              [style.top.%]="node.y"
              [class.ring-3]="engine.selectedNodeId() === node.id || engine.activeHighlightedNode()?.id === node.id"
              [class.ring-teal-400]="engine.selectedNodeId() === node.id || engine.activeHighlightedNode()?.id === node.id"
              [class.ring-offset-2]="engine.selectedNodeId() === node.id || engine.activeHighlightedNode()?.id === node.id"
              [class.scale-102]="engine.selectedNodeId() === node.id || engine.activeHighlightedNode()?.id === node.id"
              class="absolute -translate-x-1/2 -translate-y-1/2 w-[184px] p-2.5 rounded-2xl border-2 transition-all duration-300 cursor-pointer shadow-sm z-20"
              [class.bg-rose-50_border-rose-400]="node.health === 'ROOT_ANOMALY'"
              [class.bg-red-50_border-red-400]="node.health === 'CRITICAL_RISK'"
              [class.bg-amber-50_border-amber-300]="node.health === 'DOWNGRADED_RISK'"
              [class.bg-emerald-50_border-emerald-400]="node.health === 'FALSIFIED_SAFE'"
              [class.bg-white_border-stone-300]="node.health === 'HEALTHY'"
            >
              <!-- Node Header -->
              <div class="flex items-start justify-between gap-1 mb-1">
                <div class="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                  <mat-icon class="text-base shrink-0" [class]="getNodeIconColor(node)">
                    {{ getNodeIcon(node) }}
                  </mat-icon>
                  <span class="text-[11.5px] font-bold text-slate-900 leading-snug truncate" [title]="node.name">
                    {{ node.name }}
                  </span>
                </div>

                <!-- Tier Pill -->
                <span class="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-stone-100 text-slate-600 border border-stone-200 shrink-0">
                  {{ node.tier }}
                </span>
              </div>

              <!-- Metric Stats row -->
              <div class="flex items-center justify-between text-[10px] text-slate-600 font-mono mt-1 pt-1 border-t border-stone-200/80">
                <span>p99: {{ node.p99LatencyMs }}ms</span>
                <span [class]="getErrorClass(node)">Err: {{ node.errorRatePercent }}%</span>
              </div>

              <!-- Health Status Badge -->
              <div class="mt-1 flex items-center justify-between text-[9px] font-bold">
                @if (node.health === 'ROOT_ANOMALY') {
                  <span class="text-rose-700 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                    ROOT TRIGGER
                  </span>
                } @else if (node.health === 'CRITICAL_RISK') {
                  <span class="text-red-700">⚠️ CASCADE RISK (P1)</span>
                } @else if (node.health === 'DOWNGRADED_RISK') {
                  <span class="text-amber-800">📉 MITIGATED (P3)</span>
                } @else if (node.health === 'FALSIFIED_SAFE') {
                  <span class="text-emerald-700 flex items-center gap-0.5">
                    <mat-icon class="text-xs">verified_user</mat-icon> FALSIFIED (SAFE)
                  </span>
                } @else {
                  <span class="text-slate-500">HEALTHY</span>
                }

                <span class="text-[9px] text-slate-400 font-medium uppercase">{{ node.category }}</span>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class TopologyGraphComponent {
  readonly engine = inject(RippleEngineService);

  readonly renderedEdges = computed<RenderedEdge[]>(() => {
    const nodes = this.engine.dynamicNodes();
    const edges = this.engine.dynamicEdges();
    const activeEdgeId = this.engine.activeHighlightedEdge()?.id;
    const selectedEdgeId = this.engine.selectedEdgeId();

    const nodeMap = new Map<string, TopologyNode>();
    nodes.forEach((n) => nodeMap.set(n.id, n));

    const CARD_HALF_W = 95;
    const CARD_HALF_H = 42;

    const list = edges
      .map((edge) => {
        const fromNode = nodeMap.get(edge.from);
        const toNode = nodeMap.get(edge.to);
        if (!fromNode || !toNode) return null;

        // Centers in 1000 x 600 coordinate system
        const c1x = fromNode.x * 10;
        const c1y = fromNode.y * 6;
        const c2x = toNode.x * 10;
        const c2y = toNode.y * 6;

        // Clip path to card boundaries so lines never penetrate cards or cover text
        const start = this.getBoxIntersection(c1x, c1y, c2x, c2y, CARD_HALF_W, CARD_HALF_H, 0);
        // Leave 12 units of clearance at target for arrowhead marker
        const end = this.getBoxIntersection(c2x, c2y, c1x, c1y, CARD_HALF_W, CARD_HALF_H, 12);

        const dx = end.x - start.x;
        const dy = end.y - start.y;

        let pathD = '';
        let midX = (start.x + end.x) / 2;
        let midY = (start.y + end.y) / 2;

        if (Math.abs(dy) < 12) {
          // Horizontal connection
          pathD = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
          midX = (start.x + end.x) / 2;
          midY = (start.y + end.y) / 2;
        } else {
          // Curved cubic Bezier for diagonal dependencies
          const cx1 = start.x + dx * 0.42;
          const cy1 = start.y;
          const cx2 = start.x + dx * 0.58;
          const cy2 = end.y;

          pathD = `M ${start.x} ${start.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${end.x} ${end.y}`;

          // Precise Bezier midpoint at t = 0.5
          midX = 0.125 * start.x + 0.375 * cx1 + 0.375 * cx2 + 0.125 * end.x;
          midY = 0.125 * start.y + 0.375 * cy1 + 0.375 * cy2 + 0.125 * end.y;
        }

        const isHighlighted = edge.id === activeEdgeId || edge.id === selectedEdgeId;

        let strokeColor = '#94a3b8';
        let strokeWidth = isHighlighted ? '3' : '2';
        let dashArray = '4 4';
        let markerEnd = 'url(#arrow-pending)';

        if (edge.falsifierVerdict === 'KEEP') {
          strokeColor = '#e11d48';
          strokeWidth = isHighlighted ? '4' : '3';
          dashArray = 'none';
          markerEnd = 'url(#arrow-critical)';
        } else if (edge.falsifierVerdict === 'DOWNGRADE') {
          strokeColor = '#d97706';
          strokeWidth = isHighlighted ? '3.5' : '2.5';
          dashArray = '6 4';
          markerEnd = 'url(#arrow-downgrade)';
        } else if (edge.falsifierVerdict === 'KILL') {
          strokeColor = '#059669';
          strokeWidth = isHighlighted ? '3' : '2.2';
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
          isHighlighted,
        };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);

    // Sort so active/highlighted edges render on top of pending/other edges
    return list.sort((a, b) => {
      if (a.isHighlighted && !b.isHighlighted) return 1;
      if (!a.isHighlighted && b.isHighlighted) return -1;
      return 0;
    });
  });

  private getBoxIntersection(
    cx: number,
    cy: number,
    targetX: number,
    targetY: number,
    halfW: number,
    halfH: number,
    extraPadding: number
  ): { x: number; y: number } {
    const dx = targetX - cx;
    const dy = targetY - cy;
    if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) {
      return { x: cx, y: cy };
    }
    const w = halfW + extraPadding;
    const h = halfH + extraPadding;
    const scaleX = Math.abs(dx) > 0.0001 ? w / Math.abs(dx) : 1e9;
    const scaleY = Math.abs(dy) > 0.0001 ? h / Math.abs(dy) : 1e9;
    const scale = Math.min(scaleX, scaleY);
    return {
      x: cx + dx * scale,
      y: cy + dy * scale,
    };
  }

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
    if (node.health === 'ROOT_ANOMALY') return 'text-rose-600';
    if (node.health === 'CRITICAL_RISK') return 'text-red-600';
    if (node.health === 'DOWNGRADED_RISK') return 'text-amber-600';
    if (node.health === 'FALSIFIED_SAFE') return 'text-emerald-600';
    return 'text-teal-600';
  }

  getErrorClass(node: TopologyNode): string {
    if (node.errorRatePercent > 5) return 'text-rose-600 font-bold';
    if (node.errorRatePercent > 0) return 'text-amber-600 font-bold';
    return 'text-emerald-600 font-bold';
  }
}

