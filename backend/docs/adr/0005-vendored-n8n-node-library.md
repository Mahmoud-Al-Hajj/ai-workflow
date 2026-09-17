---
status: accepted — removal not yet carried out
---

# The n8n node library is not vendored

`backend/nodes/` — 5,265 tracked files, ~36 MB of n8n's own TypeScript, SVG icons and JSON schemas — is a leftover reference copy from early exploration. It is **not** a source of truth and is to be deleted.

The Catalog resolves Service Names from `src/templates/enhancedNodeCatalog.json` and `src/templates/officialN8nNodes.json`, which are hand-maintained and stay that way. Nothing live reads `nodes/`: the only code that touches it is `getAvailableNodes()` in `aiService.js`, which reads the directory listing, discards the result, and is called by nothing.

An attempt was already made to untrack it. The last line of `.gitignore` is an absolute Windows path with backslashes:

```
C:\Users\user\Desktop\AI_WorkFlow\WFlow\ai-workflow\backend\nodes
```

gitignore patterns are repo-relative and use forward slashes, so that line matches nothing and the files stayed tracked — including into the Docker image, since `.dockerignore` does not exclude them either.

## Remaining work

Delete the directory, delete the dead `getAvailableNodes()`, and replace that `.gitignore` line with a working `nodes/`. Recorded ahead of the deletion so that anyone who finds the directory in the meantime knows it is on its way out and does not start depending on it.
