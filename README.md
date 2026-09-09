# Ripple: Agentic Impact Intelligence
https://ripple-agentic-impact.ai.studio
## Architecture & Design Documentation
Ripple maps how unexpected events cascade through complex systems, scoring each downstream impact with empirical data and actively attempting to disprove predictions via dedicated falsification agents before reporting actionable insights.
## 1. Problem Statement
When unexpected anomalies occur in complex systems—such as storage service degradation, supplier disruptions, or infrastructure failures—the immediate cause is often transparent. The critical challenge lies in identifying the cascading effects, quantifying the confidence of each downstream impact, and prioritizing risks that require intervention.

Existing solutions typically present: Opaque Predictions: Single-point forecasts without underlying reasoning.
Raw Metric Dashboards: High-volume data streams lacking synthesis of downstream meaning.

Ripple builds an evidence-backed chain of consequences, utilizing a specialized internal sub-agent architecture to ensure specialized reasoning and reduced attention dilution.
## 2. Core Design Principles
The system architecture is governed by a strict division of labor:

LLMs Reason about Evidence: Gemini-based agents discover hypotheses and retrieve evidence.
Statistical Models Quantify Uncertainty: Historical data calibrates probability, ensuring numbers are grounded in reality rather than agent self-reporting.
## 3. High-Level System Architecture
The architecture functions as a distributed multi-agent system where specialized domain experts negotiate and validate findings.


Event Input: Triggered by a system anomaly.
Discovery Layer: The Event Agent and Impact Graph Agent establish the scope of the incident.
Iteration Loop: The Forecasting Agent and Falsifier Agent run in a tight loop. Every proposed impact edge is scored, challenged, and either kept, downgraded, or killed based on counter-evidence.
Synthesis: The surviving impact chain is assembled for the user.

By modularizing these definitions, Ripple avoids the "Monolithic Ceiling," reducing the search space for actions and mitigating potential hallucinations.
## 4. Agent Responsibilities
| Agent             | Core Objective                     | Key Inputs                       | Primary Output               |
|-------------------|------------------------------------|----------------------------------|------------------------------|
| Event Agent       | Quantification of the event        | Metrics, logs, incident feed     | Structured event object      |
| Impact Graph Agent| Identification of potential scope  | Service/dependency graph         | Candidate unscored graph     |
| Forecasting Agent | Probabilistic forecasting          | Historical analogs, scoring formula | Probability + time window |
| Falsifier Agent   | Disproving hypotheses              | Live counter-evidence search     | KILL/DOWNGRADE decision      |




The Event Agent effectively acts as an implementation of the Model Context Protocol (MCP), serving as a standardized "USB-C" connection between the model and enterprise data sources like databases and logs.
## 5. Data Flow diagram, Agent Workflow & Sequence diagram


The communication between these agents follows an Agent-to-Agent (A2A) interaction pattern, allowing for sophisticated delegation and brainstorming between specialized roles.


Initialization: The User or a Live Trigger provides an event (e.g., "storage latency spike").
Contextualization: The Event Agent quantifies the spike against a historical corpus.
Pathfinding: The Impact Graph Agent builds a candidate dependency graph.
Validation Loop: For each edge in the graph:
Forecasting scores the edge via calibrated formulas.
Falsifier searches for counter-evidence (e.g., recent config changes).
If contradicting evidence is found, the edge is KILLED with a specific reason.
Delivery: Uncertainty is propagated across the surviving chain to provide a ranked impact list.
## 6. Falsifier Decision Logic
The Falsifier Agent serves as the "adversarial" component of the system:

Scenario: Forecasting predicts a 74% probability of API degradation due to storage latency.
Falsifier Search: Identifies a traffic-routing change deployed 10 minutes prior.
Conclusion: The routing change is a more plausible explanation. The edge is KILLED to prevent alarm fatigue.
## 7. Data Model Examples
Event Object{
  "trigger": "storage_latency_spike",
  "magnitude": "p99 latency 3.2x baseline",
  "timestamp": "2026-08-21T09:14:00Z",
  "historical_percentile": 91
}


Edge Object{
  "from": "storage_service",
  "to": "dependent_api",
  "probability": 0.74,
  "time_window_minutes": 30,
  "falsifier_decision": "KILL",
  "reason": "Alternate explanation (routing change) accounts for observed latency"

}
## 8. Tech Stack & Implementation
Layer
Technology
Agent Orchestration
Gemini Agent Platform (ADK), Gemini API
Forecasting & Scoring
Vertex AI, Lightweight Regression Model
Structured Data
BigQuery (Public cluster data + custom corpus)
Deployment
Cloud Run
Interface
Firebase, React (Evidence Cards)


The integration of these layers demonstrates the shift toward Agentic Engineering, where the primary output is a system of interoperable agents rather than just raw code.
## 9. Evaluation Approach
To ensure "data-driven" claims are measurable:

Backtesting: Processing 5–10 historical incidents through the full pipeline.
Comparison: Measuring predicted vs. actual outcomes.
Falsifier Impact: Reporting accuracy metrics before and after the Falsifier intervention to prove value.
