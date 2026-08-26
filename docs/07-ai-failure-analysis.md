# AI-Powered Playwright Failure Analysis

## Overview

This project extends Playwright test automation with AI-powered failure analysis and OpenTelemetry observability.

When Playwright tests fail, the custom observability reporter captures structured failure information. The failures are analyzed using the OpenAI API, and the resulting diagnoses are stored as structured JSON and exported as OpenTelemetry traces to Jaeger.

The workflow supports multiple failures from the same Playwright test execution.

## Architecture

```text
Playwright Test Suite
        |
        v
Custom Observability Reporter
        |
        +----------------------+
        |                      |
        v                      v
OpenTelemetry             Failure Capture
        |                      |
   +----+----+                 v
   |         |            failures.json
   v         v                 |
Metrics    Traces              v
   |         |             OpenAI API
   v         v                 |
Prometheus Jaeger              v
   |                      AI Failure Analysis
   v                           |
Grafana                   +----+----+
                          |         |
                          v         v
                    analyses.json  OpenTelemetry
                                      |
                                      v
                                    Jaeger
```

## Failure Capture

When a Playwright test fails, the custom reporter captures information including:

- Test name
- Test status
- Test duration
- Error message
- Timestamp

All failures from the same Playwright execution are collected and saved to:

`failure-analysis/failures.json`

This allows the system to process multiple failures instead of storing only the most recent failure.

## AI Failure Analysis

The AI analyzer reads the failures from `failures.json` and processes each failed test individually using the OpenAI API.

For every failure, the AI returns structured information containing:

- Failure category
- Root cause
- Expected result
- Actual result
- Suggested action

Example:

```json
{
  "testName": "Intentional failing test for observability",
  "status": "failed",
  "durationMs": 5201,
  "failureCategory": "AssertionError",
  "rootCause": "The expected page title does not match the actual page title.",
  "expected": "Page title should be \"Wrong Title\".",
  "actual": "Page title was \"Example Domain\".",
  "suggestedAction": "Update the expected title if the test should pass, or retain the mismatch if the failure is intentional for observability validation."
}
```

## Structured AI Output

All AI-generated failure analyses are saved to:

`failure-analysis/analyses.json`

Using structured JSON makes the AI diagnoses reusable by observability tools, reports, CI/CD workflows, and future automation.

## OpenTelemetry AI Traces

Each AI-generated failure analysis creates its own OpenTelemetry span.

Example operations:

`ai-analysis: Intentional failing test for observability`

`ai-analysis: Intentional URL failure for observability`

Each span contains attributes such as:

- `ai.failure.test_name`
- `ai.failure.category`
- `ai.failure.root_cause`
- `ai.failure.expected`
- `ai.failure.actual`
- `ai.failure.suggested_action`

The AI-generated root-cause information can therefore be inspected directly in Jaeger.

## Automated AI Failure Analysis Workflow

The complete Playwright and AI failure-analysis workflow can be executed using a single npm command.

### Command

```powershell
npm run qa:ai
```

The command is defined in `package.json`:

```json
{
  "scripts": {
    "test": "playwright test",
    "qa:ai": "playwright test || node failure-analysis/analyze-failure.js"
  }
}
```

The Playwright test suite intentionally contains failing observability tests. When Playwright returns a non-zero exit status, the AI analyzer runs and processes the captured failures.

## Automated Execution Flow

```text
npm run qa:ai
      |
      v
Playwright Tests
      |
      +---- PASS ----> Metrics + Traces
      |
      +---- FAIL
              |
              v
       Custom Reporter
              |
              v
         failures.json
              |
              v
         AI Analyzer
              |
              v
         OpenAI API
              |
              v
       AI QA Analyses
          /        \
         v          v
 analyses.json   OpenTelemetry
                     |
                     v
                   Jaeger
```

## Multi-Failure AI Analysis

The workflow supports analyzing multiple Playwright failures from the same test execution.

The custom reporter collects every failure during the run and writes the complete collection to `failures.json`.

The AI analyzer then loops through the collection and analyzes each failure independently.

Each failure receives its own:

- Failure category
- Root cause
- Expected result
- Actual result
- Suggested action
- OpenTelemetry AI-analysis span

## End-to-End Validation

The complete multi-failure workflow was validated with three Playwright tests.

### Test Results

- Total tests: 3
- Passed: 1
- Failed: 2
- Failures captured: 2
- AI analyses generated: 2

The intentional failures represented two different scenarios:

1. Page title assertion mismatch
2. Page URL assertion mismatch

The AI successfully analyzed both failures independently.

For the title failure, the AI identified the mismatch between:

```text
Expected: Wrong Title
Actual: Example Domain
```

For the URL failure, the AI identified the mismatch between:

```text
Expected: https://wrong-example.com/
Actual: https://example.com/
```

The complete validation was executed using only:

```powershell
npm run qa:ai
```

The workflow successfully:

1. Executed the Playwright test suite.
2. Recorded passing and failing test telemetry.
3. Captured two independent failures.
4. Saved the failures as structured JSON.
5. Automatically started the AI analyzer.
6. Generated two independent AI diagnoses.
7. Saved the analyses as structured JSON.
8. Created OpenTelemetry spans for the AI diagnoses.
9. Exported the AI-analysis traces for inspection in Jaeger.

## Observability Stack

The project currently integrates:

- Playwright — automated browser testing
- OpenTelemetry — telemetry instrumentation
- Prometheus — metrics collection and querying
- Grafana — test observability dashboards
- Jaeger — distributed tracing and failure inspection
- OpenAI API — AI-powered failure analysis

## Security

The OpenAI API key is stored locally in:

`.env.local`

The environment file is excluded from Git using `.gitignore`.

Generated runtime data is also excluded from Git:

```text
failure-analysis/failures.json
failure-analysis/analyses.json
```

API credentials must never be committed to the repository.

## Current Capabilities

The AI QA Observability Agent can now:

1. Execute Playwright automated tests.
2. Capture passed and failed test metrics.
3. Export telemetry using OpenTelemetry.
4. Visualize test metrics in Grafana.
5. Generate Playwright test traces.
6. Record exceptions from failed tests.
7. Capture multiple failures from one test execution.
8. Store failure information as structured JSON.
9. Analyze multiple failures using the OpenAI API.
10. Generate structured AI root-cause analyses.
11. Save multiple AI analyses as structured JSON.
12. Create individual OpenTelemetry spans for AI diagnoses.
13. Inspect AI-generated failure information in Jaeger.
14. Execute the complete local AI QA workflow with `npm run qa:ai`.

## Next Milestone

The next milestone is CI/CD integration using GitHub Actions so the AI QA workflow can be executed automatically as part of the repository's continuous integration process.