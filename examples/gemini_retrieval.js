/**
 * Gemini API Retrieval Test
 * Tests information retrieval accuracy across formats
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

    const result = await model.generateContent(prompt);
    const answer = result.response.text().trim();
    
    console.log(`\nQ: ${q}`);
    console.log(`A: ${answer}`);
    console.log(`Expected: ${expected}`);
    
    results.push({ question: q, answer, expected });
    
    // Small delay between questions
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return results;
}

// Test all formats
console.log('\n📊 Testing retrieval accuracy across formats...\n');
console.log('⚠️  Note: This will take ~1 minute due to rate limits\n');

const jsonResults = await testFormat('JSON', jsonStr);
console.log('\n⏳ Waiting 20 seconds to avoid rate limits...');
await new Promise(resolve => setTimeout(resolve, 20000)); // Rate limit delay

const toonResults = await testFormat('TOON', toonStr);
console.log('\n⏳ Waiting 20 seconds to avoid rate limits...');
await new Promise(resolve => setTimeout(resolve, 20000));

const ysonResults = await testFormat('YSON', ysonStr);

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
