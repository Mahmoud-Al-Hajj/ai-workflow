import dagre from "dagre";

const GRID_SIZE_X = 300;
const GRID_SIZE_Y = 200;
const NODE_WIDTH = 240;
const NODE_HEIGHT = 80;
const MIN_DISTANCE = 80;

/**
 * Size a Node for layout purposes. Conditions and the Trigger render smaller
 * in n8n's editor, so they get less room.
 */
function nodeSize(node) {
  if (node.type === "n8n-nodes-base.if") return { width: 200, height: 100 };
  if (node.name === "Trigger") return { width: 160, height: 60 };
  return { width: NODE_WIDTH, height: NODE_HEIGHT };
}

function buildGraph(definition) {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));

  graph.setGraph({
    rankdir: "LR",
    align: "UL",
    nodesep: 60,
    edgesep: 40,
    ranksep: 120,
    marginx: 50,
    marginy: 50,
    acyclicer: "greedy",
    ranker: "tight-tree",
  });

  definition.nodes.forEach((node) => {
    const { width, height } = nodeSize(node);
    graph.setNode(node.name, { label: node.name, width, height });
  });

  Object.entries(definition.connections).forEach(([fromNode, conn]) => {
    if (!conn.main) return;
    conn.main.forEach((outputs, outputIndex) => {
      if (!outputs) return;
      outputs.forEach((output) => {
        graph.setEdge(fromNode, output.node, {
          label: outputIndex === 0 ? "✓" : "✗",
          weight: outputIndex === 0 ? 2 : 1, // prefer keeping true branches straight
          minlen: 1,
        });
      });
    });
  });

  return graph;
}

/**
 * Nothing should land at the origin once Dagre has run; anything that did was
 * missed, so fall back to a grid for those.
 */
function repositionStrandedNodes(definition) {
  const stranded = definition.nodes.filter(
    (node) =>
      node.position[0] === 0 && node.position[1] === 0 && node.name !== "Trigger",
  );

  if (stranded.length === 0) return;

  console.warn(`Found ${stranded.length} nodes not positioned by Dagre`);

  stranded.forEach((node, index) => {
    const row = Math.floor(index / 4);
    const col = index % 4;
    node.position = [300 + col * GRID_SIZE_X, row * GRID_SIZE_Y];
  });
}

function enforceMinimumSpacing(definition) {
  for (let i = 0; i < definition.nodes.length; i++) {
    for (let j = i + 1; j < definition.nodes.length; j++) {
      const node1 = definition.nodes[i];
      const node2 = definition.nodes[j];

      const dx = node1.position[0] - node2.position[0];
      const dy = node1.position[1] - node2.position[1];
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < MIN_DISTANCE && distance > 0) {
        const angle = Math.atan2(dy, dx);
        node2.position[0] = node1.position[0] - Math.cos(angle) * MIN_DISTANCE;
        node2.position[1] = node1.position[1] - Math.sin(angle) * MIN_DISTANCE;
      }
    }
  }
}

/**
 * Assign every Node a position. Cosmetic only: layout never changes which
 * Nodes exist or how they are connected, so it runs last, over a finished
 * Definition, and any positions set earlier are overwritten.
 */
export function applyLayout(definition) {
  const graph = buildGraph(definition);
  dagre.layout(graph);

  definition.nodes.forEach((node) => {
    const laidOut = graph.node(node.name);
    if (laidOut) {
      // Dagre gives centres; n8n wants top-left.
      node.position = [
        Math.round(laidOut.x - laidOut.width / 2),
        Math.round(laidOut.y - laidOut.height / 2),
      ];
    }
  });

  repositionStrandedNodes(definition);
  enforceMinimumSpacing(definition);

  return definition;
}
