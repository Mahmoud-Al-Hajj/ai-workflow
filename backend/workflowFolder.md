# Workflow Services Architecture Documentation

## Overview

The `src/services/workflow/` directory contains a modular service architecture for building n8n workflows from AI-generated JSON. This design follows separation of concerns principles, making the codebase maintainable and testable.

---

## 🔗 **connectionService.js**

### **Purpose**

Manages the complex task of connecting n8n workflow nodes, handling sequential, parallel, and conditional (IF/ELSE) execution paths.

### **Key Responsibilities**

- **Connection State Management**: Tracks current execution chains (main, parallel, true/false branches)
- **Branch Logic**: Handles IF node true/false path routing
- **Connection Validation**: Ensures proper node-to-node connections
- **Context Switching**: Manages transitions between different execution modes

### **Core Classes & Methods**

```javascript
export class ConnectionService {
  reset() // Clear state for new workflow
  addConnection(fromNode, toNode, outputIndex, inputIndex) // Create node connection
  determineSourceNode(actionObj, nodeName) // Find correct source for connection
  connectNode(actionObj, nodeName) // Connect node based on execution mode
  updateTrackingState(actionObj, nodeName) // Update internal state after connection
}
```

### **Execution Modes Handled**

- **sequential**: Standard linear workflow progression
- **parallel**: Simultaneous execution branches
- **branch_true**: IF condition true path
- **branch_false**: IF condition false path

### **State Management**

The service maintains execution context through:

- `mainChain`: Current head of sequential execution
- `parallelChain`: Current head of parallel execution
- `trueBranchChain`: Current head of IF true branch
- `falseBranchChain`: Current head of IF false branch
- `currentIfNode`: Active IF node context

---

## 🚀 **deploymentService.js**

### **Purpose**

Handles the final deployment of generated workflows to n8n instances via REST API.

### **Key Responsibilities**

- **Workflow Deployment**: Sends workflow JSON to n8n API
- **API Integration**: Manages n8n authentication and communication
- **Error Handling**: Provides deployment feedback and error reporting
- **Response Processing**: Extracts workflow ID from deployment response

### **Core Functions**

```javascript
export async function deployWorkflow(userJson, apiKey, n8nUrl) {
  // 1. Build workflow using WorkflowBuilderService
  // 2. Add required n8n settings
  // 3. Deploy via createN8nWorkflow API call
  // 4. Return deployment result with workflow ID
}
```

### **Integration Points**

- Uses `WorkflowBuilderService` for workflow construction
- Integrates with `n8nAuthService` for API communication
- Requires environment configuration (API keys, URLs)

---

## 🏗️ **nodeCreationService.js**

### **Purpose**

Factory service for creating properly structured n8n node objects with correct types, parameters, and naming.

### **Key Responsibilities**

- **Node Type Mapping**: Maps service names to correct n8n node types
- **Unique Naming**: Ensures no duplicate node names in workflow
- **Parameter Handling**: Sets up node-specific parameters correctly
- **Type Versioning**: Assigns appropriate version numbers for node compatibility

### **Core Classes & Methods**

```javascript
export class NodeCreationService {
  reset() // Clear state for new workflow
  createNode({name, type, position, parameters}) // Generic node creation
  ensureUniqueNodeName(baseName) // Generate unique names
  getTriggerNodeType(trigger) // Map trigger to n8n type
  getActionNodeType(action) // Map action to n8n type
  createTriggerNode(trigger, params) // Create workflow trigger
  createActionNode(actionObj, position) // Create action node
}
```

### **Node Type Mapping Strategy**

1. **Service Name Extraction**: Parses action strings (e.g., "gmail.send" → "gmail")
2. **Catalog Lookup**: Checks enhanced node catalog for exact matches
3. **Special Case Handling**: IF nodes, HTTP requests, wait/delay operations
4. **Fallback Strategy**: Default mappings for common services

### **Special Handling**

- **Function Nodes**: Multiple parameter formats (`code`, `functionCode`, `jsCode`)
- **Trigger Nodes**: Schedule triggers, webhook triggers, manual triggers
- **IF Nodes**: Conditional logic with proper type versioning

---

## 🎯 **nodeMatchingService.js**

### **Purpose**

Intelligent service name matching that maps user input to available n8n nodes using fuzzy matching and keyword recognition.

### **Key Responsibilities**

- **Keyword Extraction**: Identifies service names from natural language input
- **Fuzzy Matching**: Handles variations, abbreviations, and synonyms
- **Service Discovery**: Maps user terms to actual n8n node types
- **Dynamic Mapping**: Generates contextual service suggestions

### **Core Classes & Methods**

```javascript
export class NodeMatchingService {
  buildServiceKeywordMap() // Build comprehensive service-to-node mapping
  generateAllVariations(serviceName) // Create service name variations
  extractWordVariations(serviceName) // Handle camelCase, compound words
  generateAbbreviations(serviceName) // Common abbreviations and expansions
  extractMentionedServices(userInput) // Find services in user text
  generateServiceMappings(userInput) // Create AI prompt mappings
}
```

### **Matching Strategies**

1. **Direct Mapping**: Exact service name matches
2. **Variation Generation**: CamelCase splitting, compound words
3. **Abbreviation Handling**: Common tech abbreviations (e.g., "db" → "database")
4. **Synonym Recognition**: Multiple terms for same concept (e.g., "email" ↔ "mail")

### **AI Integration**

Generates dynamic service mappings for AI prompts based on detected services in user input, improving accuracy of workflow generation.

---

## 📍 **positioningService.js**

### **Purpose**

Professional graph layout service using Dagre algorithm to position workflow nodes optimally for visual clarity.

### **Key Responsibilities**

- **Graph Layout**: Uses Dagre library for optimal node positioning
- **Visual Optimization**: Prevents node overlaps and ensures readability
- **Workflow Flow**: Maintains logical left-to-right execution flow
- **Custom Layouts**: Specialized positioning for different node types

### **Core Classes & Methods**

```javascript
class PositioningService {
  createLayoutState() // Initialize layout state (backward compatibility)
  calculateNodePosition(mode, layoutState) // Basic positioning
  applyConnectionAwareLayout(workflow) // Standard Dagre layout
  applyOptimizedDagreLayout(workflow) // Enhanced layout with optimizations
  validateAndFixOverlaps(workflow) // Ensure proper spacing
  enforceMinimumSpacing(workflow) // Prevent node collisions
}
```

### **Layout Algorithm**

1. **Graph Construction**: Creates directed graph from workflow connections
2. **Dagre Configuration**: Left-to-right layout with optimal spacing parameters
3. **Node Sizing**: Adjusts dimensions based on node type (IF nodes smaller, etc.)
4. **Edge Weighting**: Prioritizes true branches in conditional flows
5. **Position Calculation**: Converts Dagre coordinates to n8n format

### **Quality Assurance**

- **Overlap Detection**: Identifies and fixes positioning conflicts
- **Minimum Spacing**: Ensures readable node separation
- **Fallback Positioning**: Grid layout for nodes that escape Dagre positioning

---

## 🎼 **workflowBuilderService.js**

### **Purpose**

Main orchestrator that coordinates all other services to build complete n8n workflows from AI-generated JSON.

### **Key Responsibilities**

- **Service Coordination**: Manages ConnectionService, NodeCreationService, PositioningService
- **Workflow Assembly**: Builds complete n8n workflow structure
- **Process Orchestration**: Ensures proper order of operations
- **Quality Validation**: Validates final workflow structure

### **Core Classes & Methods**

```javascript
export class WorkflowBuilderService {
  buildWorkflow(userJson) // Main workflow building orchestration
  processActionNode(actionObj, workflow, layoutState) // Handle individual nodes
  validateWorkflow(workflow) // Ensure workflow integrity
  getWorkflowStats(workflow) // Generate workflow statistics
}
```

### **Build Process Flow**

1. **Initialization**: Reset all services for clean state
2. **Trigger Creation**: Build workflow trigger node
3. **Action Processing**: Create and connect all action nodes
4. **Connection Assembly**: Apply all node connections
5. **Layout Application**: Position nodes using Dagre algorithm
6. **Validation**: Check for orphaned nodes and structural issues

### **Workflow Structure**

```javascript
const workflow = {
  name: "AI Generated Workflow",
  nodes: [], // Array of n8n node objects
  connections: {}, // Connection mapping object
  settings: {
    saveExecutionProgress: true,
  },
};
```

---

## 🔄 **Service Interaction Flow**

```
User Input → AI Service → JSON Structure
                ↓
    WorkflowBuilderService (Orchestrator)
                ↓
    ┌─────────────────────────────────────┐
    │ 1. NodeCreationService              │
    │    - Create trigger & action nodes  │
    │    - Handle type mapping & naming   │
    └─────────────────────────────────────┘
                ↓
    ┌─────────────────────────────────────┐
    │ 2. ConnectionService                │
    │    - Connect nodes based on flow   │
    │    - Handle branching logic        │
    └─────────────────────────────────────┘
                ↓
    ┌─────────────────────────────────────┐
    │ 3. PositioningService               │
    │    - Apply Dagre layout algorithm  │
    │    - Optimize visual presentation  │
    └─────────────────────────────────────┘
                ↓
    ┌─────────────────────────────────────┐
    │ 4. DeploymentService                │
    │    - Send to n8n via API          │
    │    - Handle deployment response    │
    └─────────────────────────────────────┘
```

---

## 🛠️ **Technical Design Principles**

### **Separation of Concerns**

Each service has a single, well-defined responsibility, making the codebase modular and maintainable.

### **Stateful Services**

Services maintain internal state that gets reset between workflow builds, ensuring clean processing.

### **Error Resilience**

Each service includes error handling and fallback strategies for robust workflow generation.

### **Extensibility**

Modular design allows easy addition of new node types, connection patterns, or layout algorithms.

### **n8n Compatibility**

All services generate structures that comply with n8n's workflow format and API requirements.

---

## 🚀 **Performance Considerations**

### **Memory Management**

- Services reset state between workflows to prevent memory leaks
- Large workflow support through efficient graph algorithms

### **Computational Efficiency**

- Dagre algorithm provides O(V+E) layout complexity
- Service lookups use Map structures for O(1) access

### **Scalability**

- Stateless deployment allows horizontal scaling
- Individual services can be optimized independently

---

## 📈 **Potential Improvements**

### **Caching**

- Node type mapping cache for repeated lookups
- Layout template cache for similar workflow patterns

### **Validation**

- Schema validation for input JSON
- n8n compatibility checks before deployment

### **Monitoring**

- Performance metrics for each service
- Error tracking and analytics

### **Testing**

- Unit tests for each service
- Integration tests for service coordination
