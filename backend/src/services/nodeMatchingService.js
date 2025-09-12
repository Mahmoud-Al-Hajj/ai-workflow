import { getAllNodeTemplates } from "./catalogService.js";

export class NodeMatchingService {
  constructor() {
    this.nodeCatalog = getAllNodeTemplates();
    this.serviceKeywords = this.buildServiceKeywordMap();
  }

  /**
   * Build a comprehensive mapping of service keywords to node names using only official n8n catalog
   */
  buildServiceKeywordMap() {
    const keywordMap = new Map();

    // Add direct node name mappings from official catalog
    Object.entries(this.nodeCatalog).forEach(([serviceName, nodeType]) => {
      const cleanServiceName = serviceName.toLowerCase();
      keywordMap.set(cleanServiceName, { serviceName, nodeType });

      // Generate all possible variations dynamically from the service name
      const variations = this.generateAllVariations(cleanServiceName);
      variations.forEach((variation) => {
        if (!keywordMap.has(variation)) {
          keywordMap.set(variation, { serviceName, nodeType });
        }
      });
    });

    return keywordMap;
  }

  /**
   * Generate all possible variations of a service name dynamically
   */
  generateAllVariations(serviceName) {
    const variations = new Set();

    // 1. Remove common suffixes to get base names
    const suffixes = ["trigger", "api", "webhook", "node", "service"];
    suffixes.forEach((suffix) => {
      if (serviceName.endsWith(suffix)) {
        variations.add(serviceName.replace(new RegExp(suffix + "$"), ""));
      }
    });

    // 2. Add word boundary variations (split camelCase, remove special chars)
    const wordVariations = this.extractWordVariations(serviceName);
    wordVariations.forEach((variation) => variations.add(variation));

    // 3. Add common abbreviations and expansions
    const abbreviations = this.generateAbbreviations(serviceName);
    abbreviations.forEach((abbrev) => variations.add(abbrev));

    return Array.from(variations).filter((v) => v && v.length > 1);
  }

  /**
   * Extract word variations from service names (camelCase, compound words, etc.)
   */
  extractWordVariations(serviceName) {
    const variations = new Set();

    // Split camelCase: "googleSheets" -> ["google", "sheets", "google sheets"]
    const camelCaseWords = serviceName
      .split(/(?=[A-Z])/)
      .map((w) => w.toLowerCase());
    if (camelCaseWords.length > 1) {
      camelCaseWords.forEach((word) => variations.add(word));
      variations.add(camelCaseWords.join(" "));
      variations.add(camelCaseWords.join(""));
    }

    // Handle compound words with common separators
    const separators = ["-", "_", ".", " "];
    separators.forEach((sep) => {
      if (serviceName.includes(sep)) {
        const parts = serviceName.split(sep).filter((p) => p.length > 0);
        parts.forEach((part) => variations.add(part.toLowerCase()));
        variations.add(parts.join(" "));
        variations.add(parts.join(""));
      }
    });

    // Extract meaningful word parts (3+ characters)
    const words = serviceName.match(/[a-z]{3,}/g) || [];
    words.forEach((word) => variations.add(word));

    return Array.from(variations);
  }

  /**
   * Generate common abbreviations and expansions dynamically
   */
  generateAbbreviations(serviceName) {
    const abbreviations = new Set();

    // Create acronyms from compound words
    const words = serviceName.split(/[^a-z]/i).filter((w) => w.length > 0);
    if (words.length > 1) {
      const acronym = words
        .map((w) => w[0])
        .join("")
        .toLowerCase();
      if (acronym.length > 1) abbreviations.add(acronym);
    }

    // Common word mappings found in service names
    const commonMappings = new Map([
      ["email", ["mail", "e-mail"]],
      ["mail", ["email"]],
      ["google", ["g"]],
      ["microsoft", ["ms", "office"]],
      ["database", ["db"]],
      ["http", ["api", "rest", "web"]],
      ["webhook", ["hook"]],
      ["schedule", ["cron", "timer"]],
      ["calendar", ["cal"]],
      ["drive", ["storage"]],
      ["sheets", ["spreadsheet", "excel"]],
      ["wait", ["delay", "pause", "sleep"]],
      ["message", ["msg"]],
      ["notification", ["notify", "alert"]],
    ]);

    // Apply mappings if service name contains these words
    commonMappings.forEach((synonyms, word) => {
      if (serviceName.includes(word)) {
        synonyms.forEach((synonym) => abbreviations.add(synonym));
      }
    });

    return Array.from(abbreviations);
  }

  /**
   * Extract service names mentioned in user input
   */
  extractMentionedServices(userInput) {
    const input = userInput.toLowerCase();
    const mentionedServices = new Set();

    // Check for direct keyword matches
    this.serviceKeywords.forEach((nodeInfo, keyword) => {
      if (input.includes(keyword)) {
        mentionedServices.add(nodeInfo);
      }
    });

    return Array.from(mentionedServices).filter((service) => service?.nodeType);
  }

  /**
   * Generate dynamic service mappings for AI prompt
   */
  generateServiceMappings(userInput) {
    const mentionedServices = this.extractMentionedServices(userInput);

    if (mentionedServices.length === 0) return "";

    const mappings = mentionedServices
      .map((service) => `  - "${service.serviceName}" → "${service.nodeType}"`)
      .join("\n");

    return `\n\nAVAILABLE NODES FOR THIS REQUEST:\n${mappings}\n\nUse these exact service names in your JSON output.`;
  }
}

export const nodeMatchingService = new NodeMatchingService();
