import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PRESET_SCENARIOS } from '../data/scenarios.data';
import { IncidentScenario, AgentStep, TopologyNode, TopologyEdge } from '../models/ripple.types';

@Injectable({
  providedIn: 'root',
})
export class RippleEngineService {
  private http = inject(HttpClient);

  // Scenarios State
  readonly scenarios = signal<IncidentScenario[]>(PRESET_SCENARIOS);
  readonly selectedScenarioId = signal<string>(PRESET_SCENARIOS[0].id);

  // Active Scenario
  readonly activeScenario = computed<IncidentScenario>(() => {
    const list = this.scenarios();
    const found = list.find((s) => s.id === this.selectedScenarioId());
    return found || list[0];
  });

  // Playback & Stepping State
  readonly currentStepIndex = signal<number>(1);
  readonly isAutoPlaying = signal<boolean>(false);
  readonly playbackSpeed = signal<number>(1); // 1x, 2x, 4x
  readonly isLiveAnalyzing = signal<boolean>(false);
  readonly liveAnalysisError = signal<string | null>(null);

  // Selected interactive elements for inspection drawer
  readonly selectedNodeId = signal<string | null>(null);
  readonly selectedEdgeId = signal<string | null>(null);

  private timerHandle: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // When scenario changes, reset step to 1 and pause
    effect(() => {
      const current = this.activeScenario();
      if (current) {
        this.currentStepIndex.set(1);
        this.stopAutoPlay();
        // Select root anomaly node by default
        const rootNode = current.nodes.find((n) => n.health === 'ROOT_ANOMALY');
        this.selectedNodeId.set(rootNode ? rootNode.id : current.nodes[0]?.id || null);
        this.selectedEdgeId.set(null);
      }
    });

    // Auto-play interval manager
    effect(() => {
      const isPlaying = this.isAutoPlaying();
      const speed = this.playbackSpeed();
      const scenario = this.activeScenario();

      if (this.timerHandle) {
        clearInterval(this.timerHandle);
        this.timerHandle = null;
      }

      if (isPlaying && scenario) {
        const intervalMs = Math.max(800, 3200 / speed);
        this.timerHandle = setInterval(() => {
          const currentIdx = this.currentStepIndex();
          if (currentIdx < scenario.steps.length) {
            this.nextStep();
          } else {
            this.stopAutoPlay();
          }
        }, intervalMs);
      }
    });
  }

  // Computed state
  readonly totalSteps = computed(() => this.activeScenario()?.steps.length || 0);

  readonly currentStep = computed<AgentStep | null>(() => {
    const scenario = this.activeScenario();
    if (!scenario) return null;
    const idx = this.currentStepIndex();
    return scenario.steps.find((s) => s.stepIndex === idx) || scenario.steps[0] || null;
  });

  readonly executedSteps = computed<AgentStep[]>(() => {
    const scenario = this.activeScenario();
    if (!scenario) return [];
    const idx = this.currentStepIndex();
    return scenario.steps.filter((s) => s.stepIndex <= idx);
  });

  // Dynamic Nodes & Edges state based on current step
  readonly dynamicNodes = computed<TopologyNode[]>(() => {
    const scenario = this.activeScenario();
    if (!scenario) return [];
    const currentStep = this.currentStepIndex();

    return scenario.nodes.map((node) => {
      // If node is root, always ROOT_ANOMALY
      if (node.health === 'ROOT_ANOMALY') return node;

      // Check if any edge targeting this node has been falsified (KILLED)
      const incomingEdges = scenario.edges.filter((e) => e.to === node.id);
      const isKilledByStep = incomingEdges.some((e) => e.falsifierVerdict === 'KILL' && e.activeInStep <= currentStep);
      const isDowngradedByStep = incomingEdges.some((e) => e.falsifierVerdict === 'DOWNGRADE' && e.activeInStep <= currentStep);
      const isConfirmedByStep = incomingEdges.some((e) => e.falsifierVerdict === 'KEEP' && e.activeInStep <= currentStep);

      if (isKilledByStep && currentStep >= 4) {
        return { ...node, health: 'FALSIFIED_SAFE' };
      }
      if (isDowngradedByStep && currentStep >= 5) {
        return { ...node, health: 'DOWNGRADED_RISK' };
      }
      if (isConfirmedByStep && currentStep >= 3) {
        return { ...node, health: 'CRITICAL_RISK' };
      }

      // Early steps before evaluation: show as under investigation / normal
      if (currentStep <= 2) {
        return { ...node, health: 'HEALTHY' };
      }

      return node;
    });
  });

  readonly dynamicEdges = computed<TopologyEdge[]>(() => {
    const scenario = this.activeScenario();
    if (!scenario) return [];
    const currentStep = this.currentStepIndex();

    return scenario.edges.map((edge) => {
      // Has this edge been evaluated yet?
      const isEvaluated = edge.activeInStep <= currentStep;
      if (!isEvaluated) {
        return {
          ...edge,
          falsifierVerdict: 'PENDING',
          calibratedProbability: edge.priorProbability,
        };
      }
      return edge;
    });
  });

  readonly activeHighlightedEdge = computed<TopologyEdge | null>(() => {
    const step = this.currentStep();
    if (!step?.targetEdgeId) return null;
    const edges = this.dynamicEdges();
    return edges.find((e) => e.id === step.targetEdgeId) || null;
  });

  readonly activeHighlightedNode = computed<TopologyNode | null>(() => {
    const step = this.currentStep();
    if (!step?.targetNodeId) return null;
    const nodes = this.dynamicNodes();
    return nodes.find((n) => n.id === step.targetNodeId) || null;
  });

  readonly inspectNode = computed<TopologyNode | null>(() => {
    const selId = this.selectedNodeId();
    if (!selId) return null;
    return this.dynamicNodes().find((n) => n.id === selId) || null;
  });

  readonly inspectEdge = computed<TopologyEdge | null>(() => {
    const selId = this.selectedEdgeId();
    if (!selId) return null;
    return this.dynamicEdges().find((e) => e.id === selId) || null;
  });

  // Actions
  selectScenario(id: string) {
    this.selectedScenarioId.set(id);
  }

  nextStep() {
    const max = this.totalSteps();
    if (this.currentStepIndex() < max) {
      this.currentStepIndex.update((i) => i + 1);
      // sync inspector to active element if available
      const step = this.currentStep();
      if (step?.targetNodeId) {
        this.selectedNodeId.set(step.targetNodeId);
      }
      if (step?.targetEdgeId) {
        this.selectedEdgeId.set(step.targetEdgeId);
      }
    }
  }

  prevStep() {
    if (this.currentStepIndex() > 1) {
      this.currentStepIndex.update((i) => i - 1);
    }
  }

  goToStep(index: number) {
    const max = this.totalSteps();
    if (index >= 1 && index <= max) {
      this.currentStepIndex.set(index);
    }
  }

  toggleAutoPlay() {
    this.isAutoPlaying.update((v) => !v);
  }

  stopAutoPlay() {
    this.isAutoPlaying.set(false);
  }

  setSpeed(speed: number) {
    this.playbackSpeed.set(speed);
  }

  reset() {
    this.stopAutoPlay();
    this.currentStepIndex.set(1);
    const scenario = this.activeScenario();
    const rootNode = scenario.nodes.find((n) => n.health === 'ROOT_ANOMALY');
    this.selectedNodeId.set(rootNode ? rootNode.id : scenario.nodes[0]?.id || null);
    this.selectedEdgeId.set(null);
  }

  selectNode(nodeId: string) {
    this.selectedNodeId.set(nodeId);
    this.selectedEdgeId.set(null);
  }

  selectEdge(edgeId: string) {
    this.selectedEdgeId.set(edgeId);
    this.selectedNodeId.set(null);
  }

  // Live Incident Analysis
  analyzeCustomIncident(incidentDescription: string, cluster = 'prod-us-west2-k8s-cluster-01') {
    this.isLiveAnalyzing.set(true);
    this.liveAnalysisError.set(null);
    this.stopAutoPlay();

    this.http.post<IncidentScenario>('/api/analyze-incident', { incidentDescription, cluster }).subscribe({
      next: (customScenario) => {
        // Add or replace custom scenario in list
        this.scenarios.update((list) => {
          const filtered = list.filter((s) => s.id !== customScenario.id && !s.id.startsWith('live-incident-'));
          return [...filtered, customScenario];
        });
        this.selectedScenarioId.set(customScenario.id);
        this.currentStepIndex.set(1);
        this.isLiveAnalyzing.set(false);
      },
      error: (err) => {
        console.error('Failed live incident analysis:', err);
        this.liveAnalysisError.set('Failed to analyze live incident. Reverted to baseline.');
        this.isLiveAnalyzing.set(false);
      },
    });
  }
}
