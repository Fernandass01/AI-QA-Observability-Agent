const sdk = require("./instrumentation");
const { metrics } = require("@opentelemetry/api");

const meter = metrics.getMeter(
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

        testsTotalCounter.add(1, {
            "test.name": test.title,
        });

        if (result.status === "passed") {

            testsPassedCounter.add(1, {
                "test.name": test.title,
            });

            console.log(
                `[OTEL] PASS: ${test.title}`
            );

        } else {

            testsFailedCounter.add(1, {
                "test.name": test.title,
                "test.status": result.status,
            });

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
    }

    async onEnd() {

        console.log(
            "[OTEL] Playwright telemetry export complete"
        );

        await sdk.shutdown();
    }
}

module.exports = ObservabilityReporter;