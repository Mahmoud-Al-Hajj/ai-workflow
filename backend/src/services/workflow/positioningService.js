import dagre from "dagre";

class PositioningService {
  constructor() {
    this.GRID_SIZE_X = 300;
    this.GRID_SIZE_Y = 200;
    this.NODE_WIDTH = 240;
    this.NODE_HEIGHT = 80;
  }

  /**
   * Create initial layout state (kept for backward compatibility)
   */
  createLayoutState() {
    return {
      sequentialX: 300,
      sequentialY: 0,
      parallelY: 200,
      currentBranchX: 0,
      currentBranchY: 0,
      inBranch: false,
      branchType: null,
      branchDepth: 0,
    };
  }

  /**
   * Calculate position using Dagre for optimal layout
   */
  calculateNodePosition(mode, layoutState) {
    // For now, return simple positions during node creation
    // Dagre will override these with optimal positions later
    switch (mode) {
      case "sequential":
        const pos = [layoutState.sequentialX, layoutState.sequentialY];
        layoutState.sequentialX += this.GRID_SIZE_X;
        return pos;
      case "parallel":
        const parallelPos = [300, layoutState.parallelY];
        layoutState.parallelY += this.GRID_SIZE_Y;
        return parallelPos;
      case "branch_true":
        return [layoutState.sequentialX, layoutState.sequentialY - 150];
      case "branch_false":
        return [layoutState.sequentialX, layoutState.sequentialY + 150];
      default:
        return [layoutState.sequentialX, layoutState.sequentialY];
    }
  }

  /**
   * Handle IF node positioning (kept for compatibility)
   */
  handleIfNodePositioning(actionObj, layoutState) {
    if (actionObj.action.startsWith("if.")) {
      const position = [layoutState.sequentialX, layoutState.sequentialY];
      layoutState.sequentialX += this.GRID_SIZE_X;
      return position;
    }
    return null;
  }

  /**
   * Professional graph layout using Dagre
   * This is the main positioning function that should be used
   */
  applyConnectionAwareLayout(workflow) {
    // Create a new directed graph
    const dagreGraph = new dagre.graphlib.Graph();

    // Configure the graph
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
      rankdir: "LR", // Left to Right layout (good for workflows)
      align: "UL", // Upper Left alignment
      nodesep: 100, // Horizontal separation between nodes
      edgesep: 50, // Separation between edges
      ranksep: 150, // Separation between ranks (vertical levels)
      marginx: 50, // Graph margin
      marginy: 50,
    });

    // Add all nodes to the graph
    workflow.nodes.forEach((node) => {
      dagreGraph.setNode(node.name, {
        label: node.name,
        width: this.NODE_WIDTH,
        height: this.NODE_HEIGHT,
      });
    });

    // Add all edges based on workflow connections
    Object.entries(workflow.connections).forEach(([fromNode, conn]) => {
      if (conn.main) {
        conn.main.forEach((outputs, outputIndex) => {
          if (outputs) {
            outputs.forEach((output) => {
              dagreGraph.setEdge(fromNode, output.node, {
                label: outputIndex === 0 ? "true" : "false",
              });
            });
          }
        });
      }
    });

    // Apply Dagre layout
    dagre.layout(dagreGraph);

    // Update workflow nodes with calculated positions
    workflow.nodes.forEach((node) => {
      const dagreNode = dagreGraph.node(node.name);
      if (dagreNode) {
        // Dagre returns center coordinates, adjust to top-left for n8n
        node.position = [
          Math.round(dagreNode.x - this.NODE_WIDTH / 2),
          Math.round(dagreNode.y - this.NODE_HEIGHT / 2),
        ];
      }
    });

    return workflow;
  }

  /**
   * Enhanced Dagre layout with custom optimizations for n8n workflows
   */
  applyOptimizedDagreLayout(workflow) {
    const dagreGraph = new dagre.graphlib.Graph();

    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // Optimized settings for workflow clarity
    dagreGraph.setGraph({
      rankdir: "LR", // Left to Right (workflow style)
      align: "UL", // Upper Left alignment
      nodesep: 120, // More space between nodes horizontally
      edgesep: 80, // More space between parallel edges
      ranksep: 200, // More space between sequential levels
      marginx: 100, // Graph margins
      marginy: 100,
      acyclicer: "greedy", // Handle cycles in complex workflows
      ranker: "tight-tree", // Better ranking algorithm
    });

    // Add nodes with proper sizing
    workflow.nodes.forEach((node) => {
      // Adjust node size based on node type
      let width = this.NODE_WIDTH;
      let height = this.NODE_HEIGHT;

      if (node.type === "n8n-nodes-base.if") {
        width = 200; // IF nodes are smaller
        height = 100;
      } else if (node.name === "Trigger") {
        width = 160; // Trigger is smaller
        height = 60;
      }

      dagreGraph.setNode(node.name, {
        label: node.name,
        width: width,
        height: height,
      });
    });

    // Add edges with proper labeling
    Object.entries(workflow.connections).forEach(([fromNode, conn]) => {
      if (conn.main) {
        conn.main.forEach((outputs, outputIndex) => {
          if (outputs) {
            outputs.forEach((output) => {
              // Add edge metadata for better layout decisions
              dagreGraph.setEdge(fromNode, output.node, {
                label: outputIndex === 0 ? "✓" : "✗",
                weight: outputIndex === 0 ? 2 : 1, // Prioritize true branches
                minlen: 1,
              });
            });
          }
        });
      }
    });

    // Apply layout
    dagre.layout(dagreGraph);

    // Apply positions with n8n coordinate system
    workflow.nodes.forEach((node) => {
      const dagreNode = dagreGraph.node(node.name);
      if (dagreNode) {
        node.position = [
          Math.round(dagreNode.x - dagreNode.width / 2),
          Math.round(dagreNode.y - dagreNode.height / 2),
        ];
      }
    });

    return workflow;
  }

  /**
   * Validate positioning and fix any issues
   */
  validateAndFixOverlaps(workflow) {
    // Check for nodes still at origin (excluding Trigger)
    const problematicNodes = workflow.nodes.filter(
      (node) =>
        node.position[0] === 0 &&
        node.position[1] === 0 &&
        node.name !== "Trigger"
    );

    if (problematicNodes.length > 0) {
      console.warn(
        `Found ${problematicNodes.length} nodes not positioned by Dagre`
      );

      // Apply fallback grid positioning
      problematicNodes.forEach((node, index) => {
        const row = Math.floor(index / 4);
        const col = index % 4;
        node.position = [300 + col * this.GRID_SIZE_X, row * this.GRID_SIZE_Y];
      });
    }

    // Ensure minimum spacing between nodes
    this.enforceMinimumSpacing(workflow);

    return workflow;
  }

  /**
   * Ensure no nodes are too close to each other
   */
  enforceMinimumSpacing(workflow) {
    const MIN_DISTANCE = 120;

    for (let i = 0; i < workflow.nodes.length; i++) {
      for (let j = i + 1; j < workflow.nodes.length; j++) {
        const node1 = workflow.nodes[i];
        const node2 = workflow.nodes[j];

        const dx = node1.position[0] - node2.position[0];
        const dy = node1.position[1] - node2.position[1];
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < MIN_DISTANCE && distance > 0) {
          // Move second node away
          const angle = Math.atan2(dy, dx);
          node2.position[0] =
            node1.position[0] - Math.cos(angle) * MIN_DISTANCE;
          node2.position[1] =
            node1.position[1] - Math.sin(angle) * MIN_DISTANCE;
        }
      }
    }
  }
}

export const positioningService = new PositioningService();
