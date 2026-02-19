# Chat Vault

Export AI chat conversations to durable JSON and Markdown formats. Privacy-first Chrome extension — zero network requests, ever.

## Supported Platforms

| Platform | Domain | Status |
|----------|--------|--------|
| Claude | claude.ai | Supported |
| ChatGPT | chatgpt.com, chat.openai.com | Supported |
| Gemini | gemini.google.com | Supported |
| Grok | grok.com | Supported |
| Grok (X) | x.com/i/grok | Supported |
| Perplexity | perplexity.ai | Supported |
| DeepSeek | chat.deepseek.com | Supported |

## Features

- **Per-platform content scripts** — each platform gets its own isolated extraction logic
- **Dual export formats** — JSON (Zod-validated, schema v2.0) and Markdown (YAML frontmatter)
- **Ensemble heuristic classification** — 7-rule classifier determines user vs. assistant roles with confidence scores
- **Clipboard + direct extraction** — tries copy-button clipboard capture first, falls back to DOM text
- **Integrity checks** — detects alternation breaks, empty turns, low confidence, and duplicates
- **Safety limits** — caps at 500 turns, 60s timeout, 100KB per turn, scroll stability detection
- **Type-safe messaging** — `@webext-core/messaging` protocol between content scripts and background worker

## Install

### From Source

```bash
git clone https://github.com/dsather/chat-vault.git
cd chat-vault
pnpm install
pnpm build
```

Then load the unpacked extension from `.output/chrome-mv3/` in `chrome://extensions` (enable Developer Mode).

### Development

```bash
pnpm dev          # Start dev server with HMR
pnpm build        # Production build
pnpm test         # Run all tests
pnpm test:watch   # Watch mode
pnpm lint         # Biome lint + format check
pnpm lint:fix     # Auto-fix lint issues
pnpm typecheck    # TypeScript strict check
pnpm zip          # Package extension ZIP
```

## Usage

1. Navigate to any supported AI chat platform
2. Click the Chat Vault extension icon
3. Select export format (JSON, Markdown, or Both)
4. Click **Export Conversation**
5. File downloads automatically via save dialog

## Architecture

```
chat-vault/
├── src/
│   ├── entrypoints/
│   │   ├── popup/              # Extension popup (vanilla HTML/CSS/TS)
│   │   ├── background.ts       # Service worker (download handler)
│   │   ├── claude.content.ts   # Per-platform content scripts
│   │   ├── chatgpt.content.ts
│   │   ├── gemini.content.ts
│   │   ├── grok.content.ts
│   │   ├── grok-x.content.ts
│   │   ├── perplexity.content.ts
│   │   └── deepseek.content.ts
│   ├── lib/
│   │   ├── extractors/         # Platform-specific extraction logic
│   │   │   ├── base.ts         # Abstract BaseExtractor class
│   │   │   ├── claude.ts       # Claude, ChatGPT, Gemini, etc.
│   │   │   └── index.ts        # Extractor registry
│   │   ├── heuristics/         # Role classification
│   │   │   ├── rules.ts        # H1-H7 pure heuristic functions
│   │   │   ├── classifier.ts   # Ensemble classifier
│   │   │   └── integrity.ts    # Post-extraction validation
│   │   ├── serializers/        # Export format generation
│   │   │   ├── schema.ts       # Zod schemas (source of truth)
│   │   │   ├── json.ts         # JSON serializer
│   │   │   └── markdown.ts     # Markdown serializer
│   │   ├── constants.ts        # Safety limits, platform config
│   │   ├── dom.ts              # Shared DOM utilities
│   │   ├── download.ts         # File download (background + blob fallback)
│   │   └── messaging.ts        # Type-safe messaging protocol
│   └── utils/
│       └── platform.ts         # Platform detection
├── tests/
│   ├── serializers/            # Schema, JSON, Markdown tests
│   └── heuristics/             # Rule + classifier tests
└── public/icons/               # Extension icons
```

### Key Design Decisions

**Per-platform content scripts** — WXT's named content script pattern (`{name}.content.ts`) registers separate scripts per domain. Claude.ai never loads Grok's code. Each script has an independent lifecycle.

**Abstract extractor interface** — All 7 extractors implement `BaseExtractor`, which provides shared scrolling, clipboard reading, and safety-limited extraction. Adding a new platform means implementing 5 methods.

**Zod as single source of truth** — The export schema is defined once in Zod. TypeScript types are inferred from it. Runtime validation catches corruption before file write.

## Export Format (v2.0)

### JSON

```json
{
  "schema_version": "2.0",
  "export_metadata": {
    "source_platform": "claude",
    "source_url": "https://claude.ai/chat/...",
    "export_timestamp": "2025-01-15T10:30:00.000Z",
    "extension_version": "1.0.0",
    "total_turns": 12,
    "flagged_turns": 1,
    "integrity_warnings": []
  },
  "conversation": [
    {
      "turn": 1,
      "role": "user",
      "content": "...",
      "classification_confidence": 0.95,
      "classification_source": "structural",
      "extraction_method": "clipboard"
    }
  ]
}
```

### Markdown

```markdown
---
source_platform: claude
source_url: https://claude.ai/chat/...
export_timestamp: 2025-01-15T10:30:00.000Z
total_turns: 12
schema_version: "2.0"
---

## Turn 1 — User

What is TypeScript?

## Turn 2 — Assistant

TypeScript is a typed superset of JavaScript...
```

## Tech Stack

| Component | Choice |
|-----------|--------|
| Framework | [WXT](https://wxt.dev) |
| Language | TypeScript (strict) |
| Bundler | Vite (via WXT) |
| Testing | Vitest + @webext-core/fake-browser |
| Messaging | @webext-core/messaging |
| Schema | Zod |
| Linting | Biome |
| CI | GitHub Actions |

## Privacy

Chat Vault makes **zero network requests**. All processing happens locally in the browser. Extracted conversations are saved directly to your filesystem via the Chrome downloads API. No telemetry, no analytics, no external services.

## License

ISC
