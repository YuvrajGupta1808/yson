/**
 * YSON Demo - See the magic happen!
 */

import { readFileSync } from 'fs';
import { JSONParser, YSONConverter } from '../src/index.js';

console.log('\n');
console.log('╔═══════════════════════════════════════════════════════════════════╗');
console.log('║                    🚀 YSON FORMAT DEMO 🚀                        ║');
console.log('║              Hyper-Compact Data Format for LLMs                  ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝');
console.log('\n');

// Load test data
const data = JSON.parse(readFileSync('test_data/simple_products.json', 'utf8'));

console.log('📦 Sample Data: Product Catalog\n');

// JSON Format
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📄 JSON FORMAT (Traditional)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
const json = JSONParser.stringify(data, true);
const jsonLines = json.split('\n');
console.log(jsonLines.slice(0, 20).join('\n'));
if (jsonLines.length > 20) {
  console.log('  ...');
}
const jsonTokens = JSONParser.countTokens(json);
console.log(`\n📊 Token Count: ${jsonTokens} tokens`);
console.log(`💾 Size: ${json.length} characters\n`);

// YSON Format
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✨ YSON FORMAT (Optimized)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
const yson = YSONConverter.encode(data);
console.log(yson);
const ysonTokens = YSONConverter.countTokens(yson);
console.log(`\n📊 Token Count: ${ysonTokens} tokens`);
console.log(`💾 Size: ${yson.length} characters\n`);

// Comparison
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('💰 SAVINGS BREAKDOWN');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const tokenSavings = jsonTokens - ysonTokens;
const percentSavings = ((tokenSavings / jsonTokens) * 100).toFixed(1);
const charSavings = json.length - yson.length;
const charPercent = ((charSavings / json.length) * 100).toFixed(1);

console.log(`🎯 Token Reduction:  ${tokenSavings} tokens saved (${percentSavings}% reduction)`);
console.log(`📉 Size Reduction:   ${charSavings} characters saved (${charPercent}% reduction)`);

// Cost calculation
const costPerMillion = 0.15; // $0.15 per 1M tokens (typical LLM pricing)
const dailyRequests = 10000;
const jsonDailyCost = (jsonTokens * dailyRequests / 1000000) * costPerMillion;
const ysonDailyCost = (ysonTokens * dailyRequests / 1000000) * costPerMillion;
const dailySavings = jsonDailyCost - ysonDailyCost;
const annualSavings = dailySavings * 365;

console.log('\n💵 Cost Impact (at 10,000 requests/day):');
console.log(`   JSON:  $${jsonDailyCost.toFixed(2)}/day`);
console.log(`   YSON:  $${ysonDailyCost.toFixed(2)}/day`);
console.log(`   ────────────────────────────`);
console.log(`   Daily Savings:   $${dailySavings.toFixed(2)}`);
console.log(`   Annual Savings:  $${annualSavings.toFixed(2)}`);

// Round-trip verification
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔄 DATA INTEGRITY CHECK');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const decoded = YSONConverter.decode(yson);
const matches = JSON.stringify(data) === JSON.stringify(decoded);

console.log(`YSON → JSON conversion: ${matches ? '✅ Perfect match!' : '❌ Failed'}`);
console.log(`Data loss: ${matches ? '✅ Zero data loss' : '❌ Data corrupted'}`);
console.log(`Round-trip safe: ${matches ? '✅ 100% reliable' : '❌ Not safe'}`);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎉 SUMMARY');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log(`✨ YSON saves ${percentSavings}% tokens compared to JSON`);
console.log(`💰 Potential annual savings: $${annualSavings.toFixed(2)}`);
console.log(`🔒 ${matches ? '100%' : 'Failed'} data integrity`);
console.log(`⚡ Perfect for LLM applications\n`);

console.log('Try it yourself:');
console.log('  npm install yson-format');
console.log('  import { YSONConverter } from "yson-format";\n');

console.log('╚═══════════════════════════════════════════════════════════════════╝\n');
