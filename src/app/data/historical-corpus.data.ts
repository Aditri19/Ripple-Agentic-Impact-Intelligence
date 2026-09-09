/**
 * Ripple: Agentic Impact Intelligence
 * Empirical Historical Incident Corpus & Base Rates for IT Infrastructure
 */

import { HistoricalAnalogSet } from '../models/ripple.types';

export const HISTORICAL_ANALOG_CORPUS: Record<string, HistoricalAnalogSet> = {
  'edge-storage-order': {
    edgeId: 'edge-storage-order',
    totalHistoricalEvents: 42,
    historicalCascadesCount: 35,
    empiricalBaseRate: 0.833, // 35 / 42
    analogs: [
      {
        analogId: 'inc-2025-11-04',
        incidentDate: '2025-11-04',
        title: 'EBS Volume IOPS Throttling in us-east-1a',
        triggerType: 'storage_latency_spike',
        pastMagnitudeRatio: 3.1,
        systemContext: 'Synchronous write-through transactional database',
        downstreamService: 'Order Processing API',
        observedCascade: true,
        actualTimeToCascadeMinutes: 12,
        recoveryDurationMinutes: 54,
        similarityScore: 0.94,
        mitigatingFactors: ['No connection pooling circuit breaker engaged'],
      },
      {
        analogId: 'inc-2025-08-19',
        incidentDate: '2025-08-19',
        title: 'Ceph OSD Deep Scrubbing Contention',
        triggerType: 'storage_latency_spike',
        pastMagnitudeRatio: 3.8,
        systemContext: 'Primary Postgres write replica',
        downstreamService: 'Order Processing API',
        observedCascade: true,
        actualTimeToCascadeMinutes: 14,
        recoveryDurationMinutes: 68,
        similarityScore: 0.91,
      },
      {
        analogId: 'inc-2025-03-12',
        incidentDate: '2025-03-12',
        title: 'SAN Fiber Channel Controller Fault',
        triggerType: 'storage_latency_spike',
        pastMagnitudeRatio: 4.5,
        systemContext: 'Tier-0 Master Database',
        downstreamService: 'Order Processing API',
        observedCascade: true,
        actualTimeToCascadeMinutes: 8,
        recoveryDurationMinutes: 120,
        similarityScore: 0.85,
      },
    ],
  },

  'edge-storage-search': {
    edgeId: 'edge-storage-search',
    totalHistoricalEvents: 38,
    historicalCascadesCount: 27,
    empiricalBaseRate: 0.710, // 27 / 38 (Prior before checking RAM read replicas)
    analogs: [
      {
        analogId: 'inc-2025-09-14',
        incidentDate: '2025-09-14',
        title: 'Lucene Segment Flush Bottleneck',
        triggerType: 'storage_latency_spike',
        pastMagnitudeRatio: 2.8,
        systemContext: 'Search index workers writing segment files to disk',
        downstreamService: 'Catalog Search Indexer',
        observedCascade: true,
        actualTimeToCascadeMinutes: 22,
        recoveryDurationMinutes: 45,
        similarityScore: 0.88,
      },
      {
        analogId: 'inc-2025-06-02',
        incidentDate: '2025-06-02',
        title: 'Disk Queue Depth Saturation',
        triggerType: 'storage_latency_spike',
        pastMagnitudeRatio: 3.5,
        systemContext: 'Kafka buffered worker nodes with memory caching',
        downstreamService: 'Catalog Search Indexer',
        observedCascade: false, // Falsified in reality due to memory buffer
        actualTimeToCascadeMinutes: 0,
        recoveryDurationMinutes: 20,
        similarityScore: 0.92,
        mitigatingFactors: ['In-memory buffer replica absorbed queries during write stall'],
      },
    ],
  },

  'edge-order-checkout': {
    edgeId: 'edge-order-checkout',
    totalHistoricalEvents: 50,
    historicalCascadesCount: 38,
    empiricalBaseRate: 0.760, // 38 / 50
    analogs: [
      {
        analogId: 'inc-2025-10-22',
        incidentDate: '2025-10-22',
        title: 'Order API Thread Pool Exhaustion',
        triggerType: 'service_latency_spike',
        pastMagnitudeRatio: 4.2,
        systemContext: 'Gateway calling synchronous REST order creation',
        downstreamService: 'Checkout Gateway Ingress',
        observedCascade: true,
        actualTimeToCascadeMinutes: 18,
        recoveryDurationMinutes: 80,
        similarityScore: 0.89,
      },
      {
        analogId: 'inc-2025-07-15',
        incidentDate: '2025-07-15',
        title: 'Checkout Gateway Under Adaptive Concurrency Limiting',
        triggerType: 'service_latency_spike',
        pastMagnitudeRatio: 3.0,
        systemContext: 'Envoy adaptive rate limiting active',
        downstreamService: 'Checkout Gateway Ingress',
        observedCascade: false, // Downgraded to partial user impact
        actualTimeToCascadeMinutes: 0,
        recoveryDurationMinutes: 30,
        similarityScore: 0.87,
        mitigatingFactors: ['Adaptive concurrency token bucket shedded 40% non-critical traffic'],
      },
    ],
  },

  'edge-search-gw': {
    edgeId: 'edge-search-gw',
    totalHistoricalEvents: 35,
    historicalCascadesCount: 22,
    empiricalBaseRate: 0.628,
    analogs: [
      {
        analogId: 'inc-2025-05-11',
        incidentDate: '2025-05-11',
        title: 'Search Index Drift & Staleness',
        triggerType: 'indexer_lag',
        pastMagnitudeRatio: 2.1,
        systemContext: 'Edge Gateway serving cached read queries',
        downstreamService: 'Search API Gateway',
        observedCascade: false,
        actualTimeToCascadeMinutes: 0,
        recoveryDurationMinutes: 15,
        similarityScore: 0.90,
        mitigatingFactors: ['Edge CDN served cached catalog results with 98.4% hit rate'],
      },
    ],
  },
};
