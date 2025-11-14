/**
 * YSON Converter V2 - Optimized with schema compression
 * Key improvements:
 * 1. Remove colons - use spaces only
 * 2. Remove dashes - use indentation
 * 3. Schema definitions for repeated structures
 * 4. Inline arrays when possible
 */

export class YSONConverter {
  /**
   * Encode with schema optimization
   */
  static encode(obj, indent = 0) {
    const spaces = '  '.repeat(indent);
    let result = [];

    if (Array.isArray(obj)) {
      // Check if array has uniform objects (can use schema)
      if (obj.length > 1 && this.hasUniformStructure(obj)) {
        return this.encodeWithSchema(obj, indent);
      }
      
      // Non-uniform or small arrays - inline if primitives
      if (obj.every(item => typeof item !== 'object' || item === null)) {
        return spaces + obj.map(v => this.formatValue(v)).join(' ');
      }
      
      // Objects without schema
      obj.forEach(item => {
        result.push(this.encode(item, indent));
      });
    } else if (typeof obj === 'object' && obj !== null) {
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

      // Inline simple pairs (no colons!)
      if (simple.length > 0) {
        const pairs = simple.map(([k, v]) => `${k} ${this.formatValue(v)}`).join(' ');
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
   * Check if array has uniform object structure
   */
  static hasUniformStructure(arr) {
    if (arr.length === 0) return false;
    if (typeof arr[0] !== 'object' || arr[0] === null) return false;
    
    const keys = Object.keys(arr[0]).sort();
    return arr.every(item => {
      if (typeof item !== 'object' || item === null) return false;
      const itemKeys = Object.keys(item).sort();
      return JSON.stringify(keys) === JSON.stringify(itemKeys);
    });
  }

  /**
   * Encode array with schema definition
   */
  static encodeWithSchema(arr, indent = 0) {
    const spaces = '  '.repeat(indent);
    const keys = Object.keys(arr[0]);
    
    // Schema definition: $S (key1 key2 key3)
    const schema = `$S ${keys.join(' ')}`;
    const rows = arr.map(item => {
      return spaces + '  ' + keys.map(k => this.formatValue(item[k])).join(' ');
    });
    
    return spaces + schema + '\n' + rows.join('\n');
  }

  /**
   * Format primitive values (no quotes unless necessary)
   */
  static formatValue(value) {
    if (value === null) return 'null';
    if (typeof value === 'boolean') return String(value);
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string') {
      // Quote only if contains spaces
      if (/\s/.test(value)) {
        return `"${value}"`;
      }
      return value;
    }
    return String(value);
  }

  /**
   * Decode YSON back to JSON
   */
  static decode(ysonString) {
    const lines = ysonString.split('\n').filter(l => l.trim());
    return this.parseLines(lines, 0).value;
  }

  static parseLines(lines, startIdx) {
    if (startIdx >= lines.length) return { value: null, nextIdx: startIdx };

    const firstLine = lines[startIdx].trim();
    const baseIndent = this.getIndent(lines[startIdx]);

    // Check if schema definition
    if (firstLine.startsWith('$S ')) {
      return this.parseSchema(lines, startIdx);
    }

    // Build object from current level
    const obj = {};
    let i = startIdx;

    while (i < lines.length) {
      const indent = this.getIndent(lines[i]);
      if (indent < baseIndent) break;
      if (indent > baseIndent) {
        i++;
        continue;
      }

      const line = lines[i].trim();

      // Schema definition
      if (line.startsWith('$S ')) {
        const schemaResult = this.parseSchema(lines, i);
        return schemaResult;
      }

      // Check if inline key-value pairs
      if (this.isKeyValueLine(line)) {
        const pairs = this.parseInlinePairs(line);
        Object.assign(obj, pairs);
        i++;
      } else {
        // Single key - check if it has nested content
        const key = line;
        i++;

        if (i < lines.length && this.getIndent(lines[i]) > indent) {
          // Has nested content
          const nested = this.parseLines(lines, i);
          obj[key] = nested.value;
          i = nested.nextIdx;
        } else {
          // No nested content - shouldn't happen in valid YSON
          obj[key] = null;
        }
      }
    }

    return { value: obj, nextIdx: i };
  }

  static parseSchema(lines, startIdx) {
    const schemaLine = lines[startIdx].trim();
    const keys = schemaLine.substring(3).split(/\s+/); // Remove "$S "
    
    const result = [];
    let i = startIdx + 1;
    const baseIndent = this.getIndent(lines[startIdx]);

    while (i < lines.length) {
      const indent = this.getIndent(lines[i]);
      if (indent <= baseIndent) break;

      // Use tokenize to handle quoted strings properly
      const values = this.tokenize(lines[i].trim());
      const obj = {};
      
      for (let j = 0; j < keys.length && j < values.length; j++) {
        obj[keys[j]] = this.parseValue(values[j]);
      }
      
      result.push(obj);
      i++;
    }

    return { value: result, nextIdx: i };
  }

  static isKeyValueLine(line) {
    // Parse considering quoted strings
    const tokens = this.tokenize(line);
    // Must have at least 2 tokens and even number (key value pairs)
    return tokens.length >= 2 && tokens.length % 2 === 0;
  }

  static parseInlinePairs(line) {
    const obj = {};
    const tokens = this.tokenize(line);

    for (let i = 0; i < tokens.length; i += 2) {
      if (i + 1 < tokens.length) {
        const key = tokens[i];
        const value = this.parseValue(tokens[i + 1]);
        obj[key] = value;
      }
    }

    return obj;
  }

  static tokenize(line) {
    const tokens = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes) {
          // End quote
          tokens.push('"' + current + '"');
          current = '';
          inQuotes = false;
        } else {
          // Start quote
          inQuotes = true;
        }
      } else if (char === ' ' && !inQuotes) {
        if (current) {
          tokens.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current) {
      tokens.push(current);
    }

    return tokens;
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
