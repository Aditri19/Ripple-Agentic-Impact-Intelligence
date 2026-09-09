import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RippleEngineService } from '../services/ripple-engine.service';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <header class="bg-slate-900 border-b border-slate-800 px-4 py-3 select-none">
      <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <!-- Logo & Identity -->
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-lg">
            <mat-icon class="text-xl">hub</mat-icon>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-base font-bold text-white tracking-tight">RIPPLE</h1>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold">
                IMPACT INTELLIGENCE
              </span>
            </div>
            <p class="text-[11px] text-slate-400 hidden sm:block">
              Agentic Multi-Stage Failure Cascading & Adversarial Falsification Engine
            </p>
          </div>
        </div>

        <!-- Scenario Switcher & Actions -->
        <div class="flex flex-wrap items-center gap-2 sm:gap-3">
          <!-- Scenario Selector Dropdown -->
          <div class="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200">
            <mat-icon class="text-sm text-cyan-400 mr-2">timeline</mat-icon>
            <select
              [value]="engine.selectedScenarioId()"
              (change)="onScenarioChange($event)"
              class="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer pr-4"
            >
              @for (scenario of engine.scenarios(); track scenario.id) {
                <option [value]="scenario.id" class="bg-slate-900 text-slate-200 py-1">
                  {{ scenario.category }}: {{ scenario.title.slice(0, 48) }}...
                </option>
              }
            </select>
          </div>

          <!-- Ingest Custom Incident Button -->
          <button
            type="button"
            (click)="openCustomModal()"
            class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <mat-icon class="text-base text-cyan-400">add_circle_outline</mat-icon>
            <span>Live Incident Ingestion</span>
          </button>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  readonly engine = inject(RippleEngineService);

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
