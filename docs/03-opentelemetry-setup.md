# OpenTelemetry Setup

This document describes how OpenTelemetry was added to the AI QA Observability Agent.

## Install OpenTelemetry

Install the OpenTelemetry API:

```powershell
npm install @opentelemetry/api
```

Install the Node.js SDK and tracing/metrics packages:

```powershell
npm install @opentelemetry/sdk-node
npm install @opentelemetry/sdk-metrics
npm install @opentelemetry/sdk-trace-node
```

Install automatic Node.js instrumentation:

```powershell
npm install @opentelemetry/auto-instrumentations-node
```

Install the OTLP trace exporter:

```powershell
npm install @opentelemetry/exporter-trace-otlp-proto
```

## Instrumentation File

A dedicated file was created:

```text
instrumentation.js
```

Its responsibility is to initialize OpenTelemetry before the application starts.

The application loads it before executing application logic.

```javascript
const sdk = require("./instrumentation");
```

## OTLP Trace Exporter

The trace exporter sends telemetry to the OpenTelemetry Collector:

```javascript
const traceExporter = new OTLPTraceExporter({
    url: "http://localhost:4318/v1/traces",
});
```

The flow is:

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
localhost:4318
```

## Service Resource

A custom OpenTelemetry resource was added so the application could be identified correctly.

```javascript
const resource = resourceFromAttributes({
    "service.name": "ai-qa-observability-agent",
    "service.version": "1.0.0",
    "deployment.environment.name": "development",
});
```

Without this configuration, the service initially appeared as:

```text
unknown_service:C:\Program Files\nodejs\node.exe
```

After configuring the resource, the service appears as:

```text
ai-qa-observability-agent
```

## Custom Tracer

The application obtains a tracer:

```javascript
const tracer = trace.getTracer(
    "ai-qa-observability-agent"
);
```

The tracer is responsible for creating spans.

## Payment Span

A custom span was created around the simulated payment operation:

```javascript
const paymentSpan = tracer.startSpan("payment-test");
```

Custom attributes were attached:

```javascript
paymentSpan.setAttribute(
    "payment.attempts",
    paymentAttempts
);

paymentSpan.setAttribute(
    "payment.successful",
    paymentSuccessful
);
```

When the payment fails:

```javascript
paymentSpan.setAttribute(
    "payment.failures",
    paymentFailures
);
```

The span is marked as an error:

```javascript
paymentSpan.setStatus({
    code: SpanStatusCode.ERROR,
    message: "Payment failed"
});
```

Finally:

```javascript
paymentSpan.end();
```

## SDK Shutdown

Because the application is short-lived, the SDK is shut down gracefully before Node.js exits.

```javascript
setTimeout(async () => {
    await sdk.shutdown();
    console.log(
        "OpenTelemetry shutdown complete"
    );
}, 1000);
```

This gives OpenTelemetry time to flush telemetry to the Collector.

## Result

The application now generates a real OpenTelemetry span:

```text
Service:
ai-qa-observability-agent

Span:
payment-test

Status:
ERROR

Description:
Payment failed
```

This trace is exported through OTLP to the OpenTelemetry Collector.
