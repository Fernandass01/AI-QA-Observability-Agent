# Docker and Jaeger Setup

Docker is used to run the observability infrastructure locally.

## Verify Docker

```powershell
docker --version
docker compose version
```

Environment used during development:

```text
Docker 29.1.3
Docker Compose 5.0.1
```

## Architecture

```text
Node.js Application
        |
        | OTLP/HTTP :4318
        v
OpenTelemetry Collector
        |
        | OTLP/gRPC :4317
        v
Jaeger
        |
        v
Jaeger UI :16686
```

## Docker Compose

The project uses:

```text
docker-compose.yml
```

Two services are currently used:

* OpenTelemetry Collector
* Jaeger

The Collector exposes OTLP HTTP port `4318`.

Jaeger exposes:

* `4317` for OTLP/gRPC
* `16686` for the Jaeger UI

## Collector Configuration

The Collector configuration is stored in:

```text
otel-collector-config.yml
```

The OTLP receiver must listen on an address accessible outside the Collector container:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
```

The traces pipeline sends telemetry to both the debug exporter and Jaeger.

## Start Infrastructure

```powershell
docker compose up -d
```

Verify:

```powershell
docker ps
```

Expected containers:

```text
otel-collector
jaeger
```

## Collector Logs

Collector logs can be inspected with:

```powershell
docker logs otel-collector
```

For recent output:

```powershell
docker logs otel-collector --tail 50
```

## Troubleshooting — Docker Daemon

One issue encountered was:

```text
failed to connect to the docker API
dockerDesktopLinuxEngine
```

### Cause

The Docker CLI was installed, but Docker Desktop's engine was not running.

### Resolution

Docker Desktop was started and updated.

The connection was verified with:

```powershell
docker ps
```

## Troubleshooting — ECONNRESET

The Node.js application initially produced:

```text
Error: socket hang up
code: ECONNRESET
```

The Collector logs showed:

```text
Starting HTTP server
endpoint: 127.0.0.1:4318
```

### Root Cause

The Collector was listening only on its container's loopback interface.

The Windows host therefore could not correctly communicate with the OTLP HTTP receiver through the exposed Docker port.

### Resolution

The receiver was explicitly configured as:

```yaml
http:
  endpoint: 0.0.0.0:4318
```

and:

```yaml
grpc:
  endpoint: 0.0.0.0:4317
```

The containers were restarted:

```powershell
docker compose down
docker compose up -d
```

After the change, the Collector reported:

```text
Starting HTTP server
endpoint: [::]:4318
```

and telemetry successfully reached the Collector.

## Jaeger

The Jaeger UI is available locally on port:

```text
16686
```

Jaeger allows the project to inspect:

* Services
* Operations
* Traces
* Spans
* Duration
* Errors
* Span attributes

The application eventually appeared as:

```text
ai-qa-observability-agent
```
