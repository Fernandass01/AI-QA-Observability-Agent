const sdk = require("./instrumentation");
const fs = require("fs");
const path = require("path");

function cleanAnsi(text = "") {
    return text.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "");
}

const {
    metrics,
    trace,
    SpanStatusCode,
} = require("@opentelemetry/api");

const meter = metrics.getMeter(
    "playwright-observability-reporter"
);

const tracer = trace.getTracer(
    "playwright-observability-reporter"
);

const testsTotalCounter = meter.createCounter(
    "playwright_tests_total",
    {
        description: "Total number of Playwright tests executed",
    }
);

const testsPassedCounter = meter.createCounter(
    "playwright_tests_passed_total",
    {
        description: "Total number of Playwright tests passed",
    }
);

const testsFailedCounter = meter.createCounter(
    "playwright_tests_failed_total",
    {
        description: "Total number of Playwright tests failed",
    }
);

const testDurationHistogram = meter.createHistogram(
    "playwright_test_duration_ms",
    {
        description: "Playwright test execution duration",
        unit: "ms",
    }
);

class ObservabilityReporter {

    onTestEnd(test, result) {

        // -------------------------
        // TRACE
        // -------------------------

        const testSpan = tracer.startSpan(
            `playwright-test: ${test.title}`
        );

        testSpan.setAttribute(
            "test.name",
            test.title
        );

        testSpan.setAttribute(
            "test.status",
            result.status
        );

        testSpan.setAttribute(
            "test.duration_ms",
            result.duration
        );

        // -------------------------
        // METRICS
        // -------------------------

        testsTotalCounter.add(1, {
            "test.name": test.title,
        });

        if (result.status === "passed") {

            testsPassedCounter.add(1, {
                "test.name": test.title,
            });

            testSpan.setStatus({
                code: SpanStatusCode.OK,
            });

            console.log(
                `[OTEL] PASS: ${test.title}`
            );

        } else {

            testsFailedCounter.add(1, {
                "test.name": test.title,
                "test.status": result.status,
            });

            testSpan.setStatus({
                code: SpanStatusCode.ERROR,
                message: `Playwright test failed: ${test.title}`,
            });
            if (result.error) {
               testSpan.recordException(result.error);

               testSpan.setAttribute(
                "test.error.message",
                result.error.message || "Unknown Playwright error"


                
    );
}
const failureData = {
    testName: test.title,
    status: result.status,
    durationMs: result.duration,
    errorMessage: cleanAnsi(
    result.error?.message || "Unknown Playwright error"
),
    timestamp: new Date().toISOString(),
};

const failureFile = path.join(
    __dirname,
    "failure-analysis",
    "latest-failure.json"
);

fs.writeFileSync(
    failureFile,
    JSON.stringify(failureData, null, 2)
);

console.log(
    `[AI-QA] Failure data saved: ${failureFile}`
);

            console.log(
                `[OTEL] FAIL: ${test.title}`
            );
        }

        testDurationHistogram.record(
            result.duration,
            {
                "test.name": test.title,
                "test.status": result.status,
            }
        );

        // End the span after all attributes/status are recorded
        testSpan.end();
    }

    async onEnd() {

        console.log(
            "[OTEL] Playwright telemetry export complete"
        );

        await sdk.shutdown();
    }
}

module.exports = ObservabilityReporter;