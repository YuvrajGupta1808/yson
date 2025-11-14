/**
 * Gemini API Comparison
 * Shows the same prompt with data in JSON, TOON, and YSON formats
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';
import { readFileSync } from 'fs';
import { JSONParser, TOONConverter, YSONConverter } from '../src/index.js';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ Set GEMINI_API_KEY environment variable');
  console.log('Usage: GEMINI_API_KEY="your-key" node examples/gemini_comparison.js');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

// Load test data
const data = JSON.parse(readFileSync('test_data/ecommerce_orders.json', 'utf8'));

// Convert to all formats
const jsonStr = JSONParser.stringify(data, true);
const toonStr = TOONConverter.encode(data);
const ysonStr = YSONConverter.encode(data);

// Count tokens
const jsonTokens = JSONParser.countTokens(jsonStr);
const toonTokens = TOONConverter.countTokens(toonStr);
const ysonTokens = YSONConverter.countTokens(ysonStr);

console.log('='.repeat(70));
console.log('GEMINI API COMPARISON: E-commerce Orders Analysis');
console.log('='.repeat(70));

// Question to ask
const question = "Which customer spent the most money and what was their total?";

console.log('\n📋 Question:', question);
console.log('\n' + '-'.repeat(70));

// Test with JSON
console.log('\n1️⃣  JSON FORMAT\n');
console.log('Data preview (first 10 lines):');
console.log(jsonStr.split('\n').slice(0, 10).join('\n') + '\n...');
console.log(`\nTotal tokens: ${jsonTokens}`);

const jsonPrompt = `You are analyzing e-commerce order data.

Data (JSON format):
${jsonStr}

Question: ${question}

Provide a clear answer with the customer name and total amount.`;

console.log('\n🤖 Sending to Gemini...');
const jsonResult = await model.generateContent(jsonPrompt);
console.log('Response:', jsonResult.response.text().trim());

// Wait to avoid rate limits
console.log('\n⏳ Waiting 5 seconds to avoid rate limits...');
await new Promise(resolve => setTimeout(resolve, 5000));

// Test with TOON
console.log('\n' + '-'.repeat(70));
console.log('\n2️⃣  TOON FORMAT\n');
console.log('Data preview (first 10 lines):');
console.log(toonStr.split('\n').slice(0, 10).join('\n') + '\n...');
console.log(`\nTotal tokens: ${toonTokens} (${((jsonTokens - toonTokens) / jsonTokens * 100).toFixed(1)}% reduction)`);

const toonPrompt = `You are analyzing e-commerce order data.

Data (TOON format):
${toonStr}

Question: ${question}

Provide a clear answer with the customer name and total amount.`;

console.log('\n🤖 Sending to Gemini...');
const toonResult = await model.generateContent(toonPrompt);
console.log('Response:', toonResult.response.text().trim());

// Wait to avoid rate limits
console.log('\n⏳ Waiting 5 seconds to avoid rate limits...');
await new Promise(resolve => setTimeout(resolve, 5000));

// Test with YSON
console.log('\n' + '-'.repeat(70));
console.log('\n3️⃣  YSON FORMAT\n');
console.log('Data preview (first 10 lines):');
console.log(ysonStr.split('\n').slice(0, 10).join('\n') + '\n...');
console.log(`\nTotal tokens: ${ysonTokens} (${((jsonTokens - ysonTokens) / jsonTokens * 100).toFixed(1)}% reduction)`);

const ysonPrompt = `You are analyzing e-commerce order data.

Data (YSON format):
${ysonStr}

Question: ${question}

Provide a clear answer with the customer name and total amount.`;

console.log('\n🤖 Sending to Gemini...');
const ysonResult = await model.generateContent(ysonPrompt);
console.log('Response:', ysonResult.response.text().trim());

// Summary
console.log('\n' + '='.repeat(70));
console.log('SUMMARY');
console.log('='.repeat(70));
console.log(`JSON:  ${jsonTokens} tokens`);
console.log(`TOON:  ${toonTokens} tokens (saves ${jsonTokens - toonTokens} tokens, ${((jsonTokens - toonTokens) / jsonTokens * 100).toFixed(1)}%)`);
console.log(`YSON:  ${ysonTokens} tokens (saves ${jsonTokens - ysonTokens} tokens, ${((jsonTokens - ysonTokens) / jsonTokens * 100).toFixed(1)}%)`);
console.log(`\n🏆 YSON saves ${ysonTokens < toonTokens ? toonTokens - ysonTokens : 0} more tokens than TOON!`);
console.log('\n💡 All formats should produce similar answers.');
console.log('   Token savings = lower API costs!');
console.log('='.repeat(70));
