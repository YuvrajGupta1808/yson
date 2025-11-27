# YSON: Hyper-Compact Data Format for LLMs

**Save 35-60% on LLM API costs** by using fewer tokens for the same data.

YSON (Why-son) is a data serialization format designed for AI applications. It reduces token usage while maintaining full compatibility with JSON, making your LLM applications faster and cheaper.

## Why YSON?

### Massive Cost Savings

Every token costs money. YSON uses **35-60% fewer tokens** than JSON.

**Real-world impact:**
- 10,000 API calls/day with JSON: ~$15/day
- Same calls with YSON: ~$6-9/day
- **Annual savings: $2,000-3,000+**

### The Difference

**JSON (45 tokens):**
```json
{
  "users": [
    {"id": 1, "name": "Alice", "age": 30},
    {"id": 2, "name": "Bob", "age": 25},
    {"id": 3, "name": "Carol", "age": 35}
  ]
}
```

**YSON (18 tokens - 60% reduction):**
```
users
  $S id name age
    1 Alice 30
    2 Bob 25
    3 Carol 35
```

## YSON Structure Explained

YSON uses three simple rules:

### 1. Space-Delimited Key-Values
```
name Alice age 30 city "San Francisco"
```
No colons, commas, or brackets. Just `key value key value`. Quote strings with spaces.

### 2. Indentation for Nesting
```
user
  name Alice
  address
    city "San Francisco"
    zip 94102
```
Parent keys on their own line, children indented by 2 spaces.

### 3. Schema for Arrays (The Magic!)
```
products
  $S id name price
    P001 Laptop 1299.99
    P002 Mouse 29.99
```
`$S` defines columns once, then just list values. Huge token savings!

## Key Features

- **Schema-Based Compression**: Define structure once, reuse for all rows
- **Space-Delimited**: No unnecessary punctuation
- **Smart Quoting**: Quotes only when needed
- **Human-Readable**: Easy to read, write, and debug
- **100% JSON Compatible**: Perfect round-trip conversion

## Quick Start

### Install from npm

```bash
npm install yson-format
```

```javascript
import { YSONConverter } from 'yson-format';

const data = { user: { id: 1, name: "Alice" } };
const yson = YSONConverter.encode(data);
console.log(yson);
```

### Or clone from GitHub

```bash
git clone https://github.com/YuvrajGupta1808/yson.git
cd yson
npm install
npm run demo
```

### Usage

```javascript
import { YSONConverter } from 'yson-format';

// JSON to YSON
const data = { user: { id: 1, name: "Alice" } };
const yson = YSONConverter.encode(data);
console.log(yson);
// Output:
// user
//   id 1 name Alice

// YSON to JSON
const json = YSONConverter.decode(yson);

// Count tokens
const tokens = YSONConverter.countTokens(yson);
```

## Live Examples with Gemini API

```bash
# Get API key from https://aistudio.google.com/app/apikey
# Add to .env: GEMINI_API_KEY=your-key

npm run compare    # Compare JSON vs YSON formats
npm run accuracy   # Test retrieval accuracy
npm run savings    # See token savings & cost reduction
npm run io         # Input/output efficiency
npm run company    # Company data analysis
```

## When to Use YSON

**Perfect For:**
- High-volume LLM API calls
- RAG systems with large context
- AI agent communication
- Cost-sensitive applications
- Structured data in prompts

## Proven Results

**Token Reduction vs JSON:**
- Simple objects: 40-60% fewer tokens
- Arrays with schemas: 50-70% fewer tokens
- Nested structures: 30-40% fewer tokens

Tested with Google Gemini API on real-world data with identical accuracy.

## Works With

- OpenAI (GPT-4, GPT-3.5)
- Google Gemini
- Anthropic Claude
- Open-source models (Llama, Mistral, etc.)
- Any LLM that accepts text input

## API Reference

```javascript
// YSONConverter
YSONConverter.encode(jsonObject)      // JSON to YSON
YSONConverter.decode(ysonString)      // YSON to JSON
YSONConverter.countTokens(ysonString) // Count tokens

// JSONParser
JSONParser.parse(jsonString)
JSONParser.stringify(ast, pretty=false)
JSONParser.countTokens(jsonString)
```

## License

MIT

---

**Start saving on your LLM costs today.**
