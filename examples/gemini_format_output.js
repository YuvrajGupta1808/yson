/**
 * Gemini Format Output Comparison
 * Ask Gemini to output data in JSON vs YSON format
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

console.log('='.repeat(70));
console.log('GEMINI FORMAT OUTPUT: JSON vs YSON Response Comparison');
console.log('='.repeat(70));

const analysisTask = `Analyze the e-commerce orders and create a summary report with:
1. Top 3 customers by total spending
2. Most popular products (by quantity sold)
3. Order status breakdown (count by status)
4. Total revenue`;

// Test 1: Ask for JSON output
console.log('\n' + '='.repeat(70));
console.log('TEST 1: Request JSON Output');
console.log('='.repeat(70));

const jsonPrompt = `${analysisTask}

Input data:
${JSON.stringify(data, null, 2)}

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

// Test 2: Ask for YSON output
console.log('\n' + '='.repeat(70));
console.log('TEST 2: Request YSON Output');
console.log('='.repeat(70));

const ysonPrompt = `${analysisTask}

Input data:
${JSON.stringify(data, null, 2)}

Return the summary in YSON format. YSON format rules:
- Use indentation (2 spaces) for nesting
- Space-separated key-value pairs: key value
- For arrays with same structure, use schema: $S key1 key2 key3
- Then list values: value1 value2 value3
- No colons, no brackets, no commas
- Quote strings only if they contain spaces

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

// Try to parse YSON
// try {
//  const parsed = YSONConverter.decode(ysonOutput);
//  console.log('✅ Valid YSON (parseable)');
//  console.log('\nParsed to JSON:');
//  console.log(JSON.stringify(parsed, null, 2));
//} catch (e) {
//  console.log('⚠️  YSON parsing note:', e.message);
//  console.log('(Gemini may need more examples to learn YSON format)');
//}

// Comparison
console.log('\n' + '='.repeat(70));
console.log('COMPARISON');
console.log('='.repeat(70));

console.log('\n📊 Output Token Efficiency:');
console.log(`  JSON output:  ${jsonOutputTokens} tokens`);
console.log(`  YSON output:  ${ysonOutputTokens} tokens`);

if (ysonOutputTokens < jsonOutputTokens) {
  const savings = jsonOutputTokens - ysonOutputTokens;
  const percent = ((savings / jsonOutputTokens) * 100).toFixed(1);
  console.log(`  🏆 YSON saves ${savings} tokens (${percent}%)`);
} else {
  console.log(`  📊 JSON is more compact in this case`);
}

console.log('\n💡 Key Insights:');
console.log('  • Both formats can represent the same data');
console.log('  • YSON typically uses fewer tokens for structured data');
console.log('  • LLMs can learn to output in custom formats');
console.log('  • Token savings apply to both input AND output');

console.log('\n🎯 Use Cases:');
console.log('  • API responses with custom formats');
console.log('  • Reducing output token costs');
console.log('  • Data serialization for LLM-to-LLM communication');
console.log('  • Efficient data storage in vector databases');

console.log('\n' + '='.repeat(70));
