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

const qaTestsTotalCounter = meter.createCounter(
    "qa_tests_total",
    {
        description: "Total number of QA tests executed",
    }
);

const qaTestsPassedCounter = meter.createCounter(
    "qa_tests_passed_total",
    {
        description: "Total number of QA tests passed",
    }
);

const qaTestsFailedCounter = meter.createCounter(
    "qa_tests_failed_total",
    {
        description: "Total number of QA tests failed",
    }
);

const qaTestDurationHistogram = meter.createHistogram(
    "qa_test_duration_ms",
    {
        description: "QA test execution duration",
        unit: "ms",
    }
);
// -------------------------
// QA TEST SUITE SIMULATION
// -------------------------

let qaTestsTotal = 0;
let qaTestsPassed = 0;
let qaTestsFailed = 0;

const qaTestSuite = [
    "Login Test",
    "Checkout Test",
    "Payment Test",
    "Search Test",
    "Profile Update Test"
];

for (const testName of qaTestSuite) {
    const testSpan = tracer.startSpan(`qa-${testName}`);

    const startTime = Date.now();

    qaTestsTotal++;
    qaTestsTotalCounter.add(1);

    const testPassed = Math.random() < 0.8;

    const simulatedDuration =
        Math.floor(Math.random() * 500) + 100;

    if (testPassed) {
        qaTestsPassed++;
        qaTestsPassedCounter.add(1);

        console.log(`PASS: ${testName}`);
    } else {
        qaTestsFailed++;
        qaTestsFailedCounter.add(1);

        console.error(`FAIL: ${testName}`);

        testSpan.setStatus({
            code: SpanStatusCode.ERROR,
            message: `${testName} failed`
        });
    }

    const testDuration =
        Date.now() - startTime + simulatedDuration;

    qaTestDurationHistogram.record(
        testDuration,
        {
            "test.name": testName,
            "test.passed": testPassed,
        }
    );

    testSpan.setAttribute(
        "test.name",
        testName
    );

    testSpan.setAttribute(
        "test.passed",
        testPassed
    );

    testSpan.setAttribute(
        "test.duration_ms",
        testDuration
    );

    testSpan.end();
}

const qaPassRate =
    (qaTestsPassed / qaTestsTotal) * 100;

console.log("----- QA TEST METRICS -----");
console.log("Total tests:", qaTestsTotal);
console.log("Passed tests:", qaTestsPassed);
console.log("Failed tests:", qaTestsFailed);
console.log("Pass rate:", qaPassRate + "%");


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