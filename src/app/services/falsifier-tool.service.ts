import { Injectable, signal } from '@angular/core';
import { FalsifierVerdict, TopologyEdge } from '../models/ripple.types';

export interface FalsifierToolDefinition {
  id: string;
  name: string;
  category: 'GITOPS' | 'CIRCUIT_BREAKER' | 'CACHE_REPLICA' | 'QUEUE_BUFFER' | 'TELEMETRY';
  icon: string;
  description: string;
  commandSnippet: string;
}

export interface FalsifierToolResult {
  toolId: string;
  toolName: string;
  timestamp: string;
  status: 'SUCCESS' | 'COUNTER_EVIDENCE_FOUND' | 'NO_COUNTER_EVIDENCE' | 'MITIGATING_CONFIG_FOUND';
  summary: string;
  payload: Record<string, unknown>;
}

export interface FalsifierInvestigationRun {
  edgeId: string;
  edgeLabel: string;
  startedAt: string;
  completedAt?: string;
  status: 'IDLE' | 'INVESTIGATING' | 'COMPLETED';
  toolResults: FalsifierToolResult[];
  verdict: FalsifierVerdict;
  priorProbability: number;
  calibratedProbability: number;
  justification: string;
  evidenceFound: string;
}

export const FALSIFIER_AVAILABLE_TOOLS: FalsifierToolDefinition[] = [
  {
    id: 'tool-gitops-deploy',
    name: 'GitOps & Deploy History Inspector',
    category: 'GITOPS',
    icon: 'history_edu',
    description: 'Inspects ArgoCD/Kubernetes rollout history, canary traffic splits, and feature flags committed in the last 60 minutes.',
    commandSnippet: 'argocd app history --service-window 60m --inspect-traffic-weights',
  },
  {
    id: 'tool-circuit-breaker',
    name: 'Circuit Breaker & Fallback Analyzer',
    category: 'CIRCUIT_BREAKER',
    icon: 'electrical_services',
    description: 'Queries Envoy/Istio service mesh and client SDK (Resilience4j/Finagle) for active tripping, timeout thresholds, and bulkhead isolation.',
    commandSnippet: 'istioctl proxy-config circuit-breaker --target-cluster default',
  },
  {
    id: 'tool-cache-replica',
    name: 'Cache Hit & Read Replica Route Probe',
    category: 'CACHE_REPLICA',
    icon: 'memory',
    description: 'Evaluates in-memory cache hit ratio, TTL freshness, and automatic read-traffic diversion to secondary read replicas.',
    commandSnippet: 'redis-cli info stats | grep -E "hit_rate|evicted_keys|replica_lag"',
  },
  {
    id: 'tool-queue-buffer',
    name: 'MQ & Stream Buffer Capacity Assessor',
    category: 'QUEUE_BUFFER',
    icon: 'queue',
    description: 'Measures consumer lag, partition leader health, buffer retention capacity, and idempotent processing backpressure.',
    commandSnippet: 'kafka-consumer-groups.sh --describe --group analytics-stream-v2',
  },
  {
    id: 'tool-telemetry-correlation',
    name: 'OpenTelemetry Trace & Metric Correlator',
    category: 'TELEMETRY',
    icon: 'multiline_chart',
    description: 'Cross-examines p99 socket latency, connection pool saturation, and error rates against historical baseline distributions.',
    commandSnippet: 'promql: sum(rate(http_requests_total{status=~"5.."}[2m])) by (service)',
  },
];

@Injectable({
  providedIn: 'root',
})
export class FalsifierToolService {
  readonly availableTools = signal<FalsifierToolDefinition[]>(FALSIFIER_AVAILABLE_TOOLS);
  readonly currentInvestigation = signal<FalsifierInvestigationRun | null>(null);
  readonly isRunningSuite = signal<boolean>(false);
  readonly executionLog = signal<string[]>([]);

  /**
   * Run full tool suite investigation on a given edge
   */
  async investigateEdge(edge: TopologyEdge, edgeLabel: string): Promise<FalsifierInvestigationRun> {
    this.isRunningSuite.set(true);
    const initialRun: FalsifierInvestigationRun = {
      edgeId: edge.id,
      edgeLabel,
      startedAt: new Date().toLocaleTimeString(),
      status: 'INVESTIGATING',
      toolResults: [],
      verdict: 'PENDING',
      priorProbability: edge.priorProbability,
      calibratedProbability: edge.priorProbability,
      justification: 'Falsifier Agent actively querying observability and infrastructure tools...',
      evidenceFound: 'Pending tool scan...',
    };

    this.currentInvestigation.set(initialRun);
    this.executionLog.set([`[${new Date().toLocaleTimeString()}] Falsifier Agent initiated adversarial investigation on ${edgeLabel}`]);

    // Simulated staggered tool execution for rich real-time UI feedback
    const tools = this.availableTools();
    const results: FalsifierToolResult[] = [];

    for (const tool of tools) {
      await new Promise((r) => setTimeout(r, 450));

      const toolResult = this.generateToolResultForEdge(edge, tool);
      results.push(toolResult);

      this.executionLog.update((logs) => [
        ...logs,
        `[${new Date().toLocaleTimeString()}] Executed [${tool.name}]: ${toolResult.summary}`,
      ]);

      this.currentInvestigation.update((curr) => {
        if (!curr) return null;
        return {
          ...curr,
          toolResults: [...results],
        };
      });
    }

    // Synthesize final decision based on edge characteristics and tool outputs
    await new Promise((r) => setTimeout(r, 400));
    const finalOutcome = this.synthesizeVerdict(edge, results);

    const completedRun: FalsifierInvestigationRun = {
      ...initialRun,
      completedAt: new Date().toLocaleTimeString(),
      status: 'COMPLETED',
      toolResults: results,
      verdict: finalOutcome.verdict,
      calibratedProbability: finalOutcome.calibratedProb,
      justification: finalOutcome.justification,
      evidenceFound: finalOutcome.evidenceFound,
    };

    this.executionLog.update((logs) => [
      ...logs,
      `[${new Date().toLocaleTimeString()}] Synthesis Complete: Verdict = ${finalOutcome.verdict} (Probability: ${(edge.priorProbability * 100).toFixed(0)}% -> ${(finalOutcome.calibratedProb * 100).toFixed(0)}%)`,
    ]);

    this.currentInvestigation.set(completedRun);
    this.isRunningSuite.set(false);
    return completedRun;
  }

  /**
   * Generates deterministic grounded tool responses matching the edge domain
   */
  private generateToolResultForEdge(edge: TopologyEdge, tool: FalsifierToolDefinition): FalsifierToolResult {
    const timestamp = new Date().toLocaleTimeString();

    // Check if edge is async or search or redis (known false alarm / killable targets)
    const isAsyncOrSearch =
      edge.id.includes('search') ||
      edge.dependencyType === 'ASYNCHRONOUS' ||
      edge.id.includes('down2') ||
      edge.to.includes('catalog') ||
      edge.to.includes('async');

    const isCircuitBreakerProtected =
      edge.id.includes('fraud') ||
      edge.id.includes('down1-gw') ||
      edge.id.includes('edge-gw') ||
      edge.to.includes('analytics');

    if (tool.id === 'tool-gitops-deploy') {
      if (isAsyncOrSearch) {
        return {
          toolId: tool.id,
          toolName: tool.name,
          timestamp,
          status: 'COUNTER_EVIDENCE_FOUND',
          summary: 'Canary Release #8812 found committed 14m prior: Diverted catalog read queries to local in-memory replica.',
          payload: {
            commitSha: 'a8f9c12b',
            author: 'infra-deploy-bot',
            trafficSplitPercent: { inMemoryReplica: 100, primaryDb: 0 },
            mitigationActive: true,
          },
        };
      }
      return {
        toolId: tool.id,
        toolName: tool.name,
        timestamp,
        status: 'NO_COUNTER_EVIDENCE',
        summary: 'No mitigating traffic-rerouting deployments found for target service in the past 60 minutes.',
        payload: {
          recentDeploymentsCount: 0,
          trafficRouting: 'DIRECT_SYNCHRONOUS_PRIMARY',
        },
      };
    }

    if (tool.id === 'tool-circuit-breaker') {
      if (isCircuitBreakerProtected) {
        return {
          toolId: tool.id,
          toolName: tool.name,
          timestamp,
          status: 'MITIGATING_CONFIG_FOUND',
          summary: 'Envoy circuit breaker threshold engaged (consecutive 5xx error limit: 5). Async fallback queue absorbing load.',
          payload: {
            circuitState: 'OPEN_DEGRADED',
            consecutive5xxLimit: 5,
            fallbackQueueState: 'HEALTHY_BUFFERED',
            dampeningFactor: 0.22,
          },
        };
      }
      return {
        toolId: tool.id,
        toolName: tool.name,
        timestamp,
        status: 'NO_COUNTER_EVIDENCE',
        summary: 'Circuit breaker is configured in PASS-THROUGH mode; no automatic trip threshold defined on this critical path.',
        payload: {
          circuitState: 'CLOSED_PASS_THROUGH',
          failsafePolicy: 'NONE',
        },
      };
    }

    if (tool.id === 'tool-cache-replica') {
      if (isAsyncOrSearch) {
        return {
          toolId: tool.id,
          toolName: tool.name,
          timestamp,
          status: 'COUNTER_EVIDENCE_FOUND',
          summary: 'Local NodeCache and Memcached hit rate confirmed at 99.4%. Read queries do not hit the stalled primary DB.',
          payload: {
            cacheHitRatePercent: 99.4,
            avgResponseTimeMs: 1.8,
            primaryDbQueryRateRps: 2.1,
          },
        };
      }
      return {
        toolId: tool.id,
        toolName: tool.name,
        timestamp,
        status: 'NO_COUNTER_EVIDENCE',
        summary: 'Cache bypass mode active on write-through transactional endpoints; 100% of calls reach the saturated primary.',
        payload: {
          cacheHitRatePercent: 12.1,
          writeThroughActive: true,
        },
      };
    }

    if (tool.id === 'tool-queue-buffer') {
      if (isAsyncOrSearch) {
        return {
          toolId: tool.id,
          toolName: tool.name,
          timestamp,
          status: 'COUNTER_EVIDENCE_FOUND',
          summary: 'Kafka partition buffer retention healthy (48h head room). Consumer lag is stable at 14 messages.',
          payload: {
            consumerLagMessages: 14,
            bufferHeadroomHours: 48,
            backpressureAbsorbed: true,
          },
        };
      }
      return {
        toolId: tool.id,
        toolName: tool.name,
        timestamp,
        status: 'NO_COUNTER_EVIDENCE',
        summary: 'Synchronous gRPC/HTTP connection; no messaging buffer exists between caller and target.',
        payload: {
          isBuffered: false,
          directSocketHold: true,
        },
      };
    }

    // Telemetry Correlator
    if (edge.falsifierVerdict === 'KILL' || isAsyncOrSearch) {
      return {
        toolId: tool.id,
        toolName: tool.name,
        timestamp,
        status: 'COUNTER_EVIDENCE_FOUND',
        summary: 'Target service p99 latency remains flat at 38ms (baseline 35ms). Zero 5xx errors recorded on downstream endpoint.',
        payload: {
          p99LatencyObservedMs: 38,
          baselineLatencyMs: 35,
          errorRatePercent: 0.0,
          zScore: 0.2,
        },
      };
    } else if (edge.falsifierVerdict === 'DOWNGRADE' || isCircuitBreakerProtected) {
      return {
        toolId: tool.id,
        toolName: tool.name,
        timestamp,
        status: 'MITIGATING_CONFIG_FOUND',
        summary: 'Moderate latency elevation observed (190ms vs 45ms baseline), but error rate dampened by 80% due to retry budget clamps.',
        payload: {
          p99LatencyObservedMs: 190,
          baselineLatencyMs: 45,
          errorRatePercent: 1.2,
          zScore: 1.8,
        },
      };
    } else {
      return {
        toolId: tool.id,
        toolName: tool.name,
        timestamp,
        status: 'NO_COUNTER_EVIDENCE',
        summary: 'Critical anomaly correlation: Thread pool is 98% blocked waiting on upstream sockets. Latency jumped 4.8x (620ms).',
        payload: {
          p99LatencyObservedMs: 620,
          baselineLatencyMs: 60,
          errorRatePercent: 9.4,
          zScore: 5.4,
        },
      };
    }
  }

  /**
   * Synthesizes verdict based on tool outputs
   */
  private synthesizeVerdict(
    edge: TopologyEdge,
    results: FalsifierToolResult[]
  ): { verdict: FalsifierVerdict; calibratedProb: number; justification: string; evidenceFound: string } {
    const counterEvidenceCount = results.filter((r) => r.status === 'COUNTER_EVIDENCE_FOUND').length;
    const mitigatingCount = results.filter((r) => r.status === 'MITIGATING_CONFIG_FOUND').length;

    if (counterEvidenceCount >= 2 || edge.falsifierVerdict === 'KILL') {
      return {
        verdict: 'KILL',
        calibratedProb: 0.0,
        justification:
          'FALSIFIED AS SAFE: Conclusive counter-evidence discovered. Local cache hit rate (99.4%), asynchronous buffering, and read-replica rerouting isolate this service from the upstream failure.',
        evidenceFound: 'Deploy #8812 active, 99.4% cache absorption, flat 38ms p99 latency. False alarm successfully prevented.',
      };
    }

    if (mitigatingCount >= 1 || edge.falsifierVerdict === 'DOWNGRADE') {
      return {
        verdict: 'DOWNGRADE',
        calibratedProb: Math.min(0.25, +(edge.priorProbability * 0.3).toFixed(2)),
        justification:
          'DOWNGRADED RISK: Partial resilience mechanisms discovered. Active circuit breaker and automated fallback queue dampens the cascade shock.',
        evidenceFound: 'Circuit breaker tripped in Envoy proxy; retry budget clamped; error rate contained to 1.2%.',
      };
    }

    return {
      verdict: 'KEEP',
      calibratedProb: edge.priorProbability,
      justification:
        'CONFIRMED CRITICAL CASCADE: No mitigating safeguards or counter-evidence found. Synchronous dependency with saturated thread pool confirms imminent downstream failure.',
      evidenceFound: 'Direct unbuffered gRPC calls, thread pool 98% blocked, p99 latency spiked 4.8x (620ms). Immediate SRE intervention required.',
    };
  }

  reset() {
    this.isRunningSuite.set(false);
    this.currentInvestigation.set(null);
    this.executionLog.set([]);
  }
}
