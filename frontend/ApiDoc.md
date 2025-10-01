# API Documentation: WorkflowService

This document describes the API methods provided by the `WorkflowService` class in `src/services/workflowService.js`.

---

## 1. createCompleteWorkflow

**Signature:**

```js
async createCompleteWorkflow({ description, userId, n8nUrl, n8nApiKey })
```

**Description:**
Creates a new workflow from a natural language description. The workflow is created in the database with status `PENDING`, and the AI/n8n deployment is processed in the background. Returns immediately with the workflow record and status.

**Parameters:**

- `description` (string): Natural language description of the workflow.
- `userId` (number|string): ID of the user creating the workflow.
- `n8nUrl` (string): n8n instance URL.
- `n8nApiKey` (string): n8n API key.

**Returns:**

- `{ databaseWorkflow, status: 'PENDING', message }`

---

## 2. getAllWorkflows

**Signature:**

```js
async getAllWorkflows()
```

**Description:**
Returns all workflows in the database.

**Returns:**

- `Array<Workflow>`

---

## 3. getWorkflowById

**Signature:**

```js
async getWorkflowById(id)
```

**Description:**
Returns a workflow by its ID.

**Parameters:**

- `id` (number|string): Workflow ID.

**Returns:**

- `Workflow | null`

---

## 4. getWorkflowsForUser

**Signature:**

```js
async getWorkflowsForUser(userId)
```

**Description:**
Returns all workflows for a specific user.

**Parameters:**

- `userId` (number|string): User ID.

**Returns:**

- `Array<Workflow>`

---

## 5. deleteWorkflow

**Signature:**

```js
async deleteWorkflow(id)
```

**Description:**
Deletes a workflow by its ID.

**Parameters:**

- `id` (number|string): Workflow ID.

**Returns:**

- `Result` (deletion result)

---

## 6. validateWorkflow

**Signature:**

```js
validateWorkflow(workflow);
```

**Description:**
Validates a workflow object using the WorkflowBuilderService.

**Parameters:**

- `workflow` (object): Workflow data.

**Returns:**

- `ValidationResult`

---

## 7. getWorkflowStats

**Signature:**

```js
getWorkflowStats(workflow);
```

**Description:**
Returns statistics for a workflow object.

**Parameters:**

- `workflow` (object): Workflow data.

**Returns:**

- `Stats` (object)

---

## Instance

The exported instance is:

```js
export const workflowService = new WorkflowService();
```

---

**Note:** All database operations are delegated to `WorkflowDatabaseService`. AI and n8n integration are handled asynchronously in the background for workflow creation.
