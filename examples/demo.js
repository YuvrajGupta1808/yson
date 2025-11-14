/**
 * YSON Demo - Format comparison with real data
 */

import { readFileSync } from 'fs';
import { JSONParser, TOONConverter, YSONConverter } from '../src/index.js';

// Load test data from file
const data = JSON.parse(readFileSync('test_data/restaurant_menu.json', 'utf8'));

console.log('='.repeat(70));
console.log('YSON DEMO: Restaurant Menu Format Comparison');
console.log('='.repeat(70));

console.log('\n📄 JSON:');
const json = JSONParser.stringify(data, true);
console.log(json);
const jsonTokens = JSONParser.countTokens(json);
console.log(`\nTokens: ${jsonTokens}\n`);

console.log('-'.repeat(70));

console.log('\n📋 TOON:');
const toon = TOONConverter.encode(data);
console.log(toon);
const toonTokens = TOONConverter.countTokens(toon);
console.log(`\nTokens: ${toonTokens} (${((jsonTokens - toonTokens) / jsonTokens * 100).toFixed(1)}% reduction)\n`);

console.log('-'.repeat(70));

console.log('\n✨ YSON:');
const yson = YSONConverter.encode(data);
console.log(yson);
const ysonTokens = YSONConverter.countTokens(yson);
console.log(`\nTokens: ${ysonTokens} (${((jsonTokens - ysonTokens) / jsonTokens * 100).toFixed(1)}% reduction)\n`);

console.log('='.repeat(70));

// Summary
console.log('\n📊 SUMMARY\n');
console.log(`JSON:  ${jsonTokens} tokens (baseline)`);
console.log(`TOON:  ${toonTokens} tokens (${((jsonTokens - toonTokens) / jsonTokens * 100).toFixed(1)}% better)`);
console.log(`YSON:  ${ysonTokens} tokens (${((jsonTokens - ysonTokens) / jsonTokens * 100).toFixed(1)}% better)`);

if (ysonTokens < toonTokens) {
  console.log(`\n🏆 YSON wins! Saves ${toonTokens - ysonTokens} more tokens than TOON`);
} else if (toonTokens < ysonTokens) {
  console.log(`\n🏆 TOON wins by ${ysonTokens - toonTokens} tokens`);
} else {
  console.log(`\n🤝 Tie! Both formats use the same tokens`);
}

// Round-trip test
console.log('\n' + '='.repeat(70));
console.log('🔄 ROUND-TRIP TEST\n');
const decoded = YSONConverter.decode(yson);

// Deep equality check (order-independent)
function deepEqual(obj1, obj2) {
  return JSON.stringify(sortKeys(obj1)) === JSON.stringify(sortKeys(obj2));
}

function sortKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sortKeys);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).sort().reduce((result, key) => {
      result[key] = sortKeys(obj[key]);
      return result;
    }, {});
  }
  return obj;
}

const matches = deepEqual(data, decoded);
console.log('YSON → JSON → YSON:', matches ? '✅ Perfect!' : '❌ Failed');
console.log('='.repeat(70));
