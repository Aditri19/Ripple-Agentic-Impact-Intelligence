import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RippleEngineService } from './services/ripple-engine.service';
import { HeaderComponent } from './components/header.component';
import { PlaybackBarComponent } from './components/playback-bar.component';
import { TopologyGraphComponent } from './components/topology-graph.component';
import { AgentDeliberationFeedComponent } from './components/agent-deliberation-feed.component';
import { FalsifierWorkbenchComponent } from './components/falsifier-workbench.component';
import { ScoringBreakdownComponent } from './components/scoring-breakdown.component';
import { NodeInspectorComponent } from './components/node-inspector.component';
import { BacktestPanelComponent } from './components/backtest-panel.component';
import { MitigationPanelComponent } from './components/mitigation-panel.component';
import { CustomIncidentModalComponent } from './components/custom-incident-modal.component';

export type ActiveTab = 'DELIBERATION' | 'FALSIFIER' | 'SCORING' | 'INSPECTOR' | 'BACKTEST' | 'MITIGATIONS';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIconModule,
    HeaderComponent,
    PlaybackBarComponent,
    TopologyGraphComponent,
    AgentDeliberationFeedComponent,
    FalsifierWorkbenchComponent,
    ScoringBreakdownComponent,
    NodeInspectorComponent,
    BacktestPanelComponent,
    MitigationPanelComponent,
    CustomIncidentModalComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly engine = inject(RippleEngineService);
  readonly activeTab = signal<ActiveTab>('FALSIFIER');

  setTab(tab: ActiveTab) {
    this.activeTab.set(tab);
  }
}
