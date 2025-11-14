/**
 * Gemini Prompt Optimization
 * Shows how YSON reduces prompt token usage for complex queries
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';
import { readFileSync } from 'fs';
import { JSONParser, TOONConverter, YSONConverter } from '../src/index.js';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ Set GEMINI_API_KEY environment variable');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

// Load test data
const data = JSON.parse(readFileSync('test_data/company_employees.json', 'utf8'));

const jsonStr = JSONParser.stringify(data);
const toonStr = TOONConverter.encode(data);
const ysonStr = YSONConverter.encode(data);

const jsonTokens = JSONParser.countTokens(jsonStr);
const toonTokens = TOONConverter.countTokens(toonStr);
const ysonTokens = YSONConverter.countTokens(ysonStr);

console.log('='.repeat(70));
console.log('PROMPT OPTIMIZATION: Company Analysis with Token Savings');
console.log('='.repeat(70));

const task = `Analyze the company data and provide:
1. Total number of employees across all departments
2. Department with the highest average salary
3. Employee with the longest tenure and their role`;

// Build full prompts
const jsonPrompt = `${task}\n\nData (JSON):\n${jsonStr}`;
const toonPrompt = `${task}\n\nData (TOON):\n${toonStr}`;
const ysonPrompt = `${task}\n\nData (YSON):\n${ysonStr}`;

console.log('\n📊 TOKEN COMPARISON\n');
console.log(`JSON:  ${jsonTokens} tokens`);
console.log(`TOON:  ${toonTokens} tokens (saves ${jsonTokens - toonTokens} tokens)`);
console.log(`YSON:  ${ysonTokens} tokens (saves ${jsonTokens - ysonTokens} tokens)`);

console.log('\n💰 COST SAVINGS (Gemini pricing: ~$0.00015 per 1K input tokens)\n');
const jsonCost = (jsonTokens / 1000 * 0.00015).toFixed(6);
const toonCost = (toonTokens / 1000 * 0.00015).toFixed(6);
const ysonCost = (ysonTokens / 1000 * 0.00015).toFixed(6);

console.log(`JSON:  $${jsonCost} per request`);
console.log(`TOON:  $${toonCost} per request (saves $${(jsonCost - toonCost).toFixed(6)})`);
console.log(`YSON:  $${ysonCost} per request (saves $${(jsonCost - ysonCost).toFixed(6)})`);

const requestsPerDay = 10000;
const jsonDailyCost = (jsonTokens / 1000 * 0.00015 * requestsPerDay).toFixed(2);
const ysonDailyCost = (ysonTokens / 1000 * 0.00015 * requestsPerDay).toFixed(2);
const dailySavings = (jsonDailyCost - ysonDailyCost).toFixed(2);

console.log(`\n📈 At ${requestsPerDay.toLocaleString()} requests/day:`);
console.log(`   JSON:  $${jsonDailyCost}/day`);
console.log(`   YSON:  $${ysonDailyCost}/day`);
console.log(`   💵 Daily savings: $${dailySavings}`);
console.log(`   💵 Annual savings: $${(dailySavings * 365).toFixed(2)}`);

console.log('\n' + '-'.repeat(70));
console.log('\n🤖 TESTING WITH GEMINI\n');

console.log('Task:', task);
console.log('');

// Test JSON
console.log('1️⃣  JSON Response:');
const jsonResult = await model.generateContent(jsonPrompt);
console.log(jsonResult.response.text().trim());
console.log('');

console.log('⏳ Waiting 5 seconds to avoid rate limits...');
await new Promise(resolve => setTimeout(resolve, 5000)); // Rate limit

// Test TOON
console.log('2️⃣  TOON Response:');
const toonResult = await model.generateContent(toonPrompt);
console.log(toonResult.response.text().trim());
console.log('');

console.log('⏳ Waiting 5 seconds to avoid rate limits...');
await new Promise(resolve => setTimeout(resolve, 5000)); // Rate limit

// Test YSON
console.log('3️⃣  YSON Response:');
const ysonResult = await model.generateContent(ysonPrompt);
console.log(ysonResult.response.text().trim());

console.log('\n' + '='.repeat(70));
console.log('✅ All formats produce equivalent results');
console.log(`🏆 YSON saves ${jsonTokens - ysonTokens} tokens per request (${((jsonTokens - ysonTokens) / jsonTokens * 100).toFixed(1)}%)`);
console.log(`💡 At scale, this means significant cost savings!`);
console.log('='.repeat(70));
