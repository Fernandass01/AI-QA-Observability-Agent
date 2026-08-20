# First Distributed Trace

This milestone created and visualized the project's first OpenTelemetry trace.

## Scenario

The application intentionally simulates a failed payment.

```text
Payment Test
     |
     v
Payment Attempt
     |
     v
Payment Failure
     |
     v
OpenTelemetry Span
```

## Span

The operation is represented by:

```text
payment-test
```

The span records:

```text
payment.attempts = 1
payment.successful = false
payment.failures = 1
```

The span status is:

```text
ERROR
```

with the description:

```text
Payment failed
```

## Telemetry Pipeline

The successful telemetry path is:

```text
Node.js
   |
   v
OpenTelemetry SDK
   |
   v
OTLP Trace Exporter
   |
   v
OpenTelemetry Collector
   |
   v
Jaeger
```

## Collector Verification

Before checking Jaeger, the Collector's debug exporter was used to verify the span.

Collector output confirmed:

```text
InstrumentationScope:
ai-qa-observability-agent

Span:
payment-test

Status code:
Error

Status message:
Payment failed
```

This troubleshooting step was important because it separated the telemetry pipeline into two areas:

```text
Node.js → Collector
Collector → Jaeger
```

This made it possible to determine exactly where telemetry was successfully flowing.

## Service Naming

Initially Jaeger displayed:

```text
unknown_service:C:\Program Files\nodejs\node.exe
```

A custom OpenTelemetry resource fixed the issue.

The service is now identified as:

```text
ai-qa-observability-agent
```

## Jaeger Result

Jaeger successfully displayed:

```text
Service:
ai-qa-observability-agent

Operation:
payment-test

Spans:
1

Errors:
1
```

The trace detail view also showed:

```text
otel.status_code = ERROR
otel.status_description = Payment failed

payment.attempts = 1
payment.failures = 1
payment.successful = false
```

## Trace ID

A Trace ID uniquely identifies the complete journey of an operation.

Future versions of this project may contain a trace such as:

```text
TRACE: checkout
│
├── login
├── cart
├── checkout
├── payment
└── database
```

All of these spans can share the same Trace ID.

## Span ID

A Span ID uniquely identifies an individual operation within a trace.

For example:

```text
TRACE: checkout

Span: login
Span: cart
Span: payment
Span: database
```

Each span has its own Span ID.

## Why This Matters for QA

Traditional automation might report:

```text
Checkout Test FAILED
```

Distributed tracing can provide:

```text
Checkout Test FAILED
        |
        v
Payment operation
        |
        v
ERROR
        |
        v
Payment failed
```

As the project evolves, this telemetry will become input for an AI agent that can perform automated failure analysis.

## Milestone Completed

The project has successfully demonstrated:

* OpenTelemetry instrumentation
* Custom span creation
* Span attributes
* Error status
* OTLP export
* OpenTelemetry Collector
* Docker-based observability infrastructure
* Jaeger trace visualization
* Basic root-cause investigation

## Next Milestone

The next phase introduces **OpenTelemetry Metrics**.

Planned metrics include:

```text
payment_attempts_total
payment_failures_total
payment_duration
```

These metrics will later be visualized using Grafana.
