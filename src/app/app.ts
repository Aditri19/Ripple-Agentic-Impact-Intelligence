import { ChangeDetectionStrategy, Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RippleEngineService } from './services/ripple-engine.service';
import { HeaderComponent } from './components/header.component';
import { HomeOverviewComponent, AppPage } from './components/home-overview.component';
import { PlaybackBarComponent } from './components/playback-bar.component';
import { TopologyGraphComponent } from './components/topology-graph.component';
import { AgentDeliberationFeedComponent } from './components/agent-deliberation-feed.component';
import { FalsifierWorkbenchComponent } from './components/falsifier-workbench.component';
import { ScoringBreakdownComponent } from './components/scoring-breakdown.component';
import { NodeInspectorComponent } from './components/node-inspector.component';
import { BacktestPanelComponent } from './components/backtest-panel.component';
import { MitigationPanelComponent } from './components/mitigation-panel.component';
import { CustomIncidentModalComponent } from './components/custom-incident-modal.component';

export type SimulatorSidebarTab = 'DELIBERATION' | 'INSPECTOR';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule,
    HeaderComponent,
    HomeOverviewComponent,
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
  readonly currentPage = signal<AppPage>('home');
  readonly simulatorTab = signal<SimulatorSidebarTab>('DELIBERATION');

  @HostListener('window:navigate-to-page', ['$event'])
  onNavigateToPage(event: Event) {
    const customEvent = event as CustomEvent<AppPage>;
    if (customEvent && customEvent.detail) {
      this.currentPage.set(customEvent.detail);
    }
  }

  setPage(page: AppPage) {
    this.currentPage.set(page);
  }

  setSimulatorTab(tab: SimulatorSidebarTab) {
    this.simulatorTab.set(tab);
  }
}
