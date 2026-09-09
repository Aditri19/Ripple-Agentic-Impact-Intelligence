import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RippleEngineService } from '../services/ripple-engine.service';

@Component({
  selector: 'app-playback-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <section class="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 select-none">
      <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <!-- Step Navigation Controls -->
        <div class="flex items-center gap-2">
          <!-- Reset -->
          <button
            type="button"
            (click)="engine.reset()"
            title="Reset to Step 1"
            class="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
          >
            <mat-icon class="text-base">replay</mat-icon>
          </button>

          <!-- Prev Step -->
          <button
            type="button"
            (click)="engine.prevStep()"
            [disabled]="engine.currentStepIndex() <= 1"
            title="Previous Step"
            class="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-30 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
          >
            <mat-icon class="text-base">skip_previous</mat-icon>
          </button>

          <!-- Play / Pause Auto-Playback -->
          <button
            type="button"
            (click)="engine.toggleAutoPlay()"
            [class.bg-emerald-600]="engine.isAutoPlaying()"
            [class.hover:bg-emerald-500]="engine.isAutoPlaying()"
            [class.bg-cyan-600]="!engine.isAutoPlaying()"
            [class.hover:bg-cyan-500]="!engine.isAutoPlaying()"
            class="px-4 py-2 rounded-xl text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <mat-icon class="text-base">{{ engine.isAutoPlaying() ? 'pause' : 'play_arrow' }}</mat-icon>
            <span>{{ engine.isAutoPlaying() ? 'Pause Simulation' : 'Auto Play' }}</span>
          </button>

          <!-- Next Step -->
          <button
            type="button"
            (click)="engine.nextStep()"
            [disabled]="engine.currentStepIndex() >= engine.totalSteps()"
            title="Next Step"
            class="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-30 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
          >
            <mat-icon class="text-base">skip_next</mat-icon>
          </button>

          <!-- Playback Speed -->
          <div class="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-[11px] font-mono">
            @for (spd of [1, 2, 4]; track spd) {
              <button
                type="button"
                (click)="engine.setSpeed(spd)"
                [class.bg-cyan-600]="engine.playbackSpeed() === spd"
                [class.text-white]="engine.playbackSpeed() === spd"
                [class.text-slate-400]="engine.playbackSpeed() !== spd"
                class="px-2 py-1 rounded-lg transition-colors cursor-pointer"
              >
                {{ spd }}x
              </button>
            }
          </div>
        </div>

        <!-- Stage Timeline Steps Indicators -->
        <div class="flex items-center gap-1.5 overflow-x-auto py-1">
          @for (step of engine.activeScenario().steps; track step.stepIndex) {
            <button
              type="button"
              (click)="engine.goToStep(step.stepIndex)"
              [class.bg-cyan-500]="engine.currentStepIndex() === step.stepIndex"
              [class.text-white]="engine.currentStepIndex() === step.stepIndex"
              [class.border-cyan-400]="engine.currentStepIndex() === step.stepIndex"
              [class.bg-slate-800]="engine.currentStepIndex() > step.stepIndex"
              [class.text-emerald-400]="engine.currentStepIndex() > step.stepIndex"
              [class.bg-slate-950]="engine.currentStepIndex() < step.stepIndex"
              [class.text-slate-500]="engine.currentStepIndex() < step.stepIndex"
              class="px-2.5 py-1 rounded-lg text-xs font-mono border border-slate-800 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span class="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center bg-black/30">
                {{ step.stepIndex }}
              </span>
              <span class="font-sans font-medium text-[11px]">{{ step.stageName }}</span>
            </button>
          }
        </div>

        <!-- Live Step Indicator / Noise Reduction Status -->
        <div class="hidden xl:flex items-center gap-2 text-xs font-mono">
          <span class="text-slate-400">Deliberation Step:</span>
          <span class="text-cyan-400 font-bold">{{ engine.currentStepIndex() }} / {{ engine.totalSteps() }}</span>
        </div>
      </div>
    </section>
  `,
})
export class PlaybackBarComponent {
  readonly engine = inject(RippleEngineService);
}
