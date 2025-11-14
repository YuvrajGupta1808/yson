/**
 * JSON Parser - converts JSON to internal AST and back
 */

export class JSONParser {
  /**
   * Parse JSON string to AST
   */
  static parse(jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error(`JSON parse error: ${error.message}`);
    }
  }

  /**
   * Serialize AST to JSON string
   */
  static stringify(ast, pretty = false) {
    return pretty ? JSON.stringify(ast, null, 2) : JSON.stringify(ast);
  }

  /**
   * Count tokens in JSON (approximate using GPT-style tokenization)
   * Rough estimate: ~4 chars per token
   */
  static countTokens(jsonString) {
    // Simple approximation: count significant characters
    // More accurate would use tiktoken, but this works for comparison
    const normalized = jsonString.replace(/\s+/g, ' ').trim();
    return Math.ceil(normalized.length / 4);
  }
}
