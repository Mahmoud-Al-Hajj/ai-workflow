# AI Workflow

Turns a sentence of plain English into a running automation on the user's own n8n instance. A language model interprets the request; this service translates that interpretation into n8n's graph format, deploys it, and tracks what happened.

## Language

### The pipeline

**Description**:
The natural-language sentence a user submits, describing the automation they want.
_Avoid_: prompt, input, englishInput

**Plan**:
The model's structured interpretation of a Description: one Trigger plus an ordered list of Actions. Abstract and engine-agnostic — it names services and intent, never n8n node types.
_Avoid_: AI JSON, userJson, aiWorkflowJson, parsedJson, AI response

**Definition**:
The n8n-executable graph built from a Plan: Nodes, Connections and settings, in exactly the shape n8n's API accepts.
_Avoid_: workflow JSON, n8nWorkflow, built workflow, the workflow object

**Workflow**:
The tracked record of one automation, joining a Description to its Plan, Definition, Status and Deployment. The thing a user sees in a list.
_Avoid_: job, automation, task

**Generation Run**:
The single attempt to carry one Workflow from PENDING to ACTIVE — planning, building, deploying, recording the outcome. Exactly one per Workflow today.
_Avoid_: background task, the async bit, processing

**Status**:
Where a Workflow stands: `PENDING`, `ACTIVE`, `FAILED` or `DELETED`. A Workflow is ACTIVE only once n8n has accepted its Definition.

### Inside a Plan

**Trigger**:
The single entry point of a Plan — the event that starts it. Exactly one per Plan, never zero and never two.
_Avoid_: start node, entry point, source

**Action**:
One step in a Plan: what to do, the parameters to do it with, and a Mode saying where it attaches.
_Avoid_: step, task, operation

**Mode**:
How an Action attaches to the graph: `sequential` (after the previous step), `parallel` (alongside it, from the same point), or `branch_true` / `branch_false` (down one side of the preceding Condition). Mode is the only thing that determines graph shape — two Plans with identical Actions and different Modes are different automations.
_Avoid_: flow type, connection type, order

**Condition**:
An Action that splits the flow in two, producing a true path and a false path. Chained Conditions express multi-way choices, each one's false path leading to the next.
_Avoid_: IF node (that is the Node it becomes), branch, switch

**Service Name**:
The lowercase token identifying an integration in an Action — `slack`, `gmail`, `googlesheets`. The unit the Catalog resolves.
_Avoid_: provider, integration, app

### Inside a Definition

**Node**:
One element of a Definition: an n8n node type, a unique name, parameters and a position. A Node is what an Action becomes.
_Avoid_: step, block, element

**Connection**:
A directed edge in a Definition, from a numbered output of one Node to the input of another. A Condition's Node uses output 0 for the true path and output 1 for the false path.
_Avoid_: edge, link, wire

**Catalog**:
The mapping from a Service Name to the n8n node type that implements it, including the fallback order used when a service has no exact match.
_Avoid_: node registry, node list, templates

**Layout**:
The coordinates assigned to Nodes so the deployed graph is readable in n8n's editor. Cosmetic: it never changes what the automation does.
_Avoid_: positioning, graph layout

### People and instances

**User**:
Someone with an account here. Unusually, a User also carries the address and credentials of their own n8n Instance — this service has none of its own.
_Avoid_: customer, account, client

**Owner**:
The User a Workflow belongs to. Ownership decides who may read or delete it; only an admin may act on a Workflow they do not own.

**n8n Instance**:
The n8n server a User runs and this service deploys to. Owned and operated by the User, never by us — we can write Definitions to it, but we cannot watch a Workflow execute or repair one that breaks.
_Avoid_: n8n server, their n8n, the instance

**Deployment**:
Writing a Definition to an n8n Instance. Succeeds by returning the id n8n assigns, which is then the Workflow's only handle on what it created.
_Avoid_: publish, push, sync
