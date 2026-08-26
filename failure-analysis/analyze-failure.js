const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const sdk = require("../instrumentation");

const {
    trace,
    SpanStatusCode,
} = require("@opentelemetry/api");

require("dotenv").config({
    path: path.join(__dirname, "..", ".env.local"),
});

if (!process.env.OPENAI_API_KEY) {
    throw new Error(
        "OPENAI_API_KEY was not found in .env.local"
    );
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const tracer = trace.getTracer(
    "ai-qa-failure-analyzer"
);

const failuresPath = path.join(
    __dirname,
    "failures.json"
);

const failures = JSON.parse(
    fs.readFileSync(failuresPath, "utf8")
);

async function analyzeSingleFailure(failure) {

    const response = await openai.responses.create({
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

Return ONLY valid JSON with this exact structure:

{
  "failureCategory": "",
  "rootCause": "",
  "expected": "",
  "actual": "",
  "suggestedAction": ""
}
`,
    });

    return JSON.parse(
        response.output_text
    );
}

async function analyzeFailures() {

    console.log("\n==============================");
    console.log("AI QA FAILURE ANALYSIS");
    console.log("==============================");

    const analyses = [];

    for (const failure of failures) {

        console.log(
            `\nAnalyzing: ${failure.testName}`
        );

        const analysis =
            await analyzeSingleFailure(failure);

        const combinedResult = {
            testName: failure.testName,
            status: failure.status,
            durationMs: failure.durationMs,
            ...analysis,
        };

        analyses.push(combinedResult);

        console.log(
            JSON.stringify(
                combinedResult,
                null,
                2
            )
        );

        // -------------------------
        // AI ANALYSIS TRACE
        // -------------------------

        const analysisSpan = tracer.startSpan(
            `ai-analysis: ${failure.testName}`
        );

        analysisSpan.setAttribute(
            "ai.failure.test_name",
            failure.testName
        );

        analysisSpan.setAttribute(
            "ai.failure.category",
            analysis.failureCategory
        );

        analysisSpan.setAttribute(
            "ai.failure.root_cause",
            analysis.rootCause
        );

        analysisSpan.setAttribute(
            "ai.failure.expected",
            analysis.expected
        );

        analysisSpan.setAttribute(
            "ai.failure.actual",
            analysis.actual
        );

        analysisSpan.setAttribute(
            "ai.failure.suggested_action",
            analysis.suggestedAction
        );

        analysisSpan.setStatus({
            code: SpanStatusCode.OK,
        });

        analysisSpan.end();
    }

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

   try {
        await sdk.shutdown();

        console.log(
            "[OTEL] AI analysis traces export complete"
        );
    } catch (error) {
        console.warn(
            "[OTEL] Trace export unavailable. AI analysis completed successfully."
        );
    }
}

analyzeFailures().catch((error) => {
    console.error(
        "AI analysis failed:",
        error.message
    );

    process.exitCode = 1;
});