# Google Gemini CLI: Download & Installation Guide

## Official NPM Package
- [@google/gemini-cli on npm](https://www.npmjs.com/package/@google/gemini-cli)

## Quick Install

### Option 1: Run Directly (No Installation)
```sh
npx https://github.com/google-gemini/gemini-cli
```

### Option 2: Global Installation (Recommended)
```sh
npm install -g @google/gemini-cli
gemini
```

## Prerequisites
- Node.js v18 or later ([Download Node.js](https://nodejs.org/en/download))

## Authentication
- On first run, sign in with your Google account for free usage (60 requests/min, 1,000/day).
- Or, use a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey):

```sh
export GEMINI_API_KEY="YOUR_API_KEY"
```

## Documentation & Resources
- [GitHub Repository](https://github.com/google-gemini/gemini-cli)
- [Google Cloud Gemini CLI Docs](https://cloud.google.com/gemini/docs/codeassist/gemini-cli)
- [Google Blog Announcement](https://blog.google/technology/developers/introducing-gemini-cli-open-source-ai-agent/)
- [Tutorial: How to Install and Use](https://dev.to/auden/google-gemini-cli-tutorial-how-to-install-and-use-it-with-images-4phb)

## Example Usage
```sh
cd my-project/
gemini
> Write me a Gemini Discord bot that answers questions using a FAQ.md file I will provide
```

---

**Gemini CLI** is an open-source AI agent for your terminal, offering code understanding, workflow automation, and more. See the links above for full documentation and advanced usage. 