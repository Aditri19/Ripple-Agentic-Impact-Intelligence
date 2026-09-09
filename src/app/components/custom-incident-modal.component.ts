import { ChangeDetectionStrategy, Component, inject, signal, HostListener } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RippleEngineService } from '../services/ripple-engine.service';

@Component({
  selector: 'app-custom-incident-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, ReactiveFormsModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none">
        <div class="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col text-slate-100 animate-in fade-in zoom-in-95 duration-200">
          <!-- Modal Header -->
          <div class="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <mat-icon class="text-lg">hub</mat-icon>
              </div>
              <div>
                <h3 class="text-sm font-bold text-white">Live Incident Ingestion Prompt</h3>
                <p class="text-[11px] text-slate-400">Trigger multi-agent parsing, topological pathfinding & falsification</p>
              </div>
            </div>

            <button
              type="button"
              (click)="close()"
              class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <mat-icon class="text-base">close</mat-icon>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-5 space-y-4">
            <!-- Preset Template Chips -->
            <div>
              <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Quick Incident Templates:
              </span>
              <div class="flex flex-wrap gap-1.5">
                @for (tmpl of presetPrompts; track tmpl.label) {
                  <button
                    type="button"
                    (click)="applyTemplate(tmpl.prompt, tmpl.cluster)"
                    class="px-2.5 py-1 rounded-lg text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
                  >
                    {{ tmpl.label }}
                  </button>
                }
              </div>
            </div>

            <!-- Custom Incident Prompt Input -->
            <div class="space-y-1.5">
              <label for="incident-prompt-input" class="text-xs font-semibold text-slate-200 block">
                Incident Anomaly Description / Alert Feed:
              </label>
              <textarea
                id="incident-prompt-input"
                [formControl]="promptControl"
                rows="4"
                placeholder="e.g. Postgres Primary connection pool exhausted (100% active). Read queries failing with connection timeout 500 error in us-west-2..."
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none font-mono"
              ></textarea>
            </div>

            <!-- Target Cluster -->
            <div class="space-y-1.5">
              <label for="target-cluster-input" class="text-xs font-semibold text-slate-200 block">
                Target Cluster Environment:
              </label>
              <input
                id="target-cluster-input"
                [formControl]="clusterControl"
                type="text"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
              />
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-3">
            <button
              type="button"
              (click)="close()"
              class="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="engine.isLiveAnalyzing() || promptControl.invalid"
              class="px-5 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              @if (engine.isLiveAnalyzing()) {
                <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Agents Deliberating...</span>
              } @else {
                <mat-icon class="text-base">play_arrow</mat-icon>
                <span>Run Agent Negotiation Loop</span>
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class CustomIncidentModalComponent {
  readonly engine = inject(RippleEngineService);
  readonly isOpen = signal<boolean>(false);

  readonly promptControl = new FormControl(
    'PostgreSQL primary connection pool saturation (98/100 connections held). Latency spiked to 2.4s causing Checkout DB writes to stall in us-west-2.',
    [Validators.required]
  );
  readonly clusterControl = new FormControl('prod-us-west2-k8s-cluster-01', [Validators.required]);

  readonly presetPrompts = [
    {
      label: 'PostgreSQL Pool Saturation',
      prompt: 'PostgreSQL primary connection pool saturation (98/100 connections held). Latency spiked to 2.4s causing Checkout DB writes to stall in us-west-2.',
      cluster: 'prod-us-west2-db-cluster',
    },
    {
      label: 'Kafka Partition Leader Rebalance',
      prompt: 'Kafka partition leader election timed out on orders-topic-03. Consumer lag spiked 42,000 messages on Analytics ETL stream.',
      cluster: 'prod-us-east1-kafka-mesh',
    },
    {
      label: 'Payment Vendor 504 Surge',
      prompt: 'External Payment Gateway returning 504 Gateway Timeout on 65% of credit card auth requests during promotional flash sale.',
      cluster: 'prod-eu-central1-pay-gw',
    },
  ];

  @HostListener('window:open-custom-incident-modal')
  openModal() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }

  applyTemplate(prompt: string, cluster: string) {
    this.promptControl.setValue(prompt);
    this.clusterControl.setValue(cluster);
  }

  onSubmit() {
    if (this.promptControl.invalid) return;
    const prompt = this.promptControl.value || '';
    const cluster = this.clusterControl.value || 'prod-us-west2';

    this.engine.analyzeCustomIncident(prompt, cluster);
    this.close();
  }
}
