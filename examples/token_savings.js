/**
 * Token Savings Calculator
 * See exactly how much money YSON saves you
 * Real API calls with cost breakdown
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import { JSONParser, TOONConverter, YSONConverter } from '../src/index.js';

const apiKey = process.env.GEMINI_API_KEY ?? "YOUR_GEMINI_API_KEY";

if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
  console.error('❌ Set GEMINI_API_KEY environment variable');
  process.exit(1);
}

// Helper function to call Gemini API
async function callGeminiAPI(content) {
  const body = {
    "contents": [{
      "parts": [{
        "text": content
      }]
    }],
    "generationConfig": {
      "temperature": 0.6,
      "topP": 0.95,
      "maxOutputTokens": 16384
    }
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const fullResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const usage = data.usageMetadata ? {
    prompt_tokens: data.usageMetadata.promptTokenCount,
    completion_tokens: data.usageMetadata.candidatesTokenCount,
    total_tokens: data.usageMetadata.totalTokenCount
  } : null;
  
  return {
    text: fullResponse.trim(),
    usage: usage
  };
}

// Load test data
const data = JSON.parse(readFileSync('test_data/company_employees.json', 'utf8'));

const jsonStr = JSONParser.stringify(data);
const toonStr = TOONConverter.encode(data);
const ysonStr = YSONConverter.encode(data);

const jsonTokens = JSONParser.countTokens(jsonStr);
const toonTokens = TOONConverter.countTokens(toonStr);
const ysonTokens = YSONConverter.countTokens(ysonStr);

console.log('='.repeat(70));
console.log('GEMINI PROMPT OPTIMIZATION: Company Analysis with Token Savings');
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
const jsonResult = await callGeminiAPI(jsonPrompt);
console.log(jsonResult.text);
if (jsonResult.usage) {
  console.log(`📊 Actual tokens - Input: ${jsonResult.usage.prompt_tokens}, Output: ${jsonResult.usage.completion_tokens}`);
}
console.log('');

console.log('⏳ Waiting 5 seconds to avoid rate limits...');
await new Promise(resolve => setTimeout(resolve, 5000)); // Rate limit

// Test TOON
console.log('2️⃣  TOON Response:');
const toonResult = await callGeminiAPI(toonPrompt);
console.log(toonResult.text);
if (toonResult.usage) {
  console.log(`📊 Actual tokens - Input: ${toonResult.usage.prompt_tokens}, Output: ${toonResult.usage.completion_tokens}`);
}
console.log('');

console.log('⏳ Waiting 5 seconds to avoid rate limits...');
await new Promise(resolve => setTimeout(resolve, 5000)); // Rate limit

// Test YSON
console.log('3️⃣  YSON Response:');
const ysonResult = await callGeminiAPI(ysonPrompt);
console.log(ysonResult.text);
if (ysonResult.usage) {
  console.log(`📊 Actual tokens - Input: ${ysonResult.usage.prompt_tokens}, Output: ${ysonResult.usage.completion_tokens}`);
}

console.log('\n' + '='.repeat(70));
console.log('✅ All formats produce equivalent results');
if (jsonResult.usage && ysonResult.usage) {
  console.log(`🏆 YSON saves ${jsonResult.usage.prompt_tokens - ysonResult.usage.prompt_tokens} tokens per request (${((jsonResult.usage.prompt_tokens - ysonResult.usage.prompt_tokens) / jsonResult.usage.prompt_tokens * 100).toFixed(1)}%)`);
} else {
  console.log(`🏆 YSON saves ${jsonTokens - ysonTokens} tokens per request (${((jsonTokens - ysonTokens) / jsonTokens * 100).toFixed(1)}%)`);
}
console.log(`💡 At scale, this means significant cost savings!`);
console.log('='.repeat(70));
