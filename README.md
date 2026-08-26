# 🤖 AI QA Observability Agent

An end-to-end QA engineering project combining **Test Automation, Observability, OpenTelemetry, Distributed Tracing, CI/CD, and AI-powered failure analysis**.

The project demonstrates how automated tests can generate telemetry, capture failures, analyze those failures with AI, and publish actionable QA reports directly inside a CI/CD pipeline.

---

## 🎯 Project Goal

The goal of this project is to explore how modern QA automation can be combined with observability and artificial intelligence.

The system can:

- Execute automated Playwright tests
- Detect and capture test failures
- Generate OpenTelemetry traces and metrics
- Record test execution duration
- Export telemetry using OTLP
- Analyze failed tests using AI
- Identify probable root causes
- Compare expected vs. actual behavior
- Suggest corrective actions
- Generate dynamic QA reports
- Run automatically through GitHub Actions
- Preserve test and AI-analysis artifacts

---

# 🏗️ Architecture

```text
                    GitHub Actions
                          |
                          v
                   Playwright Tests
                          |
              +-----------+-----------+
              |                       |
              v                       v
      Custom QA Reporter        Test Failures
              |                       |
              v                       v
       OpenTelemetry           failures.json
        /         \                   |
       /           \                  v
   Metrics        Traces        OpenAI Analysis
      |              |                 |
      v              v                 v
OpenTelemetry Collector        analyses.json
      |              |                 |
      v              v                 v
 Observability     Jaeger       AI QA Report
                                      |
                                      v
                             GitHub Actions Summary
                                      |
                                      v
                                CI Artifacts
```

---

# 🧪 Playwright Test Automation

The project uses **Playwright** for browser automation.

The current test suite contains three tests:

```text
Example homepage loads successfully
Intentional failing test for observability
Intentional URL failure for observability
```

The intentional failures allow the observability and AI-analysis pipeline to be tested.

Example execution:

```text
Running 3 tests using 1 worker

PASS: Example homepage loads successfully

FAIL: Intentional failing test for observability

FAIL: Intentional URL failure for observability
```

The CI workflow intentionally reports a failed status when Playwright tests fail, while still allowing telemetry collection, AI analysis, report generation, and artifact upload to complete.

---

# 📡 Custom Playwright Observability Reporter

A custom Playwright reporter captures telemetry for every automated test.

File:

```text
playwright-observability-reporter.js
```

The reporter collects:

- Test name
- Test status
- Execution duration
- Error message
- Failure timestamp
- OpenTelemetry trace data
- OpenTelemetry metrics

Example metrics:

```text
playwright_tests_total

playwright_tests_passed_total

playwright_tests_failed_total

playwright_test_duration_ms
```

Example trace:

```text
playwright-test: Intentional failing test for observability

Status: ERROR
```

Failed tests are automatically stored in:

```text
failure-analysis/failures.json
```

---

# 🔭 OpenTelemetry Observability

The project uses OpenTelemetry to instrument test execution and application behavior.

The observability pipeline includes:

```text
Node.js
   |
   v
OpenTelemetry SDK
   |
   v
OTLP Exporter
   |
   v
OpenTelemetry Collector
   |
   v
Jaeger
```

OpenTelemetry captures test execution information including:

```text
test.name
test.status
test.duration_ms
test.error.message
```

Failed tests are recorded using:

```text
SpanStatusCode.ERROR
```

Successful tests use:

```text
SpanStatusCode.OK
```

---

# 📊 Metrics

The project collects QA automation metrics using OpenTelemetry.

Current metrics include:

```text
playwright_tests_total
playwright_tests_passed_total
playwright_tests_failed_total
playwright_test_duration_ms
```

These metrics provide visibility into:

- Total test executions
- Passed tests
- Failed tests
- Test execution duration
- Failure rates

---

# 🔎 Distributed Tracing

Distributed tracing is implemented using:

- OpenTelemetry SDK
- OTLP
- OpenTelemetry Collector
- Jaeger
- Docker

Each Playwright test can generate an OpenTelemetry span.

Example:

```text
playwright-test: Intentional URL failure for observability

Status: ERROR
```

Error information can also be attached to the span, allowing failed automated tests to be investigated through observability tooling.

---

# 🧠 AI-Powered Failure Analysis

Failed Playwright tests are automatically analyzed using the OpenAI API.

The failure-analysis pipeline is:

```text
Playwright Failure
       |
       v
failures.json
       |
       v
AI Failure Analyzer
       |
       v
OpenAI API
       |
       v
Structured Root Cause Analysis
       |
       v
analyses.json
```

The AI returns structured information for each failure:

```json
{
  "failureCategory": "",
  "rootCause": "",
  "expected": "",
  "actual": "",
  "suggestedAction": ""
}
```

Example analysis:

```text
Failure Category:
AssertionError

Root Cause:
The test intentionally asserts an incorrect page title.

Expected:
Page title should be "Wrong Title".

Actual:
Page title was "Example Domain".

Suggested Action:
Update the assertion to use the correct expected title,
or keep the failure intentionally for observability validation.
```

Multiple failures can be analyzed during the same test execution.

---

# 📋 Dynamic AI QA Test Report

The project automatically generates an executive QA report from the actual test execution and AI analysis.

Example:

```text
🤖 AI QA Test Report

Executive Summary

Total Tests: 3
Passed: 1
Failed: 2
AI Analyses: 2
CI Status: FAILED
```

The report also groups failures by category:

```text
Failure Categories

AssertionError: 2
```

Each failed test includes:

- Status
- Duration
- Failure category
- Root cause
- Expected result
- Actual result
- Suggested corrective action

The report is generated by:

```text
failure-analysis/generate-summary.js
```

---

# ⚙️ GitHub Actions CI/CD

The project includes a GitHub Actions workflow that automatically executes the QA pipeline on pushes and pull requests to the `main` branch.

Workflow:

```text
.github/workflows/playwright.yml
```

Pipeline:

```text
Checkout Repository
        |
        v
Setup Node.js
        |
        v
Install Dependencies
        |
        v
Install Playwright Chromium
        |
        v
Run Playwright Tests
        |
        v
Capture Failures
        |
        v
Run AI Failure Analysis
        |
        v
Generate AI QA Summary
        |
        v
Upload Test Results
        |
        v
Upload AI Analysis
        |
        v
Preserve Playwright CI Status
```

The AI-analysis and reporting steps run even when Playwright tests fail.

This allows the pipeline to preserve diagnostic information before returning the correct CI failure status.

---

# 📦 CI Artifacts

GitHub Actions automatically preserves QA evidence from each execution.

Current artifacts include:

```text
playwright-test-results

ai-failure-analysis
```

The AI artifact contains:

```text
failure-analysis/failures.json
failure-analysis/analyses.json
```

This allows failure evidence and AI-generated analysis to be downloaded after the CI execution.

---

# 📊 GitHub Actions Job Summary

The CI pipeline publishes the AI QA report directly to the GitHub Actions Summary page.

Example:

```text
🤖 AI QA Test Report

Executive Summary

Total Tests     3
Passed          1
Failed          2
AI Analyses     2
CI Status       FAILED
```

The report then provides detailed AI analysis for each failed test.

This means QA engineers can investigate failures directly from GitHub Actions without manually reading the entire CI log.

---

# 💳 Original Observability Scenario

The project originally started with a simulated payment failure.

```text
Payment Test
     |
     v
Payment Attempt
     |
     v
Payment Failed
     |
     v
OpenTelemetry Span
     |
     v
ERROR
```

The `payment-test` span contains custom attributes such as:

```text
payment.attempts = 1
payment.successful = false
payment.failures = 1
```

This initial experiment evolved into the current automated QA observability and AI-analysis platform.

---

# 🛠️ Technologies

## Test Automation

- Playwright
- JavaScript
- Node.js

## Observability

- OpenTelemetry
- OTLP
- OpenTelemetry Collector
- Jaeger

## Infrastructure

- Docker
- Docker Compose

## Artificial Intelligence

- OpenAI API
- AI-powered failure classification
- Root-cause analysis
- Suggested corrective actions

## CI/CD

- Git
- GitHub
- GitHub Actions
- CI artifacts
- GitHub Actions Job Summary

---

# 📁 Project Structure

```text
AI-QA-Observability-Agent/
│
├── .github/
│   └── workflows/
│       └── playwright.yml
│
├── docs/
│   ├── 01-project-setup.md
│   ├── 02-observability-basics.md
│   ├── 03-opentelemetry-setup.md
│   ├── 04-docker-jaeger-setup.md
│   ├── 05-first-trace.md
│   └── 07-ai-failure-analysis.md
│
├── failure-analysis/
│   ├── analyze-failure.js
│   └── generate-summary.js
│
├── tests/
│   └── example.spec.js
│
├── app.js
├── instrumentation.js
├── playwright-observability-reporter.js
├── playwright.config.js
├── docker-compose.yml
├── otel-collector-config.yml
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

Runtime-generated files include:

```text
failure-analysis/failures.json
failure-analysis/analyses.json
test-results/
```

---

# ✅ Development Progress

## Phase 1 — Fundamentals

- [x] Create Node.js project
- [x] Create application logs
- [x] Simulate application failure
- [x] Learn Logs, Metrics, and Traces

## Phase 2 — OpenTelemetry

- [x] Install OpenTelemetry
- [x] Configure Node.js SDK
- [x] Configure OTLP exporter
- [x] Configure OpenTelemetry Collector
- [x] Run Collector with Docker
- [x] Configure Jaeger
- [x] Create custom spans
- [x] Send traces through the Collector
- [x] Visualize traces in Jaeger
- [x] Configure custom service name
- [x] Record failures as OpenTelemetry errors

## Phase 3 — QA Metrics

- [x] Implement OpenTelemetry Metrics
- [x] Create test execution counter
- [x] Create passed-test counter
- [x] Create failed-test counter
- [x] Measure test duration
- [x] Connect Playwright execution with telemetry

## Phase 4 — Test Automation

- [x] Add Playwright
- [x] Create automated browser tests
- [x] Create intentional failure scenarios
- [x] Build custom Playwright observability reporter
- [x] Capture multiple test failures
- [x] Generate failure JSON data

## Phase 5 — AI Failure Analysis

- [x] Integrate OpenAI API
- [x] Analyze Playwright failures automatically
- [x] Classify failure categories
- [x] Generate root-cause analysis
- [x] Extract expected behavior
- [x] Extract actual behavior
- [x] Generate suggested corrective actions
- [x] Analyze multiple failures
- [x] Save structured AI results

## Phase 6 — CI/CD

- [x] Create GitHub Actions workflow
- [x] Execute Playwright tests in CI
- [x] Run AI analysis after test execution
- [x] Preserve correct Playwright failure status
- [x] Upload Playwright artifacts
- [x] Upload AI failure-analysis artifacts
- [x] Generate GitHub Actions AI QA Summary
- [x] Generate report from dynamic test results

## Phase 7 — Observability Dashboard

- [ ] Add Grafana
- [ ] Build QA observability dashboard
- [ ] Visualize test pass/failure rates
- [ ] Visualize test duration
- [ ] Visualize failure trends

## Phase 8 — Advanced AI QA Agent

- [ ] Correlate traces, metrics, and failures
- [ ] Add historical failure analysis
- [ ] Detect recurring failure patterns
- [ ] Improve AI evidence collection
- [ ] Generate automated investigation reports
- [ ] Explore automated retesting after corrective actions

---

# 🔧 Troubleshooting Learned During Development

The project intentionally documents real implementation problems encountered during development.

Examples include:

- Docker daemon not running
- Docker Desktop updates
- OTLP Collector connection reset (`ECONNRESET`)
- Collector listening on incorrect interfaces
- Docker port configuration
- Unknown OpenTelemetry service names
- Configuring custom `service.name`
- Verifying traces through Collector debug output
- OpenTelemetry export behavior in CI
- Preserving Playwright failure status while still executing AI analysis
- Handling intentionally failed tests in GitHub Actions
- Preserving test evidence as CI artifacts

Troubleshooting is part of the project because observability is fundamentally about understanding and diagnosing system behavior.

---

# 🚀 Running the Project

Install dependencies:

```bash
npm install
```

Install Playwright Chromium:

```bash
npx playwright install chromium
```

Run the Playwright tests:

```bash
npx playwright test
```

Run AI failure analysis:

```bash
node failure-analysis/analyze-failure.js
```

Generate the QA summary:

```bash
node failure-analysis/generate-summary.js
```

Start the observability infrastructure:

```bash
docker compose up -d
```

---

# 🔐 Environment Variables

The AI analyzer requires an OpenAI API key.

For local development, configure:

```text
OPENAI_API_KEY
```

The local environment file must not be committed to Git.

In GitHub Actions, the API key is stored using GitHub Actions Secrets.

---

# 🎓 Skills Demonstrated

This project demonstrates practical experience with:

- QA Automation Engineering
- Playwright
- JavaScript / Node.js
- Test failure investigation
- Custom Playwright reporters
- OpenTelemetry instrumentation
- Metrics and distributed tracing
- OTLP
- Jaeger
- Docker
- CI/CD
- GitHub Actions
- CI artifact management
- AI API integration
- Structured AI outputs
- AI-assisted root-cause analysis
- Automated QA reporting
- Observability-driven testing

---

# 🔮 Final Vision

The architecture is evolving toward an intelligent QA investigation platform:

```text
Automated Tests
      |
      v
Playwright
      |
      v
Observability Reporter
      |
      +-------------------+
      |                   |
      v                   v
Telemetry              Failures
      |                   |
      v                   v
OpenTelemetry          AI Analysis
      |                   |
      v                   v
Observability       Root Cause
Platform            Analysis
      |                   |
      +---------+---------+
                |
                v
        AI QA Investigation
                |
                v
        Suggested Action
                |
                v
         Automated Retest
```

---

# 📌 Project Status

**Active development**

Current milestone:

> Playwright automation, OpenTelemetry instrumentation, AI-powered multi-failure analysis, GitHub Actions CI/CD, dynamic QA reporting, and CI artifact preservation are operational.

Next milestone:

> Build the visualization layer for QA metrics and failure trends, then expand the AI analyzer toward a more complete autonomous QA investigation agent.