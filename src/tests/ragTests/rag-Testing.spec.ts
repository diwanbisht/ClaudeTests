import { test, expect } from '@playwright/test';
import { extractPDFText } from '../../utils/pdfReader';
import { chunkText } from '../../utils/chunker';
import { createVectorDB } from '../../rag/setup';
import { queryRAG } from '../../rag/query';
import { askOllama } from '../../rag/ollamaClient';
import { allure } from 'allure-playwright';

const pdfPath = 'src/test-data/hr-policy/HR_Leave_and_Policies_Manual.pdf';

test('Validate HR Leave Policy via Prompt (RAG + Claude)', async () => {
  // Local Ollama inference (cold model load) can exceed the default 30s
  // test timeout on the first run — give this spec more room.
  test.setTimeout(180000);

  // 📄 Step 1: Load PDF

  const text = await extractPDFText(pdfPath);

  // ✂️ Step 2: Chunk
  const chunks = chunkText(text);

  // 🧠 Step 3: Create Vector DB
  const db = await createVectorDB(chunks);

  // ❓ Step 4: Prompt
  const question = "What is the notice period?";

  // 🔍 Step 5: Get relevant context
  const context = await queryRAG(db, question);

  // 🤖 Step 6: Ask local Ollama model
  const systemPrompt = `Answer the question using only the following context:\n\n${context}`;
  const answer = await askOllama(systemPrompt, question);

  console.log("AI Answer:", answer);

  // ✅ Step 7: Assertion
  expect(answer.toLowerCase()).toContain("60 days");
  allure.attachment("AI Answer", answer, "text/plain");

});

test('Validate Casual Leave Policy', async () => {
  test.setTimeout(180000);

  const text = await extractPDFText(pdfPath);
  const chunks = chunkText(text);
  const db = await createVectorDB(chunks);

  const question = "How many casual leaves are given per year?";
  const context = await queryRAG(db, question);

  const prompt = `Answer only from context:\n${context}`;
  const answer = await askOllama(prompt, question);

  expect(answer.toLowerCase()).toContain("12 days");
   allure.attachment("AI Answer", answer, "text/plain");
});

test('Validate Referral Bonus Policy', async () => {
    test.setTimeout(180000);

  const text = await extractPDFText(pdfPath);
  const chunks = chunkText(text);
  const db = await createVectorDB(chunks);

  const question = "What is referral bonus policy?";
  const context = await queryRAG(db, question);

  const prompt = `Answer only from context:\n${context}`;
  const answer = await askOllama(prompt, question);

  expect(answer.toLowerCase()).toContain("bonus");
   allure.attachment("AI Answer", answer, "text/plain");
});

test('Validate Joining Bonus Policy', async () => {
  test.setTimeout(180000);

  const text = await extractPDFText(pdfPath);
  const chunks = chunkText(text);
  const db = await createVectorDB(chunks);

  const question = "When is joining bonus paid?";
  const context = await queryRAG(db, question);

  const prompt = `Answer only from context:\n${context}`;
  const answer = await askOllama(prompt, question);

  expect(answer.toLowerCase()).toContain("6 months");
  allure.attachment("AI Answer", answer, "text/plain");
});