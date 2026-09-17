# The model produces a Plan, not n8n JSON

The obvious approach is to ask the language model for n8n workflow JSON directly. We don't: the model returns an abstract **Plan** (one Trigger, a list of Actions, each with a Mode), and a deterministic builder translates that Plan into a **Definition**. The Plan names services and intent — `slack`, `branch_true` — and never an n8n node type, typeVersion, or connection index.

The reason is that n8n's format is large, versioned and unforgiving: node type names, `typeVersion` numbers, the nested `connections` object with output indices for true/false branches. A model asked to emit that directly gets it subtly wrong in ways that deploy successfully and then misbehave. The Plan is small enough that the model is reliable at it, and everything version-specific lives in code we can test and fix in one place.

## Consequences

The builder now owns every hard question the model no longer answers: node type resolution, unique naming, branch wiring, layout. That is deliberate — it is the part we want deterministic and testable — but it means the Plan vocabulary is a real interface. Adding an n8n capability generally means teaching the Plan a new Mode or Action shape, updating the prompt, *and* updating the builder. A capability that cannot be expressed as a Plan cannot be generated at all, no matter how well the model understands the request.
