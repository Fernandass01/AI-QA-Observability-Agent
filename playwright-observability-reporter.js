const sdk = require("./instrumentation");

const fs = require("fs");
const path = require("path");

const {
    metrics,
    trace,
    SpanStatusCode,
} = require("@opentelemetry/api");

const failures = [];

const testSummary = {
    total: 0,
    passed: 0,
    failed: 0,
};

function cleanAnsi(text = "") {
    return text.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "");
}

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
        // TEST SUMMARY
        // -------------------------

        testSummary.total++;

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

            testSummary.passed++;

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

            testSummary.failed++;

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
                    cleanAnsi(
                        result.error.message ||
                        "Unknown Playwright error"
                    )
                );
            }

            // -------------------------
            // FAILURE CAPTURE
            // -------------------------

            const failureData = {
                testName: test.title,
                status: result.status,
                durationMs: result.duration,
                errorMessage: cleanAnsi(
                    result.error?.message ||
                    "Unknown Playwright error"
                ),
                timestamp: new Date().toISOString(),
            };

            failures.push(failureData);

            console.log(
                `[AI-QA] Failure captured: ${test.title}`
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

        testSpan.end();
    }

    async onEnd() {

        // -------------------------
        // FAILURE ANALYSIS DIRECTORY
        // -------------------------

        const failureDirectory = path.join(
            __dirname,
            "failure-analysis"
        );

        fs.mkdirSync(
            failureDirectory,
            { recursive: true }
        );

        // -------------------------
        // SAVE ALL FAILURES
        // -------------------------

        if (failures.length > 0) {

            const failuresFile = path.join(
                failureDirectory,
                "failures.json"
            );

            fs.writeFileSync(
                failuresFile,
                JSON.stringify(
                    failures,
                    null,
                    2
                )
            );

            console.log(
                `[AI-QA] ${failures.length} failure(s) saved: ${failuresFile}`
            );
        }

        // -------------------------
        // SAVE TEST SUMMARY
        // -------------------------

        const summaryFile = path.join(
            failureDirectory,
            "test-summary.json"
        );

        fs.writeFileSync(
            summaryFile,
            JSON.stringify(
                testSummary,
                null,
                2
            )
        );

        console.log(
            `[AI-QA] Test summary saved: ${summaryFile}`
        );

        // -------------------------
        // SHUTDOWN
        // -------------------------

        console.log(
            "[OTEL] Playwright telemetry export complete"
        );

        await sdk.shutdown();
    }
}

module.exports = ObservabilityReporter;