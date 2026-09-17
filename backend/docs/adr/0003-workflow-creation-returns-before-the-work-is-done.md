# Workflow creation returns before the work is done

`POST /api/workflows` creates a Workflow row with Status `PENDING`, starts a Generation Run in the background, and responds immediately. The response therefore describes a Workflow that does not yet exist in n8n. Clients learn the outcome by re-reading the Workflow and checking its Status.

Creation was originally synchronous. A Generation Run means one language-model call plus one deploy call to a remote n8n Instance, which together run well past what a request should hold open, with retries on top when the model rate-limits. Returning `PENDING` keeps the endpoint fast and bounded regardless of how slow either dependency is.

## Consequences

A Generation Run lives only in process memory. If the server restarts mid-run, the Workflow stays `PENDING` forever — nothing resumes it, and nothing currently sweeps for it. Runs are also unbounded: nothing limits how many proceed at once beyond the endpoint's rate limit.

This is the decision to revisit first if `PENDING` rows start accumulating in practice. The fix is a durable queue rather than a return to synchronous creation — the latency that motivated this is not going away.
