export class ConnectionService {
  constructor() {
    this.reset();
  }

  reset() {
    this.connections = {};
    // Chain heads - track the last node in each execution path
    this.state = {
      mainChain: "Trigger", // Main sequential flow
      parallelChain: null, // Parallel branch chain
      trueBranchChain: null, // True branch chain
      falseBranchChain: null, // False branch chain
      currentIfNode: null, // Current IF node context
    };
  }

  addConnection(fromNode, toNode, outputIndex = 0, inputIndex = 0) {
    if (!this.connections[fromNode]) {
      this.connections[fromNode] = { main: [] };
    }
    if (!this.connections[fromNode].main[outputIndex]) {
      this.connections[fromNode].main[outputIndex] = [];
    }

    this.connections[fromNode].main[outputIndex].push({
      node: toNode,
      type: "main",
      index: inputIndex,
    });
  }

  // Helper method to find connection source for branch nodes (true/false paths)
  // Used by both IF nodes and action nodes for consistent branch handling

  findBranchConnection(isTrueBranch) {
    const branchChain = isTrueBranch
      ? this.state.trueBranchChain
      : this.state.falseBranchChain;
    const branchOutputIndex = isTrueBranch ? 0 : 1;

    // If we have nodes already in this branch, chain to the last one
    if (branchChain) {
      return { sourceNode: branchChain, outputIndex: 0 };
    }

    // If this is the first node in the branch, connect to the IF node
    if (this.state.currentIfNode) {
      return {
        sourceNode: this.state.currentIfNode,
        outputIndex: branchOutputIndex,
      };
    }

    // Fallback to main chain
    return { sourceNode: this.state.mainChain, outputIndex: 0 };
  }

  determineSourceNode(actionObj, nodeName) {
    const { action, mode } = actionObj;

    if (action.startsWith("if.")) {
      return this.handleIfNodeConnection(actionObj, nodeName);
    }

    return this.handleActionNodeConnection(actionObj, nodeName);
  }

  handleIfNodeConnection(actionObj, nodeName) {
    const { mode } = actionObj;

    let connectionInfo;

    switch (mode) {
      case "branch_true":
        connectionInfo = this.findBranchConnection(true);
        break;

      case "branch_false":
        connectionInfo = this.findBranchConnection(false);
        break;

      case "sequential":
        connectionInfo = { sourceNode: this.state.mainChain, outputIndex: 0 };
        break;

      case "parallel":
        connectionInfo = {
          sourceNode: this.state.parallelChain || "Trigger",
          outputIndex: 0,
        };
        break;

      default:
        // Fallback to main chain
        connectionInfo = { sourceNode: this.state.mainChain, outputIndex: 0 };
        break;
    }

    // Update IF context and reset branch tracking for new IF
    if (this.state.currentIfNode !== nodeName) {
      this.clearBranchChains();
    }
    this.state.currentIfNode = nodeName;

    return connectionInfo;
  }

  handleActionNodeConnection(actionObj, nodeName) {
    const { mode } = actionObj;

    switch (mode) {
      case "branch_true":
        return this.findBranchConnection(true);

      case "branch_false":
        return this.findBranchConnection(false);

      case "sequential":
        return { sourceNode: this.state.mainChain, outputIndex: 0 };

      case "parallel":
        return {
          sourceNode: this.state.parallelChain || "Trigger",
          outputIndex: 0,
        };

      default:
        // Fallback to main chain
        return { sourceNode: this.state.mainChain, outputIndex: 0 };
    }
  }

  connectNode(actionObj, nodeName) {
    const { sourceNode, outputIndex } = this.determineSourceNode(
      actionObj,
      nodeName
    );

    if (sourceNode) {
      this.addConnection(sourceNode, nodeName, outputIndex, 0);
    }

    // Update tracking state
    this.updateTrackingState(actionObj, nodeName);
  }

  /**
   * Update chain heads after connecting a node
   */
  updateTrackingState(actionObj, nodeName) {
    const { mode } = actionObj;

    switch (mode) {
      case "sequential":
        this.state.mainChain = nodeName;
        // Reset other chains when returning to main flow
        this.clearBranchChains();
        this.state.parallelChain = null;
        break;

      case "parallel":
        this.state.parallelChain = nodeName;
        break;

      case "branch_true":
        this.state.trueBranchChain = nodeName;
        // Clear opposite branch to prevent cross-contamination
        this.state.falseBranchChain = null;
        break;

      case "branch_false":
        this.state.falseBranchChain = nodeName;
        // Clear opposite branch to prevent cross-contamination
        this.state.trueBranchChain = null;
        break;
    }
  }

  getConnections() {
    return this.connections;
  }

  /**
   * Clear branch chain tracking when entering new IF context
   */
  clearBranchChains() {
    this.state.trueBranchChain = null;
    this.state.falseBranchChain = null;
  }

  /**
   * Get current state for debugging
   */
  getState() {
    return { ...this.state };
  }
}
