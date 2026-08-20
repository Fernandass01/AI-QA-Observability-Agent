const sdk = require("./instrumentation");
const { trace, SpanStatusCode } = require("@opentelemetry/api");

const tracer = trace.getTracer("ai-qa-observability-agent");

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

paymentAttempts++;

const paymentSuccessful = false;

paymentSpan.setAttribute("payment.attempts", paymentAttempts);
paymentSpan.setAttribute("payment.successful", paymentSuccessful);

if (!paymentSuccessful) {
    paymentFailures++;

    console.error("ERROR: Payment failed");

    paymentSpan.setAttribute("payment.failures", paymentFailures);

    paymentSpan.setStatus({
        code: SpanStatusCode.ERROR,
        message: "Payment failed"
    });
}

console.log("Payment test completed");

paymentSpan.end();

// -------------------------
// METRICS
// -------------------------

console.log("----- METRICS -----");

console.log("Payment attempts:", paymentAttempts);
console.log("Payment failures:", paymentFailures);

const successRate =
    ((paymentAttempts - paymentFailures) / paymentAttempts) * 100;

console.log("Success rate:", successRate + "%");

setTimeout(async () => {
    await sdk.shutdown();
    console.log("OpenTelemetry shutdown complete");
}, 1000);