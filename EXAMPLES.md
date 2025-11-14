# YSON Examples Guide

## Basic Examples

### 1. Demo - Format Comparison
```bash
npm run demo
```
Shows JSON, TOON, and YSON side-by-side with token counts using restaurant menu data.

**Output:** Visual comparison with token savings

### 2. V2 Comparison
```bash
npm run v2
```
Compares YSON V1 vs V2 to show improvements.

**Output:** Shows how V2 beats TOON with schema optimization

### 3. Benchmark
```bash
npm run benchmark
```
Runs token efficiency benchmark on complex company data.

**Output:** Detailed token comparison report

## Gemini API Examples

**Prerequisites:**
1. Get API key: https://makersuite.google.com/app/apikey
2. Edit `.env` file: `GEMINI_API_KEY=your-key-here`

**Note:** Run one at a time to avoid rate limits (15 requests/minute)

### 1. Format Comparison
```bash
npm run gemini:compare
```
**What it does:** Asks the same question with data in JSON, TOON, and YSON formats

**Use case:** Compare how LLMs understand different formats

**Duration:** ~15 seconds

**Example output:**
- Question: "Which customer spent the most money?"
- Shows answers from all 3 formats
- Displays token savings

### 2. Retrieval Accuracy
```bash
npm run gemini:retrieval
```
**What it does:** Tests 5 different questions across all formats

**Use case:** Verify accuracy is maintained across formats

**Duration:** ~2 minutes (includes rate limit delays)

**Example questions:**
- "What is the restaurant name?"
- "What is the most expensive item?"
- "How many vegetarian options?"

### 3. Prompt Optimization
```bash
npm run gemini:optimize
```
**What it does:** Shows token savings and cost reduction at scale

**Use case:** Calculate ROI of using YSON

**Duration:** ~20 seconds

**Example output:**
- Token comparison
- Cost per request
- Daily/annual savings projections

### 4. Structured Data Extraction
```bash
npm run gemini:structured
```
**What it does:** Asks Gemini to extract and structure data from all formats

**Use case:** Data transformation, ETL pipelines

**Duration:** ~20 seconds

**Example task:**
- Extract company info
- Calculate department statistics
- Find top earners
- Return as structured JSON

### 5. Format Output Comparison
```bash
npm run gemini:format
```
**What it does:** Asks Gemini to OUTPUT data in JSON vs YSON format

**Use case:** 
- Custom format responses
- Reducing output token costs
- LLM-to-LLM communication

**Duration:** ~15 seconds

**Example:**
- Input: E-commerce orders
- Output 1: Summary in JSON format
- Output 2: Summary in YSON format
- Compare output token efficiency

## Example Workflow

```bash
# 1. Start with basic demo
npm run demo

# 2. See the improvements
npm run v2

# 3. Run full benchmark
npm run benchmark

# Wait 1 minute for rate limit reset

# 4. Test with Gemini
npm run gemini:compare

# Wait 1 minute

# 5. Test structured output
npm run gemini:format
```

## Understanding the Results

### Token Savings
- **30-40%**: Typical for simple objects
- **40-60%**: Arrays with schema optimization
- **50-70%**: Large datasets with repeated structures

### Cost Impact
At 10,000 requests/day:
- JSON: ~$1.50/day
- YSON: ~$0.90/day
- **Savings: $0.60/day = $219/year**

### When to Use YSON

✅ **Good for:**
- Large datasets with repeated structures
- API responses with arrays
- LLM prompts with structured data
- Cost-sensitive applications

❌ **Not ideal for:**
- Single small objects
- Highly nested unique structures
- When JSON compatibility is required everywhere

## Troubleshooting

### Rate Limit Error (429)
**Solution:** Wait 1 minute between examples

### API Key Error
**Solution:** Check `.env` file has correct key

### Parsing Errors
**Solution:** Some complex nested structures may need manual review

## Next Steps

1. Try with your own data in `test_data/`
2. Modify questions in the examples
3. Integrate YSON into your application
4. Measure real-world token savings
