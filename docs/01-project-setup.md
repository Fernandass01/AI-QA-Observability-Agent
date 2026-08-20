# Project Setup

This document describes the initial setup for the **AI QA Observability Agent** project.

## Prerequisites

The project uses:

* Node.js
* npm
* Visual Studio Code
* Docker Desktop
* Docker Compose

## Verify Node.js

Check the installed Node.js version:

```powershell
node --version
```

Development environment used during this project:

```text
v24.18.0
```

## Verify npm

```powershell
npm --version
```

Development environment:

```text
10.9.0
```

## Create the Project

From PowerShell:

```powershell
cd $HOME
mkdir AI-QA-Observability-Agent
cd AI-QA-Observability-Agent
```

Initialize the Node.js project:

```powershell
npm init -y
```

This creates:

```text
package.json
```

## Create the Application

Create the initial JavaScript file:

```powershell
New-Item app.js -ItemType File
```

Open the project in Visual Studio Code:

```powershell
code .
```

## Initial Application

The first version of the application was intentionally simple.

Its purpose was to understand observability concepts before introducing OpenTelemetry.

The initial flow was:

```text
Application starts
       |
       v
Test starts
       |
       v
Payment operation
       |
       v
Payment failure
```

## First Logs

The application initially used `console.log()` and `console.error()`.

Examples:

```javascript
console.log("Application started");
console.log("Payment test started");
console.error("ERROR: Payment failed");
```

This introduced the first observability signal:

**Logs**

Logs answer the question:

> What happened inside the application?

## Simulated Payment Failure

A failure was intentionally introduced:

```javascript
const paymentSuccessful = false;

if (!paymentSuccessful) {
    console.error("ERROR: Payment failed");
}
```

The failure is intentional and will later allow the project to demonstrate tracing, metrics, root-cause analysis, and AI-assisted failure investigation.

## Initial Manual Metrics

Before implementing OpenTelemetry Metrics, basic metrics were created manually:

```javascript
let paymentAttempts = 0;
let paymentFailures = 0;
```

The application calculates:

```text
Payment attempts: 1
Payment failures: 1
Success rate: 0%
```

These values are currently educational examples.

Later they will be replaced with real OpenTelemetry metric instruments.

## Running the Application

Execute:

```powershell
node app.js
```

Example output:

```text
AI QA Observability Agent
=================================
Application started

Test execution started
Test execution completed

Payment test started
ERROR: Payment failed
Payment test completed

----- METRICS -----
Payment attempts: 1
Payment failures: 1
Success rate: 0%
```

## Project Documentation

A dedicated documentation directory was created:

```powershell
New-Item docs -ItemType Directory
```

The documentation structure is:

```text
docs/
├── 01-project-setup.md
├── 02-observability-basics.md
├── 03-opentelemetry-setup.md
├── 04-docker-jaeger-setup.md
└── 05-first-trace.md
```

## Git Ignore

The project uses a `.gitignore` file to prevent dependencies and sensitive environment files from being committed.

```text
node_modules/
.env
```

`node_modules` should not be committed because dependencies can be restored using:

```powershell
npm install
```

## Next Step

The next stage introduces the fundamentals of:

* Logs
* Metrics
* Traces

These concepts provide the foundation for the OpenTelemetry implementation used later in the project.
