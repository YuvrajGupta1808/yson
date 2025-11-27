/**
 * Format Comparison with Opik Tracing
 * Compare JSON vs YSON with real Gemini API calls
 * See token savings in action!
 */

import 'dotenv/config';
import { readFileSync, writeFileSync } from 'fs';
import { Opik } from 'opik';
import { JSONParser, TOONConverter, YSONConverter } from '../src/index.js';

const apiKey = process.env.GEMINI_API_KEY ?? "YOUR_GEMINI_API_KEY";

if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
  console.error('❌ Set GEMINI_API_KEY environment variable');
  console.log('Usage: GEMINI_API_KEY="your-key" node examples/gemini_comparison.js');
  process.exit(1);
}

// Initialize Opik client (optional - only if API key is set)
let opik = null;
let localTraces = [];

if (process.env.OPIK_API_KEY) {
  try {
    opik = new Opik({
      projectName: 'yson-format-comparison'
    });
    console.log('✅ Opik cloud tracing enabled');
  } catch (e) {
    console.log('⚠️  Opik cloud init failed, using local logging');
    opik = null;
  }
} else {
  console.log('✅ Opik local tracing enabled (set OPIK_API_KEY for cloud sync)');
}

// Helper function to call Gemini API with optional Opik tracing
async function callGeminiAPI(content, format, question) {
  const startTime = Date.now();
  
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
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Log to Opik or local storage
  if (usage) {
    const trace = {
      name: `Format Comparison - ${format}`,
      timestamp: new Date().toISOString(),
      input: { question, format },
      output: { answer: fullResponse.trim() },
      metadata: {
        format: format,
        model: 'gemini-2.5-flash-lite',
        temperature: 0.6,
        duration_ms: duration
      },
      usage: {
        prompt_tokens: usage.prompt_tokens,
        completion_tokens: usage.completion_tokens,
        total_tokens: usage.total_tokens
      },
      tags: ['format-comparison', format.toLowerCase()]
    };

    // Try cloud Opik first, fallback to local
    if (opik) {
      try {
        opik.trace(trace);
      } catch (e) {
        console.warn('⚠️  Failed to log to Opik cloud:', e.message);
        localTraces.push(trace);
      }
    } else {
      localTraces.push(trace);
    }
  }
  
  return {
    text: fullResponse.trim(),
    usage: usage
  };
}

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
const jsonResult = await callGeminiAPI(jsonPrompt, 'JSON', question);
console.log('Response:', jsonResult.text);
if (jsonResult.usage) {
  console.log(`📊 Actual tokens - Input: ${jsonResult.usage.prompt_tokens}, Output: ${jsonResult.usage.completion_tokens}, Total: ${jsonResult.usage.total_tokens}`);
}

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
const toonResult = await callGeminiAPI(toonPrompt, 'TOON', question);
console.log('Response:', toonResult.text);
if (toonResult.usage) {
  console.log(`📊 Actual tokens - Input: ${toonResult.usage.prompt_tokens}, Output: ${toonResult.usage.completion_tokens}, Total: ${toonResult.usage.total_tokens}`);
}

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
const ysonResult = await callGeminiAPI(ysonPrompt, 'YSON', question);
console.log('Response:', ysonResult.text);
if (ysonResult.usage) {
  console.log(`📊 Actual tokens - Input: ${ysonResult.usage.prompt_tokens}, Output: ${ysonResult.usage.completion_tokens}, Total: ${ysonResult.usage.total_tokens}`);
}

// Summary
console.log('\n' + '='.repeat(70));
console.log('SUMMARY');
console.log('='.repeat(70));
console.log('\n📊 ACTUAL TOKEN USAGE FROM API:');
if (jsonResult.usage && toonResult.usage && ysonResult.usage) {
  console.log(`JSON:  ${jsonResult.usage.prompt_tokens} input tokens`);
  console.log(`TOON:  ${toonResult.usage.prompt_tokens} input tokens (saves ${jsonResult.usage.prompt_tokens - toonResult.usage.prompt_tokens} tokens, ${((jsonResult.usage.prompt_tokens - toonResult.usage.prompt_tokens) / jsonResult.usage.prompt_tokens * 100).toFixed(1)}%)`);
  console.log(`YSON:  ${ysonResult.usage.prompt_tokens} input tokens (saves ${jsonResult.usage.prompt_tokens - ysonResult.usage.prompt_tokens} tokens, ${((jsonResult.usage.prompt_tokens - ysonResult.usage.prompt_tokens) / jsonResult.usage.prompt_tokens * 100).toFixed(1)}%)`);
  console.log(`\n🏆 YSON saves ${ysonResult.usage.prompt_tokens < toonResult.usage.prompt_tokens ? toonResult.usage.prompt_tokens - ysonResult.usage.prompt_tokens : 0} more tokens than TOON!`);
} else {
  console.log(`JSON:  ${jsonTokens} tokens (estimated)`);
  console.log(`TOON:  ${toonTokens} tokens (saves ${jsonTokens - toonTokens} tokens, ${((jsonTokens - toonTokens) / jsonTokens * 100).toFixed(1)}%)`);
  console.log(`YSON:  ${ysonTokens} tokens (saves ${jsonTokens - ysonTokens} tokens, ${((jsonTokens - ysonTokens) / jsonTokens * 100).toFixed(1)}%)`);
  console.log(`\n🏆 YSON saves ${ysonTokens < toonTokens ? toonTokens - ysonTokens : 0} more tokens than TOON!`);
}
console.log('\n💡 All formats should produce similar answers.');
console.log('   Token savings = lower API costs!');

// Flush Opik traces
if (opik) {
  try {
    await opik.flush();
    console.log('\n📊 Traces synced to Opik cloud');
  } catch (e) {
    console.warn('⚠️  Failed to flush to Opik:', e.message);
  }
}

// Save local traces if any
if (localTraces.length > 0) {
  const traceFile = 'opik_traces.json';
  writeFileSync(traceFile, JSON.stringify(localTraces, null, 2));
  console.log(`\n📊 ${localTraces.length} traces saved locally to ${traceFile}`);
}

console.log('='.repeat(70));
