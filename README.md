# AI QA Observability Agent

A hands-on QA engineering project combining **Test Automation, Observability, OpenTelemetry, Distributed Tracing, Docker, and AI Agents**.

The long-term goal is to build an intelligent QA observability system capable of detecting test failures, collecting telemetry, analyzing the probable root cause, and eventually using an AI agent to assist with failure investigation.

## Project Goals

This project explores how modern QA automation can be combined with observability and artificial intelligence.

The system will eventually be able to:

* Execute automated tests
* Detect test failures
* Collect application logs
* Collect metrics
* Generate distributed traces
* Analyze failures
* Identify probable root causes
* Provide evidence for the analysis
* Suggest possible fixes
* Integrate with an AI agent
* Re-run automated tests to verify results

## Current Architecture

```text
Node.js Application
        |
        v
OpenTelemetry SDK
        |
        v
OTLP Exporter
        |
        v
OpenTelemetry Collector
        |
        v
Jaeger
        |
        v
Distributed Trace Analysis
```

## Current Test Scenario

The application currently simulates a payment failure.

```text
Payment Test
     |
     v
Payment Attempt
     |
     v
Payment Failed
     |
     v
OpenTelemetry Span
     |
     v
ERROR
```

The `payment-test` span contains custom attributes such as:

```text
payment.attempts = 1
payment.successful = false
payment.failures = 1
```

The failure is recorded with the OpenTelemetry error status:

```text
Status: ERROR
Description: Payment failed
```

## Technologies

* Node.js
* JavaScript
* OpenTelemetry
* OTLP
* OpenTelemetry Collector
* Jaeger
* Docker
* Docker Compose

Planned technologies:

* OpenTelemetry Metrics
* Grafana
* Playwright
* API Testing
* AI Agents
* CI/CD

## Observability Concepts

The project focuses on the three major observability signals:

### Logs

Logs describe events that occurred inside the application.

Example:

```text
ERROR: Payment failed
```

### Metrics

Metrics measure application behavior over time.

Examples:

```text
Payment attempts
Payment failures
Success rate
Response duration
```

### Traces

Traces show the path and duration of operations inside a system.

The first distributed trace created in this project is:

```text
Service: ai-qa-observability-agent
Operation: payment-test
Status: ERROR
```

## Project Structure

```text
AI-QA-Observability-Agent/
|
├── docs/
│   ├── 01-project-setup.md
│   ├── 02-observability-basics.md
│   ├── 03-opentelemetry-setup.md
│   ├── 04-docker-jaeger-setup.md
│   └── 05-first-trace.md
|
├── app.js
├── instrumentation.js
├── docker-compose.yml
├── otel-collector-config.yml
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## Progress

### Phase 1 — Fundamentals

* [x] Create Node.js project
* [x] Create application logs
* [x] Simulate application failure
* [x] Create basic manual metrics
* [x] Learn Logs, Metrics, and Traces

### Phase 2 — OpenTelemetry

* [x] Install OpenTelemetry
* [x] Configure Node.js SDK
* [x] Configure OTLP exporter
* [x] Configure OpenTelemetry Collector
* [x] Run Collector with Docker
* [x] Configure Jaeger
* [x] Create first custom span
* [x] Send trace through the Collector
* [x] Visualize trace in Jaeger
* [x] Add custom service name
* [x] Record payment failure as an OpenTelemetry error

### Phase 3 — Metrics

* [ ] Implement OpenTelemetry Metrics
* [ ] Create payment attempt counter
* [ ] Create payment failure counter
* [ ] Measure operation duration
* [ ] Export metrics through OTLP
* [ ] Visualize metrics

### Phase 4 — Grafana

* [ ] Add Grafana
* [ ] Build QA observability dashboard
* [ ] Visualize test success/failure rates
* [ ] Visualize latency
* [ ] Visualize error rates

### Phase 5 — Test Automation

* [ ] Add Playwright
* [ ] Create automated checkout tests
* [ ] Connect test execution with telemetry
* [ ] Correlate test failures with traces

### Phase 6 — AI Agent

* [ ] Build AI failure-analysis agent
* [ ] Provide traces, metrics, and logs to the agent
* [ ] Generate root-cause analysis
* [ ] Generate failure summaries
* [ ] Suggest corrective actions
* [ ] Re-run tests to validate fixes

## Troubleshooting Learned During Development

This project intentionally documents problems encountered during implementation.

Examples include:

* Docker daemon not running
* Docker Desktop update required
* OTLP Collector connection reset (`ECONNRESET`)
* Collector initially listening only on `127.0.0.1`
* Docker port configuration
* Unknown OpenTelemetry service name
* Configuring a custom `service.name`
* Verifying traces through Collector debug output

Troubleshooting is part of the project because observability is fundamentally about understanding and diagnosing system behavior.

## Final Vision

The final architecture will evolve toward:

```text
Playwright Tests
       |
       v
Application
       |
       v
OpenTelemetry
   /    |    \
Logs Metrics Traces
   \    |    /
       v
Observability Platform
       |
       v
AI QA Agent
       |
       v
Root Cause Analysis
       |
       v
Suggested Fix
       |
       v
Automated Retest
```

## Status

**In development**

Current milestone:

> Distributed tracing successfully implemented using Node.js, OpenTelemetry Collector, Docker, and Jaeger.

Next milestone:

> Implement real OpenTelemetry Metrics and begin preparing the Grafana observability layer.
