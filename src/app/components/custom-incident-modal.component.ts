import { ChangeDetectionStrategy, Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RippleEngineService } from '../services/ripple-engine.service';

@Component({
  selector: 'app-custom-incident-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs select-none">
        <div class="bg-white border border-stone-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col text-slate-800 animate-in fade-in zoom-in-95 duration-200">
          <!-- Modal Header -->
          <div class="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/60">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shadow-xs">
                <mat-icon class="text-lg">hub</mat-icon>
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-900">Live Incident Ingestion Prompt</h3>
                <p class="text-xs text-slate-500">Trigger multi-agent parsing, topological pathfinding & falsification</p>
              </div>
            </div>

            <button
              type="button"
              (click)="close()"
              class="p-1.5 rounded-xl hover:bg-stone-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <mat-icon class="text-base">close</mat-icon>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-4">
            <!-- Preset Template Chips -->
            <div>
              <span class="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Quick Incident Templates:
              </span>
              <div class="flex flex-wrap gap-1.5">
                @for (tmpl of presetPrompts; track tmpl.label) {
                  <button
                    type="button"
                    (click)="applyTemplate(tmpl.prompt, tmpl.cluster)"
                    class="px-3 py-1.5 rounded-xl text-xs bg-stone-100 hover:bg-stone-200 text-slate-700 border border-stone-200 transition-colors cursor-pointer font-medium"
                  >
                    {{ tmpl.label }}
                  </button>
                }
              </div>
            </div>

            <!-- Custom Incident Prompt Input -->
            <div class="space-y-1.5">
              <label for="incident-prompt-input" class="text-xs font-bold text-slate-800 block">
                Incident Anomaly Description / Alert Feed:
              </label>
              <textarea
                id="incident-prompt-input"
                [formControl]="promptControl"
                rows="4"
                placeholder="e.g. Postgres Primary connection pool exhausted (100% active). Read queries failing with connection timeout 500 error in us-west-2..."
                class="w-full bg-stone-50 border border-stone-200 rounded-2xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none font-mono"
              ></textarea>
            </div>

            <!-- Target Cluster -->
            <div class="space-y-1.5">
              <label for="target-cluster-input" class="text-xs font-bold text-slate-800 block">
                Target Cluster Environment:
              </label>
              <input
                id="target-cluster-input"
                [formControl]="clusterControl"
                type="text"
                class="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400 font-mono"
              />
            </div>

            @if (isProcessing()) {
              <div class="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center gap-2.5 text-xs text-teal-900 animate-pulse">
                <span class="w-4 h-4 border-2 border-teal-700 border-t-transparent rounded-full animate-spin"></span>
                <span class="font-mono font-medium">{{ synthesisStage() }}</span>
              </div>
            }
          </div>

          <!-- Modal Footer -->
          <div class="p-4 border-t border-stone-200 bg-stone-50/60 flex items-center justify-between">
            <button
              type="button"
              (click)="close()"
              title="Cancel and close dialog"
              class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              (click)="submit()"
              [disabled]="promptControl.invalid || isProcessing()"
              title="Ingests raw incident alert, constructs a full distributed service graph, runs anomaly detection, and calibrates cascade risk"
              class="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              @if (isProcessing()) {
                <span class="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                <span>Ingesting & Synthesizing...</span>
              } @else {
                <mat-icon class="text-base">auto_awesome</mat-icon>
                <span>Synthesize Incident Model</span>
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
  readonly isProcessing = signal<boolean>(false);
  readonly synthesisStage = signal<string>('Parsing alert telemetry...');

  readonly promptControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(15)],
  });

  readonly clusterControl = new FormControl<string>('production-k8s-us-central1', {
    nonNullable: true,
  });

  readonly presetPrompts = [
    {
      label: 'Postgres Pool Saturation',
      cluster: 'prod-db-us-west-2',
      prompt: 'Postgres Primary connection pool exhausted (100% active, 200/200 connections held). Read-heavy API gateway queries failing with connection timeout 500 in us-west-2.',
    },
    {
      label: 'Kafka Partition Lag',
      cluster: 'streaming-pipeline-eu-west-1',
      prompt: 'Kafka ingestion partition 04 lag spiked to 480,000 messages. Worker consumer group failing offset commits due to memory pressure and tombstone accumulation.',
    },
    {
      label: 'Redis OOM Throttling',
      cluster: 'session-cache-east',
      prompt: 'Redis session store maxmemory limit reached (16GB). Eviction policy volatile-lru latency spiked 45ms and dropping session sync tokens for checkout service.',
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

  async submit() {
    if (this.promptControl.invalid) return;

    this.isProcessing.set(true);
    this.synthesisStage.set('Inferring dependency topology & anomaly metrics...');
    try {
      await this.engine.analyzeCustomIncident(
        this.promptControl.value,
        this.clusterControl.value
      );
      this.close();
      this.promptControl.reset();
      // Navigate to simulator page so user immediately sees the generated topology
      window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'simulator' }));
    } catch (err) {
      console.error('Failed to synthesize custom incident:', err);
    } finally {
      this.isProcessing.set(false);
    }
  }
}
