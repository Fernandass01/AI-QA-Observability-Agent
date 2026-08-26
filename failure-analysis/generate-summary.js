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

const testSummaryPath = path.join(
    __dirname,
    "test-summary.json"
);

if (!fs.existsSync(testSummaryPath)) {
    console.log(
        "[AI-QA] No test-summary.json found. Summary skipped."
    );
    process.exit(0);
}

const testSummary = JSON.parse(
    fs.readFileSync(testSummaryPath, "utf8")
);

const totalTests = testSummary.total;
const passedTests = testSummary.passed;
const failedTests = testSummary.failed;

const categoryCounts = {};

for (const analysis of analyses) {
    const category =
        analysis.failureCategory || "Unknown";

    categoryCounts[category] =
        (categoryCounts[category] || 0) + 1;
}

let markdown = `# 🤖 AI QA Test Report

## Executive Summary

| Metric | Result |
| --- | ---: |
| Total Tests | ${totalTests} |
| Passed | ${passedTests} |
| Failed | ${failedTests} |
| AI Analyses | ${analyses.length} |
| CI Status | ❌ FAILED |

## Failure Categories

| Category | Count |
| --- | ---: |
`;

for (const [category, count] of Object.entries(categoryCounts)) {
    markdown += `| ${category} | ${count} |\n`;
}

markdown += `
---

# Failure Details

`;

analyses.forEach((analysis, index) => {
    markdown += `## ${index + 1}. ${analysis.testName}

| Field | Result |
| --- | --- |
| Status | ❌ ${analysis.status} |
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

const summaryPath =
    process.env.GITHUB_STEP_SUMMARY;

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