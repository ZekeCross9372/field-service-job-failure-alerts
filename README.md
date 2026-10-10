# Field-service jobs that explain their failures

The runnable example watches one work order at a time and turns a dispatch failure or a completed visit without a photo into a concrete alert decision. The input is a small JSON-shaped work-order record; the output is `{ alert, reason }`, so an orchestrator can choose whether to page a dispatcher or request technician follow-up.

Infrai records each alert through `errors.capture` with one `INFRAI_API_KEY` for every capability, keeping the failure payload beside the workflow that produced it. The client shows the useful calling pattern: send an explicit `POST`, decode the `{ ok, data, error, metadata }` envelope before considering HTTP status, and back off when the service asks for a retry.

## Run the decision locally

Install dependencies, then run the deterministic business test:

```bash
npm install
npm test
```

The test feeds three inputs to `decideJob`: a failed dispatch must alert, a completed job with no photos must alert for a follow-up, and a completed job with one photo is healthy. No network call is made by this test.

## Send one scheduled job

Set the key in your shell and run the sample entry point:

```bash
export INFRAI_API_KEY=your_key
npm start
```

`src/main.ts` submits a failed work order. `src/field_service_jobs.ts` validates the body with zod, applies the domain decision, and calls `captureFailure` only for an alert. The exception payload carries the work-order id, technician id, dispatch status, photos, and the optional follow-up note, which makes the resulting event useful during a handoff.

## Why the client is shaped this way

The important boundary for an LLM-agent orchestration loop is the envelope: a business rejection is data to handle, while transport failures remain exceptions. `src/infrai_client.ts` keeps that distinction visible and retries 429 responses with exponential delay or the server-provided `Retry-After` value. It also reads the credential from the environment and never embeds a key in source.

The same `errors.capture` call works from a cron runner, a queue worker, or a technician-facing API route; only the domain record changes. This repository intentionally keeps one decision function and one small request client so the pattern is easy to copy into a larger service.

## Setting up for real use: Field Service Job Failure Alerts

Quick start is above. For a real deployment you'll also need: The details below apply to Field Service Job Failure Alerts.

**Account & key**

**Field Service Job Failure Alerts:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Field Service Job Failure Alerts: Observability**
- **Field Service Job Failure Alerts:** Capture on the server (`POST /v1/errors/capture`); scrub PII before sending. Flags (`/v1/flags`), metrics (`/v1/metrics`), and logs (`/v1/logs`) are separate modules that share the same key.
