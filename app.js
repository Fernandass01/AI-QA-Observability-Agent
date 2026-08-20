const sdk = require("./instrumentation");

const {
    trace,
    metrics,
    SpanStatusCode,
} = require("@opentelemetry/api");

const tracer = trace.getTracer("ai-qa-observability-agent");

const meter = metrics.getMeter("ai-qa-observability-agent");

const paymentAttemptsCounter = meter.createCounter(
    "payment_attempts_total",
    {
        description: "Total number of payment attempts",
    }
);

const paymentFailuresCounter = meter.createCounter(
    "payment_failures_total",
    {
        description: "Total number of failed payments",
    }
);

const paymentDurationHistogram = meter.createHistogram(
    "payment_duration_ms",
    {
        description: "Payment operation duration",
        unit: "ms",
    }
);

console.log("=================================");
console.log("AI QA Observability Agent");
console.log("=================================");

console.log("Application started");

const user = {
    name: "Fernanda",
    role: "QA Automation Engineer"
};

console.log("User:", user);

console.log("Test execution started");
console.log("Test execution completed");

// -------------------------
// PAYMENT TEST + TRACE
// -------------------------

let paymentAttempts = 0;
let paymentFailures = 0;

const paymentSpan = tracer.startSpan("payment-test");

console.log("Payment test started");

const paymentStartTime = Date.now();

paymentAttempts++;
paymentAttemptsCounter.add(1);

const paymentSuccessful = false;

paymentSpan.setAttribute(
    "payment.attempts",
    paymentAttempts
);

paymentSpan.setAttribute(
    "payment.successful",
    paymentSuccessful
);

if (!paymentSuccessful) {
    paymentFailures++;
    paymentFailuresCounter.add(1);

    console.error("ERROR: Payment failed");

    paymentSpan.setAttribute(
        "payment.failures",
        paymentFailures
    );

    paymentSpan.setStatus({
        code: SpanStatusCode.ERROR,
        message: "Payment failed"
    });
}

console.log("Payment test completed");

const paymentDuration =
    Date.now() - paymentStartTime;

paymentDurationHistogram.record(
    paymentDuration,
    {
        "payment.successful": paymentSuccessful,
    }
);

paymentSpan.end();

// -------------------------
// METRICS
// -------------------------

console.log("----- METRICS -----");

console.log(
    "Payment attempts:",
    paymentAttempts
);

console.log(
    "Payment failures:",
    paymentFailures
);

const successRate =
    ((paymentAttempts - paymentFailures) /
        paymentAttempts) * 100;

console.log(
    "Success rate:",
    successRate + "%"
);

setTimeout(async () => {
    await sdk.shutdown();

    console.log(
        "OpenTelemetry shutdown complete"
    );
}, 1000);