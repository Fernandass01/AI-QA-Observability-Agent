const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const sdk = require("../instrumentation");

const {
    trace,
    SpanStatusCode,
} = require("@opentelemetry/api");

// --------------------------------------------------
// LOAD ENVIRONMENT VARIABLES
// --------------------------------------------------

require("dotenv").config({
    path: path.join(
        __dirname,
        "..",
        ".env.local"
    ),
});

if (!process.env.OPENAI_API_KEY) {
    throw new Error(
        "OPENAI_API_KEY was not found in the environment."
    );
}

// --------------------------------------------------
// OPENAI CLIENT
// --------------------------------------------------

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// --------------------------------------------------
// OPENTELEMETRY TRACER
// --------------------------------------------------

const tracer = trace.getTracer(
    "ai-qa-failure-analyzer"
);

// --------------------------------------------------
// FAILURE INPUT
// --------------------------------------------------

const failuresPath = path.join(
    __dirname,
    "failures.json"
);

if (!fs.existsSync(failuresPath)) {
    throw new Error(
        `Failure file not found: ${failuresPath}`
    );
}

const failures = JSON.parse(
    fs.readFileSync(
        failuresPath,
        "utf8"
    )
);

// --------------------------------------------------
// ANALYZE ONE FAILURE
// --------------------------------------------------

async function analyzeSingleFailure(failure) {

    const response =
        await openai.responses.create({
            model: "gpt-5.4",

            input: `
You are a senior QA automation engineer.

Analyze the following Playwright automated test failure.

Test Name:
${failure.testName}

Status:
${failure.status}

Duration:
${failure.durationMs} ms

Playwright Error:
${failure.errorMessage}

Your task is to identify:

1. The failure category.
2. The probable root cause.
3. The expected result.
4. The actual result.
5. The recommended action.
6. A concrete proposed fix.

The proposedFix should be specific enough for a QA engineer
to understand what code or assertion could be changed.

Do NOT modify any source code.
Do NOT claim that a fix has already been applied.
Only recommend the change.

Return ONLY valid JSON.

Use this exact structure:

{
  "failureCategory": "",
  "rootCause": "",
  "expected": "",
  "actual": "",
  "suggestedAction": "",
  "proposedFix": ""
}
`,
        });

    return JSON.parse(
        response.output_text
    );
}

// --------------------------------------------------
// ANALYZE ALL FAILURES
// --------------------------------------------------

async function analyzeFailures() {

    console.log(
        "\n=============================="
    );

    console.log(
        "AI QA FAILURE ANALYSIS"
    );

    console.log(
        "=============================="
    );

    const analyses = [];

    for (const failure of failures) {

        console.log(
            `\nAnalyzing: ${failure.testName}`
        );

        const analysis =
            await analyzeSingleFailure(
                failure
            );

        const combinedResult = {
            testName: failure.testName,
            status: failure.status,
            durationMs: failure.durationMs,
            ...analysis,
        };

        analyses.push(
            combinedResult
        );

        console.log(
            JSON.stringify(
                combinedResult,
                null,
                2
            )
        );

        // ------------------------------------------
        // AI ANALYSIS OPENTELEMETRY TRACE
        // ------------------------------------------

        const analysisSpan =
            tracer.startSpan(
                `ai-analysis: ${failure.testName}`
            );

        analysisSpan.setAttribute(
            "ai.failure.test_name",
            failure.testName
        );

        analysisSpan.setAttribute(
            "ai.failure.category",
            analysis.failureCategory ||
                "Unknown"
        );

        analysisSpan.setAttribute(
            "ai.failure.root_cause",
            analysis.rootCause ||
                "Unknown"
        );

        analysisSpan.setAttribute(
            "ai.failure.expected",
            analysis.expected ||
                "Unknown"
        );

        analysisSpan.setAttribute(
            "ai.failure.actual",
            analysis.actual ||
                "Unknown"
        );

        analysisSpan.setAttribute(
            "ai.failure.suggested_action",
            analysis.suggestedAction ||
                "Unknown"
        );

        analysisSpan.setAttribute(
            "ai.failure.proposed_fix",
            analysis.proposedFix ||
                "Unknown"
        );

        analysisSpan.setStatus({
            code: SpanStatusCode.OK,
        });

        analysisSpan.end();
    }

    // --------------------------------------------------
    // SAVE ANALYSIS RESULTS
    // --------------------------------------------------

    const analysesPath = path.join(
        __dirname,
        "analyses.json"
    );

    fs.writeFileSync(
        analysesPath,
        JSON.stringify(
            analyses,
            null,
            2
        )
    );

    console.log(
        `\n[AI-QA] ${analyses.length} analysis result(s) saved: ${analysesPath}`
    );

    // --------------------------------------------------
    // OPENTELEMETRY SHUTDOWN
    // --------------------------------------------------

    // Telemetry export may not be available in every
    // environment, especially GitHub-hosted runners.
    // AI analysis should remain successful even if
    // telemetry export is unavailable.

    try {

        await sdk.shutdown();

        console.log(
            "[OTEL] AI analysis traces export complete"
        );

    } catch (error) {

        console.warn(
            "[OTEL] Trace export unavailable. AI analysis completed successfully."
        );

        console.warn(
            `[OTEL] ${error.message}`
        );
    }
}

// --------------------------------------------------
// START ANALYSIS
// --------------------------------------------------

analyzeFailures().catch(
    (error) => {

        console.error(
            "AI analysis failed:",
            error.message
        );

        process.exitCode = 1;
    }
);