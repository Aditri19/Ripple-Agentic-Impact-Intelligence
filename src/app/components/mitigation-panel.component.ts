import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RippleEngineService } from '../services/ripple-engine.service';

@Component({
  selector: 'app-mitigation-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="h-full flex flex-col bg-slate-900 border-l border-slate-800 text-slate-100 overflow-y-auto custom-scrollbar select-none p-4 space-y-4">
      <!-- Section Header -->
      <div class="border-b border-slate-800 pb-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <mat-icon class="text-cyan-400 text-xl">healing</mat-icon>
            <div>
              <h2 class="text-sm font-bold text-white flex items-center gap-2">
                Actionable Mitigations & Playbook
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                  Synthesis Engine
                </span>
              </h2>
              <p class="text-[11px] text-slate-400">
                Prioritized interventions targeting confirmed high-risk cascade choke points
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Overview Stats -->
      <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
        <div>
          <span class="text-slate-400 block text-[10px]">Active Mitigations:</span>
          <span class="text-white font-bold text-sm">{{ engine.activeScenario().mitigations.length }} Recommended Actions</span>
        </div>
        <div class="text-right">
          <span class="text-slate-400 block text-[10px]">Est. Time To Remediate:</span>
          <span class="text-cyan-300 font-bold text-sm">
            {{ engine.activeScenario().evaluation.estimatedTimeToMitigateMin }} minutes
          </span>
        </div>
      </div>

      <!-- Mitigation Action Cards -->
      <div class="space-y-3">
        @for (mitigation of engine.activeScenario().mitigations; track mitigation.title) {
          <div class="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 space-y-2.5 text-xs">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span
                  [class.bg-rose-500_20]="mitigation.priority === 'P1'"
                  [class.text-rose-300]="mitigation.priority === 'P1'"
                  [class.border-rose-500_40]="mitigation.priority === 'P1'"
                  [class.bg-amber-500_20]="mitigation.priority === 'P2'"
                  [class.text-amber-300]="mitigation.priority === 'P2'"
                  [class.border-amber-500_40]="mitigation.priority === 'P2'"
                  [class.bg-blue-500_20]="mitigation.priority === 'P3'"
                  [class.text-blue-300]="mitigation.priority === 'P3'"
                  [class.border-blue-500_40]="mitigation.priority === 'P3'"
                  class="text-[10px] font-bold px-2 py-0.5 rounded border"
                >
                  {{ mitigation.priority }}
                </span>
                <h4 class="font-bold text-white text-xs">{{ mitigation.title }}</h4>
              </div>

              <span class="text-[10px] font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {{ mitigation.targetService }}
              </span>
            </div>

            <p class="text-[11px] text-slate-300 leading-relaxed">{{ mitigation.rationale }}</p>

            <!-- Executable CLI Command Box -->
            <div class="bg-slate-900 rounded-lg p-2.5 border border-slate-800 font-mono text-[11px]">
              <div class="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                <span>Remediation CLI:</span>
                <button
                  type="button"
                  (click)="copyScript(mitigation.actionScript)"
                  class="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <mat-icon class="text-xs">content_copy</mat-icon>
                  <span>{{ copiedText() === mitigation.actionScript ? 'Copied!' : 'Copy' }}</span>
                </button>
              </div>
              <code class="text-emerald-300 break-all select-all block">{{ mitigation.actionScript }}</code>
            </div>
          </div>
        }
      </div>
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
export class MitigationPanelComponent {
  readonly engine = inject(RippleEngineService);
  readonly copiedText = signal<string | null>(null);

  copyScript(text: string) {
    navigator.clipboard.writeText(text);
    this.copiedText.set(text);
    setTimeout(() => this.copiedText.set(null), 2000);
  }
}
