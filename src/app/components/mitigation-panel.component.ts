import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RippleEngineService } from '../services/ripple-engine.service';
import { ReportPlaceholderComponent } from './report-placeholder.component';

@Component({
  selector: 'app-mitigation-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule, ReportPlaceholderComponent],
  template: `
    <div class="h-full flex flex-col bg-white text-slate-800 overflow-y-auto select-none p-4 sm:p-6 space-y-5">
      @if (!engine.isAutoplayComplete()) {
        <!-- Dynamic Staging Placeholder when Autoplay hasn't run yet -->
        <app-report-placeholder
          reportName="Actionable SRE Mitigations & Runbooks"
          reportCategory="Remediation & Rollbacks"
          reportDescription="Synthesizes targeted commands and blast-radius containment playbooks specifically at validated choke points."
          icon="healing"
        />
      } @else {
        <!-- Section Header -->
        <div class="border-b border-stone-200 pb-4 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shadow-xs">
              <mat-icon class="text-xl">healing</mat-icon>
            </div>
            <div>
              <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
                Actionable SRE Mitigations & Playbooks
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  ✓ Deliberation Complete
                </span>
              </h2>
              <p class="text-xs text-slate-500 mt-0.5">
                Targeted, prioritized interventions focusing purely on confirmed critical cascade choke points.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
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

        <!-- Overview Stats -->
        <div class="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div>
            <span class="text-slate-500 block text-[11px]">Recommended Mitigations:</span>
            <span class="text-slate-900 font-bold text-base mt-0.5 block">
              {{ engine.activeScenario().mitigations.length }} Validated Actions
            </span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11px]">Est. Time To Remediate:</span>
            <span class="text-teal-700 font-bold text-base mt-0.5 block">
              {{ engine.activeScenario().evaluation.estimatedTimeToMitigateMin }} minutes
            </span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11px]">Noise Elimination:</span>
            <span class="text-emerald-700 font-bold text-base mt-0.5 block">
              65% fewer pages
            </span>
          </div>
        </div>

        <!-- Mitigation Action Cards -->
        <div class="space-y-4">
          @for (mitigation of engine.activeScenario().mitigations; track mitigation.title) {
            <div class="bg-stone-50/90 rounded-2xl p-4 sm:p-5 border border-stone-200 space-y-3 shadow-2xs">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span
                    [class.bg-rose-100_text-rose-800_border-rose-200]="mitigation.priority === 'P1'"
                    [class.bg-amber-100_text-amber-800_border-amber-200]="mitigation.priority === 'P2'"
                    [class.bg-sky-100_text-sky-800_border-sky-200]="mitigation.priority === 'P3'"
                    class="text-xs font-bold px-2.5 py-0.5 rounded-full border"
                  >
                    {{ mitigation.priority }} PRIORITY
                  </span>
                  <h3 class="text-sm font-bold text-slate-900">{{ mitigation.title }}</h3>
                </div>

                <span class="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-stone-200">
                  Target: {{ mitigation.targetService }}
                </span>
              </div>

              <p class="text-xs text-slate-600 leading-relaxed">{{ mitigation.rationale }}</p>

              <!-- Action Command Snippet -->
              <div class="bg-slate-950 rounded-xl p-3 text-xs font-mono text-slate-200 flex items-center justify-between gap-3 border border-slate-800 shadow-inner">
                <div class="overflow-x-auto select-all text-teal-300">
                  $ {{ mitigation.actionScript }}
                </div>
                <button
                  type="button"
                  (click)="copyCommand(mitigation.actionScript)"
                  class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                >
                  <mat-icon class="text-xs">content_copy</mat-icon>
                  <span>{{ copiedCommand() === mitigation.actionScript ? 'Copied!' : 'Copy' }}</span>
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class MitigationPanelComponent {
  readonly engine = inject(RippleEngineService);
  readonly copiedCommand = signal<string | null>(null);

  copyCommand(cmd: string) {
    navigator.clipboard?.writeText(cmd);
    this.copiedCommand.set(cmd);
    setTimeout(() => this.copiedCommand.set(null), 2000);
  }
}
