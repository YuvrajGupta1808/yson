/**
 * Token Counter - measures token efficiency across formats
 */

import { JSONParser, TOONConverter, YSONConverter } from '../src/index.js';

export class TokenCounter {
  /**
   * Compare token counts across all formats
   */
  static compare(jsonObj) {
    const jsonStr = JSONParser.stringify(jsonObj);
    const toonStr = TOONConverter.encode(jsonObj);
    const ysonStr = YSONConverter.encode(jsonObj);

    const jsonTokens = JSONParser.countTokens(jsonStr);
    const toonTokens = TOONConverter.countTokens(toonStr);
    const ysonTokens = YSONConverter.countTokens(ysonStr);

    return {
      json: {
        string: jsonStr,
        tokens: jsonTokens,
        reduction: 0
      },
      toon: {
        string: toonStr,
        tokens: toonTokens,
        reduction: ((jsonTokens - toonTokens) / jsonTokens * 100).toFixed(1)
      },
      yson: {
        string: ysonStr,
        tokens: ysonTokens,
        reduction: ((jsonTokens - ysonTokens) / jsonTokens * 100).toFixed(1)
      }
    };
  }

  /**
   * Generate comparison report
   */
  static report(results) {
    console.log('\n📊 Token Efficiency Report\n');
    console.log('Format | Tokens | Reduction  |  Size');
    console.log('-------|--------|------------|---------');
    console.log(`JSON   | ${results.json.tokens.toString().padEnd(6)} | ${results.json.reduction.toString().padEnd(9)}% | ${results.json.string.length} chars`);
    console.log(`TOON   | ${results.toon.tokens.toString().padEnd(6)} | ${results.toon.reduction.toString().padEnd(9)}% | ${results.toon.string.length} chars`);
    console.log(`YSON   | ${results.yson.tokens.toString().padEnd(6)} | ${results.yson.reduction.toString().padEnd(9)}% | ${results.yson.string.length} chars`);
    
    const ysonVsToon = ((results.toon.tokens - results.yson.tokens) / results.toon.tokens * 100).toFixed(1);
    console.log(`\n✨ YSON vs TOON: ${ysonVsToon}% additional reduction`);
  }
}
