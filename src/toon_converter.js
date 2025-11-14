/**
 * TOON Converter - minimal implementation for benchmarking
 * TOON uses indentation and whitespace to reduce tokens
 */

export class TOONConverter {
  /**
   * Convert JSON AST to TOON format
   */
  static encode(obj, indent = 0) {
    const spaces = '  '.repeat(indent);
    let result = [];

    if (Array.isArray(obj)) {
      // Arrays: each item on new line
      obj.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          result.push(this.encode(item, indent));
        } else {
          result.push(spaces + this.formatValue(item));
        }
      });
    } else if (typeof obj === 'object' && obj !== null) {
      // Objects: key-value pairs with indentation
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
          result.push(spaces + key);
          result.push(this.encode(value, indent + 1));
        } else {
          result.push(spaces + key + ' ' + this.formatValue(value));
        }
      }
    }

    return result.join('\n');
  }

  /**
   * Format primitive values
   */
  static formatValue(value) {
    if (typeof value === 'string') {
      // Only quote if contains spaces
      return value.includes(' ') ? `"${value}"` : value;
    }
    return String(value);
  }

  /**
   * Parse TOON back to JSON AST
   */
  static decode(toonString) {
    const lines = toonString.split('\n').filter(l => l.trim());
    return this.parseLines(lines, 0).value;
  }

  static parseLines(lines, startIdx) {
    if (startIdx >= lines.length) return { value: null, nextIdx: startIdx };

    const result = {};
    let i = startIdx;
    const baseIndent = this.getIndent(lines[i]);

    while (i < lines.length) {
      const line = lines[i];
      const indent = this.getIndent(line);

      if (indent < baseIndent) break;
      if (indent > baseIndent) {
        i++;
        continue;
      }

      const trimmed = line.trim();
      const spaceIdx = trimmed.indexOf(' ');

      if (spaceIdx === -1) {
        // Key only - next lines are nested object
        const key = trimmed;
        const nested = this.parseLines(lines, i + 1);
        result[key] = nested.value;
        i = nested.nextIdx;
      } else {
        // Key value pair
        const key = trimmed.substring(0, spaceIdx);
        const value = this.parseValue(trimmed.substring(spaceIdx + 1).trim());
        result[key] = value;
        i++;
      }
    }

    return { value: result, nextIdx: i };
  }

  static getIndent(line) {
    return line.search(/\S/);
  }

  static parseValue(str) {
    if (str.startsWith('"') && str.endsWith('"')) {
      return str.slice(1, -1);
    }
    if (str === 'true') return true;
    if (str === 'false') return false;
    if (str === 'null') return null;
    if (!isNaN(str)) return Number(str);
    return str;
  }

  /**
   * Count tokens (approximate)
   */
  static countTokens(toonString) {
    const normalized = toonString.replace(/\s+/g, ' ').trim();
    return Math.ceil(normalized.length / 4);
  }
}
