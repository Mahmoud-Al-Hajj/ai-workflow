export class AIResponseValidator {
  static validateAIWorkflowResponse(response) {
    const errors = [];

    if (!response) {
      errors.push("Response is null or undefined.");
      return { isValid: false, errors };
    }

    if (!response.trigger) {
      errors.push("Missing required field: trigger");
    }

    if (!response.actions || !Array.isArray(response.actions)) {
      errors.push("Missing or invalid actions array");
    }

    if (response.trigger && typeof response.trigger !== "string") {
      errors.push("Trigger must be a string");
    }

    return { isValid: errors.length === 0, errors };
  }

  static validateAction(action, index, errors) {
    if (!action || typeof action !== "object") {
      errors.push(`Action ${index}: Must be an object`);
      return;
    }

    // Required: action field
    if (!action.action || typeof action.action !== "string") {
      errors.push(`Action ${index}: Missing or invalid 'action' field`);
    }

    // Required: mode field
    if (!action.mode || !["sequential", "parallel"].includes(action.mode)) {
      errors.push(`Action ${index}: Mode must be 'sequential' or 'parallel'`);
    }
  }
}
