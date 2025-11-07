# feature-rag

This library provides RAG (Retrieval-Augmented Generation) integration for the student web application, connecting directly to NVIDIA Blueprint RAG services.

## Features

- Direct API calls to RAG retriever and ingestor services
- Streaming chat interface with citations
- Document ingestion with multipart upload
- Collection management
- Health checks for RAG services

## Usage

```typescript
import { RagChat, RagIngestForm, useRagGenerate } from '@endo4life/feature-rag';
```

## Running unit tests

Run `nx test feature-rag` to execute the unit tests via [Jest](https://jestjs.io).

