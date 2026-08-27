# OpenTelemetry Metrics

This document describes how real OpenTelemetry metrics were added to the AI QA Observability Agent.

## Goal

The project initially used manual counters printed with `console.log()`.

Example:

```text
Payment attempts: 1
Payment failures: 1
Success rate: 0%
```

Those values are useful for learning, but they are not persistent telemetry.

The goal of this milestone was to create real OpenTelemetry metrics that can be exported, collected, and later visualized in Grafana.

## Metrics Exporter

The OTLP metrics exporter was added with:

```powershell
npm install @opentelemetry/exporter-metrics-otlp-proto
```

The exporter sends metrics to the OpenTelemetry Collector:

```javascript
const metricExporter = new OTLPMetricExporter({
    url: "http://localhost:4318/v1/metrics",
});
```

## Periodic Metric Reader

A periodic metric reader was configured:

```javascript
const metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 5000,
});
```

The metric reader is passed into the NodeSDK:

```javascript
const sdk = new NodeSDK({
    resource,
    traceExporter,
    metricReader,
    instrumentations: [getNodeAutoInstrumentations()],
});
```

## Collector Metrics Pipeline

The OpenTelemetry Collector configuration was updated with a metrics pipeline:

```yaml
metrics:
  receivers: [otlp]
  processors: [batch]
  exporters: [debug]
```

This allows the Collector to receive OTLP metrics and print them through the debug exporter.

## Automatic Runtime Metrics

OpenTelemetry also generated Node.js runtime metrics automatically.

Examples included:

```text
v8js.memory.heap.space.physical_size
v8js.memory.heap.space.available_size
v8js.resource.active
```

These metrics describe runtime behavior such as memory usage and active event loop resources.

## Custom QA Metrics

Three custom metrics were added specifically for the simulated payment test.

### Payment Attempts

```javascript
const paymentAttemptsCounter = meter.createCounter(
    "payment_attempts_total",
    {
        description: "Total number of payment attempts",
    }
);
```

Each payment attempt increments the counter:

```javascript
paymentAttemptsCounter.add(1);
```

### Payment Failures

```javascript
const paymentFailuresCounter = meter.createCounter(
    "payment_failures_total",
    {
        description: "Total number of failed payments",
    }
);
```

When the payment fails:

```javascript
paymentFailuresCounter.add(1);
```

### Payment Duration

A histogram measures how long the payment operation takes:

```javascript
const paymentDurationHistogram = meter.createHistogram(
    "payment_duration_ms",
    {
        description: "Payment operation duration",
        unit: "ms",
    }
);
```

The operation duration is calculated:

```javascript
const paymentStartTime = Date.now();
```

and later:

```javascript
const paymentDuration =
    Date.now() - paymentStartTime;
```

The duration is recorded with an attribute:

```javascript
paymentDurationHistogram.record(
    paymentDuration,
    {
        "payment.successful": paymentSuccessful,
    }
);
```

## Verification

The application was executed with:

```powershell
node app.js
```

The Collector was then searched for the custom metric names:

```powershell
docker logs otel-collector 2>&1 |
Select-String "payment_attempts_total|payment_failures_total|payment_duration_ms"
```

The Collector confirmed all three custom metrics:

```text
Name: payment_attempts_total
Name: payment_failures_total
Name: payment_duration_ms
```

## Current Telemetry Architecture

```text
Node.js Application
        |
        v
OpenTelemetry SDK
   /             \
  v               v
Traces           Metrics
  |               |
  v               v
OTLP Exporters
   \             /
        |
        v
OpenTelemetry Collector
   |               |
   v               v
Jaeger           Debug Metrics
```

## Why This Matters for QA

These metrics allow a QA observability system to measure:

* Number of test/payment attempts
* Number of failures
* Failure rate
* Operation duration
* Performance changes over time

Later, these measurements can be visualized in Grafana and combined with traces and logs for AI-assisted root-cause analysis.

## Milestone Completed

The project now supports:

* OpenTelemetry traces
* Custom spans
* Error status
* OpenTelemetry metrics
* Custom counters
* Custom histograms
* Node.js runtime metrics
* OTLP export
* OpenTelemetry Collector pipelines for traces and metrics

## Next Milestone

The next phase is to add **Grafana** and a metrics backend so the custom QA metrics can be visualized in dashboards.
## Dynamic Payment Simulation

The application now simulates 10 payment transactions per execution.

Each payment randomly succeeds or fails, allowing the observability
pipeline to generate realistic QA telemetry.

The simulation produces:

- Total payment attempts
- Total payment failures
- Payment failure rate
- Payment duration
- Individual OpenTelemetry traces for each payment

Example execution:

- Payment attempts: 10
- Payment failures: 3
- Success rate: 70%
- Failure rate: 30%

## Prometheus and Grafana

Prometheus scrapes metrics exposed by the OpenTelemetry Collector.

Grafana uses Prometheus as its data source and displays the following
QA observability metrics:

- Payment Attempts
- Payment Failures
- Average Payment Duration
- Payment Failure Rate

Average payment duration is calculated with:

```promql
sum(payment_duration_ms_milliseconds_sum)
/
sum(payment_duration_ms_milliseconds_count)
## Grafana Alerting

Grafana alerting is configured to automatically detect high payment
failure rates.

### Alert Rule

Alert name:

High Payment Failure Rate

The alert uses the following PromQL query:

```promql
(
  last_over_time(payment_failures_total[6h])
  /
  last_over_time(payment_attempts_total[6h])
) * 100

## QA Test Observability Dashboard

A dedicated Grafana dashboard was created to monitor automated QA test execution.

Dashboard name:

AI QA Test Observability Dashboard

### QA Metrics

The application exports the following OpenTelemetry metrics:

- `qa_tests_total` - Total number of QA tests executed
- `qa_tests_passed_total` - Total number of passed QA tests
- `qa_tests_failed_total` - Total number of failed QA tests
- `qa_test_duration_ms` - QA test execution duration

### Grafana Panels

The dashboard contains five QA observability panels:

- QA Tests - Total
- Passed Tests
- Failed Tests
- QA Pass Rate
- Average QA Test Duration

QA Pass Rate is calculated using:

```promql
(qa_tests_passed_total / qa_tests_total) * 100

## Playwright Test Observability

The project now integrates real Playwright automated tests with the OpenTelemetry observability pipeline.

### Architecture

Playwright Tests → Custom Observability Reporter → OpenTelemetry → OpenTelemetry Collector → Prometheus → Grafana

### Playwright Metrics

The custom Playwright reporter exports:

- `playwright_tests_total` — Total Playwright tests executed
- `playwright_tests_passed_total` — Total passed tests
- `playwright_tests_failed_total` — Total failed tests
- `playwright_test_duration_ms` — Playwright test execution duration

Metrics include attributes such as test name and test status.

### Grafana Dashboard

Dashboard: `Playwright Test Observability Dashboard`

The dashboard displays:

- Total tests
- Passed tests
- Failed tests
- Pass rate
- Average test duration

### Validation

The integration was validated with two real Playwright test executions:

- Total: 2
- Passed: 1
- Failed: 1
- Pass rate: 50%

Both PASS and FAIL results were exported through OpenTelemetry, verified in Prometheus, and visualized in Grafana.

## Playwright Tracing with Jaeger

Playwright test execution is now traced with OpenTelemetry and visualized in Jaeger.

Each Playwright test creates an OpenTelemetry span with attributes including:

- Test name
- Test status
- Test duration

Passing tests are marked with an OK span status.

Failing tests are marked with an ERROR span status.

### Exception Capture

When a Playwright test fails, the reporter records the actual Playwright exception using OpenTelemetry.

This allows Jaeger to display:

- Exception event
- Exception message
- Exception stack trace
- Test failure details

Example failure:

- Test: Intentional failing test for observability
- Expected title: Wrong Title
- Received title: Example Domain
- Span status: ERROR

### Trace Verification

Jaeger successfully displayed separate traces for:

- `playwright-test: Example homepage loads successfully`
- `playwright-test: Intentional failing test for observability`

The failed trace included the Playwright exception details, allowing the failure cause to be investigated directly from the observability platform.

### Observability Flow

Playwright Tests → Custom Reporter → OpenTelemetry → OpenTelemetry Collector

From the collector:

- Metrics → Prometheus → Grafana
- Traces and Exceptions → Jaeger

## Final Playwright Dashboard Validation

The Grafana dashboards were updated to use the current Playwright metrics.

### Total Tests

```promql
sum(playwright_tests_total)