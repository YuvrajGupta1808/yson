/**
 * YSON Converter - ultra-compact format
 * Key innovations:
 * - Inline key:value pairs on same line when possible
 * - Minimal punctuation
 * - Indentation for nesting
 * - Type inference
 */

export class YSONConverter {
  /**
   * Convert JSON AST to YSON format
   */
  static encode(obj, indent = 0) {
    const spaces = '  '.repeat(indent);
    let result = [];

    if (Array.isArray(obj)) {
      // Arrays: compact inline when primitives, nested when objects
      if (obj.every(item => typeof item !== 'object' || item === null)) {
        // All primitives - inline
        const values = obj.map(v => this.formatValue(v)).join(' ');
        return spaces + '- ' + values;
      } else {
        // Contains objects - nested
        obj.forEach(item => {
          result.push(spaces + '-');
          result.push(this.encode(item, indent + 1));
        });
      }
    } else if (typeof obj === 'object' && obj !== null) {
      // Objects: try to inline simple key:value pairs
      const entries = Object.entries(obj);
      const simple = [];
      const complex = [];

      for (const [key, value] of entries) {
        if (typeof value === 'object' && value !== null) {
          complex.push([key, value]);
        } else {
          simple.push([key, value]);
        }
      }

      // Inline simple pairs
      if (simple.length > 0) {
        const pairs = simple.map(([k, v]) => `${k}:${this.formatValue(v)}`).join(' ');
        result.push(spaces + pairs);
      }

      // Nested complex pairs
      for (const [key, value] of complex) {
        result.push(spaces + key);
        result.push(this.encode(value, indent + 1));
      }
    }

    return result.join('\n');
  }

  /**
   * Format primitive values (no quotes unless necessary)
   */
  static formatValue(value) {
    if (value === null) return 'null';
    if (typeof value === 'boolean') return String(value);
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string') {
      // Quote only if contains special chars
      if (/[\s:]/.test(value)) {
        return `"${value}"`;
      }
      return value;
    }
    return String(value);
  }

  /**
   * Parse YSON back to JSON AST
   */
  static decode(ysonString) {
    const lines = ysonString.split('\n').filter(l => l.trim());
    return this.parseLines(lines, 0).value;
  }

  static parseLines(lines, startIdx) {
    if (startIdx >= lines.length) return { value: null, nextIdx: startIdx };

    const firstLine = lines[startIdx].trim();
    const baseIndent = this.getIndent(lines[startIdx]);

    // Check if array
    if (firstLine.startsWith('-')) {
      return this.parseArray(lines, startIdx);
    }

    // Check if inline key:value pairs
    if (firstLine.includes(':')) {
      const obj = this.parseInlinePairs(firstLine);
      let i = startIdx + 1;

      // Check for nested objects
      while (i < lines.length && this.getIndent(lines[i]) > baseIndent) {
        const line = lines[i].trim();
        if (!line.includes(':')) {
          // Nested object key
          const key = line;
          const nested = this.parseLines(lines, i + 1);
          obj[key] = nested.value;
          i = nested.nextIdx;
        } else {
          i++;
        }
      }

      return { value: obj, nextIdx: i };
    }

    // Single key with nested value
    const key = firstLine;
    const nested = this.parseLines(lines, startIdx + 1);
    return { value: { [key]: nested.value }, nextIdx: nested.nextIdx };
  }

  static parseArray(lines, startIdx) {
    const result = [];
    let i = startIdx;
    const baseIndent = this.getIndent(lines[i]);

    while (i < lines.length) {
      const indent = this.getIndent(lines[i]);
      if (indent < baseIndent) break;
      if (indent > baseIndent) {
        i++;
        continue;
      }

      const line = lines[i].trim();
      if (!line.startsWith('-')) break;

      const content = line.substring(1).trim();
      if (content) {
        // Inline array values
        const values = content.split(/\s+/).map(v => this.parseValue(v));
        result.push(...values);
        i++;
      } else {
        // Nested object
        const nested = this.parseLines(lines, i + 1);
        result.push(nested.value);
        i = nested.nextIdx;
      }
    }

    return { value: result, nextIdx: i };
  }

  static parseInlinePairs(line) {
    const obj = {};
    const pairs = line.split(/\s+(?=\w+:)/); // Split on space before key:

    for (const pair of pairs) {
      const colonIdx = pair.indexOf(':');
      if (colonIdx === -1) continue;

      const key = pair.substring(0, colonIdx);
      const value = this.parseValue(pair.substring(colonIdx + 1));
      obj[key] = value;
    }

    return obj;
  }

  static getIndent(line) {
    return line.search(/\S/);
  }

  static parseValue(str) {
    str = str.trim();
    if (str.startsWith('"') && str.endsWith('"')) {
      return str.slice(1, -1);
    }
    if (str === 'true') return true;
    if (str === 'false') return false;
    if (str === 'null') return null;
    if (!isNaN(str) && str !== '') return Number(str);
    return str;
  }

  /**
   * Count tokens (approximate)
   */
  static countTokens(ysonString) {
    const normalized = ysonString.replace(/\s+/g, ' ').trim();
    return Math.ceil(normalized.length / 4);
  }
}
