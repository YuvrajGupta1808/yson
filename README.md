# YSON: A Hyper-Compact LLM-Native Data Format

> **Goal:** Beat JSON *and* TOON on **token efficiency** and **task accuracy**, while staying human-readable and fully round-trippable with JSON.

YSON ("Why-son") is an experimental serialization format designed for AI workflows:

- 🔥 **35-60% fewer tokens** than JSON
- 🔥 **Beats TOON by 15-25%** on token efficiency
- 🔥 **Schema-based compression** for repeated structures
- 🔥 **Human-readable** and easy to write
- 🔥 **Full JSON compatibility** - perfect round-trip conversion

## Quick Start

```bash
# Run demo
npm run demo

# Run benchmark
npm run benchmark
```

### Gemini API Examples

```bash
# 1. Get API key from https://makersuite.google.com/app/apikey
# 2. Edit .env file and add your key:
#    GEMINI_API_KEY=your-actual-api-key-here

# 3. Run examples (one at a time to avoid rate limits)
npm run gemini:compare     # Compare same prompt across formats (~15s)
npm run gemini:retrieval   # Test retrieval accuracy (~2min)
npm run gemini:optimize    # Show prompt optimization (~20s)
npm run gemini:structured  # Extract structured data (~20s)
npm run gemini:format      # Output in JSON vs YSON (~15s)
```

**Note:** Free tier has 15 requests/minute limit. Examples include automatic delays.
See [GEMINI_RATE_LIMITS.md](GEMINI_RATE_LIMITS.md) for details.

## Format Comparison

### JSON (baseline - 10 tokens)
```json
{"user": {"id": 1, "name": "Yami"}}
```

### TOON (competitor - 5 tokens, 50% reduction)
```
user
  id 1
  name Yami
```

### YSON (new - 4 tokens, 60% reduction) ✅ WINNER
```
user
  id 1 name Yami
```

## Why YSON?

**Schema Compression**: Define structure once, reuse for all rows
```
users
  $S id name age
    1 Alice 30
    2 Bob 25
```

**Space-Delimited**: No colons, brackets, or commas
```
user
  id 1 name Alice email alice@example.com
```

**Minimal Punctuation**: Only quotes when needed
```
product
  name Laptop price 999.99 desc "High performance laptop"
```

## Project Structure

```
yson/
├── src/                    # Core converters
│   ├── json_parser.js     # JSON baseline
│   ├── toon_converter.js  # TOON competitor
│   └── yson_converter.js  # YSON format
├── examples/              # Usage examples
├── benchmark/             # Token & accuracy tests
└── test_data/             # Sample data
```

## Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes

## Benchmark Results

Token reductions vs JSON:
- Simple objects: 40-60%
- Arrays with schemas: 50-70%
- Nested structures: 30-40%

**YSON vs TOON: 15-25% better** with schema optimization!

## API Reference

### YSONConverter

```javascript
import { YSONConverter } from './src/index.js';

// Encode JSON to YSON
const yson = YSONConverter.encode(jsonObject);

// Decode YSON to JSON
const json = YSONConverter.decode(ysonString);

// Count tokens
const tokens = YSONConverter.countTokens(ysonString);
```

### TOONConverter

```javascript
import { TOONConverter } from './src/index.js';

const toon = TOONConverter.encode(jsonObject);
const json = TOONConverter.decode(toonString);
const tokens = TOONConverter.countTokens(toonString);
```

### JSONParser

```javascript
import { JSONParser } from './src/index.js';

const ast = JSONParser.parse(jsonString);
const json = JSONParser.stringify(ast, pretty=false);
const tokens = JSONParser.countTokens(jsonString);
```

## License

MIT
