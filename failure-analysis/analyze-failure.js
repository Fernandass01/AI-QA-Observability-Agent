const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const sdk = require("../instrumentation");

const {
    trace,
    SpanStatusCode,
} = require("@opentelemetry/api");

const tracer = trace.getTracer(
    "ai-qa-failure-analyzer"
);

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

const failurePath = path.join(
    __dirname,
    "latest-failure.json"
);

const failure = JSON.parse(
    fs.readFileSync(failurePath, "utf8")
);

async function analyzeFailure() {

    console.log("\n==============================");
    console.log("AI QA FAILURE ANALYSIS");
    console.log("==============================");

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

    const analysis = JSON.parse(
        response.output_text
    );
const analysisSpan = tracer.startSpan(
    `ai-analysis: ${failure.testName}`
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


    console.log(
        JSON.stringify(analysis, null, 2)
    );

    const analysisPath = path.join(
        __dirname,
        "latest-analysis.json"
    );

    fs.writeFileSync(
        analysisPath,
        JSON.stringify(analysis, null, 2)
    );

    console.log(
        `\n[AI-QA] Analysis saved: ${analysisPath}`
    );
    await sdk.shutdown();

console.log(
    "[OTEL] AI analysis trace export complete"
);
}

analyzeFailure().catch((error) => {

    console.error(
        "AI analysis failed:",
        error.message
    );

    process.exitCode = 1;

    
});

