# Observability Basics

Observability is the ability to understand the internal state of a system by examining the data that the system produces.

For this project, we focus on three primary telemetry signals:

**Logs, Metrics, and Traces.**

## Logs

Logs describe individual events that occurred inside an application.

Example:

```text
Application started
Payment test started
ERROR: Payment failed
```

Logs help answer:

> What happened?

For QA engineers, logs can provide information about application failures that may not be visible from the automated test itself.

## Metrics

Metrics are numerical measurements collected over time.

Examples include:

```text
Payment attempts
Payment failures
Success rate
Error rate
Response time
Request count
```

Metrics help answer questions such as:

> How often is the problem happening?

> Is application performance getting worse?

> What percentage of requests are failing?

The first version of this project calculates payment metrics manually.

Future versions will use OpenTelemetry Metrics.

## Traces

Traces represent the journey of an operation through a system.

A simple trace might look like:

```text
Checkout
   |
   +-- Authentication
   |
   +-- Cart Validation
   |
   +-- Payment
   |
   +-- Database
```

Each individual operation within a trace is called a **span**.

## Trace vs Span

A **Trace** represents the complete journey.

A **Span** represents one individual operation within that journey.

Example:

```text
TRACE: checkout
│
├── SPAN: login
├── SPAN: validate-cart
├── SPAN: payment
└── SPAN: database
```

If the payment operation fails, observability allows us to identify the exact operation associated with the failure.

## Why Observability Matters for QA

Traditional automated testing might report:

```text
Checkout Test FAILED
```

That tells the QA engineer **that something failed**, but not necessarily why.

With observability, the investigation can become:

```text
Checkout Test FAILED

Trace:
Checkout
   |
   +-- Payment API

Metric:
Payment latency = 4.8 seconds

Log:
Payment service timeout

Probable Root Cause:
Payment API timeout
```

This provides significantly more information for debugging and root-cause analysis.

## Observability and AI

The long-term objective of this project is to provide telemetry to an AI agent.

The future architecture will look approximately like:

```text
            Test Failure
                 |
       +---------+---------+
       |         |         |
       v         v         v
      Logs     Metrics    Traces
       |         |         |
       +---------+---------+
                 |
                 v
             AI Agent
                 |
                 v
        Root Cause Analysis
                 |
                 v
          Suggested Action
```

Instead of simply reporting:

```text
Test failed
```

the system should eventually be able to generate an analysis similar to:

```text
Failure:
Checkout test failed.

Evidence:
Payment service returned an error.

Probable Root Cause:
Payment service failure.

Recommended Action:
Investigate the payment service and associated trace.
```

## QA Observability Goal

The objective is to evolve traditional QA automation:

```text
Test
  |
  v
PASS / FAIL
```

into:

```text
Automated Test
      |
      v
Observability
      |
 +----+----+
 |    |    |
Logs Metrics Traces
 |    |    |
 +----+----+
      |
      v
Failure Analysis
      |
      v
AI Agent
```

This combination forms the foundation of the **AI QA Observability Agent** project.

