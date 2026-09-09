import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RippleEngineService } from '../services/ripple-engine.service';

@Component({
  selector: 'app-playback-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <section class="bg-white/95 border-b border-stone-200/90 px-4 py-2.5 select-none shadow-2xs">
      <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <!-- Step Navigation Controls -->
        <div class="flex items-center gap-2">
          <!-- Reset to Step 1 & Clear All -->
          <button
            type="button"
            (click)="engine.reset()"
            title="Reset simulation to step 1, clear all falsifier overrides, and start fresh"
            class="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 border border-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <mat-icon class="text-base text-slate-600">replay</mat-icon>
            <span>Reset</span>
          </button>

          <!-- Prev Step -->
          <button
            type="button"
            (click)="engine.prevStep()"
            [disabled]="engine.currentStepIndex() <= 1"
            title="Go back to previous deliberation stage"
            class="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 disabled:opacity-40 text-slate-700 border border-stone-200 transition-colors cursor-pointer"
          >
            <mat-icon class="text-base">skip_previous</mat-icon>
          </button>

          <!-- Play / Pause Auto-Playback -->
          <button
            type="button"
            (click)="engine.toggleAutoPlay()"
            [class.bg-emerald-600]="engine.isAutoPlaying()"
            [class.hover:bg-emerald-700]="engine.isAutoPlaying()"
            [class.bg-teal-600]="!engine.isAutoPlaying()"
            [class.hover:bg-teal-700]="!engine.isAutoPlaying()"
            title="Automatically advance through all multi-agent stages with ripple propagation"
            class="px-4 py-2 rounded-xl text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <mat-icon class="text-base">{{ engine.isAutoPlaying() ? 'pause' : 'play_arrow' }}</mat-icon>
            <span>{{ engine.isAutoPlaying() ? 'Pause Simulation' : 'Start Autoplay' }}</span>
          </button>

          <!-- Next Step -->
          <button
            type="button"
            (click)="engine.nextStep()"
            [disabled]="engine.currentStepIndex() >= engine.totalSteps()"
            title="Advance to next deliberation stage"
            class="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 disabled:opacity-40 text-slate-700 border border-stone-200 transition-colors cursor-pointer"
          >
            <mat-icon class="text-base">skip_next</mat-icon>
          </button>

          <!-- Playback Speed Controls -->
          <div class="flex items-center bg-stone-100 border border-stone-200 rounded-xl p-0.5 text-[11px] font-mono" title="Playback speed multiplier">
            @for (spd of [1, 2, 4]; track spd) {
              <button
                type="button"
                (click)="engine.setSpeed(spd)"
                [class.bg-teal-600]="engine.playbackSpeed() === spd"
                [class.text-white]="engine.playbackSpeed() === spd"
                [class.text-slate-600]="engine.playbackSpeed() !== spd"
                [title]="spd + 'x playback speed'"
                class="px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer"
              >
                {{ spd }}x
              </button>
            }
          </div>
        </div>

        <!-- Stage Timeline Step Chips -->
        <div class="flex items-center gap-1.5 overflow-x-auto py-1">
          @for (step of engine.activeScenario().steps; track step.stepIndex) {
            <button
              type="button"
              (click)="engine.goToStep(step.stepIndex)"
              [title]="'Jump to Step ' + step.stepIndex + ': ' + step.stageName"
              [class.bg-teal-50]="engine.currentStepIndex() === step.stepIndex"
              [class.text-teal-900]="engine.currentStepIndex() === step.stepIndex"
              [class.border-teal-400]="engine.currentStepIndex() === step.stepIndex"
              [class.ring-2]="engine.currentStepIndex() === step.stepIndex"
              [class.ring-teal-300]="engine.currentStepIndex() === step.stepIndex"
              [class.bg-emerald-50]="engine.currentStepIndex() > step.stepIndex"
              [class.text-emerald-800]="engine.currentStepIndex() > step.stepIndex"
              [class.border-emerald-200]="engine.currentStepIndex() > step.stepIndex"
              [class.bg-stone-50]="engine.currentStepIndex() < step.stepIndex"
              [class.text-slate-400]="engine.currentStepIndex() < step.stepIndex"
              [class.border-stone-200]="engine.currentStepIndex() < step.stepIndex"
              class="px-2.5 py-1 rounded-lg text-xs font-mono border transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span
                class="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                [class.bg-teal-200]="engine.currentStepIndex() === step.stepIndex"
                [class.text-teal-900]="engine.currentStepIndex() === step.stepIndex"
                [class.bg-emerald-200]="engine.currentStepIndex() > step.stepIndex"
                [class.text-emerald-900]="engine.currentStepIndex() > step.stepIndex"
                [class.bg-stone-200]="engine.currentStepIndex() < step.stepIndex"
                [class.text-slate-600]="engine.currentStepIndex() < step.stepIndex"
              >
                {{ step.stepIndex }}
              </span>
              <span class="font-sans font-medium text-[11px]">{{ step.stageName }}</span>
            </button>
          }
        </div>

        <!-- Deliberation Counter & Status -->
        <div class="hidden xl:flex items-center gap-2 text-xs font-mono">
          <span class="text-slate-500">Deliberation Step:</span>
          <span class="text-teal-700 font-bold px-2 py-0.5 rounded bg-teal-50 border border-teal-200">
            {{ engine.currentStepIndex() }} of {{ engine.totalSteps() }}
          </span>
        </div>
      </div>
    </section>
  `,
})
export class PlaybackBarComponent {
  readonly engine = inject(RippleEngineService);
}
