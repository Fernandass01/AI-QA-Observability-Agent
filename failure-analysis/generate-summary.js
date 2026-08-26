const fs = require("fs");
const path = require("path");

const analysesPath = path.join(
    __dirname,
    "analyses.json"
);

if (!fs.existsSync(analysesPath)) {
    console.log(
        "[AI-QA] No analyses.json found. Summary skipped."
    );
    process.exit(0);
}

const analyses = JSON.parse(
    fs.readFileSync(analysesPath, "utf8")
);

let markdown = `# 🤖 AI QA Failure Analysis

**Failures analyzed:** ${analyses.length}

`;

analyses.forEach((analysis, index) => {
    markdown += `## ${index + 1}. ${analysis.testName}

| Field | Result |
| --- | --- |
| Status | ${analysis.status} |
| Duration | ${analysis.durationMs} ms |
| Failure Category | ${analysis.failureCategory} |

### Root Cause

${analysis.rootCause}

### Expected

${analysis.expected}

### Actual

${analysis.actual}

### Suggested Action

${analysis.suggestedAction}

---

`;
});

const summaryPath = process.env.GITHUB_STEP_SUMMARY;

if (summaryPath) {
    fs.appendFileSync(
        summaryPath,
        markdown
    );

    console.log(
        "[AI-QA] GitHub Actions summary generated."
    );
} else {
    console.log(markdown);

    console.log(
        "[AI-QA] GITHUB_STEP_SUMMARY not available. Printed summary locally."
    );
}