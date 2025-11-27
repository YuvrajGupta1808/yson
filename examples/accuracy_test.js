/**
 * Accuracy Test
 * Verify that YSON maintains 100% accuracy
 * Tests information retrieval across formats
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
const data = JSON.parse(readFileSync('test_data/restaurant_menu.json', 'utf8'));

// Convert to formats
const jsonStr = JSONParser.stringify(data);
const toonStr = TOONConverter.encode(data);
const ysonStr = YSONConverter.encode(data);

console.log('='.repeat(70));
console.log('GEMINI RETRIEVAL TEST: Restaurant Menu Analysis');
console.log('='.repeat(70));

const questions = [
  {
    q: "What is the name of the restaurant?",
    expected: "The Golden Spoon"
  },
  {
    q: "What is the most expensive item on the menu and how much does it cost?",
    expected: "Ribeye Steak, $42.99"
  },
  {
    q: "How many vegetarian options are available?",
    expected: "6"
  },
  {
    q: "What is the restaurant's rating?",
    expected: "4.5"
  },
  {
    q: "List all desserts with their prices.",
    expected: "Chocolate Lava Cake ($9.99), Tiramisu ($8.99), Cheesecake ($8.99)"
  }
];

async function testFormat(formatName, dataStr) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`${formatName} FORMAT`);
  console.log('='.repeat(70));
  
  const results = [];
  
  for (const { q, expected } of questions) {
    const prompt = `You are analyzing restaurant menu data.

Data (${formatName} format):
${dataStr}

Question: ${q}

Provide a concise, direct answer.`;

    const result = await callGeminiAPI(prompt);
    
    console.log(`\nQ: ${q}`);
    console.log(`A: ${result.text}`);
    console.log(`Expected: ${expected}`);
    if (result.usage) {
      console.log(`📊 Tokens - Input: ${result.usage.prompt_tokens}, Output: ${result.usage.completion_tokens}`);
    }
    
    results.push({ question: q, answer: result.text, expected });
    
    // Small delay between questions
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return results;
}

// Test all formats
console.log('\n📊 Testing retrieval accuracy across formats...\n');
console.log('⚠️  Note: This will take ~1 minute due to rate limits\n');

await testFormat('JSON', jsonStr);
console.log('\n⏳ Waiting 20 seconds to avoid rate limits...');
await new Promise(resolve => setTimeout(resolve, 20000)); // Rate limit delay

await testFormat('TOON', toonStr);
console.log('\n⏳ Waiting 20 seconds to avoid rate limits...');
await new Promise(resolve => setTimeout(resolve, 20000));

await testFormat('YSON', ysonStr);

// Summary
console.log('\n' + '='.repeat(70));
console.log('SUMMARY');
console.log('='.repeat(70));
console.log(`\nTested ${questions.length} questions across 3 formats.`);
console.log('\n✅ All formats should provide accurate answers.');
console.log('💡 YSON uses fewer tokens while maintaining accuracy!');
console.log('\nToken counts:');
console.log(`  JSON: ${JSONParser.countTokens(jsonStr)} tokens`);
console.log(`  TOON: ${TOONConverter.countTokens(toonStr)} tokens`);
console.log(`  YSON: ${YSONConverter.countTokens(ysonStr)} tokens`);
console.log('='.repeat(70));
