import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RippleEngineService } from '../services/ripple-engine.service';

export type AppPage = 'home' | 'simulator' | 'falsifier' | 'backtest' | 'mitigations' | 'scoring';

@Component({
  selector: 'app-home-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 select-none">
      <!-- Confirmation Badge when Reset is Clicked -->
      @if (engine.justReset()) {
        <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <mat-icon class="text-xl">check_circle</mat-icon>
            </div>
            <div>
              <h4 class="text-sm font-bold text-emerald-900">Environment Reset Complete</h4>
              <p class="text-xs text-emerald-700">All deliberated states, tool investigations, and overrides have been cleared. You are ready to begin again!</p>
            </div>
          </div>
          <button
            type="button"
            (click)="startAutoplayFromHome()"
            class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <mat-icon class="text-base">play_arrow</mat-icon>
            <span>Start with Autoplay Now</span>
          </button>
        </div>
      }

      <!-- Hero Header Section -->
      <section class="relative bg-white/95 rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm overflow-hidden">
        <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-teal-100/50 via-sky-100/40 to-indigo-100/30 blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-gradient-to-tr from-rose-100/40 via-amber-100/30 to-teal-100/30 blur-3xl pointer-events-none"></div>

        <div class="relative z-10 max-w-3xl space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wide">
            <mat-icon class="text-sm text-teal-600">hub</mat-icon>
            <span>AGENTIC IMPACT INTELLIGENCE & SRE RESILIENCE</span>
          </div>

          <h1 class="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Stop cascading alert storms with <span class="text-teal-700 underline decoration-teal-300 decoration-wavy underline-offset-4">Adversarial Falsification</span>.
          </h1>

          <p class="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            When upstream infrastructure falters, traditional monitoring floods on-call engineers with hundreds of secondary alerts. Ripple orchestrates multi-agent deliberation and actively hunts for counter-evidence in observability tools to eliminate false alarms and confirm genuine cloud outages.
          </p>

          <!-- Primary Navigation CTA Action Buttons -->
          <div class="pt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              (click)="startAutoplayFromHome()"
              title="Launch the simulation workspace and automatically step through all multi-agent stages with animated ripple propagation"
              class="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all transform active:scale-98 cursor-pointer"
            >
              <mat-icon class="text-lg">play_arrow</mat-icon>
              <span>Start with Autoplay</span>
            </button>

            <button
              type="button"
              (click)="navigateTo('simulator')"
              title="Navigate to the interactive microservices architecture diagram and dependency graph"
              class="px-5 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200/80 text-slate-800 font-semibold text-sm border border-stone-300/80 flex items-center gap-2 transition-all cursor-pointer"
            >
              <mat-icon class="text-lg text-teal-600">schema</mat-icon>
              <span>Explore Topology Canvas</span>
            </button>

            <button
              type="button"
              (click)="engine.reset()"
              title="Reset simulation to step 1, clear all falsifier overrides, and start fresh"
              class="px-4 py-3 rounded-2xl bg-white hover:bg-stone-50 text-slate-600 hover:text-slate-900 font-semibold text-sm border border-stone-200 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <mat-icon class="text-base text-slate-500">replay</mat-icon>
              <span>Reset State</span>
            </button>

            <button
              type="button"
              (click)="openCustomModal()"
              title="Open dialog to enter any raw alert text and automatically synthesize a microservices dependency graph"
              class="px-4 py-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100/80 text-indigo-800 font-semibold text-sm border border-indigo-200 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <mat-icon class="text-base text-indigo-600">add_circle_outline</mat-icon>
              <span>Live Ingestion</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Active Incident Snapshot & Scenario Switcher Bar -->
      <section class="bg-white/90 rounded-2xl border border-stone-200/80 p-5 shadow-xs">
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shadow-xs">
              <mat-icon class="text-xl">warning_amber</mat-icon>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                  ACTIVE INCIDENT SCENARIO
                </span>
                <span class="text-xs font-mono text-slate-400">{{ engine.activeScenario().triggerEvent.timestamp }}</span>
              </div>
              <h2 class="text-base font-bold text-slate-900 mt-0.5">
                {{ engine.activeScenario().title }}
              </h2>
            </div>
          </div>

          <!-- Scenario Switcher Dropdown -->
          <div class="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-slate-700">
            <mat-icon class="text-sm text-teal-600">swap_horiz</mat-icon>
            <span class="font-medium text-slate-500">Change Scenario:</span>
            <select
              [value]="engine.selectedScenarioId()"
              (change)="onScenarioChange($event)"
              class="bg-transparent text-xs text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              @for (scenario of engine.scenarios(); track scenario.id) {
                <option [value]="scenario.id">
                  {{ scenario.category }}: {{ scenario.title.slice(0, 52) }}...
                </option>
              }
            </select>
          </div>
        </div>

        <!-- Metric Deviations Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
          <div class="bg-stone-50/80 p-3 rounded-xl border border-stone-200/60">
            <span class="text-[11px] font-mono text-slate-500 block">Measured Anomaly Magnitude:</span>
            <span class="text-sm font-bold text-amber-800 block mt-0.5">
              {{ engine.activeScenario().triggerEvent.magnitude }}
            </span>
          </div>

          <div class="bg-stone-50/80 p-3 rounded-xl border border-stone-200/60">
            <span class="text-[11px] font-mono text-slate-500 block">Statistical Deviation:</span>
            <span class="text-sm font-bold text-rose-700 block mt-0.5">
              {{ engine.activeScenario().triggerEvent.historicalPercentile }}th Percentile (P99)
            </span>
          </div>

          <div class="bg-stone-50/80 p-3 rounded-xl border border-stone-200/60">
            <span class="text-[11px] font-mono text-slate-500 block">Primary On-Call Squad:</span>
            <span class="text-sm font-semibold text-slate-800 block mt-0.5 truncate">
              {{ engine.activeScenario().triggerEvent.sreOwner }}
            </span>
          </div>

          <div class="bg-stone-50/80 p-3 rounded-xl border border-stone-200/60">
            <span class="text-[11px] font-mono text-slate-500 block">Candidate Root Cause:</span>
            <span class="text-sm font-semibold text-slate-700 block mt-0.5 truncate" [title]="engine.activeScenario().triggerEvent.rootCauseCandidate">
              {{ engine.activeScenario().triggerEvent.rootCauseCandidate }}
            </span>
          </div>
        </div>
      </section>

      <!-- All Features Showcase Grid -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-slate-900 tracking-tight">Available Platform Modules & Capabilities</h2>
            <p class="text-xs text-slate-500">Explore each dedicated section to test the end-to-end deliberation and verification flow.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- 1. Interactive Simulation & Autoplay -->
          <div class="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
            <div class="space-y-3">
              <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                <mat-icon class="text-xl">schema</mat-icon>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-bold text-slate-900">Topology DAG & Autoplay</h3>
                  <span class="text-[10px] px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 font-bold">Simulator</span>
                </div>
                <p class="text-xs text-slate-600 mt-1 leading-relaxed">
                  Interactive SVG canvas rendering microservice nodes, animated dependency links, live latency/error metrics, and stage-by-stage multi-agent progression.
                </p>
              </div>
            </div>
            <button
              type="button"
              (click)="navigateTo('simulator')"
              title="Open the interactive microservices canvas, live latency meters, and step playback"
              class="w-full py-2.5 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Open Simulation Workspace</span>
              <mat-icon class="text-sm">arrow_forward</mat-icon>
            </button>
          </div>

          <!-- 2. Adversarial Falsifier Workbench (Centerpiece) -->
          <div class="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
            <div class="space-y-3">
              <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                <mat-icon class="text-xl">security</mat-icon>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-bold text-slate-900">Adversarial Falsifier</h3>
                  <span class="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold">Centerpiece</span>
                </div>
                <p class="text-xs text-slate-600 mt-1 leading-relaxed">
                  Interrogates 5 grounded observability tools (GitOps Deploys, Circuit Breakers, Cache Replicas, Kafka Lag, Traces) to find counter-evidence and issue KILL / DOWNGRADE verdicts.
                </p>
              </div>
            </div>
            <button
              type="button"
              (click)="navigateTo('falsifier')"
              title="Open the adversarial engine to probe live infrastructure tools and hunt for counter-evidence"
              class="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Open Falsifier Workbench</span>
              <mat-icon class="text-sm">arrow_forward</mat-icon>
            </button>
          </div>

          <!-- 3. Empirical Backtest Benchmark (N=8) -->
          <div class="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
            <div class="space-y-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                <mat-icon class="text-xl">fact_check</mat-icon>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-bold text-slate-900">Backtest Benchmark (N=8)</h3>
                  <span class="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">Evaluation</span>
                </div>
                <p class="text-xs text-slate-600 mt-1 leading-relaxed">
                  Curated historical incident post-mortems demonstrating a 62.5% to 0.0% false alarm reduction while preserving 100% cascade recall across distributed topologies.
                </p>
              </div>
            </div>
            <button
              type="button"
              (click)="navigateTo('backtest')"
              title="View empirical performance against 8 historical real-world post-mortems"
              class="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Inspect Evaluation Benchmark</span>
              <mat-icon class="text-sm">arrow_forward</mat-icon>
            </button>
          </div>

          <!-- 4. Actionable SRE Mitigations -->
          <div class="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
            <div class="space-y-3">
              <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                <mat-icon class="text-xl">healing</mat-icon>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-bold text-slate-900">SRE Runbooks & Mitigations</h3>
                  <span class="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">Playbooks</span>
                </div>
                <p class="text-xs text-slate-600 mt-1 leading-relaxed">
                  Prioritized P1/P2/P3 recovery action plans with copyable shell and CLI scripts (kubectl, ceph, redis) targeting only confirmed critical cascade choke points.
                </p>
              </div>
            </div>
            <button
              type="button"
              (click)="navigateTo('mitigations')"
              title="View actionable recovery runbooks and copyable shell commands for on-call engineers"
              class="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>View SRE Action Plan</span>
              <mat-icon class="text-sm">arrow_forward</mat-icon>
            </button>
          </div>

          <!-- 5. Bayesian Scoring & Statistical Rigor -->
          <div class="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
            <div class="space-y-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                <mat-icon class="text-xl">functions</mat-icon>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-bold text-slate-900">Calibrated Scoring Engine</h3>
                  <span class="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-bold">Mathematics</span>
                </div>
                <p class="text-xs text-slate-600 mt-1 leading-relaxed">
                  Deep mathematical inspector showing Empirical Bayes base rates, cosine vector similarity against analog corpuses, and 95% Wilson score confidence intervals.
                </p>
              </div>
            </div>
            <button
              type="button"
              (click)="navigateTo('scoring')"
              title="Inspect Empirical Bayes mathematical formulations, cosine embeddings, and node telemetry details"
              class="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Inspect Mathematical Engine</span>
              <mat-icon class="text-sm">arrow_forward</mat-icon>
            </button>
          </div>

          <!-- 6. Live Incident Ingestion via Gemini -->
          <div class="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
            <div class="space-y-3">
              <div class="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                <mat-icon class="text-xl">auto_awesome</mat-icon>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-bold text-slate-900">Live Gemini Ingestion</h3>
                  <span class="text-[10px] px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 font-bold">Generative AI</span>
                </div>
                <p class="text-xs text-slate-600 mt-1 leading-relaxed">
                  Input any raw incident alert or post-mortem snippet to automatically synthesize a topological graph, dependency links, and multi-agent deliberation via Google Gemini.
                </p>
              </div>
            </div>
            <button
              type="button"
              (click)="openCustomModal()"
              title="Open ingestion dialog to paste any raw alert text and automatically synthesize a microservices DAG"
              class="w-full py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Launch Incident Ingestion</span>
              <mat-icon class="text-sm">arrow_forward</mat-icon>
            </button>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class HomeOverviewComponent {
  readonly engine = inject(RippleEngineService);
  readonly pageChange = output<AppPage>();

  navigateTo(page: AppPage) {
    this.pageChange.emit(page);
  }

  startAutoplayFromHome() {
    this.pageChange.emit('simulator');
    this.engine.startWithAutoplay();
  }

  onScenarioChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target && target.value) {
      this.engine.selectScenario(target.value);
    }
  }

  openCustomModal() {
    window.dispatchEvent(new CustomEvent('open-custom-incident-modal'));
  }
}
