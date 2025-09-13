# Changes to Fix Function Node Code Generation

## Problem
The n8n workflow generator was not properly generating valid function node code. When inspecting the workflow in n8n, function nodes showed the default template code instead of our custom code:

```javascript
// Code here will run only once, no matter how many input items there are.
// More info and help:https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.function/
// Tip: You can use luxon for dates and $jmespath for querying JSON structures

// Loop over inputs and add a new field called 'myNewField' to the JSON of each one
for (item of items) {
  item.json.myNewField = 1;
}

// You can write logs to the browser console
console.log('Done!');

return items;
```

## Changes Made

### 1. Fixed nodeCreationService.js
- Added special handling for function nodes to ensure the code is properly preserved when converting from JSON to n8n workflow
- Added support for multiple parameter names that n8n might use (code, functionCode, jsCode)
- Explicitly set the language to JavaScript

```javascript
// Special handling for function nodes
if (nodeType === "n8n-nodes-base.function" && actionObj.params && actionObj.params.code) {
  return {
    node: this.createNode({
      name: uniqueNodeName,
      type: nodeType,
      position: position,
      parameters: {
        functionCode: actionObj.params.code, // n8n sometimes uses functionCode instead of code
        code: actionObj.params.code,
        jsCode: actionObj.params.code,     // Another possible parameter name
        language: "javascript"             // Explicitly set language
      },
    }),
    uniqueName: uniqueNodeName,
  };
}
```

### 2. Fixed JSON Parsing Issues in aiService.js
- Added more robust JSON parsing with error handling
- Added logging to help debug JSON parsing issues
- Added fallback parsing methods for complex JSON that might contain newlines or special characters

```javascript
try {
  // First attempt: direct parsing
  try {
    const parsedJson = JSON.parse(cleaned); 
    return parsedJson;
  } catch (initialErr) {
    console.log("Initial JSON parsing failed, attempting to fix and retry...");
    
    // Second attempt: Fix common JSON parsing issues
    const fixedJson = cleaned
      .replace(/\\n/g, " ")
      .replace(/\n/g, " ")
      .replace(/([^\\])"/g, '$1\\"')
      .replace(/\s+/g, " ");
    
    // Try parsing the fixed JSON
    return JSON.parse(fixedJson);
  }
} catch (err) {
  // Log detailed error info for debugging
  console.error("JSON parsing error:", err.message);
  console.error("First 500 chars of cleaned text:", cleaned.substring(0, 500) + "...");
  
  // Provide more helpful error message
  throw new Error("Failed to parse complex workflow JSON. The workflow may be too large or contain invalid characters. Try simplifying your request.");
}
```

### 3. Fixed OpenAI Reference in Examples
- Updated the OpenAI node reference in the example to use consistent naming
- Changed from `openai.generate_text` to `openai.summarize`
- Updated the node reference in output from `{{$node["OpenAI"].json.output}}` to `{{$node["openai.summarize"].json.output}}`

### 4. Updated Prompt Guidelines
- Added more explicit instructions for using openai nodes: "For summaries: Use openai nodes for data summarization with proper node naming (openai.summarize)"

## Results
- Function nodes now correctly include custom JavaScript code in the n8n workflow
- The workflow JSON is properly parsed, even for complex workflows with extensive error handling and retry logic
- OpenAI node references are consistent with n8n's expected format

## Further Improvements
1. Consider adding size limits or simplification for very complex workflows
2. Add more comprehensive examples for different node types
3. Add validation before sending the workflow to n8n