import { getUserJsonFromEnglish } from "../aiService.js";
import { WorkflowDatabaseService } from "../database/workflowDBService.js";
import { deployWorkflow } from "./deploymentService.js";
import { buildDefinition } from "./buildDefinition.js";
import { AIResponseValidator } from "../../utils/AIResponseValidator.js";
import logger from "../../utils/logger.js";

const workflowDBService = new WorkflowDatabaseService();

/**
 * Carry one Workflow from PENDING to ACTIVE: plan it, build the Definition,
 * store it, deploy it to the user's n8n Instance, record the outcome.
 *
 * Never throws. A Generation Run's result is the Workflow's Status — FAILED
 * with the reason in `error` — not an exception for a caller to catch, because
 * by the time this runs the caller has already been sent its response.
 *
 * Awaitable, so the whole lifecycle including the failure path can be driven
 * directly; startGenerationRun is the fire-and-forget wrapper used in request
 * handling.
 */
export async function runGeneration({
  workflowId,
  description,
  userId,
  n8nUrl,
  n8nApiKey,
}) {
  const startedAt = Date.now();

  try {
    logger.info("Background: Generating AI workflow JSON", {
      userId,
      workflowId,
    });
    const aiStart = Date.now();
    const plan = await getUserJsonFromEnglish(description);
    const aiDuration = Date.now() - aiStart;

    logger.info("AI workflow JSON generated", { userId, workflowId, aiDuration });

    const validation = AIResponseValidator.validateAIWorkflowResponse(plan);
    if (!validation.isValid) {
      throw new Error(
        `AI response validation failed: ${validation.errors.join(", ")}`,
      );
    }

    const definition = buildDefinition(plan);

    await workflowDBService.updateWorkflow(workflowId, { data: definition });

    logger.info("Background: Deploying to n8n", { userId, workflowId });
    const deployStart = Date.now();
    const n8nWorkflowId = await deployWorkflow(definition, n8nApiKey, n8nUrl);
    const deployDuration = Date.now() - deployStart;

    logger.info("Workflow deployed to n8n", {
      userId,
      workflowId,
      n8nWorkflowId,
      deployDuration,
    });

    await workflowDBService.updateWorkflow(workflowId, {
      n8nWorkflowId,
      status: "ACTIVE",
    });

    logger.info("Background workflow processing completed", {
      userId,
      workflowId,
      n8nWorkflowId,
      totalDuration: Date.now() - startedAt,
      aiDuration,
      deployDuration,
    });

    return { status: "ACTIVE", n8nWorkflowId };
  } catch (error) {
    logger.error("Background workflow processing failed", {
      userId,
      workflowId,
      error: error.message,
      duration: Date.now() - startedAt,
    });

    try {
      await workflowDBService.updateWorkflow(workflowId, {
        status: "FAILED",
        error: error.message,
      });
    } catch (updateError) {
      // Nothing further to try: the Workflow is left PENDING and will not be
      // picked up again (see ADR-0003).
      logger.error("Failed to update workflow status to FAILED", {
        workflowId,
        error: updateError.message,
      });
    }

    return { status: "FAILED", error: error.message };
  }
}

/**
 * Start a Generation Run and return immediately.
 *
 * The seam: runs happen in this process and are not durable, so a restart
 * mid-run strands the Workflow at PENDING. A queue would replace this function
 * without touching runGeneration.
 */
export function startGenerationRun(input) {
  runGeneration(input).catch((err) => {
    // runGeneration handles its own failures, so reaching here means a defect
    // in the run itself rather than a failed Workflow.
    logger.error("Unhandled error in background workflow task", {
      userId: input.userId,
      workflowId: input.workflowId,
      error: err.message,
      stack: err.stack,
    });
  });
}
