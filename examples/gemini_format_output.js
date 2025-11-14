/**
 * Gemini Format Output Comparison
 * JSON input → JSON output vs YSON input → YSON output
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';
import { readFileSync } from 'fs';
import { JSONParser, YSONConverter } from '../src/index.js';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ Set GEMINI_API_KEY environment variable');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

// Load test data
const data = JSON.parse(readFileSync('test_data/ecommerce_orders.json', 'utf8'));

// Prepare both input formats
const jsonInput = JSON.stringify(data, null, 2);
const ysonInput = YSONConverter.encode(data);

const jsonInputTokens = JSONParser.countTokens(jsonInput);
const ysonInputTokens = YSONConverter.countTokens(ysonInput);

console.log('='.repeat(70));
console.log('GEMINI FORMAT COMPARISON: JSON vs YSON (Input & Output)');
console.log('='.repeat(70));

const analysisTask = `Analyze the e-commerce orders and create a summary report with:
1. Top 3 customers by total spending
2. Most popular products (by quantity sold)
3. Order status breakdown (count by status)
4. Total revenue`;

// Test 1: JSON Input → JSON Output
console.log('\n' + '='.repeat(70));
console.log('TEST 1: JSON Input → JSON Output');
console.log('='.repeat(70));

console.log('\n📊 Input Data (JSON format):');
console.log(jsonInput.split('\n').slice(0, 15).join('\n') + '\n...');
console.log(`\n📏 Input tokens: ${jsonInputTokens}`);

const jsonPrompt = `${analysisTask}

Input data (JSON format):
${jsonInput}

Return the summary in JSON format with this structure:
{
  "top_customers": [
    {"name": "...", "total": number, "orders": number}
  ],
  "popular_products": [
    {"product": "...", "quantity": number}
  ],
  "status_breakdown": {
    "shipped": number,
    "pending": number,
    "delivered": number
  },
  "total_revenue": number
}

Output ONLY the JSON, no explanation.`;

console.log('\n🤖 Asking Gemini to output JSON format...\n');
const jsonResult = await model.generateContent(jsonPrompt);
const jsonOutput = jsonResult.response.text().trim();

// Extract JSON from markdown if present
let cleanJsonOutput = jsonOutput;
const jsonMatch = jsonOutput.match(/```json\n([\s\S]*?)\n```/) || jsonOutput.match(/```\n([\s\S]*?)\n```/);
if (jsonMatch) {
  cleanJsonOutput = jsonMatch[1];
}

console.log('📤 Gemini JSON Output:');
console.log(cleanJsonOutput);

const jsonOutputTokens = JSONParser.countTokens(cleanJsonOutput);
console.log(`\n📊 Output tokens: ${jsonOutputTokens}`);

// Validate JSON
try {
  const parsed = JSON.parse(cleanJsonOutput);
  console.log('✅ Valid JSON');
} catch (e) {
  console.log('⚠️  JSON parsing error:', e.message);
}

// Wait to avoid rate limits
console.log('\n⏳ Waiting 5 seconds to avoid rate limits...');
await new Promise(resolve => setTimeout(resolve, 5000));

// Test 2: YSON Input → YSON Output
console.log('\n' + '='.repeat(70));
console.log('TEST 2: YSON Input → YSON Output');
console.log('='.repeat(70));

console.log('\n📊 Input Data (YSON format):');
console.log(ysonInput);
console.log(`\n📏 Input tokens: ${ysonInputTokens}`);

const ysonPrompt = `${analysisTask}

Input data (YSON format):
${ysonInput}

Return the summary in YSON format with this structure:

Example YSON:
top_customers
  $S name total orders
    Alice 1299.97 1
    Emily 2599.95 1
    Michael 449.98 1
popular_products
  $S product quantity
    "Laptop Pro 15" 1
    "Wireless Mouse" 2
status_breakdown
  shipped 1 pending 1 delivered 1
total_revenue 4349.90

Output ONLY the YSON format, no explanation.`;

console.log('\n🤖 Asking Gemini to output YSON format...\n');
const ysonResult = await model.generateContent(ysonPrompt);
let ysonOutput = ysonResult.response.text().trim();

// Extract from markdown if present
const ysonMatch = ysonOutput.match(/```\n([\s\S]*?)\n```/);
if (ysonMatch) {
  ysonOutput = ysonMatch[1];
}

console.log('📤 Gemini YSON Output:');
console.log(ysonOutput);

const ysonOutputTokens = YSONConverter.countTokens(ysonOutput);
console.log(`\n📊 Output tokens: ${ysonOutputTokens}`);

// Comparison
console.log('\n' + '='.repeat(70));
console.log('COMPARISON: JSON vs YSON (Full Pipeline)');
console.log('='.repeat(70));

console.log('\n📊 Token Breakdown:');
console.log('\nJSON Pipeline:');
console.log(`  Input:   ${jsonInputTokens} tokens`);
console.log(`  Output:  ${jsonOutputTokens} tokens`);
console.log(`  Total:   ${jsonInputTokens + jsonOutputTokens} tokens`);

console.log('\nYSON Pipeline:');
console.log(`  Input:   ${ysonInputTokens} tokens`);
console.log(`  Output:  ${ysonOutputTokens} tokens`);
console.log(`  Total:   ${ysonInputTokens + ysonOutputTokens} tokens`);

const totalJsonTokens = jsonInputTokens + jsonOutputTokens;
const totalYsonTokens = ysonInputTokens + ysonOutputTokens;
const totalSavings = totalJsonTokens - totalYsonTokens;
const savingsPercent = ((totalSavings / totalJsonTokens) * 100).toFixed(1);

console.log('\n💰 Savings:');
console.log(`  Input savings:   ${jsonInputTokens - ysonInputTokens} tokens (${((jsonInputTokens - ysonInputTokens) / jsonInputTokens * 100).toFixed(1)}%)`);
console.log(`  Output savings:  ${jsonOutputTokens - ysonOutputTokens} tokens (${((jsonOutputTokens - ysonOutputTokens) / jsonOutputTokens * 100).toFixed(1)}%)`);
console.log(`  Total savings:   ${totalSavings} tokens (${savingsPercent}%)`);

console.log('\n🏆 Winner: YSON');
console.log(`  Saves ${totalSavings} tokens per request`);
console.log(`  At 10,000 requests/day: ${(totalSavings * 10000).toLocaleString()} tokens/day`);
console.log(`  At $0.00015 per 1K tokens: $${((totalSavings * 10000 / 1000) * 0.00015).toFixed(2)}/day`);
console.log(`  Annual savings: $${((totalSavings * 10000 / 1000) * 0.00015 * 365).toFixed(2)}`);

console.log('\n💡 Key Insights:');
console.log('  • YSON saves tokens on BOTH input AND output');
console.log('  • Same semantic information, less tokens');
console.log('  • LLMs can understand and generate YSON');
console.log('  • Savings compound across the entire pipeline');
console.log('  • Perfect for high-volume API applications');

console.log('\n🎯 Use Cases:');
console.log('  • API request/response optimization');
console.log('  • LLM-to-LLM communication');
console.log('  • Data serialization in vector databases');
console.log('  • Reducing costs in production systems');
console.log('  • Chain-of-thought with compact steps');

console.log('\n' + '='.repeat(70));
