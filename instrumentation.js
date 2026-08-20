const {
    OTLPMetricExporter,
} = require("@opentelemetry/exporter-metrics-otlp-proto");

const {
    PeriodicExportingMetricReader,
} = require("@opentelemetry/sdk-metrics");


const { NodeSDK } = require("@opentelemetry/sdk-node");
const {
    getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");

const {
    OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-proto");

const {
    resourceFromAttributes,
} = require("@opentelemetry/resources");

const resource = resourceFromAttributes({
    "service.name": "ai-qa-observability-agent",
    "service.version": "1.0.0",
    "deployment.environment.name": "development",
});

const traceExporter = new OTLPTraceExporter({
    url: "http://localhost:4318/v1/traces",
});

const metricExporter = new OTLPMetricExporter({
    url: "http://localhost:4318/v1/metrics",
});

// Metric reader
const metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 5000,
});


// SDK
const sdk = new NodeSDK({
    resource,
    traceExporter,
    metricReader,
    instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

console.log("OpenTelemetry started");

module.exports = sdk;