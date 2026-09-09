/**
 * Ripple: Agentic Impact Intelligence
 * Comprehensive Backtest Incident Corpus for Empirical Evaluation & Falsifier Benchmark
 * N=8 Held-Out Historical Past Incidents Across Core Cloud Infrastructure Domains
 */

import { BacktestCase } from '../models/ripple.types';

export const BACKTEST_INCIDENT_DATASET: BacktestCase[] = [
  {
    caseId: 'case-bt-001',
    incidentTitle: 'NVMe Ceph Storage IOPS Spike vs Order Processing API',
    incidentDate: '2025-11-14',
    incidentType: 'Storage Infrastructure Anomaly',
    triggerDescription: 'p99 IOPS write latency jumped 3.4x (142ms) on primary persistent block store.',
    groundTruthCascadeOccurred: true,
    groundTruthImpactedServices: ['Order Processing API', 'Checkout Gateway Ingress'],
    initialUnfilteredPrediction: {
      predictedProbability: 0.84,
      flaggedHighRisk: true,
    },
    falsifierInvestigation: {
      counterEvidenceFound: false,
      evidenceDetails: 'Confirmed 98/100 JDBC threads blocked in fsync() waiting queue. Direct synchronous call path with no fallback buffer.',
      verdict: 'KEEP',
      postFalsifierProbability: 0.84,
    },
    evaluationOutcome: {
      wasFalseAlarmPrevented: false,
      accuracyResult: 'CORRECT_CONFIRMATION',
      alarmFatigueSaved: false,
    },
  },
  {
    caseId: 'case-bt-002',
    incidentTitle: 'Storage Write Stall vs Catalog Search Indexer',
    incidentDate: '2025-11-14',
    incidentType: 'Storage Infrastructure Anomaly',
    triggerDescription: 'Same 3.4x storage latency spike evaluating downstream impact on Catalog Search Indexer.',
    groundTruthCascadeOccurred: false,
    groundTruthImpactedServices: [],
    initialUnfilteredPrediction: {
      predictedProbability: 0.76,
      flaggedHighRisk: true, // Would have paged the on-call engineer!
    },
    falsifierInvestigation: {
      counterEvidenceFound: true,
      evidenceDetails: 'Canary Deploy #8812 rerouted read queries to local in-memory RAM cache replica 14m prior. Observed downstream latency flat at 38ms.',
      verdict: 'KILL',
      postFalsifierProbability: 0.0,
    },
    evaluationOutcome: {
      wasFalseAlarmPrevented: true,
      accuracyResult: 'CORRECT_FALSIFICATION',
      alarmFatigueSaved: true,
    },
  },
  {
    caseId: 'case-bt-003',
    incidentTitle: 'Redis Cache Cluster Master Eviction Event',
    incidentDate: '2025-10-09',
    incidentType: 'In-Memory Cache Outage',
    triggerDescription: 'Primary Redis shard evicted 45% key space due to maxmemory OOM condition.',
    groundTruthCascadeOccurred: false,
    groundTruthImpactedServices: [],
    initialUnfilteredPrediction: {
      predictedProbability: 0.78,
      flaggedHighRisk: true,
    },
    falsifierInvestigation: {
      counterEvidenceFound: true,
      evidenceDetails: 'Stale-While-Revalidate cache fallback policy active in client library; DB read surge was 4% (absorbed without connection saturation).',
      verdict: 'KILL',
      postFalsifierProbability: 0.0,
    },
    evaluationOutcome: {
      wasFalseAlarmPrevented: true,
      accuracyResult: 'CORRECT_FALSIFICATION',
      alarmFatigueSaved: true,
    },
  },
  {
    caseId: 'case-bt-004',
    incidentTitle: 'Third-Party Fraud Gateway 504 Gateway Timeout',
    incidentDate: '2025-09-28',
    incidentType: 'External Vendor Failure',
    triggerDescription: 'External fraud verification API returning 504 timeouts on 65% of credit card auth requests.',
    groundTruthCascadeOccurred: false,
    groundTruthImpactedServices: ['Payment Gateway (Degraded Mode)'],
    initialUnfilteredPrediction: {
      predictedProbability: 0.88,
      flaggedHighRisk: true,
    },
    falsifierInvestigation: {
      counterEvidenceFound: true,
      evidenceDetails: 'Async Shadow Evaluation circuit breaker tripped automatically; transactions queued in Kafka for asynchronous post-auth verification.',
      verdict: 'DOWNGRADE',
      postFalsifierProbability: 0.22,
    },
    evaluationOutcome: {
      wasFalseAlarmPrevented: true,
      accuracyResult: 'CORRECT_DOWNGRADE',
      alarmFatigueSaved: true,
    },
  },
  {
    caseId: 'case-bt-005',
    incidentTitle: 'PostgreSQL Read Replica Replication Lag Surge (180s)',
    incidentDate: '2025-08-04',
    incidentType: 'Database Replication Failure',
    triggerDescription: 'Replication lag on analytics read replica spiked to 180 seconds during bulk monthly data export.',
    groundTruthCascadeOccurred: true,
    groundTruthImpactedServices: ['Analytics Reporting Dashboard', 'Customer Insights Export'],
    initialUnfilteredPrediction: {
      predictedProbability: 0.79,
      flaggedHighRisk: true,
    },
    falsifierInvestigation: {
      counterEvidenceFound: false,
      evidenceDetails: 'Direct SQL connection pool overwhelmed; no fallback read replica configured in target region. Export queries timed out after 30s.',
      verdict: 'KEEP',
      postFalsifierProbability: 0.79,
    },
    evaluationOutcome: {
      wasFalseAlarmPrevented: false,
      accuracyResult: 'CORRECT_CONFIRMATION',
      alarmFatigueSaved: false,
    },
  },
  {
    caseId: 'case-bt-006',
    incidentTitle: 'CoreDNS Pod OOM Kill in Kubernetes Node Pool',
    incidentDate: '2025-07-21',
    incidentType: 'Kubernetes Platform Infrastructure',
    triggerDescription: 'CoreDNS memory leak caused rolling restart across 3 cluster daemonsets in prod-us-east.',
    groundTruthCascadeOccurred: false,
    groundTruthImpactedServices: [],
    initialUnfilteredPrediction: {
      predictedProbability: 0.85,
      flaggedHighRisk: true,
    },
    falsifierInvestigation: {
      counterEvidenceFound: true,
      evidenceDetails: 'NodeLocal DNSCache enabled on all 48 worker nodes serving cached A/AAAA records with 99.8% hit rate during the 45s restart.',
      verdict: 'KILL',
      postFalsifierProbability: 0.0,
    },
    evaluationOutcome: {
      wasFalseAlarmPrevented: true,
      accuracyResult: 'CORRECT_FALSIFICATION',
      alarmFatigueSaved: true,
    },
  },
  {
    caseId: 'case-bt-007',
    incidentTitle: 'Kafka Partition Leader Rebalance Storm',
    incidentDate: '2025-06-11',
    incidentType: 'Message Streaming Pipeline',
    triggerDescription: 'Broker 04 unclean shutdown triggered rebalance storm across 12 partitions on transactions.v1 topic.',
    groundTruthCascadeOccurred: false,
    groundTruthImpactedServices: ['Billing Stream Ingest (Buffered)'],
    initialUnfilteredPrediction: {
      predictedProbability: 0.74,
      flaggedHighRisk: true,
    },
    falsifierInvestigation: {
      counterEvidenceFound: true,
      evidenceDetails: 'Producer idempotence enabled with 2GB disk buffer on edge ingesters. Zero messages dropped; consumer lag cleared in 4.2 minutes.',
      verdict: 'DOWNGRADE',
      postFalsifierProbability: 0.18,
    },
    evaluationOutcome: {
      wasFalseAlarmPrevented: true,
      accuracyResult: 'CORRECT_DOWNGRADE',
      alarmFatigueSaved: true,
    },
  },
  {
    caseId: 'case-bt-008',
    incidentTitle: 'RabbitMQ Dead-Letter Exchange Loop on Settlement Service',
    incidentDate: '2025-05-19',
    incidentType: 'Message Broker Saturation',
    triggerDescription: 'Malformed settlement payload caused unhandled reject loop, filling exchange queue to 100,000 msgs.',
    groundTruthCascadeOccurred: true,
    groundTruthImpactedServices: ['Settlement Settlement Worker', 'Partner Payment Reconciliation'],
    initialUnfilteredPrediction: {
      predictedProbability: 0.91,
      flaggedHighRisk: true,
    },
    falsifierInvestigation: {
      counterEvidenceFound: false,
      evidenceDetails: 'Broker memory high watermark reached (85%); broker paused socket reads from all publishers. Downstream workers starved.',
      verdict: 'KEEP',
      postFalsifierProbability: 0.91,
    },
    evaluationOutcome: {
      wasFalseAlarmPrevented: false,
      accuracyResult: 'CORRECT_CONFIRMATION',
      alarmFatigueSaved: false,
    },
  },
];
