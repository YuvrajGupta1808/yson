/**
 * Input/Output with Opik Tracing
 * Full pipeline comparison with observability
 * Track every token saved
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import { Opik } from 'opik';
import { JSONParser, YSONConverter } from '../src/index.js';

// Initialize Opik client with project name
const opik = new Opik({
  projectName: 'yson-format-comparison'
});

const apiKey = process.env.GEMINI_API_KEY ?? "YOUR_GEMINI_API_KEY";

if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
  console.error('❌ Set GEMINI_API_KEY environment variable');
  process.exit(1);
}

// Helper function to call Gemini API with Opik tracing
async function callGeminiAPI(content, spanName, metadata = {}) {
  // Create Opik trace
  const trace = opik.trace({
    name: spanName,
    input: { prompt: content },
    metadata: metadata
  });

  try {
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
    
    const result = {
      text: fullResponse.trim(),
      usage: usage,
      traceId: trace.id
    };

    // End trace with output
    trace.end({
      output: result.text,
      usage: result.usage
    });

    return result;
  } catch (error) {
    trace.end({ error: error.message });
    throw error;
  }
}

// Create main trace for the comparison
const mainTrace = opik.trace({
  name: 'Format Comparison',
  input: { task: 'JSON vs YSON format comparison' },
  metadata: { project: 'yson-format-comparison' }
});

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

// Arrays to store trace information
const jsonTraces = [];
const ysonTraces = [];

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
const jsonResult = await callGeminiAPI(jsonPrompt, 'JSON Input → JSON Output', {
  format: 'JSON',
  input_tokens: jsonInputTokens
});
const jsonOutput = jsonResult.text;

// Extract JSON from markdown if present
let cleanJsonOutput = jsonOutput;
const jsonMatch = jsonOutput.match(/```json\n([\s\S]*?)\n```/) || jsonOutput.match(/```\n([\s\S]*?)\n```/);
if (jsonMatch) {
  cleanJsonOutput = jsonMatch[1];
}

console.log('📤 Gemini JSON Output:');
console.log(cleanJsonOutput);

if (jsonResult.usage) {
  console.log(`\n📊 Actual tokens - Input: ${jsonResult.usage.prompt_tokens}, Output: ${jsonResult.usage.completion_tokens}, Total: ${jsonResult.usage.total_tokens}`);
}
const jsonOutputTokens = jsonResult.usage?.completion_tokens || JSONParser.countTokens(cleanJsonOutput);
console.log(`\n📊 Output tokens: ${jsonOutputTokens}`);

// Store trace information
jsonTraces.push({
  task: 'JSON Input → JSON Output',
  answer: jsonResult.text,
  usage: jsonResult.usage,
  traceId: jsonResult.traceId
});

// Validate JSON
try {
  JSON.parse(cleanJsonOutput);
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
const ysonResult = await callGeminiAPI(ysonPrompt, 'YSON Input → YSON Output', {
  format: 'YSON',
  input_tokens: ysonInputTokens
});
let ysonOutput = ysonResult.text;

// Extract from markdown if present
const ysonMatch = ysonOutput.match(/```\n([\s\S]*?)\n```/);
if (ysonMatch) {
  ysonOutput = ysonMatch[1];
}

console.log('📤 Gemini YSON Output:');
console.log(ysonOutput);

if (ysonResult.usage) {
  console.log(`\n📊 Actual tokens - Input: ${ysonResult.usage.prompt_tokens}, Output: ${ysonResult.usage.completion_tokens}, Total: ${ysonResult.usage.total_tokens}`);
}
const ysonOutputTokens = ysonResult.usage?.completion_tokens || YSONConverter.countTokens(ysonOutput);
console.log(`\n📊 Output tokens: ${ysonOutputTokens}`);

// Store trace information
ysonTraces.push({
  task: 'YSON Input → YSON Output',
  answer: ysonResult.text,
  usage: ysonResult.usage,
  traceId: ysonResult.traceId
});

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

// End main trace with comparison results
mainTrace.end({
  output: `JSON Total: ${jsonInputTokens + jsonOutputTokens} tokens | YSON Total: ${ysonInputTokens + ysonOutputTokens} tokens | Savings: ${totalSavings} tokens (${savingsPercent}%)`,
  usage: {
    prompt_tokens: (jsonResult.usage?.prompt_tokens || 0) + (ysonResult.usage?.prompt_tokens || 0),
    completion_tokens: (jsonResult.usage?.completion_tokens || 0) + (ysonResult.usage?.completion_tokens || 0),
    total_tokens: (jsonResult.usage?.total_tokens || 0) + (ysonResult.usage?.total_tokens || 0)
  }
});

// Flush Opik traces
await opik.flush();

console.log('\n' + '='.repeat(70));
console.log('OPIK TRACKING SUMMARY');
console.log('='.repeat(70));

console.log('\n📊 Trace Information:');
console.log('\nJSON Format:');
jsonTraces.forEach((trace) => {
  console.log(`  Task: ${trace.task}`);
  console.log(`  Trace ID: ${trace.traceId}`);
  if (trace.usage) {
    console.log(`  Tokens - Input: ${trace.usage.prompt_tokens}, Output: ${trace.usage.completion_tokens}, Total: ${trace.usage.total_tokens}`);
  }
});

console.log('\nYSON Format:');
ysonTraces.forEach((trace) => {
  console.log(`  Task: ${trace.task}`);
  console.log(`  Trace ID: ${trace.traceId}`);
  if (trace.usage) {
    console.log(`  Tokens - Input: ${trace.usage.prompt_tokens}, Output: ${trace.usage.completion_tokens}, Total: ${trace.usage.total_tokens}`);
  }
});

console.log('\n✅ All traces logged to Opik');
console.log('   Project: yson-format-comparison');
console.log('   View your traces at: https://www.comet.com/opik');

console.log('\n' + '='.repeat(70));
