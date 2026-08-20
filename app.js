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
// PAYMENT TESTS + TRACES
// -------------------------

let paymentAttempts = 0;
let paymentFailures = 0;

const totalPaymentsToSimulate = 10;

for (let i = 1; i <= totalPaymentsToSimulate; i++) {
    const paymentSpan = tracer.startSpan(`payment-test-${i}`);

    console.log(`Payment test ${i} started`);

    const paymentStartTime = Date.now();

    paymentAttempts++;
    paymentAttemptsCounter.add(1);

    // Simulate ~70% success rate
    const paymentSuccessful = Math.random() < 0.7;

    // Simulate processing time
    const simulatedDuration = Math.floor(
        Math.random() * 400
    ) + 100;

    paymentSpan.setAttribute(
        "payment.attempt.number",
        i
    );

    paymentSpan.setAttribute(
        "payment.successful",
        paymentSuccessful
    );

    if (!paymentSuccessful) {
        paymentFailures++;
        paymentFailuresCounter.add(1);

        console.error(
            `ERROR: Payment ${i} failed`
        );

        paymentSpan.setAttribute(
            "payment.failures.total",
            paymentFailures
        );

        paymentSpan.setStatus({
            code: SpanStatusCode.ERROR,
            message: "Payment failed"
        });
    } else {
        console.log(
            `Payment ${i} succeeded`
        );
    }

    const paymentDuration =
        Date.now() - paymentStartTime +
        simulatedDuration;

    paymentDurationHistogram.record(
        paymentDuration,
        {
            "payment.successful": paymentSuccessful,
        }
    );

    paymentSpan.setAttribute(
        "payment.duration_ms",
        paymentDuration
    );

    paymentSpan.end();

    console.log(
        `Payment test ${i} completed`
    );
}
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