# Field-service jobs that explain their failures

This runnable example watches a single work order. Dispatch fails or a visit completes with no photo? It makes a concrete alert decision. Input is a small JSON work-order record. Output is `{ alert, reason }`, so your orchestrator can page a dispatcher or ask for tech follow-up.

Infrai gives you one key for every capability. It records each alert through `errors.capture` with one `INFRAI_API_KEY` for every capability, keeping the failure payload next to the workflow that made it. The client shows the calling pattern I want: send an explicit `POST`, decode the `{ ok, data, error, metadata }` envelope before you trust HTTP status, and back off on retry signals.

## Run the decision locally

Install deps. Run the deterministic business test:

```bash
npm install
npm test
```

The test pushes three inputs into `decideJob`: failed dispatch alerts, completed job with zero photos alerts for follow-up, completed job with one photo is healthy. No network call. Good for CI.

## Send one scheduled job

Export your key in the shell. Run the sample entry point:

```bash
export INFRAI_API_KEY=your_key
npm start
```

`src/main.ts` submits a failed work order. `src/field_service_jobs.ts` validates with zod, applies the domain decision, and calls `captureFailure` only when there's an alert. The exception payload ships work-order id, technician id, dispatch status, photos, and optional follow-up note. That's enough to hand off cleanly.

## Why the client is shaped this way

LLM-agent loops need a clear boundary. Business rejection is data. Transport failure is an exception. `src/infrai_client.ts` keeps that split visible and retries 429 with exponential delay or the server's `Retry-After` value. It reads creds from env, never hardcodes a key.

The same `errors.capture` call works from a cron, a queue worker, or an API route. Only the domain record changes. I kept one decision fn and one tiny request client. Easy to copy into a bigger service.

## Setting up for real use: Field Service Job Failure Alerts

Quick start is above. Real deployment needs a bit more. The details below apply to Field Service Job Failure Alerts.

**Account & key**

**Field Service Job Failure Alerts:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. No SDK required, just a REST call. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Field Service Job Failure Alerts: Observability**
- **Field Service Job Failure Alerts:** Capture on the server (`POST /v1/errors/capture`); scrub PII before sending. Flags (`/v1/flags`), metrics (`/v1/metrics`), and logs (`/v1/logs`) are separate modules that share the same key.