import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RippleEngineService } from '../services/ripple-engine.service';
import { AppPage } from './home-overview.component';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <header class="bg-white/95 backdrop-blur border-b border-stone-200/90 px-4 py-2.5 select-none sticky top-0 z-40 shadow-2xs">
      <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <!-- Brand & Logo -->
        <button
          type="button"
          class="flex items-center gap-3 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-teal-400 rounded-2xl"
          (click)="selectPage('home')"
        >
          <div class="w-9 h-9 rounded-2xl bg-teal-600 flex items-center justify-center shadow-sm text-white font-black text-lg">
            <mat-icon class="text-xl">hub</mat-icon>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-base font-extrabold text-slate-900 tracking-tight">RIPPLE</h1>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-bold">
                IMPACT INTELLIGENCE
              </span>
            </div>
            <p class="text-[11px] text-slate-500 hidden md:block">
              Cascading Failure Prediction & Adversarial Falsification Engine
            </p>
          </div>
        </button>

        <!-- Multi-Page Navigation Bar -->
        <nav class="flex items-center gap-1 overflow-x-auto py-1">
          <button
            type="button"
            (click)="selectPage('home')"
            title="Overview of Ripple, problem statement, architecture and feature directory"
            [class.bg-teal-50]="currentPage() === 'home'"
            [class.text-teal-800]="currentPage() === 'home'"
            [class.border-teal-200]="currentPage() === 'home'"
            [class.font-bold]="currentPage() === 'home'"
            [class.text-slate-600]="currentPage() !== 'home'"
            [class.border-transparent]="currentPage() !== 'home'"
            class="px-3 py-1.5 rounded-xl text-xs border transition-all flex items-center gap-1.5 hover:bg-stone-100/80 cursor-pointer whitespace-nowrap"
          >
            <mat-icon class="text-base text-teal-600">home</mat-icon>
            <span>Home</span>
          </button>

          <button
            type="button"
            (click)="selectPage('simulator')"
            title="Interactive dependency graph with live cascade propagation playback and autoplay"
            [class.bg-teal-50]="currentPage() === 'simulator'"
            [class.text-teal-800]="currentPage() === 'simulator'"
            [class.border-teal-200]="currentPage() === 'simulator'"
            [class.font-bold]="currentPage() === 'simulator'"
            [class.text-slate-600]="currentPage() !== 'simulator'"
            [class.border-transparent]="currentPage() !== 'simulator'"
            class="px-3 py-1.5 rounded-xl text-xs border transition-all flex items-center gap-1.5 hover:bg-stone-100/80 cursor-pointer whitespace-nowrap"
          >
            <mat-icon class="text-base text-teal-600">play_circle</mat-icon>
            <span>Simulator & Autoplay</span>
          </button>

          <button
            type="button"
            (click)="selectPage('falsifier')"
            title="Adversarial engine probing observability tools (GitOps, circuit breakers, cache) to kill false alarms"
            [class.bg-rose-50]="currentPage() === 'falsifier'"
            [class.text-rose-800]="currentPage() === 'falsifier'"
            [class.border-rose-200]="currentPage() === 'falsifier'"
            [class.font-bold]="currentPage() === 'falsifier'"
            [class.text-slate-600]="currentPage() !== 'falsifier'"
            [class.border-transparent]="currentPage() !== 'falsifier'"
            class="px-3 py-1.5 rounded-xl text-xs border transition-all flex items-center gap-1.5 hover:bg-stone-100/80 cursor-pointer whitespace-nowrap"
          >
            <mat-icon class="text-base text-rose-600">security</mat-icon>
            <span>Falsifier Tools</span>
            <span class="text-[9px] px-1 py-0.2 rounded bg-rose-100 text-rose-800 font-bold">Centerpiece</span>
          </button>

          <button
            type="button"
            (click)="selectPage('backtest')"
            title="Empirical validation suite across 8 historical real-world post-mortems"
            [class.bg-emerald-50]="currentPage() === 'backtest'"
            [class.text-emerald-800]="currentPage() === 'backtest'"
            [class.border-emerald-200]="currentPage() === 'backtest'"
            [class.font-bold]="currentPage() === 'backtest'"
            [class.text-slate-600]="currentPage() !== 'backtest'"
            [class.border-transparent]="currentPage() !== 'backtest'"
            class="px-3 py-1.5 rounded-xl text-xs border transition-all flex items-center gap-1.5 hover:bg-stone-100/80 cursor-pointer whitespace-nowrap"
          >
            <mat-icon class="text-base text-emerald-600">fact_check</mat-icon>
            <span>Backtest (N=8)</span>
          </button>

          <button
            type="button"
            (click)="selectPage('mitigations')"
            title="SRE recovery action plans, circuit breaker policies, and copyable CLI commands"
            [class.bg-amber-50]="currentPage() === 'mitigations'"
            [class.text-amber-800]="currentPage() === 'mitigations'"
            [class.border-amber-200]="currentPage() === 'mitigations'"
            [class.font-bold]="currentPage() === 'mitigations'"
            [class.text-slate-600]="currentPage() !== 'mitigations'"
            [class.border-transparent]="currentPage() !== 'mitigations'"
            class="px-3 py-1.5 rounded-xl text-xs border transition-all flex items-center gap-1.5 hover:bg-stone-100/80 cursor-pointer whitespace-nowrap"
          >
            <mat-icon class="text-base text-amber-600">healing</mat-icon>
            <span>Mitigations</span>
          </button>

          <button
            type="button"
            (click)="selectPage('scoring')"
            title="Bayesian probability formulation, vector embeddings, and node telemetry inspector"
            [class.bg-indigo-50]="currentPage() === 'scoring'"
            [class.text-indigo-800]="currentPage() === 'scoring'"
            [class.border-indigo-200]="currentPage() === 'scoring'"
            [class.font-bold]="currentPage() === 'scoring'"
            [class.text-slate-600]="currentPage() !== 'scoring'"
            [class.border-transparent]="currentPage() !== 'scoring'"
            class="px-3 py-1.5 rounded-xl text-xs border transition-all flex items-center gap-1.5 hover:bg-stone-100/80 cursor-pointer whitespace-nowrap"
          >
            <mat-icon class="text-base text-indigo-600">functions</mat-icon>
            <span>Scoring & Inspector</span>
          </button>
        </nav>

        <!-- Right Quick Actions -->
        <div class="flex items-center gap-2">
          <!-- Reset Global Button -->
          <button
            type="button"
            (click)="engine.reset()"
            title="Reset simulation to step 1, clear all falsifier overrides, and start fresh"
            class="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 border border-stone-200 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
          >
            <mat-icon class="text-sm">replay</mat-icon>
            <span class="hidden sm:inline">Reset</span>
          </button>

          <!-- Ingest Custom Incident Button -->
          <button
            type="button"
            (click)="openCustomModal()"
            title="Ingest any raw alert log or incident description to dynamically generate a new dependency graph"
            class="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <mat-icon class="text-base">add_circle_outline</mat-icon>
            <span class="hidden sm:inline">Live Incident Ingestion</span>
          </button>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  readonly engine = inject(RippleEngineService);
  readonly currentPage = input<AppPage>('home');
  readonly pageChange = output<AppPage>();

  selectPage(page: AppPage) {
    this.pageChange.emit(page);
  }

  openCustomModal() {
    window.dispatchEvent(new CustomEvent('open-custom-incident-modal'));
  }
}
