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