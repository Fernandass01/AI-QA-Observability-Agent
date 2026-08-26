# AI-Powered Playwright Failure Analysis

## Overview

This project extends Playwright test automation with AI-powered failure analysis and OpenTelemetry observability.

When a Playwright test fails, the custom reporter captures structured failure information. The failure is analyzed using the OpenAI API, and the resulting diagnosis is stored as structured JSON and exported as an OpenTelemetry trace to Jaeger.

## Architecture

Playwright Test
    |
    v
Custom Observability Reporter
    |
    +--> OpenTelemetry Metrics
    |       |
    |       v
    |    Prometheus
    |       |
    |       v
    |     Grafana
    |
    +--> OpenTelemetry Traces
    |       |
    |       v
    |     Jaeger
    |
    +--> Failure JSON
            |
            v
        OpenAI API
            |
            v
      AI Failure Analysis
            |
            +--> latest-analysis.json
            |
            +--> OpenTelemetry AI Analysis Span
                        |
                        v
                      Jaeger

## Failure Capture

When a Playwright test fails, the custom reporter captures information such as:

- Test name
- Test status
- Test duration
- Error message
- Timestamp

The information is stored in:

`failure-analysis/latest-failure.json`

## AI Failure Analysis

The failure analyzer sends the structured Playwright failure information to the OpenAI API.

The AI analyzes the failure and returns structured information containing:

- Failure category
- Root cause
- Expected result
- Actual result
- Suggested action

Example:

```json
{
  "failureCategory": "AssertionError",
  "rootCause": "The test contains an intentionally incorrect title assertion.",
  "expected": "Page title should be 'Wrong Title'.",
  "actual": "Page title was 'Example Domain'.",
  "suggestedAction": "Update the assertion to use the correct title or retain the mismatch if the failure is intentional for observability validation."
}
## Automated AI Failure Analysis Workflow

The Playwright and AI failure-analysis workflow can now be executed using a single npm command.

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
```## Multi-Failure AI Analysis

The AI QA workflow now supports analyzing multiple Playwright failures from the same test execution.

### Failure Collection

Instead of storing only the latest failed test, the custom Playwright reporter collects all failures generated during the test run.

The failures are saved to:

`failure-analysis/failures.json`

Each failure contains:

- Test name
- Status
- Test duration
- Error message
- Timestamp

### Multi-Failure Analysis

The AI analyzer reads all entries from `failures.json` and processes each failed test individually using the OpenAI API.

Each failure receives its own:

- Failure category
- Root cause
- Expected result
- Actual result
- Suggested action

The complete set of AI results is saved to:

`failure-analysis/analyses.json`

### Validation

The workflow was validated with three Playwright tests:

- 1 passing test
- 2 intentional failing tests

The two failures were:

1. Page title assertion mismatch
2. URL assertion mismatch

The AI correctly analyzed both failures independently.

Example result:

- Total tests: 3
- Passed: 1
- Failed: 2
- AI analyses generated: 2

### OpenTelemetry Integration

Each AI-generated failure analysis also creates its own OpenTelemetry span.

Example operations:

`ai-analysis: Intentional failing test for observability`

`ai-analysis: Intentional URL failure for observability`

This allows multiple AI root-cause analyses from the same Playwright run to be inspected individually in Jaeger.