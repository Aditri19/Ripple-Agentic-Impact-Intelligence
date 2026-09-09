import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RippleEngineService } from '../services/ripple-engine.service';

@Component({
  selector: 'app-report-placeholder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="max-w-4xl mx-auto w-full py-6 px-4 space-y-6 select-none animate-in fade-in duration-300">
      <!-- Top Staging Badge & Title Header -->
      <div class="bg-stone-50 border border-stone-200/90 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xs relative overflow-hidden">
        <div class="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-teal-50/50 pointer-events-none blur-2xl"></div>

        <!-- Animated Icon Ring -->
        <div class="mx-auto w-16 h-16 rounded-3xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-xs relative">
          <mat-icon class="text-3xl animate-pulse">{{ icon() }}</mat-icon>
          <span class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-white ring-1 ring-amber-300"></span>
        </div>

        <!-- The Target User Message Heading -->
        <div class="space-y-2 max-w-2xl mx-auto">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono font-semibold">
            <mat-icon class="text-sm text-amber-600">hourglass_top</mat-icon>
            <span>REPORT GENERATION PENDING AUTOPLAY</span>
          </div>

          <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Start with Autoplay for any project to view the reports.
          </h2>

          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Ripple avoids hardcoded static mockups by synthesizing {{ reportName() }} dynamically during the multi-agent deliberation cycle. Run the incident cascade simulation on any project to probe infrastructure, compute Bayesian risks, and compile actionable results.
          </p>
        </div>

        <!-- Active Project Scope Banner -->
        <div class="max-w-xl mx-auto bg-white rounded-2xl p-4 border border-stone-200 text-left shadow-2xs space-y-2">
          <div class="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500">
            <span class="font-bold text-slate-700 flex items-center gap-1.5">
              <mat-icon class="text-sm text-teal-600">layers</mat-icon>
              Selected Target Incident:
            </span>
            <span class="px-2 py-0.5 rounded bg-stone-100 text-slate-600 font-semibold border border-stone-200 text-[11px]">
              {{ engine.activeScenario().category }}
            </span>
          </div>

          <h3 class="text-sm font-bold text-slate-900">
            {{ engine.activeScenario().title }}
          </h3>

          <div class="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 font-mono">
            <span>{{ engine.activeScenario().nodes.length }} Services</span>
            <span>•</span>
            <span>{{ engine.activeScenario().edges.length }} Dependency Links</span>
            <span>•</span>
            <span class="text-rose-700 font-semibold">{{ engine.activeScenario().triggerEvent.magnitude }}</span>
          </div>
        </div>

        <!-- In-Progress Live Deliberation Banner (when running) -->
        @if (engine.isSimulatingDeliberation()) {
          <div class="max-w-xl mx-auto bg-teal-50 border border-teal-200 rounded-2xl p-4 text-left space-y-2.5 animate-in fade-in duration-200">
            <div class="flex items-center justify-between text-xs font-mono font-bold text-teal-950">
              <span class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-teal-600 animate-ping"></span>
                <span>DELIBERATING & PROBING INCIDENT...</span>
              </span>
              <span>{{ engine.deliberationProgress().toFixed(0) }}%</span>
            </div>

            <div class="w-full bg-stone-200/80 rounded-full h-2 overflow-hidden">
              <div
                class="bg-teal-600 h-full rounded-full transition-all duration-300"
                [style.width.%]="engine.deliberationProgress()"
              ></div>
            </div>

            <p class="text-xs font-mono text-teal-900 truncate">
              {{ engine.deliberationStage() }}
            </p>
          </div>
        }

        <!-- Actions -->
        <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            (click)="engine.startAutoplayAndNavigate()"
            [disabled]="engine.isSimulatingDeliberation()"
            title="Switch to the simulation view and automatically run all 5 multi-agent deliberation stages to generate reports"
            class="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <mat-icon class="text-base">play_arrow</mat-icon>
            <span>Start with Autoplay in Simulation</span>
          </button>

          <button
            type="button"
            (click)="engine.runFastDeliberationCycle()"
            [disabled]="engine.isSimulatingDeliberation()"
            title="Execute the 5-stage deliberation cycle directly on this page to dynamically generate the reports in seconds"
            class="px-5 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200/80 disabled:opacity-50 text-slate-800 font-semibold text-xs sm:text-sm border border-stone-300/80 flex items-center gap-2 transition-all cursor-pointer"
          >
            <mat-icon class="text-base text-teal-600">bolt</mat-icon>
            <span>Run Autoplay & Generate Reports Here</span>
          </button>

          <button
            type="button"
            (click)="engine.completeAutoplayImmediately()"
            title="Directly reveal the calibrated report without waiting"
            class="px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
          >
            Skip to Generated Report →
          </button>
        </div>
      </div>

      <!-- Deliberation Pipeline Explanation Cards -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div class="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs space-y-1.5">
          <div class="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 text-xs font-mono font-bold flex items-center justify-center">1</div>
          <h4 class="text-xs font-bold text-slate-900">Alert Ingestion</h4>
          <p class="text-[11px] text-slate-500 leading-snug">Parses MCP alerts, extracts P99 spike metrics, and isolates root blast radius.</p>
        </div>

        <div class="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs space-y-1.5">
          <div class="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 text-xs font-mono font-bold flex items-center justify-center">2</div>
          <h4 class="text-xs font-bold text-slate-900">Dependency DAG</h4>
          <p class="text-[11px] text-slate-500 leading-snug">Traverses call graphs and downstream consumers across Kubernetes microservices.</p>
        </div>

        <div class="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs space-y-1.5">
          <div class="w-6 h-6 rounded-lg bg-rose-50 text-rose-700 text-xs font-mono font-bold flex items-center justify-center">3</div>
          <h4 class="text-xs font-bold text-slate-900">Adversarial Probe</h4>
          <p class="text-[11px] text-slate-500 leading-snug">Queries GitOps commits, circuit breakers, and caches to falsify spurious alerts.</p>
        </div>

        <div class="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs space-y-1.5">
          <div class="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-mono font-bold flex items-center justify-center">4</div>
          <h4 class="text-xs font-bold text-slate-900">Risk Calibration</h4>
          <p class="text-[11px] text-slate-500 leading-snug">Calculates Empirical Bayes probabilities and updates edge cascade weights.</p>
        </div>

        <div class="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs space-y-1.5">
          <div class="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 text-xs font-mono font-bold flex items-center justify-center">5</div>
          <h4 class="text-xs font-bold text-slate-900">Report Synthesis</h4>
          <p class="text-[11px] text-slate-500 leading-snug">Compiles SRE runbooks, mitigation commands, and backtest evaluations.</p>
        </div>
      </div>
    </div>
  `,
})
export class ReportPlaceholderComponent {
  readonly engine = inject(RippleEngineService);

  readonly reportName = input.required<string>();
  readonly reportCategory = input<string>('Dynamic Synthesis');
  readonly reportDescription = input<string>('');
  readonly icon = input<string>('analytics');
}
